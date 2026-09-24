import { useState } from "react";
import { Box } from "@mui/material";
import { assetUrl } from "api";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Round avatar with a brass ring, fade-in on load and an initials fallback. */
const UserImage = ({ image, size = "56px", name = "", ring = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        p: ring ? "2px" : 0,
        background: ring
          ? (t) => `linear-gradient(140deg, ${t.palette.accent.main}, transparent 60%, ${t.palette.accent.main}88)`
          : "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
          bgcolor: (t) => (t.palette.mode === "dark" ? "#26332C" : "#DCE6DC"),
          color: "primary.dark",
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 600,
          fontSize: `calc(${size} * 0.38)`,
        }}
      >
        {showImg ? (
          <img
            src={assetUrl(image)}
            alt={name || "user"}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "scale(1)" : "scale(1.06)",
              transition: "opacity .5s ease, transform .6s ease",
            }}
          />
        ) : (
          initials(name) || "·"
        )}
      </Box>
    </Box>
  );
};

export default UserImage;
