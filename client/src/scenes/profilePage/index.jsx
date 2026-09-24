import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import { LocationOnOutlined, WorkOutlineOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setFriends } from "state";
import { useApi } from "api";
import Navbar from "scenes/navbar";
import Page from "components/Page";
import UserImage from "components/UserImage";
import AnimatedNumber from "components/AnimatedNumber";
import { useToast } from "components/Toast";
import { Bone } from "components/Skeleton";
import { fadeUp, stagger } from "components/motion";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";

const Hero = ({ user, isMe }) => {
  const api = useApi();
  const toast = useToast();
  const dispatch = useDispatch();
  const me = useSelector((s) => s.user);
  const [busy, setBusy] = useState(false);
  const isFriend = (me.friends || []).some((f) => (f && f._id ? f._id : f) === user._id);
  const name = `${user.firstName} ${user.lastName}`;

  const toggle = async () => {
    setBusy(true);
    try {
      const data = await api(`/users/${me._id}/${user._id}`, { method: "PATCH" });
      dispatch(setFriends({ friends: data }));
      toast(isFriend ? `Removed ${user.firstName}` : `${user.firstName} added to your circle`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      component={motion.section}
      variants={fadeUp}
      className="glass"
      data-testid="profile-hero"
      sx={{ borderRadius: "28px", overflow: "hidden", boxShadow: (t) => t.palette.glass.shadow }}
    >
      <Box
        sx={{
          height: { xs: 110, md: 150 },
          background: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(120deg,#183426 0%,#26332C 45%,#5A1622 110%)"
              : "linear-gradient(120deg,#1F3D2F 0%,#3F6651 50%,#B08D57 120%)",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 20%, rgba(255,240,210,.35), transparent 45%)",
          },
        }}
      />
      <Box sx={{ px: { xs: 2.5, md: 4 }, pb: 3, pt: 1.5, display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: { xs: 2, md: 3 } }}>
        <Box component={motion.div} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, type: "spring", stiffness: 260, damping: 20 } }} sx={{ position: "relative", zIndex: 1, mt: { xs: "-56px", md: "-72px" }, borderRadius: "50%", bgcolor: "background.paper" }}>
          <UserImage image={user.picturePath} name={name} size="112px" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="h2" sx={{ color: "text.primary", fontSize: { xs: 30, md: 40 }, lineHeight: 1.05 }}>
            {name}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1, color: "text.secondary" }}>
            {user.occupation && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: 13 }}>
                <WorkOutlineOutlined sx={{ fontSize: 17, color: "accent.main" }} /> {user.occupation}
              </Box>
            )}
            {user.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: 13 }}>
                <LocationOnOutlined sx={{ fontSize: 17, color: "accent.main" }} /> {user.location}
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2.5, md: 3.5 }, flexWrap: "wrap" }}>
          {[
            ["Friends", isMe ? (me.friends || []).length : (user.friends || []).filter((id) => String(id) !== me._id).length + (isFriend ? 1 : 0)],
            ["Views", user.viewedProfile],
            ["Impressions", user.impressions],
          ].map(([label, value]) => (
            <Box key={label} sx={{ textAlign: "center" }} data-testid={`hero-${label.toLowerCase()}`}>
              <Typography className="serif" sx={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}>
                <AnimatedNumber value={value} compact />
              </Typography>
              <Typography variant="overline" sx={{ color: "text.secondary", fontSize: 9.5 }}>
                {label}
              </Typography>
            </Box>
          ))}
          {!isMe && (
            <Button variant={isFriend ? "outlined" : "contained"} onClick={toggle} disabled={busy} className="shine" data-testid="hero-friend" sx={{ minWidth: 140 }}>
              {busy ? <CircularProgress size={18} color="inherit" /> : isFriend ? "Remove friend" : "Add to circle"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { userId } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const meId = useSelector((s) => s.user._id);
  const isMe = meId === userId;
  const isDesktop = useMediaQuery("(min-width:1000px)");

  useEffect(() => {
    let alive = true;
    setUser(null);
    setError("");
    api(`/users/${userId}`)
      .then((u) => alive && setUser(u))
      .catch((e) => alive && setError(e.message));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      alive = false;
    };
  }, [userId, api]);

  return (
    <Page>
      <Navbar />
      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: "0.75rem", sm: "4%" }, py: { xs: 3, md: 4 } }}>
        {error ? (
          <Box className="glass" sx={{ p: 5, borderRadius: "24px", textAlign: "center" }}>
            <Typography variant="h3">{error}</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/home")}>
              Back to feed
            </Button>
          </Box>
        ) : !user ? (
          <Box className="glass" sx={{ borderRadius: "28px", overflow: "hidden" }}>
            <Bone h={150} r={0} />
            <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <Bone w={112} h={112} r={56} />
              <Box sx={{ flex: 1 }}>
                <Bone w="40%" h={22} sx={{ mb: 1.5 }} />
                <Bone w="25%" h={12} />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box component={motion.div} variants={stagger(0.1)} initial="hidden" animate="show">
            <Hero user={user} isMe={isMe} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "300px minmax(0,1fr)" : "minmax(0,1fr)",
                gap: 3.5,
                mt: 3.5,
              }}
            >
              <Box component={motion.div} variants={stagger(0.08)} sx={{ display: "flex", flexDirection: "column", gap: 3, ...(isDesktop && { position: "sticky", top: 96, alignSelf: "start" }) }}>
                <FriendListWidget userId={userId} />
              </Box>
              <Box>
                {isMe && <MyPostWidget onlyUserId={userId} />}
                <PostsWidget userId={userId} isProfile />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default ProfilePage;
