import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  // TODO: toggle like on video
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id found");
  }
  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (isLiked) {
    const removeLike = await Like.findByIdAndDelete(isLiked._id);
    if (!removeLike) {
      throw new ApiError(500, "Error while removing like");
    }
  } else {
    const liked = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    if (!liked) {
      throw new ApiError(500, "Error while liking video");
    }
  }
  return res.status(200).json(new ApiResponse(200, {}, "Liked status updated"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  // TODO: toggle like on comment
  const { commentId } = req.params;
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "No valid comment Id found");
  }
  const isLikedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (isLikedComment) {
    const removeLikedComment = await Like.findByIdAndDelete(isLikedComment._id);
    if (!removeLikedComment) {
      throw new ApiError(500, "Error while removing liked comment");
    }
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    if (!likedComment) {
      throw new ApiError(500, "Error while liking comment");
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Liked comment status updated"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  // TODO: toggle like on tweet
  const { tweetId } = req.params;
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "No valid tweet Id found");
  }
  const isLikedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (isLikedTweet) {
    const removeLikedTweet = await Like.findByIdAndDelete(isLikedTweet._id);
    if (!removeLikedTweet) {
      throw new ApiError(500, "Error while removing liked tweet");
    }
  } else {
    const likedTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    if (!likedTweet) {
      throw new ApiError(500, "Error while liking tweet");
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Liked tweet status updated"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
    {
      $match: {
        video: { $exists: true }, // Filter out non-video documents
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  if (!likedVideos) {
    throw new ApiError(500, "No liked videos found for this user");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked video fetched successfully")
    );
});

export { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike };
