import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Provider as PaperProvider,
  Paragraph,
  Portal,
} from 'react-native-paper';
import {
  getOrders,
  getRestaurantName,
  updateOrderStatus,
} from '../../data/orders';

export default function Checkout3Screen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const [order, setOrder] = useState<any>(null);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);

  useEffect(() => {
    const orders = getOrders();
    const found = orders.find((o) => o.id === id);
    setOrder(found);
  }, [id]);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const handleCancel = () => {
    setCancelDialogVisible(true);
  };

  const confirmCancel = () => {
    updateOrderStatus(order.id, 'cancelled');
    setOrder({ ...order, status: 'cancelled' });
    setCancelDialogVisible(false);
  };

  const handleConfirmReceived = () => {
    updateOrderStatus(order.id, 'completed');
    setOrder({ ...order, status: 'completed' });
    alert('🎉 Cảm ơn bạn! Đơn hàng đã được xác nhận hoàn tất.');
  };

  const renderStatusMessage = () => {
    switch (order.status) {
      case 'pending':
        return 'Đang đợi nhà hàng xác nhận đơn hàng.';
      case 'confirmed':
        return 'Nhà hàng đã xác nhận, đang chuẩn bị món ăn.';
      case 'waitingCustomer':
        return 'Drone đã giao hàng, vui lòng xác nhận nếu bạn đã nhận.';
      case 'completed':
        return 'Đơn hàng đã hoàn tất. Cảm ơn bạn đã đặt món!';
      case 'cancelled':
        return 'Đơn hàng đã bị hủy.';
      default:
        return '';
    }
  };
  // Thêm hàm bên trong component
  const getStatusImage = () => {
    switch (order.status) {
      case 'pending':
        return require('../../assets/images/time-left.png');
      case 'confirmed':
        return require('../../assets/images/medicine.png');
      case 'waitingCustomer':
        return require('../../assets/images/landing.png');
      case 'completed':
        return require('../../assets/images/package.png');
      case 'cancelled':
        return require('../../assets/images/time-left.png');
      default:
        return require('../../assets/images/time-left.png');
    }
  };

  const showCancelButton = order.status === 'pending';
  const showConfirmButton = order.status === 'waitingCustomer';
  const serviceFee = 5000;
  const shippingFee = 15000;
  const total = order.total;

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        {/* Scroll nội dung */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 250 }}
        >
          {/* Header */}
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() =>
              from === 'checkout' ? router.push('/(tabs)') : router.back()
            }
          >
            <Image
              source={require('../../assets/icons/close.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Status */}
          <View style={styles.section}>
            <View style={styles.imageContainer}>
              <Image
                source={getStatusImage()} // thay bằng hàm này
                style={styles.waitImage}
              />
            </View>
            <Text style={styles.infoTextCentered}>{renderStatusMessage()}</Text>
          </View>

          {/* Chi tiết đơn hàng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getRestaurantName(order.restaurantId)}
            </Text>
            <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              MÓN ĂN VÀ SỐ LƯỢNG
            </Text>

            {order.items.map((item: any, index: number) => (
              <View
                key={item._localKey || `${item.id}-${index}`}
                style={styles.dishRow}
              >
                <Image
                  source={item.image}
                  style={styles.dishImage}
                />
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName}>{item.name}</Text>
                  <Text style={styles.dishPrice}>
                    {item.price.toLocaleString()}đ x {item.quantity}
                  </Text>
                </View>
              </View>
            ))}

            {/* Các khoản phí */}
            <View style={styles.feeRow}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                Phí dịch vụ
              </Text>
              <Text>{serviceFee.toLocaleString()}đ</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                Phí giao hàng
              </Text>
              <Text>{shippingFee.toLocaleString()}đ</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer cố định dính dưới */}
        <View style={styles.footer}>
          <View style={styles.feeRow}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Tổng cộng</Text>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              {total.toLocaleString()}đ
            </Text>
          </View>

          {showCancelButton && order.status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {showConfirmButton && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmReceived}
            >
              <Text style={styles.confirmText}>Xác nhận đã nhận hàng</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dialog hủy đơn vẫn như cũ */}
        <Portal>
          <Dialog
            visible={cancelDialogVisible}
            onDismiss={() => setCancelDialogVisible(false)}
            style={{
              backgroundColor: '#ffffffff',
            }}
          >
            <Dialog.Title>Hủy đơn hàng</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Chúng tôi đã nhận đơn hàng và đang chờ xử lý, bạn có chắc vẫn
                hủy?
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                padding: 16,
              }}
            >
              <Button
                mode="contained"
                style={{
                  backgroundColor: '#e74c3c',
                  width: '80%',
                  marginBottom: 12,
                  paddingVertical: 14,
                  borderRadius: 80,
                  justifyContent: 'center',
                }}
                onPress={confirmCancel}
              >
                Có, hủy đơn
              </Button>

              <Button
                mode="outlined"
                textColor="#363636ff"
                style={{
                  borderColor: '#363636ff',

                  borderWidth: 1,
                  paddingVertical: 14,
                  borderRadius: 80,
                  width: '80%',
                  justifyContent: 'center',
                }}
                onPress={() => setCancelDialogVisible(false)}
              >
                Tôi sẽ tiếp tục chờ
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

// ... giữ nguyên styles cũ

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  imageContainer: { alignItems: 'center', marginVertical: 16 },
  waitImage: { width: 200, height: 200, resizeMode: 'contain' },
  infoTextCentered: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  section: { marginHorizontal: 16, marginTop: 80 },
  orderId: { fontSize: 17, fontWeight: '600', marginBottom: 9 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dishImage: { width: 60, height: 60, borderRadius: 8 },
  dishInfo: { flex: 1, marginLeft: 12 },
  dishName: { fontSize: 16, fontWeight: '600' },
  dishPrice: { fontWeight: '700', color: '#e67e22', marginTop: 4 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent', // bỏ nền đỏ
    borderColor: '#e74c3c', // viền đỏ
    borderWidth: 2, // độ dày viền
    margin: 16,
    padding: 16,
    borderRadius: 50, // bo tròn
    alignItems: 'center',
  },

  cancelText: {
    color: '#e74c3c', // chữ đỏ
    fontSize: 18,
    fontWeight: '700',
  },

  confirmButton: {
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
    borderWidth: 2, // độ dày viền
    margin: 16,
    padding: 16,
    borderRadius: 50, // bo tròn
    alignItems: 'center',
  },
  confirmText: {
    color: '#27ae60', // chữ đỏ
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
});
