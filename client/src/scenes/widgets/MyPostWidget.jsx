import { useState } from "react";
import { CloseRounded, ImageOutlined } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, InputBase, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import { useApi } from "api";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import FilePreview from "components/FilePreview";
import { useToast } from "components/Toast";
import { ease } from "components/motion";

const MAX = 2000;
const IMAGE_TYPES = { "image/jpeg": [], "image/png": [], "image/webp": [], "image/gif": [] };

const MyPostWidget = ({ onlyUserId }) => {
  const dispatch = useDispatch();
  const api = useApi();
  const toast = useToast();
  const [showDrop, setShowDrop] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");
  const [busy, setBusy] = useState(false);
  const user = useSelector((state) => state.user);
  const canPost = (post.trim() || image) && post.length <= MAX && !busy;

  const handlePost = async () => {
    if (!canPost) return;
    const formData = new FormData();
    formData.append("description", post.trim());
    if (image) formData.append("picture", image);

    setBusy(true);
    try {
      const posts = await api("/posts", { method: "POST", body: formData });
      dispatch(setPosts({ posts: onlyUserId ? posts.filter((p) => p.userId === onlyUserId) : posts }));
      setImage(null);
      setShowDrop(false);
      setPost("");
      toast("Shared with your circle");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WidgetWrapper sx={{ mb: 3 }} data-testid="composer">
      <Box sx={{ display: "flex", gap: 1.8, alignItems: "flex-start" }}>
        <UserImage image={user.picturePath} name={`${user.firstName} ${user.lastName}`} size="48px" />
        <InputBase
          multiline
          minRows={2}
          maxRows={10}
          placeholder={`What's on your mind, ${user.firstName}?`}
          onChange={(e) => setPost(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
          }}
          value={post}
          inputProps={{ "data-testid": "composer-input", "aria-label": "New post" }}
          sx={{
            flex: 1,
            fontSize: 15,
            px: 2,
            py: 1.4,
            borderRadius: "18px",
            bgcolor: "neutral.light",
            border: (t) => `1px solid ${t.palette.divider}`,
            transition: "box-shadow .25s, border-color .25s",
            "&.Mui-focused": {
              borderColor: "accent.main",
              boxShadow: (t) => `0 0 0 4px ${t.palette.mode === "dark" ? "rgba(196,164,110,0.12)" : "rgba(31,61,47,0.08)"}`,
            },
          }}
        />
      </Box>

      <AnimatePresence initial={false}>
        {showDrop && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.35, ease } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease } }}
            style={{ overflow: "hidden" }}
          >
            <Box sx={{ pt: 2 }}>
              {image ? (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  sx={{ position: "relative", borderRadius: "16px", overflow: "hidden", maxHeight: 360 }}
                >
                  <FilePreview file={image} style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
                  <IconButton
                    onClick={() => setImage(null)}
                    aria-label="Remove image"
                    className="glass"
                    sx={{ position: "absolute", top: 10, right: 10, color: "text.primary", "&:hover": { bgcolor: (t) => t.palette.glass.bgStrong } }}
                  >
                    <CloseRounded fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Dropzone
                  accept={IMAGE_TYPES}
                  maxSize={5 * 1024 * 1024}
                  multiple={false}
                  onDrop={(files) => files[0] && setImage(files[0])}
                  onDropRejected={() => toast("Use a JPG, PNG, WEBP or GIF under 5MB", "error")}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <Box
                      {...getRootProps()}
                      sx={{
                        py: 4,
                        textAlign: "center",
                        borderRadius: "16px",
                        cursor: "pointer",
                        border: (t) => `1.5px dashed ${isDragActive ? t.palette.accent.main : t.palette.divider}`,
                        bgcolor: isDragActive ? "primary.light" : "transparent",
                        transition: "all .25s",
                        "&:hover": { borderColor: "accent.main" },
                      }}
                    >
                      <input {...getInputProps()} data-testid="composer-file" />
                      <ImageOutlined sx={{ color: "accent.main", fontSize: 30, mb: 0.5 }} />
                      <Typography variant="h6" sx={{ color: "text.primary" }}>
                        {isDragActive ? "Drop to attach" : "Drag a photograph here"}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>or click to browse · up to 5MB</Typography>
                    </Box>
                  )}
                </Dropzone>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2, gap: 1 }}>
        <Button
          onClick={() => setShowDrop((s) => !s)}
          startIcon={<ImageOutlined />}
          data-testid="composer-image-toggle"
          sx={{
            color: showDrop ? "accent.main" : "text.secondary",
            bgcolor: showDrop ? "primary.light" : "transparent",
            px: 1.8,
            "&:hover": { bgcolor: "neutral.light", color: "accent.main" },
          }}
        >
          Photo
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AnimatePresence>
            {post.length > MAX * 0.8 && (
              <Typography
                component={motion.span}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{ fontSize: 12, color: post.length > MAX ? "error.main" : "text.secondary" }}
              >
                {MAX - post.length}
              </Typography>
            )}
          </AnimatePresence>
          <Button
            variant="contained"
            disabled={!canPost}
            onClick={handlePost}
            className="shine"
            data-testid="composer-submit"
            sx={{ minWidth: 96 }}
          >
            {busy ? <CircularProgress size={18} color="inherit" /> : "Share"}
          </Button>
        </Box>
      </Box>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
