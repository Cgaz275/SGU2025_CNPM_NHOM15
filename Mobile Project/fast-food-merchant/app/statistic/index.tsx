import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Statistic() {
  // dữ liệu demo
  const weeklyOrders = [12, 19, 7, 15, 10, 22, 18]; // số đơn theo ngày
  const weeklyRevenue = [1200, 1900, 700, 1500, 1000, 2200, 1800]; // doanh thu theo ngày

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thống kê đơn hàng tuần</Text>
      <LineChart
        data={{
          labels: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          datasets: [{ data: weeklyOrders }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" đơn"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#007AFF' },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />

      <Text style={styles.title}>Doanh thu tuần</Text>
      <BarChart
        data={{
          labels: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          datasets: [{ data: weeklyRevenue }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="₫"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
  },
});
