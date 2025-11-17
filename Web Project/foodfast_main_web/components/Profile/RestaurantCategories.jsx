'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import toast from 'react-hot-toast'
import { Trash2, Plus } from 'lucide-react'

// Generate a simple string ID from category name
const generateId = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function RestaurantCategories({ restaurantId }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [newCategory, setNewCategory] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const docRef = doc(db, 'restaurant_categories', restaurantId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setCategories(data.category_list || [])
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
                toast.error('Failed to load categories')
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [restaurantId])

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast.error('Please enter a category name')
            return
        }

        if (categories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
            toast.error('This category already exists')
            return
        }

        setSaving(true)
        try {
            const newCat = {
                id: generateId(newCategory),
                name: newCategory
            }

            const updatedCategories = [...categories, newCat]
            const docRef = doc(db, 'restaurant_categories', restaurantId)

            await setDoc(docRef, {
                category_list: updatedCategories,
                restaurant_id: restaurantId,
                updatedAt: new Date()
            }, { merge: true })

            setCategories(updatedCategories)
            setNewCategory('')
            toast.success('Category added successfully')
        } catch (error) {
            console.error('Error adding category:', error)
            toast.error('Failed to add category')
        } finally {
            setSaving(false)
        }
    }

    const handleEditCategory = (id, currentName) => {
        setEditingId(id)
        setEditingName(currentName)
    }

    const handleSaveEdit = async (id) => {
        if (!editingName.trim()) {
            toast.error('Please enter a category name')
            return
        }

        if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === editingName.toLowerCase())) {
            toast.error('This category name already exists')
            return
        }

        setSaving(true)
        try {
            const updatedCategories = categories.map(cat =>
                cat.id === id ? { ...cat, name: editingName } : cat
            )

            const docRef = doc(db, 'restaurant_categories', restaurantId)
            await updateDoc(docRef, {
                category_list: updatedCategories,
                updatedAt: new Date()
            })

            setCategories(updatedCategories)
            setEditingId(null)
            setEditingName('')
            toast.success('Category updated successfully')
        } catch (error) {
            console.error('Error updating category:', error)
            toast.error('Failed to update category')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? Dishes in this category will not be deleted.')) {
            return
        }

        setSaving(true)
        try {
            const updatedCategories = categories.filter(cat => cat.id !== id)

            const docRef = doc(db, 'restaurant_categories', restaurantId)
            await updateDoc(docRef, {
                category_list: updatedCategories,
                updatedAt: new Date()
            })

            setCategories(updatedCategories)
            toast.success('Category deleted successfully')
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Failed to delete category')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#366055] mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Add New Category */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name (e.g., Appetizers, Main Course)"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddCategory()
                            }
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                    />
                    <button
                        onClick={handleAddCategory}
                        disabled={saving}
                        className="px-4 py-3 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>

            {/* Categories List */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Your Categories {categories.length > 0 && `(${categories.length})`}
                </h3>

                {categories.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                        No categories yet. Add one to get started!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#366055] transition"
                            >
                                {editingId === category.id ? (
                                    <div className="flex-1 flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveEdit(category.id)
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(category.id)}
                                            disabled={saving}
                                            className="px-3 py-2 bg-[#366055] text-white text-sm rounded-lg hover:bg-[#2b4c44] transition disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null)
                                                setEditingName('')
                                            }}
                                            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-gray-900 font-medium">{category.name}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditCategory(category.id, category.name)}
                                                className="px-3 py-2 text-sm text-[#366055] border border-[#366055] rounded-lg hover:bg-[#366055] hover:text-white transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                disabled={saving}
                                                className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <Trash2 size={16} />
                                                <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
