'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import toast from 'react-hot-toast'
import { Trash2, Plus, Edit2, X } from 'lucide-react'
import { formatPrice, convertToDate } from '@/utils/currencyFormatter'

export default function RestaurantPromotions({ restaurantId }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [promotions, setPromotions] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingPromo, setEditingPromo] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        detail: '',
        discount_percentage: '',
        minPrice: '',
        expiryDate: '',
        usage_limit: ''
    })

    const fetchPromotions = async () => {
        try {
            setLoading(true)
            const q = query(
                collection(db, 'promotions_restaurant'),
                where('restaurantId', '==', restaurantId)
            )
            const querySnapshot = await getDocs(q)
            const promoData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPromotions(promoData)
        } catch (error) {
            console.error('Error fetching promotions:', error)
            toast.error('Failed to load promotions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPromotions()
    }, [restaurantId])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {
        if (!formData.code.trim()) {
            toast.error('Promo code is required')
            return false
        }
        if (!formData.detail.trim()) {
            toast.error('Description is required')
            return false
        }
        if (!formData.discount_percentage || formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
            toast.error('Discount percentage must be between 1 and 100')
            return false
        }
        if (!formData.minPrice || formData.minPrice < 0) {
            toast.error('Minimum price must be 0 or greater')
            return false
        }
        if (!formData.expiryDate) {
            toast.error('Expiry date is required')
            return false
        }
        const expiryDate = new Date(formData.expiryDate)
        if (expiryDate < new Date()) {
            toast.error('Expiry date must be in the future')
            return false
        }
        if (!formData.usage_limit || formData.usage_limit <= 0) {
            toast.error('Usage limit must be greater than 0')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) return

        try {
            setSaving(true)
            const promoData = {
                code: formData.code.toUpperCase(),
                detail: formData.detail,
                discount_percentage: parseFloat(formData.discount_percentage),
                minPrice: parseFloat(formData.minPrice),
                expiryDate: new Date(formData.expiryDate).toISOString(),
                is_enable: true,
                usage_count: editingPromo?.usage_count || 0,
                usage_limit: parseInt(formData.usage_limit),
                restaurantId: restaurantId,
                createdAt: editingPromo?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            if (editingPromo?.id) {
                await updateDoc(doc(db, 'promotions_restaurant', editingPromo.id), promoData)
                toast.success('Promotion updated successfully')
            } else {
                await setDoc(doc(collection(db, 'promotions_restaurant')), promoData)
                toast.success('Promotion created successfully')
            }

            setFormData({
                code: '',
                detail: '',
                discount_percentage: '',
                minPrice: '',
                expiryDate: '',
                usage_limit: ''
            })
            setEditingPromo(null)
            setShowForm(false)
            await fetchPromotions()
        } catch (error) {
            console.error('Error saving promotion:', error)
            toast.error('Failed to save promotion')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (promo) => {
        setEditingPromo(promo)
        const expiryDateObj = convertToDate(promo.expiryDate)
        const expiryDate = expiryDateObj.toISOString().split('T')[0]
        setFormData({
            code: promo.code,
            detail: promo.detail,
            discount_percentage: promo.discount_percentage.toString(),
            minPrice: promo.minPrice.toString(),
            expiryDate: expiryDate,
            usage_limit: promo.usage_limit.toString()
        })
        setShowForm(true)
    }

    const handleDelete = async (promoId) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                await deleteDoc(doc(db, 'promotions_restaurant', promoId))
                toast.success('Promotion deleted successfully')
                await fetchPromotions()
            } catch (error) {
                console.error('Error deleting promotion:', error)
                toast.error('Failed to delete promotion')
            }
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingPromo(null)
        setFormData({
            code: '',
            detail: '',
            discount_percentage: '',
            minPrice: '',
            expiryDate: '',
            usage_limit: ''
        })
    }

    if (loading) {
        return <div className="text-center py-8">Loading promotions...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                    {editingPromo ? 'Edit Promotion' : 'Create Promotion'}
                </h3>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition"
                    >
                        <Plus size={20} />
                        New Promotion
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Promotion Code *
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., SUMMER20"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Discount % *
                                </label>
                                <input
                                    type="number"
                                    name="discount_percentage"
                                    value={formData.discount_percentage}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 20"
                                    min="1"
                                    max="100"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Minimum Order Price *
                                </label>
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={formData.minPrice}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 50000"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Usage Limit *
                                </label>
                                <input
                                    type="number"
                                    name="usage_limit"
                                    value={formData.usage_limit}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 50"
                                    min="1"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            <p className="font-medium mb-1">ℹ️ Usage Limit Note</p>
                            <p>Once the promotion is used the maximum number of times (usage reaches the limit), it will automatically be disabled and customers won't be able to use it anymore.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Description/Details *
                            </label>
                            <textarea
                                name="detail"
                                value={formData.detail}
                                onChange={handleInputChange}
                                placeholder="e.g., Get 20% off on all items"
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                            ></textarea>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-[#366055] text-white py-2 rounded-lg hover:bg-[#2a4d42] transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingPromo ? 'Update Promotion' : 'Create Promotion'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg hover:bg-slate-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {promotions.length > 0 ? (
                <div className="space-y-3">
                    {promotions.map(promo => {
                        const expiryDate = convertToDate(promo.expiryDate)
                        const isExpired = expiryDate < new Date()
                        
                        return (
                            <div
                                key={promo.id}
                                className={`border rounded-lg p-4 ${isExpired ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-slate-800">{promo.code}</h4>
                                            {isExpired && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
                                            )}
                                            {!isExpired && promo.is_enable && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{promo.detail}</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600">
                                            <div>
                                                <span className="font-medium">Discount:</span> {promo.discount_percentage}%
                                            </div>
                                            <div>
                                                <span className="font-medium">Min Order:</span> {formatPrice(promo.minPrice)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Expires:</span> {expiryDate.toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-medium">Usage:</span> {promo.usage_count || 0} / {promo.usage_limit}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(promo)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                !showForm && (
                    <div className="text-center py-12 bg-slate-50 rounded-lg">
                        <p className="text-slate-600 mb-4">No promotions created yet</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-[#366055] text-white px-6 py-2 rounded-lg hover:bg-[#2a4d42] transition"
                        >
                            Create Your First Promotion
                        </button>
                    </div>
                )
            )}
        </div>
    )
}
