import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  format?: (val: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, format = (v) => v.toString(), className = "", duration = 1 }: AnimatedCounterProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const display = useTransform(spring, (current) => format(current));

  useEffect(() => {
    setHasMounted(true);
    spring.set(value);
  }, [value, spring]);

  if (!hasMounted) {
    return <span className={className}>{format(value)}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}

export function RealTimeCounter({ value, format = (v) => v.toString(), className = "", fluctuation = 0.02 }: AnimatedCounterProps & { fluctuation?: number }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate ±fluctuation%
      const diff = currentValue * fluctuation * (Math.random() * 2 - 1);
      if (Math.abs(diff) > 0) {
        const nextValue = currentValue + diff;
        setFlashColor(diff > 0 ? "text-green-500" : "text-red-500");
        setCurrentValue(nextValue);
        
        setTimeout(() => {
          setFlashColor(null);
        }, 800);
      }
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(interval);
  }, [currentValue, fluctuation]);

  return (
    <span className={`${className} transition-colors duration-300 ${flashColor || ""}`}>
      <AnimatedCounter value={currentValue} format={format} />
    </span>
  );
}
