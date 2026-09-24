import { Box } from "@mui/material";

export const Bone = ({ w = "100%", h = 12, r = 8, sx }) => (
  <Box className="skeleton" sx={{ width: w, height: h, borderRadius: `${r}px`, ...sx }} />
);

export const PostSkeleton = () => (
  <Box className="glass" sx={{ p: 3, borderRadius: "22px", mb: 3 }}>
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
      <Bone w={48} h={48} r={24} />
      <Box sx={{ flex: 1 }}>
        <Bone w="40%" h={12} sx={{ mb: 1 }} />
        <Bone w="25%" h={10} />
      </Box>
    </Box>
    <Bone h={12} sx={{ mb: 1 }} />
    <Bone w="70%" h={12} sx={{ mb: 2 }} />
    <Bone h={260} r={16} />
  </Box>
);

export const CardSkeleton = ({ lines = 4 }) => (
  <Box className="glass" sx={{ p: 3, borderRadius: "22px" }}>
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2.5 }}>
      <Bone w={56} h={56} r={28} />
      <Box sx={{ flex: 1 }}>
        <Bone w="60%" h={14} sx={{ mb: 1 }} />
        <Bone w="35%" h={10} />
      </Box>
    </Box>
    {Array.from({ length: lines }).map((_, i) => (
      <Bone key={i} w={`${90 - i * 12}%`} h={10} sx={{ mb: 1.4 }} />
    ))}
  </Box>
);
