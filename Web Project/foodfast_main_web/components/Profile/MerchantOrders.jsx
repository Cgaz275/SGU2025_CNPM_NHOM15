'use client'

import { useState } from 'react'
import useMerchantOrders from '@/hooks/useMerchantOrders'
import Loading from '@/components/Loading'
import { X, Eye, Check, XCircle } from 'lucide-react'
import { updateOrderStatus } from '@/utils/orderUtils'
import toast from 'react-hot-toast'

export default function MerchantOrders({ restaurantId }) {
    const { orders, loading, error } = useMerchantOrders(restaurantId)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [processingOrderId, setProcessingOrderId] = useState(null)

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    const handleStatusChange = async (orderId, newStatus) => {
        setProcessingOrderId(orderId)
        try {
            await updateOrderStatus(orderId, newStatus)
            toast.success(`Order ${newStatus === 'confirmed' ? 'confirmed' : 'rejected'} successfully`)
            if (isModalOpen && selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }))
            }
        } catch (error) {
            console.error('Error updating order status:', error)
            toast.error('Failed to update order status')
        } finally {
            setProcessingOrderId(null)
        }
    }

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || ''
        const colors = {
            pending: 'bg-amber-100 text-amber-800 border border-amber-300',
            confirmed: 'bg-blue-100 text-blue-800 border border-blue-300',
            shipping: 'bg-purple-100 text-purple-800 border border-purple-300',
            completed: 'bg-green-100 text-green-800 border border-green-300',
            cancelled: 'bg-red-100 text-red-800 border border-red-300',
            rejected: 'bg-red-100 text-red-800 border border-red-300',
            order_placed: 'bg-amber-100 text-amber-800 border border-amber-300',
            processing: 'bg-blue-100 text-blue-800 border border-blue-300',
            shipped: 'bg-purple-100 text-purple-800 border border-purple-300',
            delivered: 'bg-green-100 text-green-800 border border-green-300',
        }
        return colors[statusLower] || 'bg-slate-100 text-slate-700 border border-slate-300'
    }

    if (loading) return <Loading />

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600 font-medium mb-2">Error loading orders</p>
                <p className="text-gray-600 text-sm">{error.message}</p>
            </div>
        )
    }

    return (
        <>
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No orders yet</p>
                    <p className="text-gray-500 text-sm">When customers order from your restaurant, they will appear here</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-4 py-4">Order ID</th>
                                <th className="px-4 py-4">Customer</th>
                                <th className="px-4 py-4">Total</th>
                                <th className="px-4 py-4">Payment</th>
                                <th className="px-4 py-4">Coupon</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Date</th>
                                <th className="px-4 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="px-4 py-3 font-medium text-green-600 text-xs">
                                        {order.id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3 truncate max-w-xs">
                                        {order.address?.name || order.user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">
                                        {(order.total || 0).toLocaleString('vi-VN')} VND
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {order.paymentMethod || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.promotionCode ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                {order.promotionCode}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                                            {order.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openModal(order)
                                                }}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                                                title="View Details"
                                            >
                                                <Eye size={14} />
                                                <span className="hidden sm:inline">View</span>
                                            </button>
                                            {order.status?.toLowerCase() === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleStatusChange(order.id, 'confirmed')
                                                        }}
                                                        disabled={processingOrderId === order.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Confirm Order"
                                                    >
                                                        <Check size={14} />
                                                        <span className="hidden sm:inline">Confirm</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleStatusChange(order.id, 'rejected')
                                                        }}
                                                        disabled={processingOrderId === order.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Reject Order"
                                                    >
                                                        <XCircle size={14} />
                                                        <span className="hidden sm:inline">Reject</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-sm z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Order Details</h2>
                                <p className="text-xs text-gray-500 mt-1">Order ID: {selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Customer Details */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Customer Name</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.address?.name || selectedOrder.user?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Phone</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.address?.phone || 'N/A'}</p>
                                    </div>
                                    {selectedOrder.user?.email && (
                                        <div>
                                            <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Email</p>
                                            <p className="font-medium text-slate-800 truncate">{selectedOrder.user.email}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Status</p>
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {selectedOrder.address && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Delivery Address</p>
                                            <p className="font-medium text-slate-800">{selectedOrder.address.name}</p>
                                            <p className="text-sm text-slate-600 mt-1">{selectedOrder.address.phone}</p>
                                            <p className="text-sm text-slate-600 mt-1">{selectedOrder.address.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Items */}
                            {(selectedOrder.items && selectedOrder.items.length > 0 || selectedOrder.orderItems && selectedOrder.orderItems.length > 0) && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">Items Ordered</h3>
                                    <div className="space-y-2 border border-slate-200 rounded-lg overflow-hidden">
                                        {(selectedOrder.items || selectedOrder.orderItems || []).map((item, idx) => (
                                            <div key={idx} className="p-3 bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-800">{item.name || item.product?.name || 'Unknown Item'}</p>
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            {(item.price || item.productPrice)?.toLocaleString()} VND × {item.quantity} = {((item.price || item.productPrice) * item.quantity)?.toLocaleString()} VND
                                                        </p>
                                                        {item.selectedChoices && Object.keys(item.selectedChoices).length > 0 && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Choices: {Object.entries(item.selectedChoices).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {(item.image || item.product?.images?.[0]) && (
                                                        <img
                                                            src={item.image || (typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : item.product?.images?.[0]?.src)}
                                                            alt={item.name || item.product?.name}
                                                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment & Summary */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-700">Subtotal:</span>
                                        <span className="font-medium">{((selectedOrder.total || 0) + (selectedOrder.discount || 0)).toLocaleString()} VND</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Discount:</span>
                                            <span className="font-medium">-{selectedOrder.discount.toLocaleString()} VND</span>
                                        </div>
                                    )}
                                    {selectedOrder.deliveryFee > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-700">Delivery:</span>
                                            <span className="font-medium">{selectedOrder.deliveryFee.toLocaleString()} VND</span>
                                        </div>
                                    )}
                                    <div className="border-t border-blue-200 pt-2 flex justify-between items-center text-lg">
                                        <span className="font-semibold text-slate-800">Total:</span>
                                        <span className="font-bold text-blue-600">{(selectedOrder.total || 0).toLocaleString()} VND</span>
                                    </div>
                                    <div className="pt-3 space-y-2 text-sm border-t border-blue-200">
                                        <div className="flex justify-between">
                                            <span className="text-slate-700">Payment Method:</span>
                                            <span className="font-medium">{selectedOrder.paymentMethod || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-700">Payment Status:</span>
                                            <span className={`font-medium ${selectedOrder.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedOrder.isPaid ? '✓ Paid' : '✗ Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code */}
                            {selectedOrder.promotionCode && (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <p className="text-xs text-purple-600 uppercase font-semibold mb-2">Promo Code Applied</p>
                                    <p className="font-medium text-purple-800">{selectedOrder.promotionCode}</p>
                                    {selectedOrder.discountPercent && (
                                        <p className="text-sm text-purple-700 mt-1">{selectedOrder.discountPercent}% discount</p>
                                    )}
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Order Placed:</span>
                                    <span className="font-medium text-slate-800">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {selectedOrder.updatedAt && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Last Updated:</span>
                                        <span className="font-medium text-slate-800">{new Date(selectedOrder.updatedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex gap-3">
                                {selectedOrder.status?.toLowerCase() === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedOrder.id, 'confirmed')
                                                closeModal()
                                            }}
                                            disabled={processingOrderId === selectedOrder.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check size={18} />
                                            Confirm Order
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedOrder.id, 'rejected')
                                                closeModal()
                                            }}
                                            disabled={processingOrderId === selectedOrder.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={18} />
                                            Reject Order
                                        </button>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
