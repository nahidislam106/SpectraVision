import { useState, useEffect, useRef } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import type { SpectralReading } from '../lib/predictions';

export function useReadingHistory(count = 20) {
  const [readings, setReadings] = useState<SpectralReading[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const q = query(ref(db, '/spectral_readings'), limitToLast(count));
    const unsub = onValue(q, (snap) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        const items: SpectralReading[] = [];
        snap.forEach((child) => {
          items.push({ id: child.key!, ...(child.val() as Omit<SpectralReading, 'id'>) });
        });
        setReadings(items);
      }, 500);
    });
    return () => {
      unsub();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [count]);

  return readings;
}
