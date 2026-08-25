import { useState, useEffect, useRef } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import type { SpectralReading } from '../lib/predictions';

export function useLatestReading() {
  const [reading, setReading] = useState<SpectralReading | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const q = query(ref(db, '/spectral_readings'), limitToLast(1));
    const unsub = onValue(q, (snap) => {
      snap.forEach((child) => {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          setReading({ id: child.key!, ...(child.val() as Omit<SpectralReading, 'id'>) });
        }, 500);
      });
    });
    return () => {
      unsub();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return reading;
}
