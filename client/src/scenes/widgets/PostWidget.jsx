import { forwardRef, useState } from "react";
import {
  ChatBubbleOutlineRounded,
  DeleteOutlineRounded,
  FavoriteBorderRounded,
  FavoriteRounded,
  IosShareRounded,
  MoreHorizRounded,
  SendRounded,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { removePost, setPost } from "state";
import { assetUrl, useApi } from "api";
import Friend from "components/Friend";
import UserImage from "components/UserImage";
import { useToast } from "components/Toast";
import { ease, spring } from "components/motion";
import { normalizeComment, timeAgo } from "utils";

const Burst = () => (
  <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({ length: 6 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return (
        <Box
          key={i}
          component={motion.span}
          initial={{ x: 0, y: 0, scale: 0.6, opacity: 1 }}
          animate={{ x: Math.cos(a) * 18, y: Math.sin(a) * 18, scale: 0, opacity: 0 }}
          transition={{ duration: 0.55, ease }}
          sx={{ position: "absolute", top: "50%", left: "50%", width: 5, height: 5, ml: "-2.5px", mt: "-2.5px", borderRadius: "50%", bgcolor: "accent.wine" }}
        />
      );
    })}
  </Box>
);

const Action = ({ children, label, count, onClick, active, testId }) => (
  <Tooltip title={label}>
    <Box
      component="button"
      onClick={onClick}
      aria-label={label}
      data-testid={testId}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        px: 1.4,
        py: 0.8,
        border: 0,
        borderRadius: 999,
        bgcolor: active ? "primary.light" : "transparent",
        color: active ? "accent.wine" : "text.secondary",
        font: "inherit",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        position: "relative",
        transition: "background-color .2s, color .2s",
        "&:hover": { bgcolor: "neutral.light", color: active ? "accent.wine" : "text.primary" },
      }}
    >
      {children}
      {count !== undefined && (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "inline-block", minWidth: 8 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      )}
    </Box>
  </Tooltip>
);

