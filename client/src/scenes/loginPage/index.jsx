import { Box, Typography, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import Page from "components/Page";
import Logo from "components/Logo";
import { fadeUp, stagger } from "components/motion";
import Form from "./Form";

const Feature = ({ numeral, title, text }) => (
  <Box component={motion.div} variants={fadeUp} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
    <Typography className="serif" sx={{ fontSize: 22, color: "accent.main", fontStyle: "italic", lineHeight: 1.2, minWidth: 28 }}>
      {numeral}
    </Typography>
    <Box>
      <Typography variant="h5" sx={{ color: "text.primary", mb: 0.3 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13.5, maxWidth: 360 }}>{text}</Typography>
    </Box>
  </Box>
);

const LoginPage = () => {
  const isDesktop = useMediaQuery("(min-width: 1000px)");

  return (
    <Page>
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: isDesktop ? "1.1fr 1fr" : "1fr",
          alignItems: "center",
          gap: { xs: 4, md: 8 },
          px: { xs: "1rem", sm: "6%" },
          py: { xs: 4, md: 6 },
          maxWidth: 1320,
          mx: "auto",
        }}
      >
        <Box component={motion.div} variants={stagger(0.09, 0.1)} initial="hidden" animate="show">
          <Box component={motion.div} variants={fadeUp} sx={{ mb: isDesktop ? 6 : 3 }}>
            <Logo size={30} />
          </Box>
          {isDesktop && (
            <>
              <Typography component={motion.p} variants={fadeUp} variant="overline" sx={{ color: "accent.main", display: "block", mb: 2 }}>
                Est. 2023 · A private social register
              </Typography>
              <Typography
                component={motion.h1}
                variants={fadeUp}
                variant="h1"
                sx={{ fontSize: "clamp(44px, 5vw, 72px)", lineHeight: 1.02, color: "text.primary", mb: 3, maxWidth: 620 }}
              >
                A quieter place for the people{" "}
                <Box component="em" sx={{ color: "accent.main", fontWeight: 500 }}>
                  who matter.
                </Box>
              </Typography>
              <Typography component={motion.p} variants={fadeUp} sx={{ color: "text.secondary", fontSize: 16, maxWidth: 480, mb: 5 }}>
                Share moments, keep your circle close and follow the stories of friends — without the noise.
              </Typography>
              <Box component={motion.div} variants={stagger(0.1)} sx={{ display: "grid", gap: 2.5 }}>
                <Feature numeral="i." title="Your circle, curated" text="Add and remove friends with a tap. Your feed stays personal." />
                <Feature numeral="ii." title="Moments worth keeping" text="Post thoughts and photographs, gather likes and conversation." />
                <Feature numeral="iii." title="Refined by design" text="Calm typography, soft glass and gentle motion in light or dark." />
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ width: "100%", maxWidth: 520, justifySelf: isDesktop ? "end" : "center" }}>
          <Form />
        </Box>
      </Box>
    </Page>
  );
};

export default LoginPage;
