import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLatestReading } from '../../hooks/useLatestReading';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import { StatCard } from '../../components/StatCard';
import { SensorBadge } from '../../components/SensorBadge';
import { InteractiveChart } from '../../components/InteractiveChart';
import { formatDistanceToNow } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DashboardScreen() {
  const reading = useLatestReading();
  const history = useReadingHistory(20);

  const combinedSeries = useMemo(() => {
    if (!reading) return [];
    const series: { label: string; data: { x: number; y: number }[]; color: string }[] = [];
    const as7265xLabels = ['A','B','C','D','E','F','G','H','I','J','K','L','R','S','T','U','V','W'];
    const as7265xNm = [410,435,460,485,510,535,560,585,610,645,680,705,727,760,810,860,900,940];
    as7265xLabels.forEach((l, i) => {
      series.push({
        label: `AS7265X ${l}`,
        data: [{ x: as7265xNm[i], y: reading.AS7265X[l as keyof typeof reading.AS7265X] }],
        color: '#00E5B4',
      });
    });
    const as7341Labels = ['F1_415nm','F2_445nm','F3_480nm','F4_515nm','F5_555nm','F6_590nm','F7_630nm','F8_680nm','Clear','NIR'];
    const as7341Nm = [415,445,480,515,555,590,630,680,0,940];
    as7341Labels.forEach((l, i) => {
      series.push({
        label: `AS7341 ${l}`,
        data: [{ x: as7341Nm[i] || 940, y: reading.AS7341[l as keyof typeof reading.AS7341] }],
        color: '#F5A623',
      });
    });
    return series;
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
        <Text style={styles.appName}>SpectraVision</Text>
        <View style={styles.statusChip}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>FIREBASE LIVE</Text>
        </View>
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
        <StatCard label="HEALTH SCORE" value="--" subLabel="Red-edge slope agreement" />
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>Prediction model coming soon. ML inference will be enabled in a future update.</Text>
      </View>

      {reading && (
        <View style={styles.section}>
          <InteractiveChart title="Combined spectral curve — LIVE" series={combinedSeries} xLabel="Wavelength (nm)" yLabel="Value" />
        </View>
      )}

      <View style={styles.section}>
        <InteractiveChart title="Realtime History" series={historySeries} xLabel="Reading Index" yLabel="Value" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sensor Status</Text>
        <SensorBadge name="AS7265X" channels={18} detail="triad" />
        <SensorBadge name="AS7341" channels={10} detail="8 + clear + NIR" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection History (last 6 scans)</Text>
        {history.slice(-6).reverse().map((r, idx) => {
          return (
            <View key={r.id || idx} style={styles.historyRow}>
              <Text style={styles.hCol}>#{history.length - 6 + idx + 1}</Text>
              <Text style={styles.hCol}>{formatDistanceToNow(new Date(r.timestamp), { addSuffix: true })}</Text>
              <Text style={styles.hCol}>--</Text>
              <Text style={styles.hCol}>--</Text>
            </View>
          );
        })}
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
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.008,
  },
  liveDot: {
    width: SCREEN_WIDTH * 0.022,
    height: SCREEN_WIDTH * 0.022,
    borderRadius: SCREEN_WIDTH * 0.011,
    backgroundColor: '#00C853',
    marginRight: 6,
  },
  statusText: {
    color: '#00C853',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111916',
    borderRadius: 8,
    padding: SCREEN_WIDTH * 0.03,
    borderWidth: 1,
    borderColor: '#1F2E29',
    marginBottom: SCREEN_HEIGHT * 0.006,
    flexWrap: 'wrap',
  },
  hCol: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.03,
    flex: 1,
    minWidth: SCREEN_WIDTH * 0.2,
  },
});
