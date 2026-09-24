// Shared motion language: quick, soft, never bouncy enough to feel cheap.
export const ease = [0.2, 0.8, 0.2, 1];

export const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 };

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease } },
};

export const stagger = (step = 0.07, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const pop = {
  hidden: { opacity: 0, scale: 0.96, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.18, ease } },
};

export const page = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.25, ease } },
};
