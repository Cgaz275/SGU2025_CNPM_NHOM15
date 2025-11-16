'use client';

import { X, MapPin, Truck } from 'lucide-react';
import { format } from 'date-fns';

const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'VND ';

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'dd/MM/yyyy \'at\' HH:mm a');
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusClass = (currentStatus) => {
    const statuses = ['pending', 'confirmed', 'shipping', 'completed'];
    const currentIndex = statuses.indexOf(order.status?.toLowerCase() || 'pending');
    const stepIndex = statuses.indexOf(currentStatus);
    
    if (stepIndex <= currentIndex) {
      return 'bg-[#366055]';
    }
    return 'bg-[#D0D5DD]';
  };

  const getTextClass = (currentStatus) => {
    const statuses = ['pending', 'confirmed', 'shipping', 'completed'];
    const currentIndex = statuses.indexOf(order.status?.toLowerCase() || 'pending');
    const stepIndex = statuses.indexOf(currentStatus);
    
    if (stepIndex <= currentIndex) {
      return 'text-[#366055]';
    }
    return 'text-[#D0D5DD]';
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#366055]">
                Order ID: {order.id?.slice(0, 13)}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#667085]">
                <div>
                  <span>Order date: </span>
                  <span className="font-semibold text-[#1D2939]">{formatDate(order.createdAt)}</span>
                </div>
                <div className="w-px h-5 bg-[#D0D5DD]"></div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#366055]" />
                  <span className="font-semibold text-[#366055]">
                    Estimated delivery: {formatDate(order.estimatedDelivery || order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="self-end sm:self-auto px-6 py-3 bg-[#366055] text-white rounded-lg hover:bg-[#2b4c44] transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Track order
            </button>
          </div>

          <div className="h-px bg-[#D0D5DD]"></div>

          {/* Order Status Timeline */}
          <div className="relative">
            <div className="absolute top-11 left-12 right-12 h-1.5 bg-[#D0D5DD] rounded"></div>
            <div 
              className={`absolute top-11 left-12 h-1.5 bg-[#366055] rounded transition-all duration-500`}
              style={{ 
                width: `${(((['pending', 'confirmed', 'shipping', 'completed'].indexOf(order.status?.toLowerCase() || 'pending')) / 3) * 100)}%` 
              }}
            ></div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 relative">
              {['pending', 'confirmed', 'shipping', 'completed'].map((status, index) => (
                <div key={status} className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full ${getStatusClass(status)} mb-2`}></div>
                  <div className={`text-base sm:text-lg font-medium capitalize ${getTextClass(status)} text-center`}>
                    {status}
                  </div>
                  <div className="text-sm text-[#667085] text-center mt-1">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#D0D5DD]"></div>

          {/* Order Items */}
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl border border-[#D0D5DD] overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110"%3E%3Crect fill="%23e5e7eb" width="110" height="110"/%3E%3Ctext x="50" y="55" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12" font-family="system-ui"%3ENo image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl text-[#344054] font-normal mb-2 truncate">
                    {item.name || 'Unknown Item'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#344054] mb-1">
                    Restaurant: {item.restaurantId || item.restaurant || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-[#344054] line-clamp-2">
                    Address: {item.address || order.address || 'N/A'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-xl font-semibold text-[#1D2939] whitespace-nowrap">
                    {currency}{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#667085]">Qty: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-[#D0D5DD]"></div>

          {/* Payment & Delivery Info */}
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Payment */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-black mb-4">Payment</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#667085]">{order.paymentMethod || 'VNPay'}</span>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-black mb-4">Delivery</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#FC8A06]">Address</p>
                  <p className="text-base sm:text-lg font-medium text-[#667085]">
                    {order.address || order.deliveryAddress || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#FC8A06]">Receiver name</p>
                  <p className="text-base sm:text-lg font-medium text-[#667085]">
                    {order.receiverName || order.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#FC8A06]">Phone Number</p>
                  <p className="text-base sm:text-lg font-medium text-[#667085]">
                    {order.phoneNumber || order.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#D0D5DD]"></div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-medium text-black">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-[#475467] font-medium">Promotion Code</span>
                <span className="text-[#475467] font-medium">{order.promotionCode || order.promoCode || 'Not applied'}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-[#667085] font-medium">Promotion</span>
                <span className="text-[#667085] font-medium">
                  ({order.discountPercent || 0}%) - {(order.discount || 0).toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-[#667085] font-medium">Payment method</span>
                <span className="text-[#667085] font-medium">{order.paymentMethod || 'VNPay'}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-[#667085] font-medium">Total items</span>
                <span className="text-[#667085] font-medium">
                  {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-[#667085] font-medium">Delivery</span>
                <span className="text-[#667085] font-medium">{(order.deliveryFee || 0).toLocaleString()} {currency}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-dashed border-[#D0D5DD]">
              <div className="flex justify-between items-center">
                <span className="text-lg sm:text-xl text-[#667085] font-medium">Total</span>
                <span className="text-lg sm:text-xl text-[#FC8A06] font-bold">
                  {order.total?.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
