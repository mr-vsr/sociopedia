import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

/** Wordmark: a brass monogram seal + serif name. */
const Logo = ({ size = 28, onClick, showName = true }) => (
  <Box
    component={motion.div}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: onClick ? "pointer" : "default", userSelect: "none" }}
  >
    <Box
      sx={{
        width: size + 8,
        height: size + 8,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: (t) =>
          t.palette.mode === "dark"
            ? "linear-gradient(145deg,#D8C08F,#8A6A3B)"
            : "linear-gradient(145deg,#1F3D2F,#10241B)",
        color: (t) => (t.palette.mode === "dark" ? "#10241B" : "#D8C08F"),
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 6px 16px -6px rgba(0,0,0,.4)",
        fontFamily: '"Cormorant Garamond", serif',
        fontWeight: 700,
        fontSize: size * 0.75,
        fontStyle: "italic",
      }}
    >
      S
    </Box>
    {showName && (
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 600,
          fontSize: size,
          letterSpacing: "0.01em",
          color: "text.primary",
          lineHeight: 1,
        }}
      >
        Sociopedia
      </Typography>
    )}
  </Box>
);

export default Logo;
