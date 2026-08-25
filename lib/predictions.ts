export interface SpectralReading {
  id?: string;
  AS7265X: {
    A: number; B: number; C: number; D: number; E: number; F: number;
    G: number; H: number; I: number; J: number; K: number; L: number;
    R: number; S: number; T: number; U: number; V: number; W: number;
  };
  AS7341: {
    F1_415nm: number; F2_445nm: number; F3_480nm: number; F4_515nm: number;
    F5_555nm: number; F6_590nm: number; F7_630nm: number; F8_680nm: number;
    Clear: number; NIR: number;
  };
  timestamp: number;
}
