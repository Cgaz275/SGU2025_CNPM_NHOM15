import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Statistic() {
  // dữ liệu demo
  const weeklyOrders = [12, 19, 7, 15, 10, 22, 18]; // số đơn theo ngày
  const weeklyRevenue = [1200, 1900, 700, 1500, 1000, 2200, 1800]; // doanh thu theo ngày
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Thống kê</Text>
      </View>

      <Text style={styles.title}>Số đơn</Text>

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
          backgroundColor: '#f9f9f9',
          backgroundGradientFrom: '#f9f9f9',
          backgroundGradientTo: '#fff6e9ff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(215,163,89, ${opacity})`, // <-- đổi màu đường
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#D7A359' },
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
          backgroundColor: '#ffffffff',
          backgroundGradientFrom: '#ffffffff',
          backgroundGradientTo: '#fff6e9ff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(215,163,89, ${opacity})`, // <-- đổi màu đường
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', padding: 16 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'left',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 5,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12, // khoảng cách giữa mũi tên và title
  },
});
