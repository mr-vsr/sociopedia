import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

const fmt = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** Counts up to `value` the first time it scrolls into view. */
const AnimatedNumber = ({ value = 0, compact = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return undefined;
    const format = (v) => (compact ? fmt.format(v) : Math.round(v).toLocaleString("en"));
    const controls = animate(0, Number(value) || 0, {
      duration: 1.2,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, value, compact]);

  return <span ref={ref}>0</span>;
};

export default AnimatedNumber;
