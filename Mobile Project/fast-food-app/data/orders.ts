// data/orders.ts
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { CartItem } from './cart';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'waitingCustomer'
  | 'completed'
  | 'cancelled'
  | 'fail';

export type Order = {
  id: string;
  address: any;
  restaurantId: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: any;
  userId: string;

  drone_id: string;
  package_weight_kg: number;
  pickup_latlong: any;
  promotionCode?: string | null;
};

export const addOrder = async (orderData: {
  restaurantId: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  address: any;
  userId: string;

  drone_id: string;
  package_weight_kg: number;
  pickup_latlong: any;
  promotionCode?: string | null;
}): Promise<Order> => {
  try {
    // 👉 determine isPaid
    const isPaid =
      orderData.paymentMethod === 'Visa' || orderData.paymentMethod === 'VNPay';

    // 👉 tạo tạm createdAt local để tính estimatedDelivery
    const createdLocal = new Date();
    const estimatedLocal = new Date(createdLocal.getTime() + 20 * 60 * 1000);

    const docRef = await addDoc(collection(db, 'orders'), {
      restaurantId: orderData.restaurantId,
      items: orderData.items,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      address: orderData.address,
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: orderData.userId,

      drone_id: orderData.drone_id,
      package_weight_kg: orderData.package_weight_kg,
      pickup_latlong: orderData.pickup_latlong,
      promotionCode: orderData.promotionCode || null,

      // 👉 thêm các field mới
      deliveryFee: 0,
      discount: 0,
      discountPercent: 0,
      estimatedDelivery: estimatedLocal,
      isPaid,
    });

    return {
      id: docRef.id,
      restaurantId: orderData.restaurantId,
      items: orderData.items,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      address: orderData.address,
      status: 'pending',
      createdAt: createdLocal,
      userId: orderData.userId,

      drone_id: orderData.drone_id,
      package_weight_kg: orderData.package_weight_kg,
      pickup_latlong: orderData.pickup_latlong,
      promotionCode: orderData.promotionCode || null,

      deliveryFee: 0,
      discount: 0,
      discountPercent: 0,
      estimatedDelivery: estimatedLocal,
      isPaid,
    };
  } catch (error) {
    console.error('Lỗi khi tạo order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date(),
    });
    console.log(`Order ${orderId} updated to status ${status}`);
  } catch (error) {
    console.error('Lỗi khi update order status:', error);
    throw error;
  }
};
