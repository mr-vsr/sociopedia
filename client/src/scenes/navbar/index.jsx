import { useEffect, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CloseRounded,
  DarkModeOutlined,
  LightModeOutlined,
  LogoutRounded,
  MenuRounded,
  PersonOutlineRounded,
  SearchRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMode, setLogout } from "state";
import { useApi } from "api";
import Logo from "components/Logo";
import UserImage from "components/UserImage";
import { pop } from "components/motion";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDark = useTheme().palette.mode === "dark";
  return (
    <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
      <IconButton onClick={() => dispatch(setMode())} aria-label="Toggle theme" data-testid="theme-toggle" sx={{ color: "text.primary" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
          </motion.span>
        </AnimatePresence>
      </IconButton>
    </Tooltip>
  );
};

const Search = ({ autoFocus = false, onNavigate }) => {
  const api = useApi();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      api(`/users/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => {
          setResults(r);
          setActive(0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, api]);

  useEffect(() => {
    const onDoc = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (u) => {
    setOpen(false);
    setQ("");
    navigate(`/profile/${u._id}`);
    onNavigate && onNavigate();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  const showPanel = open && q.trim();

  return (
    <Box ref={boxRef} sx={{ position: "relative", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.8,
          height: 42,
          borderRadius: 999,
          bgcolor: "neutral.light",
          border: (t) => `1px solid ${t.palette.divider}`,
          transition: "box-shadow .25s, border-color .25s",
          "&:focus-within": {
            borderColor: "accent.main",
            boxShadow: (t) => `0 0 0 4px ${t.palette.mode === "dark" ? "rgba(196,164,110,0.12)" : "rgba(31,61,47,0.08)"}`,
          },
        }}
      >
        <SearchRounded sx={{ color: "text.secondary", fontSize: 20 }} />
        <InputBase
          placeholder="Search people, places, professions…"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          inputProps={{ "aria-label": "Search users", "data-testid": "search-input" }}
          sx={{ flex: 1, fontSize: 13.5 }}
        />
        {loading && <CircularProgress size={14} sx={{ color: "accent.main" }} />}
      </Box>

      <AnimatePresence>
        {showPanel && (
          <Box
            component={motion.div}
            variants={pop}
            initial="hidden"
            animate="show"
            exit="exit"
            className="glass"
            data-testid="search-results"
            sx={{
              position: "absolute",
              top: 50,
              left: 0,
              right: 0,
              p: 0.8,
              borderRadius: "18px",
              bgcolor: (t) => t.palette.glass.bgStrong,
              boxShadow: (t) => t.palette.glass.shadow,
              zIndex: 20,
              minWidth: 280,
            }}
          >
            {!loading && results.length === 0 && (
              <Typography sx={{ p: 1.5, color: "text.secondary", fontSize: 13 }}>No one found for “{q.trim()}”.</Typography>
            )}
            {results.map((u, i) => (
              <Box
                key={u._id}
                component={motion.div}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(u)}
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1,
                  borderRadius: "12px",
                  cursor: "pointer",
                  bgcolor: i === active ? "primary.light" : "transparent",
                  transition: "background-color .2s",
                }}
              >
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <UserImage image={u.picturePath} name={`${u.firstName} ${u.lastName}`} size="36px" ring={false} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" noWrap sx={{ color: "text.primary" }}>
                      {u.firstName} {u.lastName}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
                      {[u.occupation, u.location].filter(Boolean).join(" · ")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isDesktop = useMediaQuery("(min-width: 1000px)");
  const fullName = `${user.firstName} ${user.lastName}`;

  const logout = () => {
    setAnchor(null);
    setMobileOpen(false);
    dispatch(setLogout());
  };

  return (
    <Box
      component={motion.header}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } }}
      sx={{ position: "sticky", top: 0, zIndex: 50, px: { xs: "0.75rem", sm: "4%" }, pt: 1.5 }}
    >
      <Box
        className="glass"
        sx={{
          maxWidth: 1320,
          mx: "auto",
          height: 64,
          px: { xs: 1.5, sm: 2.5 },
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          boxShadow: (t) => t.palette.glass.shadow,
        }}
      >
        <Logo size={24} onClick={() => navigate("/home")} />

        {isDesktop && (
          <Box sx={{ flex: 1, maxWidth: 440 }}>
            <Search />
          </Box>
        )}

        {isDesktop ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThemeToggle />
            <Box
              component={motion.button}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => setAnchor(e.currentTarget)}
              data-testid="account-menu"
              aria-label="Account menu"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pl: 0.5,
                pr: 1.8,
                py: 0.5,
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 999,
                bgcolor: "neutral.light",
                cursor: "pointer",
                color: "text.primary",
                font: "inherit",
              }}
            >
              <UserImage image={user.picturePath} name={fullName} size="32px" ring={false} />
              <Typography variant="h6" noWrap sx={{ maxWidth: 140 }}>
                {user.firstName}
              </Typography>
            </Box>
            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { minWidth: 220, p: 0.5 } }}
            >
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="h6">{fullName}</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{user.email}</Typography>
              </Box>
              <MenuItem
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  setAnchor(null);
                  navigate(`/profile/${user._id}`);
                }}
              >
                <ListItemIcon>
                  <PersonOutlineRounded fontSize="small" />
                </ListItemIcon>
                Your profile
              </MenuItem>
              <MenuItem sx={{ borderRadius: 2, color: "error.main" }} onClick={logout} data-testid="logout">
                <ListItemIcon sx={{ color: "inherit" }}>
                  <LogoutRounded fontSize="small" />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ThemeToggle />
            <IconButton onClick={() => setMobileOpen(true)} aria-label="Open menu" sx={{ color: "text.primary" }}>
              <MenuRounded />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <>
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              sx={{ position: "fixed", inset: 0, bgcolor: "rgba(10,14,12,0.35)", backdropFilter: "blur(4px)", zIndex: 60 }}
            />
            <Box
              component={motion.aside}
              initial={{ x: "100%" }}
              animate={{ x: 0, transition: { type: "spring", stiffness: 320, damping: 34 } }}
              exit={{ x: "100%", transition: { duration: 0.25 } }}
              className="glass"
              sx={{
                position: "fixed",
                top: 8,
                right: 8,
                bottom: 8,
                width: "min(360px, calc(100vw - 16px))",
                borderRadius: "26px",
                bgcolor: (t) => t.palette.glass.bgStrong,
                boxShadow: (t) => t.palette.glass.shadow,
                zIndex: 61,
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Logo size={22} />
                <IconButton onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <CloseRounded />
                </IconButton>
              </Box>
              <Search onNavigate={() => setMobileOpen(false)} />
              <Box
                onClick={() => {
                  setMobileOpen(false);
                  navigate(`/profile/${user._id}`);
                }}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "16px", bgcolor: "neutral.light", cursor: "pointer" }}
              >
                <UserImage image={user.picturePath} name={fullName} size="44px" />
                <Box>
                  <Typography variant="h5">{fullName}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>View your profile</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Box
                component="button"
                onClick={logout}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  py: 1.4,
                  borderRadius: 999,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: "transparent",
                  color: "error.main",
                  font: "inherit",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogoutRounded fontSize="small" /> Sign out
              </Box>
            </Box>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Navbar;
