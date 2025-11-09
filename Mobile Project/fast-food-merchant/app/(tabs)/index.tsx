import { useRouter } from 'expo-router';
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
  Order,
  updateOrderStatus,
} from '../../data/orders';

function OrderManagementScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'new' | 'inprogress' | 'completed'
  >('new');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleConfirm = (id?: string) => {
    if (!id) return; // tránh lỗi null
    updateOrderStatus(id, 'confirmed');
    setOrders([...getOrders()]);
    setConfirmDialogVisible(false);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return o.status === 'pending';
    if (activeTab === 'inprogress')
      return (
        o.status === 'waitingCustomer' ||
        o.status === 'confirmed' ||
        o.status === 'shipping'
      );
    if (activeTab === 'completed')
      return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.pageTitle}>Quản lý đơn hàng</Text>

      {/* 🧭 Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'new', label: 'Đơn hàng mới' },
          { key: 'inprogress', label: 'Đang thực hiện' },
          { key: 'completed', label: 'Đã giao' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
        ) : (
          filteredOrders.map((order) => (
            <View
              key={order.id}
              style={styles.orderCard}
            >
              <View style={styles.headerRow}>
                <Text style={styles.restaurantName}>
                  {getRestaurantName(order.restaurantId)}
                </Text>
                <Text
                  style={[styles.statusTag, styles[`status_${order.status}`]]}
                >
                  {translateStatus(order.status)}
                </Text>
              </View>
              <Text style={styles.dateText}>
                🕓 {new Date(order.createdAt).toLocaleString('vi-VN')}
              </Text>

              {order.items.map((item) => (
                <View
                  key={item.id}
                  style={styles.itemRow}
                >
                  <Image
                    source={item.image}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString()}đ
                  </Text>
                </View>
              ))}

              <View style={styles.summary}>
                <Text style={styles.paymentMethod}>
                  Thanh toán: {order.paymentMethod}
                </Text>
                <Text style={styles.totalText}>
                  Tổng: {order.total.toLocaleString()}đ
                </Text>
              </View>

              {order.status === 'pending' && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setSelectedOrder(order);
                    setConfirmDialogVisible(true);
                  }}
                >
                  <Text style={styles.confirmText}>Xác nhận đơn</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* 🧾 Portal xác nhận */}
      <Portal>
        <Dialog
          visible={confirmDialogVisible}
          style={{ backgroundColor: '#ffffff' }}
          onDismiss={() => setConfirmDialogVisible(false)}
        >
          <Dialog.Title>Xác nhận đơn hàng</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Bạn có chắc muốn xác nhận đơn hàng{' '}
              <Text style={{ fontWeight: '700' }}>{selectedOrder?.id}</Text>{' '}
              không?
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
                backgroundColor: '#27ae60',
                width: '80%',
                marginBottom: 12,
                paddingVertical: 14,
                borderRadius: 80,
              }}
              onPress={() => {
                if (selectedOrder) handleConfirm(selectedOrder.id);
              }}
            >
              Xác nhận đơn
            </Button>
            <Button
              mode="outlined"
              textColor="#5d5d5d"
              style={{
                borderColor: '#5d5d5d',
                borderWidth: 1,
                width: '80%',
                paddingVertical: 14,
                borderRadius: 80,
              }}
              onPress={() => setConfirmDialogVisible(false)}
            >
              Hủy
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function translateStatus(status: string) {
  switch (status) {
    case 'pending':
      return 'Chờ nhà hàng xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'shipping':
      return 'Đang giao hàng';
    case 'waitingCustomer':
      return 'Chờ người dùng xác nhận';
    case 'completed':
      return 'Hoàn tất';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    padding: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
    paddingLeft: 20,
    color: '#333',
  },

  activeTabButton: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
  },
  tabText: { color: '#555', fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: '700' },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: '#fafafa',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: { fontWeight: '700', fontSize: 16, color: '#333' },
  dateText: { color: '#777', fontSize: 12, marginTop: 4, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemName: { fontWeight: '600', fontSize: 14, color: '#333' },
  itemQuantity: { color: '#666', fontSize: 12 },
  itemPrice: { fontWeight: '600', color: '#000', fontSize: 13 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
    paddingTop: 8,
  },
  paymentMethod: { color: '#777', fontSize: 13 },
  totalText: { color: '#e67e22', fontWeight: '700', fontSize: 15 },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  status_pending: { backgroundColor: '#f1c40f' },
  status_shipping: { backgroundColor: '#be9500ff' },
  status_confirmed: { backgroundColor: '#3498db' },
  status_waitingCustomer: { backgroundColor: '#9b59b6' },
  status_completed: { backgroundColor: '#2ecc71' },
  status_cancelled: { backgroundColor: '#e74c3c' },
  confirmButton: {
    marginTop: 10,
    backgroundColor: '#ffffffff',
    paddingVertical: 10,
    borderColor: '#27ae60',
    borderWidth: 2,
    borderRadius: 30,
    alignItems: 'center',
  },
  confirmText: { color: '#27ae60', fontWeight: '700' },
});

export default function WrappedOrderManagementScreen() {
  return (
    <PaperProvider>
      <OrderManagementScreen />
    </PaperProvider>
  );
}
