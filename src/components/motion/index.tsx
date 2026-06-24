import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/stores/uiStore";

export function useReduced() {
  return useUiStore((s) => s.reducedMotion);
}

/** Hiện dần khi cuộn tới. */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReduced();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Khối cha xếp con xuất hiện lần lượt. */
export function Stagger({ children, className, gap = 0.06 }: { children: ReactNode; className?: string; gap?: number }) {
  const reduced = useReduced();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReduced();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Số đếm lên. */
export function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 1.1,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const reduced = useReduced();
  const mv = useMotionValue(0);
  const [text, setText] = useState(() => format(reduced ? value : 0));
  useEffect(() => {
    if (reduced) {
      setText(format(value));
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setText(format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);
  return <span className={className}>{text}</span>;
}

/** Chuyển trang mượt. */
export function PageTransition({ children, k }: { children: ReactNode; k: string }) {
  const reduced = useReduced();
  if (reduced) return <div key={k}>{children}</div>;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={k}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Nền gradient động cho màn chọn tài khoản / hero. */
export function AnimatedGradient({ className }: { className?: string }) {
  const reduced = useReduced();
  return (
    <div className={className} aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <motion.div
        style={{
          position: "absolute",
          inset: "-30%",
          background:
            "radial-gradient(40% 50% at 20% 30%, var(--colors-brand-200) 0%, transparent 60%)," +
            "radial-gradient(45% 55% at 80% 20%, var(--colors-blue-light-100) 0%, transparent 60%)," +
            "radial-gradient(50% 60% at 60% 90%, var(--colors-warning-100) 0%, transparent 60%)",
          filter: "blur(8px)",
        }}
        animate={reduced ? undefined : { rotate: [0, 8, -6, 0], scale: [1, 1.08, 1.02, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const CONFETTI_COLORS = [
  "var(--colors-brand-500)",
  "var(--colors-warning-500)",
  "var(--colors-success-500)",
  "var(--colors-accent-500)",
];

/** Confetti một lần khi đạt mốc. Tự ẩn sau ~2.2s. */
export function Confetti({ run }: { run: boolean }) {
  const reduced = useReduced();
  const [show, setShow] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    if (run && !fired.current && !reduced) {
      fired.current = true;
      setShow(true);
      const t = setTimeout(() => setShow(false), 2200);
      return () => clearTimeout(t);
    }
  }, [run, reduced]);
  if (!show) return null;
  const pieces = Array.from({ length: 90 }, (_, i) => i);
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }}>
      {pieces.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.04;
        const size = 6 + (i % 4) * 2;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: "105vh", x: ((i % 5) - 2) * 30, rotate: 360 * ((i % 3) + 1), opacity: [1, 1, 0.9, 0] }}
            transition={{ duration: 2 + (i % 5) * 0.2, delay, ease: "easeIn" }}
            style={{
              position: "absolute",
              top: 0,
              left: `${left}%`,
              width: size,
              height: size * 0.5,
              background: color,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
}
