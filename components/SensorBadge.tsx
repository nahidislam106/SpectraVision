import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SensorBadgeProps {
  name: string;
  channels: number;
  detail: string;
}

export function SensorBadge({ name, channels, detail }: SensorBadgeProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { width: SCREEN_WIDTH * 0.022, height: SCREEN_WIDTH * 0.022, borderRadius: SCREEN_WIDTH * 0.011 }]} />
      <Text style={[styles.name, { fontSize: SCREEN_WIDTH * 0.035 }]}>{name}</Text>
      <Text style={[styles.detail, { fontSize: SCREEN_WIDTH * 0.03 }]}>{channels} channels · {detail}</Text>
      <Text style={[styles.ok, { fontSize: SCREEN_WIDTH * 0.03 }]}>OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111916',
    borderRadius: 8,
    padding: SCREEN_WIDTH * 0.03,
    borderWidth: 1,
    borderColor: '#1F2E29',
    marginBottom: 8,
  },
  dot: {
    backgroundColor: '#00C853',
    marginRight: 8,
  },
  name: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontWeight: '600',
    marginRight: 8,
  },
  detail: {
    color: '#7A9A8A',
    fontFamily: 'monospace',
    flex: 1,
  },
  ok: {
    color: '#00C853',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
