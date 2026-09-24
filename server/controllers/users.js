import mongoose from "mongoose";
import User from "../models/User.js";

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

const PUBLIC_FIELDS = "_id firstName lastName occupation location picturePath";

const loadFriends = async (ids) => {
  const valid = ids.map(String).filter(isId);
  if (!valid.length) return [];
  const docs = await User.find({ _id: { $in: valid } }).select(PUBLIC_FIELDS).lean();
  // Preserve the order in which friends were added.
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));
  return valid.map((id) => byId.get(id)).filter(Boolean);
};

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(404).json({ message: "User not found" });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load user" });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(404).json({ message: "User not found" });
    const user = await User.findById(id).select("friends").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(await loadFriends(user.friends || []));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load friends" });
  }
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 50);
    if (!q) return res.status(200).json([]);
    const re = new RegExp(escapeRegex(q), "i");
    const users = await User.find({
      $or: [{ firstName: re }, { lastName: re }, { occupation: re }, { location: re }],
    })
      .select(PUBLIC_FIELDS)
      .limit(8)
      .lean();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    if (req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "You can only change your own friends" });
    }
    if (!isId(friendId)) return res.status(404).json({ message: "User not found" });
    if (id === friendId) {
      return res.status(400).json({ message: "You can't befriend yourself" });
    }

    const [user, friend] = await Promise.all([
      User.findById(id).select("friends"),
      User.findById(friendId).select("_id"),
    ]);
    if (!user || !friend) return res.status(404).json({ message: "User not found" });

    const isFriend = user.friends.map(String).includes(friendId);
    // Atomic updates on both sides; avoids re-validating legacy documents
    // and the old bug that wiped the friend's entire list on removal.
    const op = isFriend ? "$pull" : "$addToSet";
    await Promise.all([
      User.updateOne({ _id: id }, { [op]: { friends: friendId } }),
      User.updateOne({ _id: friendId }, { [op]: { friends: id } }),
    ]);

    const updated = await User.findById(id).select("friends").lean();
    res.status(200).json(await loadFriends(updated.friends || []));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update friends" });
  }
};
