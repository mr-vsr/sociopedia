import { useEffect, useState } from "react";
import {
  ArrowOutwardRounded,
  LocationOnOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useApi } from "api";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import AnimatedNumber from "components/AnimatedNumber";
import { CardSkeleton } from "components/Skeleton";

const Stat = ({ label, value }) => (
  <Box sx={{ flex: 1, textAlign: "center" }}>
    <Typography className="serif" sx={{ fontSize: 26, fontWeight: 600, color: "text.primary", lineHeight: 1.1 }}>
      <AnimatedNumber value={value} compact />
    </Typography>
    <Typography variant="overline" sx={{ color: "text.secondary", fontSize: 9.5 }}>
      {label}
    </Typography>
  </Box>
);

const Social = ({ icon, name, sub }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      p: 1,
      mx: -1,
      borderRadius: "12px",
      transition: "background-color .2s",
      "&:hover": { bgcolor: "neutral.light" },
      "&:hover .arrow": { opacity: 1, transform: "translate(0,0)" },
    }}
  >
    <Box component="img" src={icon} alt={name} sx={{ width: 22, height: 22, opacity: 0.85 }} />
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" sx={{ color: "text.primary" }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{sub}</Typography>
    </Box>
    <ArrowOutwardRounded
      className="arrow"
      sx={{ fontSize: 16, color: "accent.main", opacity: 0, transform: "translate(-4px,4px)", transition: "all .25s" }}
    />
  </Box>
);

const UserWidget = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const api = useApi();
  const navigate = useNavigate();
  const me = useSelector((s) => s.user);
  const isMe = me._id === userId;

  useEffect(() => {
    let alive = true;
    setUser(null);
    setError("");
    api(`/users/${userId}`)
      .then((u) => alive && setUser(u))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [userId, api]);

  if (error) {
    return (
      <WidgetWrapper>
        <Typography sx={{ color: "text.secondary" }}>{error}</Typography>
      </WidgetWrapper>
    );
  }
  if (!user) return <CardSkeleton />;

  const { firstName, lastName, location, occupation, viewedProfile, impressions, picturePath } = user;
  const friendsCount = isMe ? (me.friends || []).length : (user.friends || []).length;
  const name = `${firstName} ${lastName}`;

  return (
    <WidgetWrapper data-testid="user-widget">
      <Box
        onClick={() => navigate(`/profile/${userId}`)}
        sx={{ display: "flex", alignItems: "center", gap: 1.8, cursor: "pointer", "&:hover .uname": { color: "accent.main" } }}
      >
        <UserImage image={picturePath} name={name} size="60px" />
        <Box sx={{ minWidth: 0 }}>
          <Typography className="uname" variant="h4" noWrap sx={{ color: "text.primary", transition: "color .25s", lineHeight: 1.15 }}>
            {name}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12.5 }} data-testid="friends-count">
            {friendsCount} {friendsCount === 1 ? "friend" : "friends"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gap: 1.2, my: 2.5 }}>
        {[
          [LocationOnOutlined, location],
          [WorkOutlineOutlined, occupation],
        ]
          .filter(([, v]) => v)
          .map(([Icon, v]) => (
            <Box key={v} sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
              <Icon sx={{ fontSize: 19, color: "accent.main" }} />
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{v}</Typography>
            </Box>
          ))}
      </Box>

      <Divider />
      <Box sx={{ display: "flex", py: 2 }}>
        <Stat label="Profile views" value={viewedProfile} />
        <Divider orientation="vertical" flexItem />
        <Stat label="Impressions" value={impressions} />
      </Box>
      <Divider />

      <Box sx={{ pt: 2 }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Elsewhere
        </Typography>
        <Box sx={{ mt: 1, display: "grid", gap: 0.3 }}>
          <Social icon="/assets/twitter.png" name="Twitter" sub="Social network" />
          <Social icon="/assets/linkedin.png" name="LinkedIn" sub="Professional network" />
        </Box>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;
