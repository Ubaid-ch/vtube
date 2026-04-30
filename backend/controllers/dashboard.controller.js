import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = new mongoose.Types.ObjectId(req.user._id)

    const stats = await Video.aggregate([
        {
            $match: { owner: channelId }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$videoLikes" } }
            }
        }
    ])

    const subscriberCount = await Subscription.countDocuments({ channel: channelId })

    const channelStats = {
        totalVideos: stats[0]?.totalVideos ?? 0,
        totalViews: stats[0]?.totalViews ?? 0,
        totalLikes: stats[0]?.totalLikes ?? 0,
        totalSubscribers: subscriberCount
    }

    return res.status(200).json(new ApiResponse(200, channelStats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = new mongoose.Types.ObjectId(req.user._id)

    const videos = await Video.aggregate([
        {
            $match: { owner: channelId }
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
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                title: 1, description: 1, thumbnail: 1, videoFile: 1,
                duration: 1, views: 1, isPublished: 1, likesCount: 1, createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } }
    ])

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export { getChannelStats, getChannelVideos }