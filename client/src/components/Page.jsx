import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { page } from "./motion";

const Page = ({ children, sx }) => (
  <Box component={motion.main} variants={page} initial="initial" animate="animate" exit="exit" sx={{ minHeight: "100vh", ...sx }}>
    {children}
  </Box>
);

export default Page;
