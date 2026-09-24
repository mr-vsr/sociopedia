import { useState } from "react";
import { PersonAddAlt1Rounded, PersonRemoveRounded } from "@mui/icons-material";
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "state";
import { useApi } from "api";
import { useToast } from "./Toast";
import UserImage from "./UserImage";

const Friend = ({ friendId, name, subtitle, userPicturePath, size = "48px", trailing }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const api = useApi();
  const toast = useToast();
  const { _id, friends = [] } = useSelector((state) => state.user);
  const [busy, setBusy] = useState(false);

  // user.friends holds ids right after login and objects once loaded
  const isFriend = friends.some((f) => (f && f._id ? f._id : f) === friendId);
  const isSelf = friendId === _id;

  const patchFriend = async () => {
    setBusy(true);
    try {
      const data = await api(`/users/${_id}/${friendId}`, { method: "PATCH" });
      dispatch(setFriends({ friends: data }));
      toast(isFriend ? `Removed ${name}` : `${name} added to your circle`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
      <Box
        onClick={() => navigate(`/profile/${friendId}`)}
        sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", minWidth: 0, "&:hover .fname": { color: "accent.main" } }}
      >
        <UserImage image={userPicturePath} size={size} name={name} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            className="fname"
            variant="h5"
            noWrap
            sx={{ color: "text.primary", transition: "color .25s" }}
          >
            {name}
          </Typography>
          {subtitle && (
            <Typography noWrap sx={{ color: "text.secondary", fontSize: 12 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {!isSelf && (
          <Tooltip title={isFriend ? "Remove friend" : "Add friend"}>
            <span>
              <IconButton
                onClick={patchFriend}
                disabled={busy}
                aria-label={isFriend ? `Remove ${name}` : `Add ${name}`}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: isFriend ? "transparent" : "primary.light",
                  border: (t) => `1px solid ${isFriend ? t.palette.divider : "transparent"}`,
                  color: isFriend ? "text.secondary" : "primary.dark",
                  "&:hover": { bgcolor: isFriend ? "rgba(123,35,52,0.08)" : "primary.light", color: isFriend ? "accent.wine" : "primary.dark" },
                }}
              >
                {busy ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isFriend ? "rm" : "add"}
                      initial={{ scale: 0.4, rotate: -45, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.4, rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "flex" }}
                    >
                      {isFriend ? <PersonRemoveRounded fontSize="small" /> : <PersonAddAlt1Rounded fontSize="small" />}
                    </motion.span>
                  </AnimatePresence>
                )}
              </IconButton>
            </span>
          </Tooltip>
        )}
        {trailing}
      </Box>
    </Box>
  );
};

export default Friend;
