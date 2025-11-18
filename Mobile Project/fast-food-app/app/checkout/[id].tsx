import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { updateOrderStatus } from '../../data/orders';
import { db } from '../../FirebaseConfig';
import NavigationScreen from './location';

export default function Checkout3Screen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();

  const [order, setOrder] = useState<any>(null);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>('');

  // ⭐ rating state
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) return;

        const data = orderSnap.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();

        setOrder({ id: orderSnap.id, ...data, createdAt });

        // ⭐ Fetch restaurant name
        if (data.restaurantId) {
          const restRef = doc(db, 'restaurants', data.restaurantId);
          const restSnap = await getDoc(restRef);
          if (restSnap.exists()) {
            setRestaurantName(restSnap.data().name || '');
          }
        }

        // ⭐ CHECK xem order này đã được đánh giá chưa
        const ratingsRef = collection(db, 'ratings');
        const qRating = query(
          ratingsRef,
          where('orderId', '==', orderSnap.id),
          where('userId', '==', data.userId)
        );

        const ratingSnap = await getDocs(qRating);
        if (!ratingSnap.empty) {
          setHasRated(true);
        }
      } catch (error) {
        console.error('Lỗi khi fetch order:', error);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const handleCancel = () => setCancelDialogVisible(true);

  const confirmCancel = async () => {
    try {
      await updateOrderStatus(order.id, 'cancelled');
      setOrder({ ...order, status: 'cancelled' });
    } catch (error) {
      console.error(error);
    } finally {
      setCancelDialogVisible(false);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      await updateOrderStatus(order.id, 'completed');
      setOrder({ ...order, status: 'completed' });
    } catch (error) {
      console.error(error);
    }
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
      case 'fail':
        return 'Đơn hàng đã thất bại do drone hoặc điều kiện thời tiết.';
      default:
        return '';
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Đã đặt' },
    { key: 'confirmed', label: 'Chờ chuẩn bị' },
    { key: 'shipping', label: 'Đang giao đến bạn' },
    { key: 'completed', label: 'Đã hoàn thành' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  const getStatusImage = () => {
    switch (order.status) {
      case 'pending':
        return require('../../assets/states/wait.png');
      case 'confirmed':
        return require('../../assets/states/medicine2.png');
      case 'waitingCustomer':
        return require('../../assets/states/landing2.png');
      case 'completed':
        return require('../../assets/states/package.png');
      case 'cancelled':
        return require('../../assets/states/wait.png');
      case 'shipping':
        return '';
      case 'fail':
        return require('../../assets/states/fail.png');
      default:
        return require('../../assets/states/wait.png');
    }
  };

  const showCancelButton = order.status === 'pending';
  const showConfirmButton = order.status === 'waitingCustomer';

  const serviceFee = 5000;
  const shippingFee = 15000;
  const total = order.total;

  // ⭐ Gửi rating
  const handleSubmitRating = async () => {
    if (!rating) {
      alert('Bạn chưa chọn số sao!');
      return;
    }

    try {
      await addDoc(collection(db, 'ratings'), {
        orderId: order.id,
        restaurantId: order.restaurantId,
        userId: order.userId,
        rating,
        review,
        createdAt: new Date(),
      });

      setHasRated(true);
      alert('Cảm ơn bạn đã đánh giá ❤️');
    } catch (error) {
      console.error('ERROR gửi rating:', error);
      alert('Lỗi khi gửi đánh giá');
    }
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 350 }}
        >
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

          {[
            'pending',
            'confirmed',
            'waitingCustomer',
            'completed',
            'cancelled',
            'fail',
          ].includes(order.status) && (
            <View style={styles.sectionPic}>
              <View style={styles.imageContainer}>
                <Image
                  source={getStatusImage()}
                  style={styles.waitImage}
                />
              </View>
              <Text style={styles.infoTextCentered}>
                {renderStatusMessage()}
              </Text>
            </View>
          )}

          {order.status === 'shipping' && (
            <View style={styles.mapContainer}>
              <NavigationScreen
                pickup={order.pickup_latlong}
                dropoff={order.address?.latlong}
              />
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{restaurantName}</Text>
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
                  source={{ uri: item.image }}
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

          {/* ⭐⭐⭐ UI RATING — chỉ hiện khi COMPLETED & CHƯA ĐÁNH GIÁ ⭐⭐⭐ */}
          {order.status === 'completed' && !hasRated && (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingTitle}>Đánh giá đơn hàng</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setRating(s)}
                  >
                    <Text
                      style={{
                        fontSize: 36,
                        marginRight: 6,
                        color: s <= rating ? '#f1c40f' : '#ccc',
                      }}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Cảm nhận của bạn..."
                value={review}
                onChangeText={setReview}
                style={styles.reviewInput}
                multiline
              />

              <TouchableOpacity
                onPress={handleSubmitRating}
                style={styles.sendRatingBtn}
              >
                <Text style={styles.sendRatingText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.feeRow}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Tổng cộng</Text>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              {total.toLocaleString()}đ
            </Text>
          </View>

          {showCancelButton && (
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

        <Portal>
          <Dialog
            visible={cancelDialogVisible}
            onDismiss={() => setCancelDialogVisible(false)}
            style={{ backgroundColor: '#fff' }}
          >
            <Dialog.Title>Hủy đơn hàng</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Đơn đang được xử lý, bạn có chắc muốn hủy?</Paragraph>
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
                }}
                onPress={confirmCancel}
              >
                Có, hủy đơn
              </Button>

              <Button
                mode="outlined"
                textColor="#363636"
                style={{
                  borderColor: '#363636',
                  width: '80%',
                  paddingVertical: 14,
                  borderRadius: 80,
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  imageContainer: { alignItems: 'center', marginVertical: 16, marginTop: 30 },
  waitImage: { width: 200, height: 200, resizeMode: 'contain' },
  infoTextCentered: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    margin: 10,
  },
  section: { marginHorizontal: 16, marginTop: 0 },
  sectionPic: { marginHorizontal: 16, marginTop: 20, marginBottom: 50 },
  orderId: { fontSize: 17, fontWeight: '600', marginBottom: 9 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  dishRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dishImage: { width: 60, height: 60, borderRadius: 8 },
  dishInfo: { flex: 1, marginLeft: 12 },
  dishName: { fontSize: 16, fontWeight: '600' },
  dishPrice: { fontWeight: '700', color: '#e67e22', marginTop: 4 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  // FOOTER
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

  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#e74c3c',
    borderWidth: 2,
    margin: 16,
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  cancelText: { color: '#e74c3c', fontSize: 18, fontWeight: '700' },

  confirmButton: {
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
    borderWidth: 2,
    margin: 16,
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmText: { color: '#27ae60', fontSize: 18, fontWeight: '700' },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  stepWrapper: { alignItems: 'center', width: 70 },
  stepCircle: {
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  stepCircleActive: { width: 16, height: 16, backgroundColor: '#d7a358' },
  stepLabel: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  stepLabelActive: { color: '#d7a358', fontWeight: '700' },
  stepLine: {
    flex: 1,
    height: 2,
    alignSelf: 'center',
    marginBottom: 33,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: '#d7a358' },

  // ⭐⭐⭐ RATING UI STYLES ⭐⭐⭐
  ratingBox: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ratingTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  starsRow: { flexDirection: 'row', marginBottom: 12 },
  reviewInput: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  sendRatingBtn: {
    marginTop: 12,
    backgroundColor: '#d7a358',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  sendRatingText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
