import { forwardRef } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";

/** Liquid-glass card. Animates in with its parent's stagger by default. */
const WidgetWrapper = forwardRef(({ children, sx, hover = false, className = "", ...rest }, ref) => (
  <Box
    ref={ref}
    component={motion.section}
    variants={fadeUp}
    className={`glass ${className}`}
    whileHover={hover ? { y: -2 } : undefined}
    sx={{
      p: { xs: "1.25rem", sm: "1.5rem" },
      borderRadius: "22px",
      boxShadow: (t) => t.palette.glass.shadow,
      transition: "box-shadow .35s",
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
));

export default WidgetWrapper;
