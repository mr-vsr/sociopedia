/* Seeds demo users/posts into an EMPTY database for local development.
   Every seeded user can sign in with the password in SEED_PASSWORD (default "password123"). */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { users, posts } from "../data/index.js";

dotenv.config();
mongoose.set("strictQuery", true);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  if ((await User.estimatedDocumentCount()) > 0 && !process.argv.includes("--force")) {
    console.log("Database already has users; skipping. Use --force to seed anyway.");
    return;
  }
  const hash = await bcrypt.hash(process.env.SEED_PASSWORD || "password123", 10);
  await User.insertMany(users.map((u) => ({ ...u, password: hash })));
  await Post.insertMany(posts);
  console.log(`Seeded ${users.length} users and ${posts.length} posts.`);
};

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
