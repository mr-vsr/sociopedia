import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";
import { CheckCircleOutlineRounded, ErrorOutlineRounded } from "@mui/icons-material";
import { spring } from "./motion";

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

let nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "success") => {
    const id = nextId++;
    setToasts((t) => [...t.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <Box
              key={t.id}
              component={motion.div}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
              className="glass"
              data-testid="toast"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.2,
                borderRadius: 999,
                bgcolor: (th) => th.palette.glass.bgStrong,
                boxShadow: (th) => th.palette.glass.shadow,
                fontWeight: 600,
                fontSize: 13,
                color: "text.primary",
              }}
            >
              {t.type === "error" ? (
                <ErrorOutlineRounded sx={{ color: "error.main", fontSize: 18 }} />
              ) : (
                <CheckCircleOutlineRounded sx={{ color: "accent.main", fontSize: 18 }} />
              )}
              {t.message}
            </Box>
          ))}
        </AnimatePresence>
      </Box>
    </ToastContext.Provider>
  );
};
