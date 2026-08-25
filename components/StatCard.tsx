import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
}

export function StatCard({ label, value, subLabel }: StatCardProps) {
  const cardWidth = (SCREEN_WIDTH - SCREEN_WIDTH * 0.08 - 12) / 2;
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111916',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#1F2E29',
    marginBottom: 12,
  },
  label: {
    color: '#7A9A8A',
    fontSize: SCREEN_WIDTH * 0.03,
    fontFamily: 'monospace',
    marginBottom: SCREEN_WIDTH * 0.015,
    letterSpacing: 0.5,
  },
  value: {
    color: '#E8F0EC',
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  subLabel: {
    color: '#7A9A8A',
    fontSize: SCREEN_WIDTH * 0.028,
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
