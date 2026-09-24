import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    location: String,
    description: { type: String, maxlength: 2000 },
    picturePath: String,
    userPicturePath: String,
    likes: { type: Map, of: Boolean, default: {} },
    // Legacy seed data stores plain strings; new comments are
    // { userId, name, picturePath, text, createdAt } objects.
    comments: { type: Array, default: [] },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
