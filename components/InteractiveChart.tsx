import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Series {
  label: string;
  data: { x: number; y: number }[];
  color: string;
}

interface InteractiveChartProps {
  title: string;
  series: Series[];
  xLabel?: string;
  yLabel?: string;
}

export function InteractiveChart({ title, series, xLabel, yLabel }: InteractiveChartProps) {
  const chartHeight = SCREEN_WIDTH * 0.55;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes">
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.2.0/dist/chartjs-plugin-zoom.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0F0D; font-family: monospace; }
        .chart-container { position: relative; width: 100%; height: ${chartHeight}px; }
        .title { color: #E8F0EC; font-size: 14px; font-weight: 600; margin-bottom: 8px; font-family: monospace; }
        .controls { margin-bottom: 8px; }
        button { background: #111916; color: #00E5B4; border: 1px solid #1F2E29; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; margin-right: 4px; }
        button:active { background: #1A2420; }
      </style>
    </head>
    <body>
      <div class="title">${title}</div>
      <div class="controls">
        <button onclick="resetZoom()">Reset Zoom</button>
      </div>
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>
      <script>
        const ctx = document.getElementById('chart').getContext('2d');
        const data = {
          datasets: [
            ${series.map((s, i) => `
            {
              label: '${s.label}',
              data: ${JSON.stringify(s.data)},
              borderColor: '${s.color}',
              backgroundColor: '${s.color}22',
              borderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 6,
              tension: 0.3,
              fill: false,
            }`).join(',')}
          ]
        };
        const config = {
          type: 'line',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#7A9A8A',
                  font: { family: 'monospace', size: 11 },
                  boxWidth: 12,
                  padding: 12,
                },
                onClick: function(e, legendItem) {
                  const index = legendItem.datasetIndex;
                  const ci = Chart.getChart('chart');
                  if (ci.isDatasetVisible(index)) {
                    ci.hide(index);
                  } else {
                    ci.show(index);
                  }
                }
              },
              tooltip: {
                backgroundColor: '#111916',
                titleColor: '#E8F0EC',
                bodyColor: '#7A9A8A',
                borderColor: '#1F2E29',
                borderWidth: 1,
                titleFont: { family: 'monospace', size: 12 },
                bodyFont: { family: 'monospace', size: 11 },
                padding: 8,
                displayColors: true,
              },
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'x',
                },
                zoom: {
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  mode: 'x',
                },
              },
            },
            scales: {
              x: {
                type: 'linear',
                title: {
                  display: !!'${xLabel || ''}',
                  text: '${xLabel || ''}',
                  color: '#7A9A8A',
                  font: { family: 'monospace', size: 11 },
                },
                ticks: {
                  color: '#7A9A8A',
                  font: { family: 'monospace', size: 10 },
                  maxTicksLimit: 10,
                },
                grid: { color: '#1F2E29' },
              },
              y: {
                title: {
                  display: !!'${yLabel || ''}',
                  text: '${yLabel || ''}',
                  color: '#7A9A8A',
                  font: { family: 'monospace', size: 11 },
                },
                ticks: {
                  color: '#7A9A8A',
                  font: { family: 'monospace', size: 10 },
                },
                grid: { color: '#1F2E29' },
                beginAtZero: true,
              },
            },
          },
        };
        const chart = new Chart(ctx, config);
        function resetZoom() {
          chart.resetZoom();
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <WebView
        source={{ html }}
        style={[styles.webview, { height: chartHeight + 40 }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
  webview: {
    width: SCREEN_WIDTH - SCREEN_WIDTH * 0.08,
    backgroundColor: '#0A0F0D',
    borderRadius: 12,
  },
});
