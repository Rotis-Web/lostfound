"use client";
import { useEffect, useState, useRef } from "react";

export default function Counter({ end = 100, duration = 5000 }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);

  function easeOutQuart(t: number) {
    return 1 - Math.pow(1 - t, 4);
  }

  useEffect(() => {
    function step(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const value = Math.floor(easedProgress * end);
      setCount(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);

    return () => {
      startTime.current = null;
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}
