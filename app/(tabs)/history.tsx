import { View, Text, StyleSheet, ScrollView, Share, Dimensions } from 'react-native';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import { formatDistanceToNow } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HistoryScreen() {
  const readings = useReadingHistory(50);

  const exportCSV = async () => {
    if (readings.length === 0) return;
    const header = 'Scan,Sample,Timestamp,AS7265X_R,AS7341_F7_630nm\n';
    const rows = readings
      .map((r, i) => {
        return `${i + 1},${r.id},${new Date(r.timestamp).toISOString()},${r.AS7265X.R},${r.AS7341.F7_630nm}`;
      })
      .join('\n');
    await Share.share({ message: header + rows, title: 'SpectraVision History' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Detection History</Text>
        <Text style={styles.exportBtn} onPress={exportCSV}>Download CSV</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
        <Text style={[styles.th, { flex: 1.5 }]}>Sample</Text>
        <Text style={[styles.th, { flex: 1.5 }]}>When</Text>
        <Text style={[styles.th, { flex: 1 }]}>AS7265X R</Text>
        <Text style={[styles.th, { flex: 1 }]}>AS7341 F7</Text>
      </View>

      {readings.slice().reverse().map((r, idx) => {
        return (
          <View key={r.id || idx} style={styles.row}>
            <Text style={[styles.td, { flex: 0.5 }]}>{readings.length - idx}</Text>
            <Text style={[styles.td, { flex: 1.5 }]}>{r.id?.slice(0, 8)}</Text>
            <Text style={[styles.td, { flex: 1.5 }]}>
              {formatDistanceToNow(new Date(r.timestamp), { addSuffix: true })}
            </Text>
            <Text style={[styles.td, { flex: 1 }]}>{r.AS7265X.R.toFixed(2)}</Text>
            <Text style={[styles.td, { flex: 1 }]}>{r.AS7341.F7_630nm}</Text>
          </View>
        );
      })}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  title: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exportBtn: {
    color: '#00E5B4',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2E29',
    paddingBottom: SCREEN_HEIGHT * 0.008,
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  th: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111916',
    borderRadius: 8,
    padding: SCREEN_WIDTH * 0.03,
    borderWidth: 1,
    borderColor: '#1F2E29',
    marginBottom: SCREEN_HEIGHT * 0.006,
  },
  td: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.03,
  },
});
