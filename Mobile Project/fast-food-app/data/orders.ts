// data/orders.ts
import { restaurants } from '../data/mockData';
import { CartItem } from './cart';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'waitingCustomer'
  | 'completed'
  | 'cancelled';

export type Order = {
  id: string;
  restaurantId: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'Cash' | 'Visa' | 'Momo';
  status: OrderStatus;
  createdAt: string;
};

let orders: Order[] = [];

// 🧩 Sample data 5 trạng thái
const sampleOrders: Order[] = [
  {
    id: 'o1',
    restaurantId: 'r1',
    items: [
      {
        id: 'd1',
        name: 'Phở bò tái',
        price: 45000,
        quantity: 1,
        image: require('../assets/images/comtam.jpg'),
      },
    ],
    total: 45000,
    paymentMethod: 'Cash',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'o2',
    restaurantId: 'r2',
    items: [
      {
        id: 'd2',
        name: 'Cơm tấm sườn bì chả',
        price: 55000,
        quantity: 1,
        image: require('../assets/images/comtam.jpg'),
      },
    ],
    total: 55000,
    paymentMethod: 'Visa',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'o3',
    restaurantId: 'r3',
    items: [
      {
        id: 'd3',
        name: 'Bún chả',
        price: 60000,
        quantity: 1,
        image: require('../assets/images/comtam.jpg'),
      },
    ],
    total: 60000,
    paymentMethod: 'Momo',
    status: 'waitingCustomer',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'o4',
    restaurantId: 'r1',
    items: [
      {
        id: 'd4',
        name: 'Cơm chiên Dương Châu',
        price: 50000,
        quantity: 1,
        image: require('../assets/images/comtam.jpg'),
      },
    ],
    total: 50000,
    paymentMethod: 'Cash',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'o5',
    restaurantId: 'r3',
    items: [
      {
        id: 'd5',
        name: 'Mì xào giòn',
        price: 48000,
        quantity: 1,
        image: require('../assets/images/comtam.jpg'),
      },
    ],
    total: 48000,
    paymentMethod: 'Visa',
    status: 'cancelled',
    createdAt: new Date().toISOString(),
  },
];

// 🟢 Lấy danh sách đơn
export const getOrders = () => {
  if (orders.length === 0) {
    orders = [...sampleOrders]; // bơm data demo
  }
  return orders;
};

// 🟢 Map restaurantId => restaurant name
export const getRestaurantName = (id: string) => {
  const restaurant = restaurants.find((r) => r.id === id);
  return restaurant?.name || 'Nhà hàng không xác định';
};

// 🟢 Thêm đơn mới (checkout)
export const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
  // 🧩 Clone items để đảm bảo mỗi item có key riêng (tránh trùng id)
  const clonedItems = order.items.map((item, index) => ({
    ...item,
    _localKey: `${item.id}-${Date.now()}-${index}`, // key duy nhất tạm
  }));

  const newOrder: Order = {
    ...order,
    id: `o${Math.random().toString(36).substring(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    items: clonedItems,
  };

  orders.push(newOrder);

  console.log('🧾 Đơn hàng mới được lưu:');
  console.log(JSON.stringify(newOrder, null, 2));

  return newOrder;
};

// 🟢 Cập nhật trạng thái đơn
export const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
  const order = orders.find((o) => o.id === id);
  if (order) order.status = newStatus;
};

// 🟢 Xóa đơn
export const removeOrder = (id: string) => {
  orders = orders.filter((o) => o.id !== id);
};
