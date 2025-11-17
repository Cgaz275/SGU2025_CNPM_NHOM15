'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import useOrders from '@/hooks/useOrders';
import useCurrentUser from '@/hooks/useCurrentUser';
import OrderDetailModal from '@/components/Modals/OrderDetailModal';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const { user, isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const hasRedirected = useRef(false);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'VND ';

  // Handle redirect to home when user logs out
  useEffect(() => {
    if (!isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error('Please login to view your orders');
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // If not authenticated, show loading (the effect will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#366055] mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const { todayOrders, pastOrders } = useMemo(() => {
    const today = [];
    const past = [];

    orders.forEach((order) => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      if (isToday(orderDate)) {
        today.push(order);
      } else {
        past.push(order);
      }
    });

    return { todayOrders: today, pastOrders: past };
  }, [orders]);

  const OrderCard = ({ order }) => {
    const firstItem = order.items?.[0] || {};
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <div className="bg-[#FAFAF6] rounded-xl p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto sm:mx-0 bg-gray-100 overflow-hidden flex-shrink-0">
            {firstItem.image ? (
              <img
                src={firstItem.image}
                alt={firstItem.name || 'Order item'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="113" height="113" viewBox="0 0 113 113"%3E%3Crect fill="%23e5e7eb" width="113" height="113"/%3E%3Ctext x="56" y="56" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12" font-family="system-ui"%3ENo image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No image
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl sm:text-3xl font-bold text-[#366055] mb-2">
              {firstItem.name || 'Order Item'}
            </h3>
            <div className="space-y-1 text-sm sm:text-base text-[#03081F]">
              <p>Restaurant: {firstItem.restaurant || 'N/A'}</p>
              <p>Unit price: {firstItem.price?.toLocaleString()} {currency}</p>
              <p>Size: {firstItem.size || 'Standard'}</p>
              <p>Quantity: {totalQuantity}</p>
            </div>
            <div className="mt-3">
              <span className="text-[#03081F] text-base">Total: </span>
              <span className="text-[#FC8A06] text-xl sm:text-2xl font-bold">
                {order.total?.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedOrder(order)}
            className="self-start sm:self-center px-6 py-2.5 bg-[#366055] text-white rounded-lg text-sm font-semibold hover:bg-[#2b4c44] transition whitespace-nowrap"
          >
            View detail
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#366055] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400 mb-4">
            There are no Orders yet
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#366055] text-white rounded-lg hover:bg-[#2b4c44] transition"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Today's Orders */}
        {todayOrders.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-black">Today's Order</h2>
            </div>
            <div className="space-y-6">
              {todayOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <div>
            {todayOrders.length > 0 && <div className="h-px bg-[#366055] my-12"></div>}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-black">
                Your Order History
              </h2>
            </div>
            <div className="space-y-6">
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
