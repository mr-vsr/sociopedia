import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import User from "../models/User.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Case-insensitive exact match, so accounts created before emails were
// normalised to lowercase can still sign in.
const emailQuery = (email) => ({
  email: new RegExp(
    `^${String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  ),
});

const removeUpload = (req) => {
  if (req.file) fs.promises.unlink(req.file.path).catch(() => {});
};

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, occupation } =
      req.body;

    const missing = ["firstName", "lastName", "email", "password"].filter(
      (k) => !req.body[k] || !String(req.body[k]).trim()
    );
    if (missing.length) {
      removeUpload(req);
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }
    if (!EMAIL_RE.test(email)) {
      removeUpload(req);
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (String(password).length < 5) {
      removeUpload(req);
      return res
        .status(400)
        .json({ message: "Password must be at least 5 characters" });
    }

    const existing = await User.findOne(emailQuery(email));
    if (existing) {
      removeUpload(req);
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: req.file ? req.file.filename : "",
      friends: [],
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    removeUpload(req);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Could not create account" });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne(emailQuery(email));
    // Same message for both cases so the endpoint can't be used to probe emails.
    const isMatch = user && (await bcrypt.compare(String(password), user.password));
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    res.status(200).json({ token, user }); // toJSON strips the password
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not sign in" });
  }
};
