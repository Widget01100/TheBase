// src/components/ui/AnimatedCounter.tsx
// Animated number counter — skips animation when value hasn't changed

import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useFormatCurrency } from '@/contexts/CurrencyContext';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  format = true,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const lastValueRef = useRef(value);
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  // Subscribe to currency changes so this component re-renders
  const formatCurrency = useFormatCurrency();

  useEffect(() => {
    // Only animate if the actual value changed
    if (lastValueRef.current !== value) {
      spring.set(value);
      lastValueRef.current = value;
    } else {
      // Currency changed but value didn't — snap instantly, no animation
      setDisplayValue(value);
    }
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [spring]);

  const formatted = format ? formatCurrency(displayValue) : displayValue.toString();

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formatted}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
