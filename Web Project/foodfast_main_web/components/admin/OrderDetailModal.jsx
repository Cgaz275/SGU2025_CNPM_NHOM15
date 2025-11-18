'use client'
import { useState, useEffect } from 'react'
import { X, MapPin, Package, CreditCard, Zap, Loader } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { formatTimestampDisplay } from '@/utils/timestampUtils'
import { updateOrderStatus, canChangeOrderStatus, getAvailableNextStatuses } from '@/utils/orderUtils'
import toast from 'react-hot-toast'
import AssignDroneModal from './AssignDroneModal'
import OrderTrackingMap from '@/components/Orders/OrderTrackingMap'

export default function OrderDetailModal({ isOpen, order, onClose, onStatusChange }) {
    const [isAssignDroneOpen, setIsAssignDroneOpen] = useState(false)
    const [statusChanging, setStatusChanging] = useState(false)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    const [droneLocation, setDroneLocation] = useState(null)
    const [loadingDroneLocation, setLoadingDroneLocation] = useState(false)

    const handleStatusChange = async (newStatus) => {
        if (!order?.id) {
            toast.error('Order ID not found')
            return
        }

        setStatusChanging(true)
        try {
            await updateOrderStatus(order.id, newStatus)
            toast.success(`Order status updated to ${newStatus}`)
            setShowStatusDropdown(false)
            onStatusChange?.()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update order status')
        } finally {
            setStatusChanging(false)
        }
    }

    useEffect(() => {
        if (!isOpen || !order?.assignedDroneId) {
            setDroneLocation(null)
            return
        }

        const fetchDroneLocation = async () => {
            setLoadingDroneLocation(true)
            try {
                const droneRef = doc(db, 'drones', order.assignedDroneId)
                const droneSnap = await getDoc(droneRef)
                if (droneSnap.exists()) {
                    const droneData = droneSnap.data()
                    setDroneLocation(droneData.latlong || null)
                }
            } catch (error) {
                console.error('Error fetching drone location:', error)
            } finally {
                setLoadingDroneLocation(false)
            }
        }

        fetchDroneLocation()

        // Poll drone location every 3 seconds
        const interval = setInterval(fetchDroneLocation, 3000)
        return () => clearInterval(interval)
    }, [isOpen, order?.assignedDroneId])

    if (!isOpen || !order) return null

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || ''
        const colors = {
            pending: 'bg-amber-100 text-amber-800 border border-amber-300',
            confirmed: 'bg-blue-100 text-blue-800 border border-blue-300',
            shipping: 'bg-purple-100 text-purple-800 border border-purple-300',
            completed: 'bg-green-100 text-green-800 border border-green-300',
            cancelled: 'bg-red-100 text-red-800 border border-red-300',
        }
        return colors[statusLower] || 'bg-slate-100 text-slate-700 border border-slate-300'
    }

    const items = Array.isArray(order.items) ? order.items : []

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-800">Order Details</h2>
                        <p className="text-sm text-slate-600 mt-1">ID: {order.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Status and Payment Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg relative">
                            <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Status</p>
                            <div className="relative">
                                <button
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${getStatusColor(order.status)} cursor-pointer hover:opacity-80 transition`}
                                    disabled={!canChangeOrderStatus(order.status) || statusChanging}
                                >
                                    {order.status || 'Unknown'}
                                </button>

                                {/* Status Dropdown Menu */}
                                {showStatusDropdown && canChangeOrderStatus(order.status) && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                                        {getAvailableNextStatuses(order.status).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(status)}
                                                disabled={statusChanging}
                                                className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-slate-50 transition first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0 ${
                                                    statusChanging ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {statusChanging ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader size={14} className="animate-spin" />
                                                        Changing to {status}...
                                                    </span>
                                                ) : (
                                                    status
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Payment Status</p>
                            <p className={`text-sm font-medium ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {order.isPaid ? '✓ Paid' : '✗ Unpaid'} • {order.paymentMethod || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Assigned Drone Info */}
                    {order.assignedDroneName && (
                        <>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={16} className="text-blue-600" />
                                    <p className="text-xs text-blue-600 uppercase font-semibold">Assigned Drone</p>
                                </div>
                                <p className="text-lg font-semibold text-blue-900">{order.assignedDroneName}</p>
                                {order.assignedDroneId && (
                                    <p className="text-xs text-blue-700 mt-1">ID: {order.assignedDroneId}</p>
                                )}
                            </div>

                            {/* Drone Live Location */}
                            {order.status?.toLowerCase() === 'shipping' && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">🚁</span>
                                        <p className="text-xs text-purple-600 uppercase font-semibold">Drone Live Location</p>
                                    </div>
                                    {loadingDroneLocation ? (
                                        <p className="text-sm text-slate-600">Loading location...</p>
                                    ) : droneLocation ? (
                                        <div className="space-y-2 text-sm">
                                            <p className="text-slate-700">
                                                <span className="font-semibold">Latitude:</span> <code className="bg-white px-2 py-1 rounded text-purple-600">{droneLocation.latitude?.toFixed(6)}</code>
                                            </p>
                                            <p className="text-slate-700">
                                                <span className="font-semibold">Longitude:</span> <code className="bg-white px-2 py-1 rounded text-purple-600">{droneLocation.longitude?.toFixed(6)}</code>
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-600">Drone location not available yet</p>
                                    )}
                                </div>
                            )}

                            {/* Delivery Map for Shipping Orders */}
                            {order.status?.toLowerCase() === 'shipping' && (
                                <div className="mt-4">
                                    <p className="text-xs text-slate-600 uppercase font-semibold mb-3">Delivery Route Map</p>
                                    <OrderTrackingMap order={order} />
                                </div>
                            )}
                        </>
                    )}

                    {/* Order Amounts */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-700">Subtotal:</span>
                                <span className="font-medium">{((order.total || 0) + (order.discount || 0)).toLocaleString('vi-VN')} VND</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span>Discount:</span>
                                    <span className="font-medium">-{order.discount.toLocaleString('vi-VN')} VND</span>
                                </div>
                            )}
                            {order.deliveryFee > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Delivery:</span>
                                    <span className="font-medium">{order.deliveryFee.toLocaleString('vi-VN')} VND</span>
                                </div>
                            )}
                            <div className="border-t border-blue-200 pt-2 flex justify-between items-center text-lg">
                                <span className="font-semibold text-slate-800">Total:</span>
                                <span className="font-bold text-blue-600">{(order.total || 0).toLocaleString('vi-VN')} VND</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.address && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-slate-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Delivery Address</p>
                                    <p className="font-medium text-slate-800">{order.address.name}</p>
                                    <p className="text-sm text-slate-600">{order.address.phone}</p>
                                    <p className="text-sm text-slate-600 mt-1">{order.address.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    {items.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <Package size={20} />
                                Order Items ({items.length})
                            </h3>
                            <div className="space-y-2 border border-slate-200 rounded-lg overflow-hidden">
                                {items.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {item.price?.toLocaleString('vi-VN')} VND × {item.quantity} = {(item.price * item.quantity)?.toLocaleString('vi-VN')} VND
                                                </p>
                                                {item.selectedChoices && Object.keys(item.selectedChoices).length > 0 && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Choices: {Object.entries(item.selectedChoices).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Promo Code */}
                    {order.promotionCode && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 uppercase font-semibold mb-2">Promo Code Applied</p>
                            <p className="font-medium text-purple-800">{order.promotionCode}</p>
                            {order.discountPercent && (
                                <p className="text-sm text-purple-700 mt-1">{order.discountPercent}% discount</p>
                            )}
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Order Placed:</span>
                            <span className="font-medium text-slate-800">{formatTimestampDisplay(order.createdAt)}</span>
                        </div>
                        {order.updatedAt && (
                            <div className="flex justify-between text-slate-600">
                                <span>Last Updated:</span>
                                <span className="font-medium text-slate-800">{formatTimestampDisplay(order.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3">
                    {order.status?.toLowerCase() !== 'cancelled' && !order.assignedDroneId && (
                        <button
                            onClick={() => setIsAssignDroneOpen(true)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                        >
                            <Zap size={18} />
                            Assign Drone
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                    >
                        Close
                    </button>
                </div>

                {/* Assign Drone Modal */}
                <AssignDroneModal
                    isOpen={isAssignDroneOpen}
                    order={order}
                    onClose={() => setIsAssignDroneOpen(false)}
                    onAssignSuccess={onClose}
                />
            </div>
        </div>
    )
}
