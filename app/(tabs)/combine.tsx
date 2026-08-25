import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLatestReading } from '../../hooks/useLatestReading';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import { StatCard } from '../../components/StatCard';
import { SensorBadge } from '../../components/SensorBadge';
import { InteractiveChart } from '../../components/InteractiveChart';
import { formatDistanceToNow } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CombineScreen() {
  const reading = useLatestReading();
  const history = useReadingHistory(20);

  const as7265xSeries = useMemo(() => {
    if (!reading) return [];
    const labels = ['A','B','C','D','E','F','G','H','I','J','K','L','R','S','T','U','V','W'];
    const nm = [410,435,460,485,510,535,560,585,610,645,680,705,727,760,810,860,900,940];
    return labels.map((l, i) => ({
      label: `${l} (${nm[i]}nm)`,
      data: [{ x: nm[i], y: reading.AS7265X[l as keyof typeof reading.AS7265X] }],
      color: '#00E5B4',
    }));
  }, [reading]);

  const as7341Series = useMemo(() => {
    if (!reading) return [];
    const labels = ['F1_415nm','F2_445nm','F3_480nm','F4_515nm','F5_555nm','F6_590nm','F7_630nm','F8_680nm','Clear','NIR'];
    const nm = [415,445,480,515,555,590,630,680,0,940];
    return labels.map((l, i) => ({
      label: `${l} (${nm[i] > 0 ? nm[i] + 'nm' : 'Clear'})`,
      data: [{ x: nm[i] || 940, y: reading.AS7341[l as keyof typeof reading.AS7341] }],
      color: '#F5A623',
    }));
  }, [reading]);

  const historySeries = useMemo(() => {
    const rData = history.map((r, i) => ({ x: i, y: r.AS7265X.R }));
    const f7Data = history.map((r, i) => ({ x: i, y: r.AS7341.F7_630nm }));
    return [
      { label: 'AS7265X R (727nm)', data: rData, color: '#00E5B4' },
      { label: 'AS7341 F7_630nm', data: f7Data, color: '#F5A623' },
    ];
  }, [history]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>Combined Sensors</Text>
        {reading ? (
          <Text style={styles.updated}>
            Updated {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
          </Text>
        ) : (
          <Text style={styles.updated}>Waiting for data...</Text>
        )}
      </View>

      <View style={styles.grid}>
        <StatCard label="ACTIVE SENSORS" value="2 / 2" subLabel="AS7265x · AS7341" />
        <StatCard label="SPECTRAL CHANNELS" value="28" subLabel="18 + 10 across 410–940 nm" />
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>Prediction model coming soon. ML inference will be enabled in a future update.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sensor Status</Text>
        <SensorBadge name="AS7265X" channels={18} detail="triad" />
        <SensorBadge name="AS7341" channels={10} detail="8 + clear + NIR" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AS7265X — 18 Channels (µW/cm²)</Text>
        {reading ? (
          <InteractiveChart title="Tap legend to toggle channels" series={as7265xSeries} xLabel="Wavelength (nm)" yLabel="Intensity" />
        ) : (
          <Text style={styles.placeholder}>Waiting for data...</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AS7341 — 10 Channels (raw counts)</Text>
        {reading ? (
          <InteractiveChart title="Tap legend to toggle channels" series={as7341Series} xLabel="Wavelength (nm)" yLabel="Counts" />
        ) : (
          <Text style={styles.placeholder}>Waiting for data...</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Realtime History (last 20 readings)</Text>
        <InteractiveChart title="Scroll/Pinch to zoom, tap legend to toggle" series={historySeries} xLabel="Reading Index" yLabel="Value" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0A0F0D',
  },
  content: {
    padding: SCREEN_WIDTH * 0.04,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  header: {
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  appName: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  updated: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.03,
    marginTop: SCREEN_HEIGHT * 0.004,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.012,
  },
  riskWrap: {
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.006,
  },
  messageBox: {
    backgroundColor: '#111916',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#1F2E29',
    marginBottom: SCREEN_HEIGHT * 0.012,
  },
  messageText: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.032,
    textAlign: 'center',
  },
  section: {
    marginTop: SCREEN_HEIGHT * 0.015,
  },
  sectionTitle: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.038,
    fontWeight: '600',
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  placeholder: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.032,
  },
});
