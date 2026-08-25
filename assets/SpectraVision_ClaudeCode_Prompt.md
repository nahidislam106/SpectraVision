# SpectraVision Mobile — Expo React Native APK Build Prompt

## Project Overview
Build a **React Native Expo** mobile application called **SpectraVision** that reads live spectral sensor data from a **Firebase Realtime Database** and displays it in a dark-themed, science-instrument-style dashboard. The app must be buildable as a standalone **APK** using `expo build` or **EAS Build**.

---

## Firebase Configuration (Do NOT change)
```
Database URL : https://spectral-a59ca-default-rtdb.firebaseio.com
Database Secret : BtwmJlxo9ZdMdDb0NvP9Lc5K4UBUGHar4Ujjyoyf
Path listened  : /spectral_readings   (push-list of readings)
```

### Firebase Data Structure (exact schema — do not alter)
Each node under `/spectral_readings/{pushId}` contains:
```json
{
  "AS7265X": {
    "A": 0.81619,  "B": 2.97967, "C": 3.59789,
    "D": 1.81591,  "E": 2.35435, "F": 2.07089,
    "G": 1.9461,   "H": 3.18885, "I": 3.52068,
    "J": 0.38298,  "K": 0,       "L": 0,
    "R": 6.8337,   "S": 1.92779, "T": 0.85908,
    "U": 0.8043,   "V": 0.84231, "W": 0
  },
  "AS7341": {
    "F1_415nm": 16,  "F2_445nm": 71,  "F3_480nm": 71,
    "F4_515nm": 95,  "F5_555nm": 129, "F6_590nm": 170,
    "F7_630nm": 175, "F8_680nm": 100,
    "Clear": 265,    "NIR": 44
  },
  "timestamp": 1787402482943
}
```

---

## Tech Stack
```
Framework   : React Native + Expo SDK 51+
Language    : TypeScript
Firebase    : firebase@10.x  (compat mode)
Charts      : react-native-svg + victory-native  OR  react-native-chart-kit
Navigation  : expo-router (file-based) OR @react-navigation/native
Icons       : @expo/vector-icons (Ionicons / MaterialCommunityIcons)
Build       : EAS Build → APK (android.buildType: apk)
```

---

## App Structure
```
app/
  _layout.tsx          ← Root layout, Firebase init, Auth context
  index.tsx            ← Redirect to /dashboard
  (tabs)/
    _layout.tsx        ← Bottom tab navigator
    dashboard.tsx      ← Main bench summary screen
    as7265x.tsx        ← AS7265X 18-channel detail screen
    as7341.tsx         ← AS7341 10-channel detail screen
    history.tsx        ← Detection history list screen
    
components/
  StatCard.tsx         ← Reusable metric card (label + big value + unit)
  SensorBadge.tsx      ← Green dot + sensor name + channel count
  SpectralBarChart.tsx ← Horizontal bar chart for channel values
  SpectralLineChart.tsx← Line chart for realtime history (last 20 readings)
  RiskBadge.tsx        ← Colored pill: CRITICAL/HIGH/MODERATE/LOW

hooks/
  useLatestReading.ts  ← Subscribe to last push node in /spectral_readings
  useReadingHistory.ts ← Subscribe to last N push nodes (limitToLast)

lib/
  firebase.ts          ← Firebase app init (Realtime Database)
  predictions.ts       ← Simple cosine-similarity prediction logic (see below)
```

---

## Screen Specifications

### 1. Dashboard Screen (`dashboard.tsx`)
Mirror the web dashboard layout, adapted for mobile scroll:

**Top header bar:**
- App name: "SpectraVision" with a teal accent dot
- Status chip: green dot + "FIREBASE LIVE" 
- Last updated: relative time ("22s ago")

**Stats Grid (2×2 cards):**
| Card | Value | Sub-label |
|------|-------|-----------|
| ACTIVE SENSORS | 2 / 2 | AS7265x · AS7341 |
| SPECTRAL CHANNELS | 28 | 18 + 10 across 410–940 nm |
| HEALTH SCORE | computed (0–100) | Red-edge slope agreement |
| LATEST PREDICTION | e.g. "Carbide" | Confidence % |

**Combined Spectral Bar Chart:**
- X-axis: wavelength labels (all 28 channels in nm order)
- Y-axis: normalized intensity
- AS7265X channels: teal bars
- AS7341 channels: amber bars
- Title: "Combined spectral curve — LIVE"

**Realtime History Line Chart:**
- Show last 20 readings
- 6 reference bands: R (727nm), S (760nm), NIR, F6_590nm, F7_630nm, F8_680nm
- Rolling window, auto-updates on new Firebase push

**Detection History List (last 6 scans):**
Columns: SCAN # | SAMPLE | PREDICTION | RISK | CONFIDENCE | WHEN
Risk badge colors: CRITICAL=red, HIGH=orange, MODERATE=yellow, LOW=green

**Sensor Status Panel:**
- AS7265x row: name, "18 channels · triad", green OK dot
- AS7341 row: name, "10 channels · 8 + clear + NIR", green OK dot

---

### 2. AS7265X Screen (`as7265x.tsx`)
- 18 horizontal bars, one per channel (A–W)
- Wavelength mapping (nm) shown on each bar label:
  ```
  A=410, B=435, C=460, D=485, E=510, F=535,
  G=560, H=585, I=610, J=645, K=680, L=705,
  R=727, S=760, T=810, U=860, V=900, W=940
  ```
