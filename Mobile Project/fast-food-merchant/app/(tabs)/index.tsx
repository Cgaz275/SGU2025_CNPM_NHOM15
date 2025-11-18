import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
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
import { auth, db } from '../../FirebaseConfig';

type Order = {
  id: string;
  restaurantId: string;
  status: string;
  items: {
    id: string;
    name: string;
    image?: { uri: string } | null;
    options?: Record<
      string,
      {
        name?: string;
        price?: number;
        quantity?: number;
      }
    >;
    price: number;
    quantity: number;
  }[];
  total: number;
  createdAt: Date;
  paymentMethod: string;
  updatedAt?: Date;
};

function OrderManagementScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'new' | 'inprogress' | 'completed' | 'cancelled'
  >('new');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    const data = await fetchOrdersForCurrentMerchant();
    setOrders(data);
  };

  const fetchOrdersForCurrentMerchant = async (): Promise<Order[]> => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const uid = user.uid;

      const restaurantQuery = query(
        collection(db, 'restaurants'),
        where('userId', '==', uid)
      );
      const restaurantSnap = await getDocs(restaurantQuery);
      if (restaurantSnap.empty) return [];

      const restaurantId = restaurantSnap.docs[0].id;

      const ordersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', restaurantId)
      );
      const ordersSnap = await getDocs(ordersQuery);

      const fetchedOrders: Order[] = ordersSnap.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          restaurantId: data.restaurantId || restaurantId,
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'Tiền mặt',
          total: data.total ?? 0,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
          items: (data.items || []).map((item: any) => ({
            id: item.id || Math.random().toString(36).substring(7),
            name: item.name || '---',
            image: item.image ? { uri: item.image } : null,
            options: item.options || {},
            price: item.price ?? 0,
            quantity: item.quantity ?? 1,
          })),
        };
      });

      return fetchedOrders;
    } catch (error) {
      console.log('Lỗi load orders:', error);
      return [];
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return o.status === 'pending';
    if (activeTab === 'inprogress')
      return ['waitingCustomer', 'confirmed', 'shipping'].includes(o.status);
    if (activeTab === 'completed') return ['completed'].includes(o.status);
    if (activeTab === 'cancelled')
      return ['fail', 'cancelled'].includes(o.status);
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setConfirmDialogVisible(false);
    } catch (error) {
      console.log('Lỗi update status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Quản lý đơn hàng</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'new', label: 'Mới' },
          { key: 'inprogress', label: 'Đang thực hiện' },
          { key: 'completed', label: 'Đã giao' },
          { key: 'cancelled', label: 'Đã hủy' },
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
                <Text style={styles.restaurantName}>Nhà hàng của bạn</Text>
                <Text
                  style={[styles.statusTag, styles[`status_${order.status}`]]}
                >
                  {translateStatus(order.status)}
                </Text>
              </View>

              <Text style={styles.dateText}>
                🕓 {order.createdAt?.toLocaleString('vi-VN') ?? '---'}
              </Text>

              {order.items.map((item, idx) => (
                <View
                  key={`${item.id}_${idx}`}
                  style={styles.itemRow}
                >
                  {item.image && (
                    <Image
                      source={item.image}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.options &&
                      Object.keys(item.options).map((groupKey) => {
                        const group = item.options?.[groupKey];
                        if (!Array.isArray(group)) return null;

                        return (
                          <View
                            key={groupKey}
                            style={{ marginLeft: 10 }}
                          >
                            <Text style={{ fontWeight: '600', fontSize: 12 }}>
                              {groupKey}:
                            </Text>
                            {group.map((opt: any) => (
                              <Text
                                key={opt.id}
                                style={styles.itemQuantity}
                              >
                                {opt.name ?? '---'} -{' '}
                                {(opt.price ?? 0).toLocaleString()}đ
                              </Text>
                            ))}
                          </View>
                        );
                      })}
                  </View>
                  <Text style={styles.itemPrice}>
                    {item.price?.toLocaleString() ?? 0}đ
                  </Text>
                </View>
              ))}

              <View style={styles.summary}>
                <Text style={styles.paymentMethod}>
                  Thanh toán: {order.paymentMethod}
                </Text>
                <Text style={styles.totalText}>
                  {order.total.toLocaleString()}đ
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
                  <Text style={styles.confirmText}>Xử lý đơn</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={confirmDialogVisible}
          onDismiss={() => setConfirmDialogVisible(false)}
        >
          <Dialog.Title>Xử lý đơn hàng</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Bạn muốn chấp nhận hay từ chối đơn{' '}
              <Text style={{ fontWeight: '700' }}>{selectedOrder?.id}</Text>?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 16,
            }}
          >
            <Button
              mode="contained"
              style={{
                backgroundColor: '#27ae60',
                flex: 1,
                marginRight: 8,
                borderRadius: 80,
              }}
              onPress={() =>
                selectedOrder &&
                handleUpdateStatus(selectedOrder.id, 'confirmed')
              }
            >
              Chấp nhận
            </Button>
            <Button
              mode="outlined"
              textColor="#e74c3c"
              style={{
                borderColor: '#e74c3c',
                borderWidth: 1,
                flex: 1,
                borderRadius: 80,
              }}
              onPress={() =>
                selectedOrder &&
                handleUpdateStatus(selectedOrder.id, 'cancelled')
              }
            >
              Từ chối
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
      return 'Chờ khách';
    case 'completed':
      return 'Hoàn tất';
    case 'cancelled':
      return 'Đã hủy';
    case 'fail':
      return 'Thất bại';
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
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
  activeTabButton: { backgroundColor: '#e67e22', borderColor: '#e67e22' },
  tabText: { color: '#555', fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: '700' },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: '#fafafa',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    borderRadius: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  restaurantName: { fontWeight: '700', fontSize: 16, color: '#333' },
  dateText: { color: '#777', fontSize: 12, marginTop: 4, marginBottom: 10 },
  itemRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemName: { fontWeight: '600', fontSize: 14 },
  itemQuantity: { color: '#666', fontSize: 12 },
  itemPrice: { fontWeight: '600', fontSize: 13 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paymentMethod: { color: '#777' },
  totalText: { color: '#e67e22', fontWeight: '700' },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#fff',
    fontWeight: '600',
  },
  status_pending: { backgroundColor: '#f1c40f' },
  status_shipping: { backgroundColor: '#be9500' },
  status_confirmed: { backgroundColor: '#3498db' },
  status_waitingCustomer: { backgroundColor: '#9b59b6' },
  status_completed: { backgroundColor: '#2ecc71' },
  status_cancelled: { backgroundColor: '#e74c3c' },
  confirmButton: {
    marginTop: 10,
    backgroundColor: '#fff',
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
