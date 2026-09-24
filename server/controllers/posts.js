import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { ASSETS_DIR } from "../middleware/upload.js";

const isId = (id) => mongoose.Types.ObjectId.isValid(id);
const newestFirst = { createdAt: -1 };

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const userId = req.user.id; // author comes from the token, never the body
    const description = String(req.body.description || "").trim();
    if (!description && !req.file) {
      return res
        .status(400)
        .json({ message: "Write something or attach an image" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Post.create({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: req.file ? req.file.filename : undefined,
      likes: {},
      comments: [],
    });

    const posts = await Post.find().sort(newestFirst);
    res.status(201).json(posts);
  } catch (err) {
    if (req.file) fs.promises.unlink(req.file.path).catch(() => {});
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Could not create post" });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort(newestFirst);
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load feed" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort(newestFirst);
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load posts" });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!isId(id)) return res.status(404).json({ message: "Post not found" });

    const post = await Post.findById(id).select("likes");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes && post.likes.get(userId);
    const update = isLiked
      ? { $unset: { [`likes.${userId}`]: "" } }
      : { $set: { [`likes.${userId}`]: true } };

    const updatedPost = await Post.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update like" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const text = String((req.body && req.body.text) || "").trim();
    if (!isId(id)) return res.status(404).json({ message: "Post not found" });
    if (!text) return res.status(400).json({ message: "Comment can't be empty" });
    if (text.length > 500) {
      return res.status(400).json({ message: "Comments are limited to 500 characters" });
    }

    const user = await User.findById(req.user.id).select("firstName lastName picturePath");
    if (!user) return res.status(404).json({ message: "User not found" });

    const comment = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: req.user.id,
      name: `${user.firstName} ${user.lastName}`,
      picturePath: user.picturePath,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ message: "Post not found" });
    res.status(201).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add comment" });
  }
};

/* DELETE */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(404).json({ message: "Post not found" });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    await post.deleteOne();

    // Remove the uploaded image (only files this server generated, never
    // bundled seed assets) unless another post still references it.
    if (post.picturePath && /^\d+-[a-f0-9]{12}\.\w+$/.test(post.picturePath)) {
      const stillUsed = await Post.exists({ picturePath: post.picturePath });
      if (!stillUsed) {
        const file = path.join(ASSETS_DIR, path.basename(post.picturePath));
        fs.promises.unlink(file).catch(() => {});
      }
    }
    res.status(200).json({ _id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete post" });
  }
};
