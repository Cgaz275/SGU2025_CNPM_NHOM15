'use client'
import { useState } from 'react'
import { Eye, Loader } from 'lucide-react'
import useOrdersAdmin from '@/hooks/useOrdersAdmin'
import ListWithPagination from '@/components/admin/ListWithPagination'
import OrderDetailModal from '@/components/admin/OrderDetailModal'
import { formatTimestampDisplay } from '@/utils/timestampUtils'

export default function AdminOrders() {
    const { data: orders, loading } = useOrdersAdmin()
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    const handleViewDetails = (order) => {
        setSelectedOrder(order)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetails = () => {
        setIsDetailModalOpen(false)
        setSelectedOrder(null)
    }

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

    const orderColumns = [
        {
            key: 'id',
            label: 'Order ID',
            render: (item) => item.id.slice(0, 8) + '...'
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusColor(item.status)}`}>
                    {item.status || 'Unknown'}
                </span>
            )
        },
        {
            key: 'total',
            label: 'Total',
            render: (item) => `${item.total?.toLocaleString('vi-VN')} VND` || '-'
        },
        {
            key: 'paymentMethod',
            label: 'Payment',
            render: (item) => {
                const method = item.paymentMethod || 'Unknown'
                const colors = {
                    COD: 'bg-orange-100 text-orange-700',
                    STRIPE: 'bg-indigo-100 text-indigo-700',
                    VNPay: 'bg-blue-100 text-blue-700',
                }
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[method] || 'bg-slate-100 text-slate-700'}`}>
                        {method}
                    </span>
                )
            }
        },
        {
            key: 'isPaid',
            label: 'Payment Status',
            render: (item) => (
                <span className={item.isPaid ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {item.isPaid ? '✓ Paid' : '✗ Unpaid'}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (item) => formatTimestampDisplay(item.createdAt)
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item) => (
                <button
                    onClick={() => handleViewDetails(item)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                >
                    <Eye size={16} />
                    View
                </button>
            )
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
            </div>
        )
    }

    return (
        <div className="text-slate-500 mb-40">
            <ListWithPagination
                items={orders}
                columns={orderColumns}
                title="Manage"
                searchFields={['id', 'status', 'userId', 'storeId']}
            />
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                order={selectedOrder}
                onClose={handleCloseDetails}
            />
        </div>
    )
}
