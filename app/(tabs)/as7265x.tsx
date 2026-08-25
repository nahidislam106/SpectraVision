import { Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLatestReading } from '../../hooks/useLatestReading';
import { InteractiveChart } from '../../components/InteractiveChart';
import { formatDistanceToNow } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AS7265X_CHANNELS = [
  { key: 'A', nm: 410 }, { key: 'B', nm: 435 }, { key: 'C', nm: 460 },
  { key: 'D', nm: 485 }, { key: 'E', nm: 510 }, { key: 'F', nm: 535 },
  { key: 'G', nm: 560 }, { key: 'H', nm: 585 }, { key: 'I', nm: 610 },
  { key: 'J', nm: 645 }, { key: 'K', nm: 680 }, { key: 'L', nm: 705 },
  { key: 'R', nm: 727 }, { key: 'S', nm: 760 }, { key: 'T', nm: 810 },
  { key: 'U', nm: 860 }, { key: 'V', nm: 900 }, { key: 'W', nm: 940 },
];

const WAVELENGTH_COLORS: Record<string, string> = {
  A: '#8B5CF6', B: '#6366F1', C: '#3B82F6', D: '#0EA5E9', E: '#06B6D4',
  F: '#14B8A6', G: '#10B981', H: '#84CC16', I: '#EAB308', J: '#F97316',
  K: '#EF4444', L: '#DC2626', R: '#B91C1C', S: '#991B1B', T: '#7F1D1D',
  U: '#6B7280', V: '#4B5563', W: '#374151',
};

export default function AS7265XScreen() {
  const reading = useLatestReading();

  const series = AS7265X_CHANNELS.map((ch) => ({
    label: `${ch.key} (${ch.nm}nm)`,
    data: reading ? [{ x: ch.nm, y: reading.AS7265X[ch.key as keyof typeof reading.AS7265X] }] : [],
    color: WAVELENGTH_COLORS[ch.key],
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AS7265X — 18 Channel Spectral Sensor</Text>
      {reading ? (
        <Text style={styles.timestamp}>
          Last reading: {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
        </Text>
      ) : (
        <Text style={styles.timestamp}>Waiting for data...</Text>
      )}

      <InteractiveChart
        title="Channel Intensities (µW/cm²)"
        series={series}
        xLabel="Wavelength (nm)"
        yLabel="Intensity"
      />
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
  title: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  timestamp: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
});
