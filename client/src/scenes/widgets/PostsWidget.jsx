import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { AutoStoriesOutlined } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import { useApi } from "api";
import { PostSkeleton } from "components/Skeleton";
import { fadeUp } from "components/motion";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const api = useApi();
  const posts = useSelector((state) => state.posts);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const load = () => {
    setStatus("loading");
    return api(isProfile ? `/posts/${userId}/posts` : "/posts")
      .then((data) => {
        dispatch(setPosts({ posts: data }));
        setStatus("ready");
      })
      .catch((e) => {
        setError(e.message);
        setStatus("error");
      });
  };

  useEffect(() => {
    dispatch(setPosts({ posts: [] }));
    load();
  }, [userId, isProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "loading" && posts.length === 0) {
    return (
      <>
        <PostSkeleton />
        <PostSkeleton />
      </>
    );
  }

  if (status === "error") {
    return (
      <Box className="glass" sx={{ p: 4, borderRadius: "22px", textAlign: "center" }}>
        <Typography sx={{ color: "text.secondary", mb: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={load}>
          Try again
        </Button>
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box
        component={motion.div}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="glass"
        data-testid="empty-feed"
        sx={{ p: 5, borderRadius: "22px", textAlign: "center" }}
      >
        <AutoStoriesOutlined sx={{ fontSize: 36, color: "accent.main", mb: 1 }} />
        <Typography variant="h4" sx={{ color: "text.primary" }}>
          The page is still blank
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          {isProfile ? "No posts here yet." : "Be the first to share something."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box data-testid="feed" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <AnimatePresence initial={true} mode="popLayout">
        {posts.map((p, i) => (
          <PostWidget key={p._id} post={p} index={i} />
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default PostsWidget;
