// "Old money" palette: parchment, hunter green, oxblood and aged brass.
export const colorTokens = {
  ivory: { 50: "#FBF8F2", 100: "#F5F0E6", 200: "#ECE4D4", 300: "#DDD2BC" },
  ink: { 900: "#0E1411", 800: "#151D19", 700: "#1C2621", 600: "#26332C", 500: "#3A4740" },
  green: { 900: "#10241B", 800: "#183426", 700: "#1F3D2F", 500: "#3F6651", 300: "#8FAE98", 100: "#DCE6DC" },
  brass: { 700: "#8A6A3B", 500: "#B08D57", 400: "#C4A46E", 300: "#D8C08F", 100: "#F1E6CF" },
  oxblood: { 700: "#5A1622", 500: "#7B2334", 300: "#B55A67" },
  stone: { 700: "#4A463F", 500: "#6F6A5F", 400: "#8C8679", 300: "#ABA596" },
};

const c = colorTokens;

export const themeSettings = (mode) => {
  const dark = mode === "dark";
  const serif = ['"Cormorant Garamond"', "Georgia", "serif"].join(",");
  const sans = ['"Manrope"', "system-ui", "-apple-system", "sans-serif"].join(",");

  const palette = dark
    ? {
        mode,
        primary: { dark: c.brass[300], main: c.brass[400], light: "rgba(196,164,110,0.14)", contrastText: c.ink[900] },
        secondary: { main: c.green[300] },
        error: { main: c.oxblood[300] },
        accent: { main: c.brass[400], wine: c.oxblood[300], green: c.green[300] },
        neutral: { dark: "#EFE8D8", main: "#D9D1BF", mediumMain: "#B4AC99", medium: "#8E8776", light: "rgba(239,232,216,0.06)" },
        background: { default: c.ink[900], alt: "rgba(28,38,33,0.55)", paper: c.ink[700] },
        text: { primary: "#EFE8D8", secondary: "#B4AC99" },
        divider: "rgba(216,192,143,0.14)",
        glass: {
          bg: "rgba(24,33,28,0.52)",
          bgStrong: "rgba(20,28,24,0.82)",
          border: "rgba(216,192,143,0.16)",
          highlight: "rgba(255,245,220,0.07)",
          shadow: "0 1px 0 rgba(255,245,220,0.05) inset, 0 20px 50px -20px rgba(0,0,0,0.65)",
        },
      }
    : {
        mode,
        primary: { dark: c.green[900], main: c.green[700], light: c.green[100], contrastText: c.ivory[50] },
        secondary: { main: c.brass[500] },
        error: { main: c.oxblood[500] },
        accent: { main: c.brass[500], wine: c.oxblood[500], green: c.green[700] },
        neutral: { dark: c.ink[700], main: c.ink[500], mediumMain: c.stone[500], medium: c.stone[400], light: "rgba(31,61,47,0.05)" },
        background: { default: c.ivory[100], alt: "rgba(255,252,246,0.62)", paper: c.ivory[50] },
        text: { primary: c.ink[700], secondary: c.stone[500] },
        divider: "rgba(31,61,47,0.10)",
        glass: {
          bg: "rgba(255,252,246,0.58)",
          bgStrong: "rgba(251,248,242,0.9)",
          border: "rgba(255,255,255,0.7)",
          highlight: "rgba(255,255,255,0.75)",
          shadow: "0 1px 0 rgba(255,255,255,0.8) inset, 0 20px 50px -24px rgba(31,45,37,0.35)",
        },
      };

  return {
    palette,
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: sans,
      fontSize: 13,
      h1: { fontFamily: serif, fontSize: 48, fontWeight: 600, letterSpacing: "-0.01em" },
      h2: { fontFamily: serif, fontSize: 36, fontWeight: 600 },
      h3: { fontFamily: serif, fontSize: 28, fontWeight: 600 },
      h4: { fontFamily: serif, fontSize: 22, fontWeight: 600 },
      h5: { fontFamily: sans, fontSize: 15, fontWeight: 600 },
      h6: { fontFamily: sans, fontSize: 13, fontWeight: 600 },
      button: { fontFamily: sans, fontWeight: 600, letterSpacing: "0.04em", textTransform: "none" },
      overline: { fontFamily: sans, letterSpacing: "0.18em", fontWeight: 600, fontSize: 10.5 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { backgroundColor: palette.background.default } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            padding: "0.6rem 1.4rem",
            transition: "transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .25s, background-color .25s, color .25s",
            "&:active": { transform: "scale(0.97)" },
          },
          containedPrimary: {
            boxShadow: dark
              ? "0 8px 24px -10px rgba(196,164,110,0.55), inset 0 1px 0 rgba(255,255,255,0.35)"
              : "0 8px 24px -10px rgba(31,61,47,0.6), inset 0 1px 0 rgba(255,255,255,0.18)",
            "&:hover": {
              backgroundColor: palette.primary.dark,
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "transform .2s cubic-bezier(.2,.8,.2,1), background-color .2s, color .2s",
            "&:hover": { transform: "translateY(-1px)" },
            "&:active": { transform: "scale(0.9)" },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: dark ? "rgba(255,245,220,0.03)" : "rgba(255,255,255,0.55)",
            transition: "box-shadow .25s, background-color .25s",
            "& fieldset": { borderColor: palette.divider, transition: "border-color .25s" },
            "&:hover fieldset": { borderColor: dark ? c.brass[400] + "88" : c.green[500] + "88" },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${dark ? "rgba(196,164,110,0.15)" : "rgba(31,61,47,0.10)"}`,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? c.ivory[100] : c.ink[700],
            color: dark ? c.ink[800] : c.ivory[50],
            fontSize: 11.5,
            borderRadius: 8,
            padding: "6px 10px",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.glass.bgStrong,
            backdropFilter: "blur(24px) saturate(160%)",
            border: `1px solid ${palette.glass.border}`,
            boxShadow: palette.glass.shadow,
            borderRadius: 14,
            marginTop: 8,
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: palette.divider } } },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? c.ivory[100] : c.ink[700],
            color: dark ? c.ink[800] : c.ivory[50],
            borderRadius: 12,
            fontWeight: 500,
          },
        },
      },
    },
  };
};
