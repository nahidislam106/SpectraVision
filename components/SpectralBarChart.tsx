import { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Channel {
  label: string;
  value: number;
  color: string;
}

interface SpectralBarChartProps {
  title: string;
  channels: Channel[];
}

export function SpectralBarChart({ title, channels }: SpectralBarChartProps) {
  const data = useMemo(() => {
    return {
      labels: channels.map((c) => c.label),
      datasets: [
        {
          data: channels.map((c) => c.value),
          color: () => '#00E5B4',
        },
      ],
    };
  }, [channels]);

  const chartHeight = SCREEN_WIDTH * 0.4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <BarChart
        data={data}
        width={SCREEN_WIDTH - SCREEN_WIDTH * 0.08}
        height={chartHeight}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#0A0F0D',
          backgroundGradientFrom: '#0A0F0D',
          backgroundGradientTo: '#0A0F0D',
          decimalPlaces: 2,
          color: () => '#00E5B4',
          labelColor: () => '#7A9A8A',
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#00E5B4' },
          propsForBackgroundLines: { stroke: '#1F2E29' },
        }}
        style={styles.chart}
        fromZero
        showValuesOnTopOfBars
        withCustomBarColorFromData
        flatColor
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SCREEN_WIDTH * 0.03,
  },
  title: {
    color: '#E8F0EC',
    fontFamily: 'monospace',
    fontSize: SCREEN_WIDTH * 0.038,
    fontWeight: '600',
    marginBottom: SCREEN_WIDTH * 0.02,
  },
  chart: {
    borderRadius: 12,
  },
});
