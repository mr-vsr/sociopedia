import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { assetUrl } from "api";
import WidgetWrapper from "components/WidgetWrapper";

const AdvertWidget = () => {
  const [loaded, setLoaded] = useState(false);
  return (
    <WidgetWrapper hover>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
        <Typography variant="overline" sx={{ color: "accent.main" }}>
          Sponsored
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>mikacosmetics.com</Typography>
      </Box>
      <Box sx={{ borderRadius: "16px", overflow: "hidden", position: "relative", aspectRatio: "4 / 3", bgcolor: "neutral.light" }}>
        {!loaded && <Box className="skeleton" sx={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
        <Box
          component="img"
          src={assetUrl("info4.jpeg")}
          alt="Mika Cosmetics"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity .6s, transform 1.2s cubic-bezier(.2,.8,.2,1)",
            "&:hover": { transform: "scale(1.04)" },
          }}
        />
      </Box>
      <Typography variant="h4" sx={{ color: "text.primary", mt: 2 }}>
        Mika Cosmetics
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>
        Considered skincare for a luminous, well-rested complexion — made in small batches.
      </Typography>
    </WidgetWrapper>
  );
};

export default AdvertWidget;
