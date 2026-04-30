import { Router } from "express"
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getSubscribedTweets
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()
// router.use(verifyJWT)

router.route("/").post(verifyJWT, createTweet)
router.route("/feed").get(verifyJWT, getSubscribedTweets)
router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet)

export default router
