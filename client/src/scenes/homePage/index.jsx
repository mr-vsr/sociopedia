import { Box, Typography, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import Page from "components/Page";
import { fadeUp, stagger } from "components/motion";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import AdvertWidget from "scenes/widgets/AdvertWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Column = ({ children, sticky, sx }) => (
  <Box
    component={motion.div}
    variants={stagger(0.08)}
    sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, ...(sticky && { position: "sticky", top: 96, alignSelf: "start" }), ...sx }}
  >
    {children}
  </Box>
);

const HomePage = () => {
  const isWide = useMediaQuery("(min-width:1200px)");
  const isDesktop = useMediaQuery("(min-width:1000px)");
  const { _id, firstName } = useSelector((state) => state.user);

  const cols = isWide ? "290px minmax(0,1fr) 310px" : isDesktop ? "290px minmax(0,1fr)" : "minmax(0,1fr)";

  return (
    <Page>
      <Navbar />
      <Box
        component={motion.div}
        variants={stagger(0.1, 0.1)}
        initial="hidden"
        animate="show"
        sx={{
          maxWidth: 1320,
          mx: "auto",
          px: { xs: "0.75rem", sm: "4%" },
          py: { xs: 3, md: 4 },
          display: "grid",
          gridTemplateColumns: cols,
          gap: { xs: 3, md: 3.5 },
        }}
      >
        {isDesktop && (
          <Column sticky>
            <UserWidget userId={_id} />
            {!isWide && <FriendListWidget userId={_id} />}
          </Column>
        )}

        <Column>
          <Box component={motion.div} variants={fadeUp} sx={{ px: 0.5 }}>
            <Typography variant="overline" sx={{ color: "accent.main" }}>
              {new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}
            </Typography>
            <Typography variant="h2" sx={{ color: "text.primary", fontSize: { xs: 30, md: 38 }, lineHeight: 1.1 }} data-testid="greeting">
              {greeting()}, <em style={{ fontWeight: 500 }}>{firstName}</em>.
            </Typography>
          </Box>
          <Box>
            <MyPostWidget />
            <PostsWidget userId={_id} />
          </Box>
        </Column>

        {isWide && (
          <Column sticky>
            <AdvertWidget />
            <FriendListWidget userId={_id} />
          </Column>
        )}
      </Box>
    </Page>
  );
};

export default HomePage;