const PostWidget = forwardRef(({ post, index = 0 }, ref) => {
  const { _id: postId, userId: postUserId, firstName, lastName, description, location, picturePath, userPicturePath, createdAt } = post;
  const likes = post.likes || {};
  const comments = (post.comments || []).map(normalizeComment);
  const name = `${firstName} ${lastName}`;

  const dispatch = useDispatch();
  const api = useApi();
  const toast = useToast();
  const me = useSelector((state) => state.user);
  const isLiked = Boolean(likes[me._id]);
  const likeCount = Object.keys(likes).length;
  const isOwn = postUserId === me._id;

  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [bigHeart, setBigHeart] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [menu, setMenu] = useState(null);

  const toggleLike = async (forceLike = false) => {
    if (forceLike && isLiked) return;
    const optimistic = { ...likes };
    if (isLiked) delete optimistic[me._id];
    else {
      optimistic[me._id] = true;
      setBurstKey((k) => k + 1);
    }
    dispatch(setPost({ post: { ...post, likes: optimistic } }));
    try {
      const updated = await api(`/posts/${postId}/like`, { method: "PATCH", json: {} });
      dispatch(setPost({ post: updated }));
    } catch (err) {
      dispatch(setPost({ post }));
      toast(err.message, "error");
    }
  };

  const onDoubleClick = () => {
    setBigHeart((k) => k + 1);
    toggleLike(true);
  };

  const sendComment = async (e) => {
    e.preventDefault();
    const text = comment.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const updated = await api(`/posts/${postId}/comments`, { method: "POST", json: { text } });
      dispatch(setPost({ post: updated }));
      setComment("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSending(false);
    }
  };

  const deletePost = async () => {
    setMenu(null);
    try {
      await api(`/posts/${postId}`, { method: "DELETE" });
      dispatch(removePost({ id: postId }));
      toast("Post deleted");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/profile/${postUserId}`;
    try {
      if (navigator.share) await navigator.share({ title: `${name} on Sociopedia`, text: description, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <Box
      ref={ref}
      component={motion.article}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: Math.min(index, 6) * 0.06 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
      className="glass"
      data-testid="post"
      sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: "22px", boxShadow: (t) => t.palette.glass.shadow }}
    >
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={[location, timeAgo(createdAt)].filter(Boolean).join(" · ")}
        userPicturePath={userPicturePath}
        trailing={
          isOwn && (
            <>
              <IconButton onClick={(e) => setMenu(e.currentTarget)} aria-label="Post options" data-testid="post-menu" sx={{ color: "text.secondary" }}>
                <MoreHorizRounded />
              </IconButton>
              <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem onClick={deletePost} sx={{ color: "error.main", borderRadius: 2, mx: 0.5 }} data-testid="post-delete">
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <DeleteOutlineRounded fontSize="small" />
                  </ListItemIcon>
                  Delete post
                </MenuItem>
              </Menu>
            </>
          )
        }
      />

      {description && (
        <Typography sx={{ color: "text.primary", mt: 2, fontSize: 15, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {description}
        </Typography>
      )}

      {picturePath && (
        <Box
          onDoubleClick={onDoubleClick}
          sx={{
            position: "relative",
            mt: 2,
            borderRadius: "16px",
            overflow: "hidden",
            bgcolor: "neutral.light",
            minHeight: imgLoaded ? 0 : 220,
            cursor: "pointer",
            "& img": { transition: "transform .8s cubic-bezier(.2,.8,.2,1), opacity .6s" },
            "&:hover img": { transform: "scale(1.02)" },
          }}
        >
          {!imgLoaded && <Box className="skeleton" sx={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
          <img
            src={assetUrl(picturePath)}
            alt={description ? description.slice(0, 80) : `Photo by ${name}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            style={{ width: "100%", display: "block", maxHeight: 620, objectFit: "cover", opacity: imgLoaded ? 1 : 0 }}
          />
          <AnimatePresence>
            {bigHeart > 0 && (
              <motion.div
                key={bigHeart}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 1] }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.5, ease }}
                onAnimationComplete={() => setTimeout(() => setBigHeart(0), 250)}
                style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}
              >
                <FavoriteRounded sx={{ fontSize: 96, color: "#FBF8F2", filter: "drop-shadow(0 8px 24px rgba(0,0,0,.35))" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5, mx: -0.5 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Action label={isLiked ? "Unlike" : "Like"} count={likeCount} onClick={() => toggleLike()} active={isLiked} testId="like">
            <Box component={motion.span} key={`${isLiked}`} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 14 }} sx={{ display: "flex", position: "relative" }}>
              {isLiked ? <FavoriteRounded sx={{ fontSize: 19 }} /> : <FavoriteBorderRounded sx={{ fontSize: 19 }} />}
              {burstKey > 0 && isLiked && <Burst key={burstKey} />}
            </Box>
          </Action>
          <Action label="Comments" count={comments.length} onClick={() => setShowComments((s) => !s)} testId="comments-toggle">
            <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />
          </Action>
        </Box>
        <Action label="Share" onClick={share}>
          <IosShareRounded sx={{ fontSize: 18 }} />
        </Action>
      </Box>

      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.35, ease } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease } }}
            style={{ overflow: "hidden" }}
            data-testid="comments"
          >
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "grid", gap: 1.5, maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
              <AnimatePresence initial={false}>
                {comments.map((c, i) => (
                  <Box
                    key={c._id || i}
                    component={motion.div}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: spring }}
                    sx={{ display: "flex", gap: 1.2 }}
                  >
                    <UserImage image={c.picturePath} name={c.name} size="30px" ring={false} />
                    <Box sx={{ bgcolor: "neutral.light", px: 1.5, py: 1, borderRadius: "4px 14px 14px 14px", minWidth: 0, flex: 1 }}>
                      {!c.legacy && (
                        <Typography variant="h6" sx={{ fontSize: 12, color: "text.primary" }}>
                          {c.name}
                          <Box component="span" sx={{ color: "text.secondary", fontWeight: 400, ml: 1 }}>
                            {timeAgo(c.createdAt)}
                          </Box>
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: 13.5, color: "text.primary", wordBreak: "break-word" }}>{c.text}</Typography>
                    </Box>
                  </Box>
                ))}
              </AnimatePresence>
              {comments.length === 0 && (
                <Typography sx={{ color: "text.secondary", fontSize: 13, textAlign: "center", py: 1 }}>No comments yet — start the conversation.</Typography>
              )}
            </Box>
            <Box component="form" onSubmit={sendComment} sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
              <UserImage image={me.picturePath} name={`${me.firstName} ${me.lastName}`} size="30px" ring={false} />
              <InputBase
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                inputProps={{ maxLength: 500, "aria-label": "Add a comment", "data-testid": "comment-input" }}
                sx={{
                  flex: 1,
                  px: 1.8,
                  height: 38,
                  fontSize: 13.5,
                  borderRadius: 999,
                  bgcolor: "neutral.light",
                  border: (t) => `1px solid ${t.palette.divider}`,
                  "&.Mui-focused": { borderColor: "accent.main" },
                }}
              />
              <IconButton type="submit" disabled={!comment.trim() || sending} aria-label="Send comment" data-testid="comment-send" sx={{ color: "accent.main" }}>
                {sending ? <CircularProgress size={16} color="inherit" /> : <SendRounded fontSize="small" />}
              </IconButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
});

export default PostWidget;
