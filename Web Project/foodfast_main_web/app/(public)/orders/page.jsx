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

  // Memoize order categorization - MUST be before early return
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

  const OrderCard = ({ order }) => {
    const firstItem = order.items?.[0] || {};
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'd/MM/yyyy \'at\' HH:mm a');
      } catch {
        return 'N/A';
      }
    };

    return (
      <div className="bg-white border border-[#D0D5DD] rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4 sm:gap-6">
          {/* Product Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {firstItem.image ? (
              <img
                src={firstItem.image}
                alt={firstItem.name || 'Order item'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect fill="%23e5e7eb" width="96" height="96"/%3E%3Ctext x="48" y="48" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="11" font-family="system-ui"%3ENo image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No image
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-[#03081F] mb-2">
              OrderID: {order.id?.slice(0, 13)}
            </h3>
            <div className="space-y-1 text-xs sm:text-sm text-[#667085]">
              <p>{formatDate(order.createdAt)}</p>
              <p>Quantity: {totalQuantity}</p>
              <p className="text-[#FC8A06] font-semibold text-sm sm:text-base">
                Total: {order.total?.toLocaleString()} {currency}
              </p>
            </div>
          </div>

          {/* View Detail Button */}
          <button
            onClick={() => setSelectedOrder(order)}
            className="self-center px-4 py-2 sm:px-6 sm:py-2.5 bg-[#366055] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#2b4c44] transition whitespace-nowrap flex-shrink-0"
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
    <div className="min-h-screen bg-[#F9F9F9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-12">
          My Orders
        </h1>

        {/* Today's Orders */}
        {todayOrders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Today's Order</h2>
            <div className="space-y-4">
              {todayOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <div>
            {todayOrders.length > 0 && <div className="h-px bg-[#E5E7EB] my-8"></div>}
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">
              Order History
            </h2>
            <div className="space-y-4">
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
