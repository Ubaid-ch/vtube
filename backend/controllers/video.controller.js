import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query

    const pipeline = []

    // Full-text search if query provided (requires text index on title/description)
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query,
                    path: ["title", "description"]
                }
            }
        })
    }

    // Filter by owner if userId provided
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID")
        }
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        })
    }

    // Only return published videos to non-owners
    pipeline.push({ $match: { isPublished: true } })

    // Sort
    pipeline.push({
        $sort: { [sortBy]: sortType === "asc" ? 1 : -1 }
    })

    // Join owner details
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } }
    )

    const options = { page: parseInt(page), limit: parseInt(limit) }
    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options)

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) throw new ApiError(400, "Video file is required")
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required")

    const videoFile = await uploadOnCloudinary(videoLocalPath, "video")
    if (!videoFile?.url) throw new ApiError(500, "Error uploading video file")

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail?.url) throw new ApiError(500, "Error uploading thumbnail")

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id,
        isPublished: false
    })

    return res.status(201).json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1, fullName: 1, avatar: 1,
                            subscribersCount: 1, isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLikedByMe: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                videoFile: 1, thumbnail: 1, title: 1, description: 1,
                duration: 1, views: 1, isPublished: 1, createdAt: 1,
                owner: 1, likesCount: 1, isLikedByMe: 1
            }
        }
    ])

    if (!video?.length) {
        throw new ApiError(404, "Video not found")
    }

    // Increment view count and add to watch history
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: videoId }
        })
    }

    return res.status(200).json(new ApiResponse(200, video[0], "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    let thumbnailUrl = video.thumbnail

    if (req.file?.path) {
        // Delete old thumbnail from cloudinary
        await deleteFromCloudinary(video.thumbnail)
        const thumbnail = await uploadOnCloudinary(req.file.path)
        if (!thumbnail?.url) throw new ApiError(500, "Error uploading new thumbnail")
        thumbnailUrl = thumbnail.url
    }

    const updated = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title ?? video.title,
                description: description ?? video.description,
                thumbnail: thumbnailUrl
            }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updated, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await deleteFromCloudinary(video.videoFile, "video")
    await deleteFromCloudinary(video.thumbnail)
    await Video.findByIdAndDelete(videoId)

    // Clean up likes on this video
    await Like.deleteMany({ video: videoId })

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status")
    }

    const updated = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, { isPublished: updated.isPublished }, "Publish status toggled successfully")
    )
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }