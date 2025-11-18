'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Trash2, Edit2, X, Check } from "lucide-react"
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/config/FirebaseConfig"
import usePromotionsAdmin from "@/hooks/usePromotionsAdmin"

export default function AdminCoupons() {
    const { data: promotions, loading } = usePromotionsAdmin()
    const [editingId, setEditingId] = useState(null)
    const [showForm, setShowForm] = useState(false)

    const [formData, setFormData] = useState({
        code: '',
        details: '',
        discount_percentage: '',
        minPrice: '',
        expiryDate: '',
        usage_limit: '',
    })

    const resetForm = () => {
        setFormData({
            code: '',
            details: '',
            discount_percentage: '',
            minPrice: '',
            expiryDate: '',
            usage_limit: '',
        })
        setEditingId(null)
        setShowForm(false)
    }

    const handleEdit = (promo) => {
        setEditingId(promo.id)
        let expiryDate = ''
        if (promo.expiryDate) {
            try {
                let date
                if (typeof promo.expiryDate.toDate === 'function') {
                    date = promo.expiryDate.toDate()
                } else {
                    date = new Date(promo.expiryDate)
                }
                expiryDate = isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
            } catch (e) {
                expiryDate = ''
            }
        }
        setFormData({
            code: promo.code,
            details: promo.details || '',
            discount_percentage: promo.discount_percentage.toString(),
            minPrice: promo.minPrice.toString(),
            expiryDate: expiryDate,
            usage_limit: promo.usage_limit.toString(),
        })
        setShowForm(true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddOrUpdate = async (e) => {
        e.preventDefault()

        if (!formData.code.trim()) {
            toast.error('Promotion code is required')
            return
        }

        if (!formData.details.trim()) {
            toast.error('Description is required')
            return
        }

        if (!formData.discount_percentage || formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
            toast.error('Discount percentage must be between 1 and 100')
            return
        }

        if (!formData.expiryDate) {
            toast.error('Expiry date is required')
            return
        }

        const expiryDate = new Date(formData.expiryDate)
        if (expiryDate <= new Date()) {
            toast.error('Expiry date must be in the future')
            return
        }

        try {
            const promoData = {
                code: formData.code.toUpperCase(),
                details: formData.details,
                discount_percentage: parseFloat(formData.discount_percentage),
                minPrice: parseFloat(formData.minPrice) || 0,
                expiryDate: expiryDate.toISOString(),
                usage_limit: parseInt(formData.usage_limit) || 999,
                is_enable: true,
                updatedAt: serverTimestamp(),
            }

            if (editingId) {
                const promoRef = doc(db, 'promotions', editingId)
                await updateDoc(promoRef, promoData)
                toast.success('Promotion updated successfully')
            } else {
                promoData.usage_count = 0
                promoData.createdAt = serverTimestamp()
                await addDoc(collection(db, 'promotions'), promoData)
                toast.success('Promotion added successfully')
            }

            resetForm()
        } catch (error) {
            console.error('Error saving promotion:', error)
            toast.error('Failed to save promotion')
        }
    }

    const handleDelete = async (promoId) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                await deleteDoc(doc(db, 'promotions', promoId))
                toast.success('Promotion deleted successfully')
            } catch (error) {
                console.error('Error deleting promotion:', error)
                toast.error('Failed to delete promotion')
            }
        }
    }

    return (
        <div className="text-slate-500 mb-40">
            {/* Add/Edit Promotion */}
            {showForm && (
                <form onSubmit={handleAddOrUpdate} className="max-w-2xl text-sm bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl"><span className="text-slate-800 font-medium">{editingId ? 'Edit' : 'Add'} Promotion</span></h2>
                        <button type="button" onClick={resetForm} className="text-slate-500 hover:text-slate-700">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Promotion Code *</label>
                            <input
                                type="text"
                                placeholder="e.g., BLACKFRIDAY"
                                className="w-full p-2 border border-slate-200 outline-slate-400 rounded-md"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Discount (%) *</label>
                            <input
                                type="number"
                                placeholder="e.g., 20"
                                min="1"
                                max="100"
                                className="w-full p-2 border border-slate-200 outline-slate-400 rounded-md"
                                name="discount_percentage"
                                value={formData.discount_percentage}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-slate-700 font-medium mb-2">Description *</label>
                            <input
                                type="text"
                                placeholder="e.g., 20% off on all items"
                                className="w-full p-2 border border-slate-200 outline-slate-400 rounded-md"
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Minimum Order Amount</label>
                            <input
                                type="number"
                                placeholder="e.g., 50000"
                                min="0"
                                className="w-full p-2 border border-slate-200 outline-slate-400 rounded-md"
                                name="minPrice"
                                value={formData.minPrice}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Expiry Date *</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-slate-200 outline-slate-400 rounded-md"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Usage Limit</label>
                            <input
                                type="number"
                                placeholder="e.g., 100"
                                min="1"
                                className="w-full p-2 border border-slate-200 outline-slate-400 rounded-md"
                                name="usage_limit"
                                value={formData.usage_limit}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="submit" className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 active:scale-95 transition flex items-center gap-2">
                            <Check size={18} />
                            {editingId ? 'Update' : 'Add'} Promotion
                        </button>
                        <button type="button" onClick={resetForm} className="px-6 py-2 rounded bg-slate-300 text-slate-700 hover:bg-slate-400 active:scale-95 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Add Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-6 px-6 py-2 rounded bg-slate-700 text-white hover:bg-slate-800 active:scale-95 transition"
                >
                    + Add New Promotion
                </button>
            )}

            {/* List Promotions */}
            <div className="mt-8">
                <h2 className="text-2xl mb-6">
                    All <span className="text-slate-800 font-medium">Promotions</span>
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                    </div>
                ) : promotions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg">No promotions found. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 max-w-full">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Code</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Discount %</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Min Amount</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Expires At</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Used / Limit</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Status</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {promotions.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-800">{promo.code}</td>
                                        <td className="py-3 px-4 text-slate-700">{promo.details}</td>
                                        <td className="py-3 px-4 text-slate-800">{promo.discount_percentage}%</td>
                                        <td className="py-3 px-4 text-slate-800">{promo.minPrice ? `${promo.minPrice}đ` : 'No min'}</td>
                                        <td className="py-3 px-4 text-slate-800">
                                            {promo.expiryDate ? (() => {
                                                try {
                                                    let date
                                                    if (typeof promo.expiryDate.toDate === 'function') {
                                                        date = promo.expiryDate.toDate()
                                                    } else {
                                                        date = new Date(promo.expiryDate)
                                                    }
                                                    return isNaN(date.getTime()) ? 'Invalid' : format(date, 'MMM dd, yyyy')
                                                } catch (e) {
                                                    return 'Invalid'
                                                }
                                            })() : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-800 text-center">
                                            {promo.usage_count || 0} / {promo.usage_limit || '∞'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${promo.is_enable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {promo.is_enable ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(promo)}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
