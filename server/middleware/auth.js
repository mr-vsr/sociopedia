import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  if (token.startsWith("Bearer ")) token = token.slice(7).trim();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
};