- Value shown as float (calibrated µW/cm²)
- Color gradient: violet → red (by wavelength)
- Last reading timestamp shown at top

---

### 3. AS7341 Screen (`as7341.tsx`)
- 10 bars: F1_415nm → F8_680nm + Clear + NIR
- Integer raw counts (0–65535 range)
- Color: blue → red gradient by wavelength
- NIR and Clear shown in distinct gray/white

---

### 4. History Screen (`history.tsx`)
- Pull-to-refresh
- FlatList of all push nodes from Firebase (newest first)
- Each row: timestamp, 3 key channel values, expandable detail
- Export button (share as CSV text)

---

## Firebase Realtime Subscription Pattern
```typescript
// hooks/useLatestReading.ts
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

export function useLatestReading() {
  const [reading, setReading] = useState(null);
  
  useEffect(() => {
    const q = query(ref(db, '/spectral_readings'), limitToLast(1));
    const unsub = onValue(q, (snap) => {
      snap.forEach(child => setReading({ id: child.key, ...child.val() }));
    });
    return unsub;
  }, []);
  
  return reading;
}
```

---

## Prediction Logic (`lib/predictions.ts`)
Simple rule-based prediction from spectral signature (no ML backend needed for MVP):

```typescript
type Prediction = 'Healthy' | 'Formalin' | 'Wax' | 'Carbide' | 'Unknown';

export function predictSample(reading: SpectralReading): { label: Prediction; confidence: number; risk: 'LOW'|'MODERATE'|'HIGH'|'CRITICAL' } {
  const { AS7265X, AS7341 } = reading;
  
  // Red-edge ratio (R channel 727nm vs I channel 610nm)
  const redEdge = AS7265X.R / (AS7265X.I + 0.001);
  // NIR ratio
  const nirRatio = AS7341.NIR / (AS7341.Clear + 0.001);
  // Visible peak (which channel dominates)
  const visiblePeak = Math.max(AS7341.F5_555nm, AS7341.F6_590nm, AS7341.F7_630nm);
  
  if (redEdge > 1.8 && nirRatio < 0.2) {
    return { label: 'Formalin', confidence: 0.656 + Math.random() * 0.1, risk: 'CRITICAL' };
  } else if (AS7265X.R > 5.0 && AS7341.F7_630nm > 150) {
    return { label: 'Carbide', confidence: 0.80 + Math.random() * 0.08, risk: 'HIGH' };
  } else if (nirRatio > 0.25 && redEdge < 1.2) {
    return { label: 'Wax', confidence: 0.62 + Math.random() * 0.1, risk: 'MODERATE' };
  } else if (redEdge > 1.0 && redEdge < 1.8 && nirRatio > 0.15) {
    return { label: 'Healthy', confidence: 0.84 + Math.random() * 0.08, risk: 'LOW' };
  }
  return { label: 'Unknown', confidence: 0.5, risk: 'MODERATE' };
}
```

---

## Design System (Dark Theme — match web dashboard)
```
Background       : #0A0F0D   (near-black with green tint)
Surface          : #111916   (card background)
Surface elevated : #1A2420   (input / elevated card)
Border           : #1F2E29
Accent teal      : #00E5B4   (live indicators, active values)
Accent amber     : #F5A623   (AS7341 bars, warnings)
Text primary     : #E8F0EC
Text secondary   : #7A9A8A
Critical red     : #FF4444
High orange      : #FF8C00
Moderate yellow  : #FFD700
Low green        : #00C853
Font             : System default (SF Pro / Roboto) — monospace for values
```

---

## EAS Build Config (`eas.json`)
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## `app.json` additions
```json
{
  "expo": {
    "name": "SpectraVision",
    "slug": "spectravision",
    "android": {
      "package": "com.spectra.vision",
      "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"]
    }
  }
}
```

---

## Package Installation Commands
```bash
npx create-expo-app SpectraVisionApp --template blank-typescript
cd SpectraVisionApp

npx expo install firebase
npx expo install expo-router
npx expo install react-native-svg
npm install victory-native
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npm install @expo/vector-icons
npm install date-fns

# EAS CLI
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

---

## Key Implementation Notes

1. **Firebase auth**: Use `database_secret` as legacy token in REST calls OR configure public read rules temporarily. For modular SDK use anonymous auth.

2. **Real-time listener cleanup**: Always return `unsubscribe()` from `useEffect` to avoid memory leaks.

3. **Chart performance**: Use `useMemo` on channel arrays. Don't re-render chart on every Firebase event — debounce 500ms.

4. **Timestamp display**: Convert Firebase server timestamp (ms) using `date-fns formatDistanceToNow`.

5. **Offline handling**: Show last known reading with a "OFFLINE" badge when Firebase connection drops.

6. **Safe areas**: Wrap all screens in `<SafeAreaView>` with `edges={['top']}`.

7. **Android back button**: Handle with `useBackHandler` on detail screens.

8. **APK size optimization**: Use `expo-font` sparingly. Don't bundle unnecessary assets.

---

## Deliverables Expected from Claude Code
1. Complete working Expo TypeScript project
2. All screens implemented and navigable
3. Firebase live subscription working
4. Charts rendering with real data
5. `eas.json` configured for APK output
6. `README.md` with build instructions
7. APK downloadable from EAS dashboard

---

## Reference
- Web dashboard screenshot: SpectraVision dark dashboard with bench summary
- Firebase DB: `spectral-a59ca-default-rtdb.firebaseio.com`
- Sensor firmware: ESP8266 pushing AS7265X (18ch) + AS7341 (10ch) every 10s
