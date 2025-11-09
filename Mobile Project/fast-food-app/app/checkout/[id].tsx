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
import NavigationScreen from './location';

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
  };

  const renderStatusMessage = () => {
    switch (order.status) {
      case 'pending':
        return 'Đang đợi nhà hàng xác nhận đơn hàng.';
      case 'shipping':
        return 'Drone đang giao hàng đến bạn, vui lòng chờ trong giây lát';
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
  // Trước phần Scroll nội dung
  const statusSteps = [
    { key: 'pending', label: 'Đã đặt' },
    { key: 'confirmed', label: 'Chờ chuẩn bị' },
    { key: 'shipping', label: 'Đang giao đến bạn' },
    { key: 'completed', label: 'Đã hoàn thành' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  // Thêm hàm bên trong component
  const getStatusImage = () => {
    switch (order.status) {
      case 'pending':
        return require('../../assets/images/wait.png');
      case 'confirmed':
        return require('../../assets/images/medicine2.png');
      case 'waitingCustomer':
        return require('../../assets/images/landing2.png');
      case 'completed':
        return require('../../assets/images/package.png');
      case 'cancelled':
        return require('../../assets/images/wait.png');
      case 'shipping':
        return '';
      default:
        return require('../../assets/images/wait.png');
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

          {/* Scroll nội dung */}
          {/* Status */}
          {[
            'pending',
            'confirmed',
            'waitingCustomer',
            'completed',
            'cancelled',
          ].includes(order.status) && (
            <View style={styles.sectionPic}>
              <View style={styles.imageContainer}>
                <Image
                  source={getStatusImage()} // thay bằng hàm này
                  style={styles.waitImage}
                />

                {/* khung map nhỏ chỉ hiện khi đang giao hàng */}
              </View>
              <Text style={styles.infoTextCentered}>
                {renderStatusMessage()}
              </Text>
            </View>
          )}

          {order.status === 'shipping' && (
            <View style={styles.mapContainer}>
              <NavigationScreen />
            </View>
          )}

          <View style={styles.progressContainer}>
            {statusSteps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              return (
                <React.Fragment key={step.key}>
                  <View style={styles.stepWrapper}>
                    <View
                      style={[
                        styles.stepCircle,
                        isActive && styles.stepCircleActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.stepLabel,
                        isActive && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        index < currentStepIndex && styles.stepLineActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
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
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
    marginTop: 30,
    marginBottom: 30,
  },
  waitImage: { width: 200, height: 200, resizeMode: 'contain' },
  infoTextCentered: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300, // giới hạn chiều cao cho map nhỏ
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    margin: 10,
  },
  section: { marginHorizontal: 16, marginTop: 0 },
  sectionPic: { marginHorizontal: 16, marginTop: 20, marginBottom: 50 },

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

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between', // chia đều các step
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 70, // cố định width, chữ dài xuống dòng
  },
  stepCircle: {
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  stepCircleActive: {
    width: 16,
    height: 16,
    backgroundColor: '#d7a358', // màu active
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  stepLabelActive: {
    color: '#d7a358',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    alignSelf: 'center',
    marginBottom: 33,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  stepLineActive: {
    alignSelf: 'center',
    backgroundColor: '#d7a358',
  },
});
