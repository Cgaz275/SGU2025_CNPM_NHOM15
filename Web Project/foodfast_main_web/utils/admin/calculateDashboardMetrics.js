import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { convertToISO } from '@/utils/timestampUtils'

/**
 * Format revenue in Vietnamese format (5.000.000 VND)
 */
export const formatRevenueVND = (amount) => {
    try {
        const num = parseFloat(amount) || 0
        // Vietnamese uses . for thousands and , for decimals
        // Format: 5.000.000 VND
        const formatted = num.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })
        return `${formatted}`
    } catch (error) {
        console.error('Error formatting revenue:', error)
        return '0'
    }
}

/**
 * Calculate total number of unique customers (users who placed orders + merchants)
 */
export const calculateTotalCustomers = async () => {
    try {
        // Get all users with role = 'user' or 'merchant'
        const usersSnapshot = await getDocs(collection(db, 'user'))
        let totalCustomers = 0

        usersSnapshot.forEach(doc => {
            const user = doc.data()
            // Count all users regardless of role (both customers and merchants)
            if (user.role && (user.role === 'user' || user.role === 'merchant')) {
                totalCustomers++
            }
        })

        return totalCustomers
    } catch (error) {
        console.error('Error calculating total customers:', error)
        return 0
    }
}

/**
 * Calculate total revenue from all orders
 */
export const calculateTotalRevenue = async () => {
    try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'))
        let totalRevenue = 0

        ordersSnapshot.forEach(doc => {
            const order = doc.data()
            if (order.total) {
                totalRevenue += parseFloat(order.total) || 0
            }
        })

        return totalRevenue.toFixed(2)
    } catch (error) {
        console.error('Error calculating total revenue:', error)
        return '0.00'
    }
}

/**
 * Calculate total number of orders
 */
export const calculateTotalOrders = async () => {
    try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'))
        return ordersSnapshot.size
    } catch (error) {
        console.error('Error calculating total orders:', error)
        return 0
    }
}

/**
 * Calculate total number of restaurants/stores
 */
export const calculateTotalStores = async () => {
    try {
        const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'))
        return restaurantsSnapshot.size
    } catch (error) {
        console.error('Error calculating total stores:', error)
        return 0
    }
}

/**
 * Convert Firebase timestamp to ISO string
 * (Wrapper for backward compatibility - uses timestampUtils)
 */
const convertTimestampToISO = (timestamp) => {
    return convertToISO(timestamp)
}

/**
 * Get all orders for the area chart
 */
export const getOrdersForChart = async () => {
    try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'))
        const orders = []

        ordersSnapshot.forEach(doc => {
            const order = doc.data()
            const createdAtISO = convertTimestampToISO(order.createdAt)

            orders.push({
                createdAt: createdAtISO,
                total: order.total || 0
            })
        })

        // Sort by date
        orders.sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateA - dateB
        })

        return orders
    } catch (error) {
        console.error('Error fetching orders for chart:', error)
        return []
    }
}

/**
 * Fetch all dashboard metrics at once
 */
export const fetchDashboardMetrics = async () => {
    try {
        const [customers, revenue, orders, stores, allOrders] = await Promise.all([
            calculateTotalCustomers(),
            calculateTotalRevenue(),
            calculateTotalOrders(),
            calculateTotalStores(),
            getOrdersForChart()
        ])

        return {
            customers,
            revenue,
            orders,
            stores,
            allOrders
        }
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        return {
            customers: 0,
            revenue: '0.00',
            orders: 0,
            stores: 0,
            allOrders: []
        }
    }
}
