import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';

// Define valid status transitions
const STATUS_FLOW = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['shipping'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
  rejected: []
};

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New status to transition to
 * @returns {boolean} - True if transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  const validNextStatuses = STATUS_FLOW[currentStatus?.toLowerCase()] || [];
  return validNextStatuses.includes(newStatus?.toLowerCase());
};

/**
 * Get available next statuses for current status
 * @param {string} currentStatus - Current order status
 * @returns {array} - Array of valid next statuses
 */
export const getAvailableNextStatuses = (currentStatus) => {
  return STATUS_FLOW[currentStatus?.toLowerCase()] || [];
};

/**
 * Check if an order status can be changed
 * @param {string} status - Order status
 * @returns {boolean} - True if status can be changed
 */
export const canChangeOrderStatus = (status) => {
  const unchangeableStatuses = ['completed', 'cancelled', 'rejected'];
  return !unchangeableStatuses.includes(status?.toLowerCase());
};

/**
 * Update order status in Firebase
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status value
 * @returns {Promise} - Update promise
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId || !newStatus) {
    throw new Error('Order ID and status are required');
  }

  const orderRef = doc(db, 'orders', orderId);
  
  return updateDoc(orderRef, {
    status: newStatus.toLowerCase(),
    updatedAt: serverTimestamp()
  });
};
