import { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpectralLineChartProps {
  title: string;
  data: number[];
  labels: string[];
}

export function SpectralLineChart({ title, data, labels }: SpectralLineChartProps) {
  const chartData = useMemo(() => {
    return {
      labels: labels.map((l, i) => (i % 2 === 0 ? l : '')),
      datasets: [
        {
          data: data,
          color: () => '#00E5B4',
          strokeWidth: 2,
        },
      ],
    };
  }, [data, labels]);

  const chartHeight = SCREEN_WIDTH * 0.4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={SCREEN_WIDTH - SCREEN_WIDTH * 0.08}
        height={chartHeight}
        chartConfig={{
          backgroundColor: '#0A0F0D',
          backgroundGradientFrom: '#0A0F0D',
          backgroundGradientTo: '#0A0F0D',
          decimalPlaces: 2,
          color: () => '#00E5B4',
          labelColor: () => '#7A9A8A',
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: '#00E5B4' },
          propsForBackgroundLines: { stroke: '#1F2E29' },
        }}
        style={styles.chart}
        bezier
        withInnerLines
        withOuterLines
        withVerticalLines
        withHorizontalLines
        fromZero
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
