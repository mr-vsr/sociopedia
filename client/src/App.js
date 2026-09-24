import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { AnimatePresence, MotionConfig } from "framer-motion";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import AmbientBackground from "components/AmbientBackground";
import { ToastProvider } from "components/Toast";
import { themeSettings } from "./theme";

// Navigate exactly once. RR's <Navigate> re-fires on every render, which loops
// when AnimatePresence keeps an exiting route mounted.
const Redirect = ({ to }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const Protected = ({ isAuth, children }) => (isAuth ? children : <Redirect to="/" />);

// Only redirect signed-in visitors on arrival, so the login page can play its exit animation.
const GuestOnly = ({ isAuth, children }) => {
  const [authedOnArrival] = useState(isAuth);
  return authedOnArrival ? <Redirect to="/home" /> : children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAuth = Boolean(useSelector((state) => state.token && state.user));
  // Key by top-level section so profile -> profile swaps animate too.
  const key = location.pathname.startsWith("/profile") ? location.pathname : location.pathname.split("/")[1];

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={key}>
        <Route path="/" element={<GuestOnly isAuth={isAuth}><LoginPage /></GuestOnly>} />
        <Route path="/home" element={<Protected isAuth={isAuth}><HomePage /></Protected>} />
        <Route path="/profile/:userId" element={<Protected isAuth={isAuth}><ProfilePage /></Protected>} />
        <Route path="*" element={<Redirect to={isAuth ? "/home" : "/"} />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#0E1411" : "#F5F0E6");
  }, [mode]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MotionConfig reducedMotion="user">
            <ToastProvider>
              <AmbientBackground />
              <div style={{ position: "relative", zIndex: 1 }}>
                <AnimatedRoutes />
              </div>
            </ToastProvider>
          </MotionConfig>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
