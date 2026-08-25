import { Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLatestReading } from '../../hooks/useLatestReading';
import { InteractiveChart } from '../../components/InteractiveChart';
import { formatDistanceToNow } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AS7341_CHANNELS = [
  { key: 'F1_415nm', nm: 415 }, { key: 'F2_445nm', nm: 445 },
  { key: 'F3_480nm', nm: 480 }, { key: 'F4_515nm', nm: 515 },
  { key: 'F5_555nm', nm: 555 }, { key: 'F6_590nm', nm: 590 },
  { key: 'F7_630nm', nm: 630 }, { key: 'F8_680nm', nm: 680 },
  { key: 'Clear', nm: 0 }, { key: 'NIR', nm: 940 },
];

const CHANNEL_COLORS: Record<string, string> = {
  F1_415nm: '#3B82F6', F2_445nm: '#6366F1', F3_480nm: '#8B5CF6',
  F4_515nm: '#14B8A6', F5_555nm: '#10B981', F6_590nm: '#EAB308',
  F7_630nm: '#F97316', F8_680nm: '#EF4444', Clear: '#9CA3AF', NIR: '#6B7280',
};

export default function AS7341Screen() {
  const reading = useLatestReading();

  const series = AS7341_CHANNELS.map((ch) => ({
    label: `${ch.key} (${ch.nm > 0 ? ch.nm + 'nm' : 'Clear'})`,
    data: reading ? [{ x: ch.nm || 940, y: reading.AS7341[ch.key as keyof typeof reading.AS7341] }] : [],
    color: CHANNEL_COLORS[ch.key],
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AS7341 — 10 Channel Spectral Sensor</Text>
      {reading ? (
        <Text style={styles.timestamp}>
          Last reading: {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
        </Text>
      ) : (
        <Text style={styles.timestamp}>Waiting for data...</Text>
      )}

      <InteractiveChart
        title="Channel Raw Counts (0–65535)"
        series={series}
        xLabel="Wavelength (nm)"
        yLabel="Counts"
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
