'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import toast from 'react-hot-toast'
import { Trash2, Plus, Edit2, X } from 'lucide-react'
import { formatPrice } from '@/utils/currencyFormatter'

// Generate a random UUID-like string
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export default function DishManagement({ restaurantId }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [dishes, setDishes] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingDish, setEditingDish] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [expandedDishId, setExpandedDishId] = useState(null)
    const [showOptionGroupForm, setShowOptionGroupForm] = useState(false)
    const [editingOptionGroup, setEditingOptionGroup] = useState(null)
    const [optionGroupFormData, setOptionGroupFormData] = useState({
        name: '',
        type: 'single',
        choices: []
    })
    const [newChoiceInput, setNewChoiceInput] = useState({ name: '', price: '' })

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: ''
    })

    const initializeOptionGroupFormData = () => ({
        name: '',
        type: 'single',
        choices: []
    })

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
            }
        }

        fetchCategories()
    }, [restaurantId])

    // Fetch dishes
    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const q = query(collection(db, 'dishes'), where('restaurantId', '==', restaurantId))
                const querySnapshot = await getDocs(q)

                const dishesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setDishes(dishesData)
            } catch (error) {
                console.error('Error fetching dishes:', error)
                toast.error('Failed to load dishes')
            } finally {
                setLoading(false)
            }
        }

        fetchDishes()
    }, [restaurantId])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const uploadFile = async (file) => {
        try {
            const formDataObj = new FormData()
            formDataObj.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataObj
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const { downloadURL } = await response.json()
            return downloadURL
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        }
    }

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        try {
            setUploadingImage(true)
            const downloadURL = await uploadFile(file)
            setFormData(prev => ({
                ...prev,
                imageUrl: downloadURL
            }))
            toast.success('Image uploaded successfully')
        } catch (error) {
            toast.error('Failed to upload image')
        } finally {
            setUploadingImage(false)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
            imageUrl: ''
        })
        setEditingDish(null)
        setShowForm(false)
        setExpandedDishId(null)
    }

    const handleSaveDish = async () => {
        if (!formData.name || !formData.price || !formData.categoryId) {
            toast.error('Please fill in all required fields')
            return
        }

        if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
            toast.error('Please enter a valid price')
            return
        }

        setSaving(true)
        try {
            const dishData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                categoryId: formData.categoryId,
                restaurantId: restaurantId,
                is_enable: true,
                updatedAt: new Date()
            }

            if (formData.imageUrl) {
                dishData.imageUrl = formData.imageUrl
            }

            if (editingDish) {
                await updateDoc(doc(db, 'dishes', editingDish.id), dishData)
                setDishes(dishes.map(d => d.id === editingDish.id ? { ...d, ...dishData } : d))
                toast.success('Dish updated successfully')
            } else {
                const newDocRef = doc(collection(db, 'dishes'))
                dishData.createdAt = new Date()
                dishData.optionGroup = []
                await setDoc(newDocRef, dishData)
                setDishes([...dishes, { id: newDocRef.id, ...dishData }])
                toast.success('Dish added successfully')
            }

            resetForm()
        } catch (error) {
            console.error('Error saving dish:', error)
            toast.error('Failed to save dish')
        } finally {
            setSaving(false)
        }
    }

    const handleEditDish = (dish) => {
        setFormData({
            name: dish.name,
            description: dish.description || '',
            price: dish.price.toString(),
            categoryId: dish.categoryId,
            imageUrl: dish.imageUrl || ''
        })
        setEditingDish(dish)
        setShowForm(true)
        setExpandedDishId(dish.id)
    }

    const handleDeleteDish = async (dishId) => {
        if (!window.confirm('Are you sure you want to delete this dish? This will also delete all option groups for this dish.')) {
            return
        }

        setSaving(true)
        try {
            // Delete all option groups for this dish
            const optionGroupsRef = collection(db, 'optionGroup')
            const q = query(optionGroupsRef, where('dishId', '==', dishId))
            const querySnapshot = await getDocs(q)
            
            for (const doc of querySnapshot.docs) {
                await deleteDoc(doc.ref)
            }

            // Delete the dish
            await deleteDoc(doc(db, 'dishes', dishId))
            setDishes(dishes.filter(d => d.id !== dishId))
            toast.success('Dish deleted successfully')
        } catch (error) {
            console.error('Error deleting dish:', error)
            toast.error('Failed to delete dish')
        } finally {
            setSaving(false)
        }
    }

    // Option Group Handlers
    const handleAddChoiceToOptionGroup = () => {
        if (!newChoiceInput.name.trim()) {
            toast.error('Please enter a choice name')
            return
        }

        if (isNaN(parseFloat(newChoiceInput.price)) || parseFloat(newChoiceInput.price) < 0) {
            toast.error('Please enter a valid price')
            return
        }

        const newChoice = {
            id: generateId(),
            name: newChoiceInput.name,
            price: parseFloat(newChoiceInput.price)
        }

        setOptionGroupFormData(prev => ({
            ...prev,
            choices: [...prev.choices, newChoice]
        }))

        setNewChoiceInput({ name: '', price: '' })
        toast.success('Choice added')
    }

    const handleRemoveChoice = (choiceId) => {
        setOptionGroupFormData(prev => ({
            ...prev,
            choices: prev.choices.filter(c => c.id !== choiceId)
        }))
    }

    const resetOptionGroupForm = () => {
        setOptionGroupFormData({
            name: '',
            type: 'single',
            choices: []
        })
        setEditingOptionGroup(null)
        setShowOptionGroupForm(false)
        setNewChoiceInput({ name: '', price: '' })
    }

    const handleSaveOptionGroup = async () => {
        if (!editingDish) {
            toast.error('Please select a dish first')
            return
        }

        if (!optionGroupFormData.name.trim()) {
            toast.error('Please enter an option group name')
            return
        }

        if (optionGroupFormData.choices.length === 0) {
            toast.error('Please add at least one choice')
            return
        }

        setSaving(true)
        try {
            const optionGroupData = {
                name: optionGroupFormData.name,
                type: optionGroupFormData.type || 'single',
                dishId: editingDish.id,
                restaurantId: restaurantId,
                choices: optionGroupFormData.choices,
                updatedAt: new Date()
            }

            if (editingOptionGroup) {
                await updateDoc(doc(db, 'optionGroup', editingOptionGroup.id), optionGroupData)
                toast.success('Option group updated successfully')
            } else {
                optionGroupData.createdAt = new Date()
                const newDocRef = doc(collection(db, 'optionGroup'))
                await setDoc(newDocRef, optionGroupData)

                // Add the new option group ID to the dish's optionGroup array
                const updatedDish = { ...editingDish }
                if (!Array.isArray(updatedDish.optionGroup)) {
                    updatedDish.optionGroup = []
                }
                updatedDish.optionGroup.push(newDocRef.id)
                await updateDoc(doc(db, 'dishes', editingDish.id), {
                    optionGroup: updatedDish.optionGroup
                })
                setEditingDish(updatedDish)
                setDishes(dishes.map(d => d.id === editingDish.id ? updatedDish : d))

                toast.success('Option group added successfully')
            }

            resetOptionGroupForm()
        } catch (error) {
            console.error('Error saving option group:', error)
            toast.error('Failed to save option group')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteOptionGroup = async (optionGroupId) => {
        if (!window.confirm('Are you sure you want to delete this option group?')) {
            return
        }

        setSaving(true)
        try {
            await deleteDoc(doc(db, 'optionGroup', optionGroupId))

            // Remove the option group ID from the dish's optionGroup array
            if (editingDish) {
                const updatedDish = { ...editingDish }
                updatedDish.optionGroup = Array.isArray(updatedDish.optionGroup)
                    ? updatedDish.optionGroup.filter(id => id !== optionGroupId)
                    : []

                await updateDoc(doc(db, 'dishes', editingDish.id), {
                    optionGroup: updatedDish.optionGroup
                })
                setEditingDish(updatedDish)
                setDishes(dishes.map(d => d.id === editingDish.id ? updatedDish : d))
            }

            toast.success('Option group deleted successfully')
        } catch (error) {
            console.error('Error deleting option group:', error)
            toast.error('Failed to delete option group')
        } finally {
            setSaving(false)
        }
    }

    const handleEditOptionGroup = (optionGroup) => {
        setOptionGroupFormData({
            name: optionGroup.name,
            type: optionGroup.type || 'single',
            choices: optionGroup.choices || []
        })
        setEditingOptionGroup(optionGroup)
        setShowOptionGroupForm(true)
    }

    const fetchOptionGroupsForDish = async (dishId) => {
        try {
            const q = query(collection(db, 'optionGroup'), where('dishId', '==', dishId))
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        } catch (error) {
            console.error('Error fetching option groups:', error)
            return []
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

    if (categories.length === 0) {
        return (
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-900">
                    Please add at least one category before adding dishes. Go to the <strong>Categories</strong> tab to create categories.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Add/Edit Dish Form */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-4 px-4 border-2 border-dashed border-[#366055] rounded-lg text-[#366055] font-medium hover:bg-[#366055] hover:text-white transition flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add New Dish
                </button>
            ) : (
                <div className="p-6 bg-white border border-gray-200 rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {editingDish ? 'Edit Dish' : 'Add New Dish'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dish Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter dish name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter dish description"
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dish Image
                        </label>
                        <div className="flex flex-col gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={uploadingImage}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055] disabled:opacity-50"
                            />
                            {uploadingImage && <p className="text-sm text-gray-600">Uploading...</p>}
                            {formData.imageUrl && (
                                <img
                                    src={formData.imageUrl}
                                    alt="Dish"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSaveDish}
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Dish'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>

                    {editingDish && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Option Groups for this Dish
                            </h4>
                            <OptionGroupsSection
                                dishId={editingDish.id}
                                showForm={showOptionGroupForm}
                                setShowForm={setShowOptionGroupForm}
                                formData={optionGroupFormData}
                                setFormData={setOptionGroupFormData}
                                newChoiceInput={newChoiceInput}
                                setNewChoiceInput={setNewChoiceInput}
                                onAddChoice={handleAddChoiceToOptionGroup}
                                onRemoveChoice={handleRemoveChoice}
                                onSave={handleSaveOptionGroup}
                                onCancel={resetOptionGroupForm}
                                onDelete={handleDeleteOptionGroup}
                                onEdit={handleEditOptionGroup}
                                saving={saving}
                                editingOptionGroup={editingOptionGroup}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Dishes List */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Your Dishes {dishes.length > 0 && `(${dishes.length})`}
                </h3>

                {dishes.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                        No dishes yet. Add one to get started!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dishes.map(dish => {
                            const category = categories.find(c => c.id === dish.categoryId)
                            const optionGroupCount = Array.isArray(dish.optionGroup) ? dish.optionGroup.length : 0
                            return (
                                <div
                                    key={dish.id}
                                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
                                >
                                    {dish.imageUrl && (
                                        <img
                                            src={dish.imageUrl}
                                            alt={dish.name}
                                            className="w-full h-40 object-cover rounded-lg mb-3"
                                        />
                                    )}

                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 flex-1">{dish.name}</h4>
                                        {dish.is_enable && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                                                Enabled
                                            </span>
                                        )}
                                    </div>

                                    {dish.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {dish.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-[#366055]">
                                                {formatPrice(dish.price)}
                                            </p>
                                            <div className="text-xs text-gray-500 space-y-1">
                                                {category && <p>{category.name}</p>}
                                                {optionGroupCount > 0 && (
                                                    <p className="text-blue-600 font-medium">
                                                        {optionGroupCount} option group{optionGroupCount !== 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditDish(dish)}
                                            className="flex-1 px-3 py-2 text-sm text-[#366055] border border-[#366055] rounded-lg hover:bg-[#366055] hover:text-white transition flex items-center justify-center gap-1"
                                        >
                                            <Edit2 size={16} />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDish(dish.id)}
                                            disabled={saving}
                                            className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

function OptionGroupsSection({
    dishId,
    showForm,
    setShowForm,
    formData,
    setFormData,
    newChoiceInput,
    setNewChoiceInput,
    onAddChoice,
    onRemoveChoice,
    onSave,
    onCancel,
    onDelete,
    onEdit,
    saving,
    editingOptionGroup
}) {
    const [optionGroups, setOptionGroups] = useState([])
    const [loadingGroups, setLoadingGroups] = useState(true)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const q = query(collection(db, 'optionGroup'), where('dishId', '==', dishId))
                const querySnapshot = await getDocs(q)
                const groups = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setOptionGroups(groups)
            } catch (error) {
                console.error('Error fetching option groups:', error)
            } finally {
                setLoadingGroups(false)
            }
        }

        fetchGroups()
    }, [dishId])

    const handleSaveWithRefresh = async () => {
        await onSave()
        // Refresh option groups
        const q = query(collection(db, 'optionGroup'), where('dishId', '==', dishId))
        const querySnapshot = await getDocs(q)
        const groups = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        setOptionGroups(groups)
    }

    const handleDeleteWithRefresh = async (id) => {
        await onDelete(id)
        setOptionGroups(optionGroups.filter(g => g.id !== id))
    }

    if (loadingGroups) {
        return (
            <div className="flex items-center justify-center py-4">
                <p className="text-gray-600 text-sm">Loading option groups...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 px-4 border-2 border-dashed border-[#366055] rounded-lg text-blue-600 font-medium hover:bg-[#31594F] transition flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Add Option Group
                </button>
            ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                            {editingOptionGroup ? 'Edit Option Group' : 'Add Option Group'}
                        </h5>
                        <button
                            onClick={onCancel}
                            className="p-1 hover:bg-blue-100 rounded transition"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Option Group Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Size, Spice Level, Add-ons"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Selection Type *
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="optionType"
                                    value="single"
                                    checked={formData.type === 'single'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Single Choice</p>
                                    <p className="text-xs text-gray-600">Customer can select one option (e.g., Size)</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="optionType"
                                    value="multiple"
                                    checked={formData.type === 'multiple'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Multiple Choices</p>
                                    <p className="text-xs text-gray-600">Customer can select multiple options (e.g., Add-ons)</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choices
                        </label>
                        <div className="space-y-2 mb-3">
                            {formData.choices.map(choice => (
                                <div key={choice.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{choice.name}</p>
                                        <p className="text-xs text-gray-600">
                                            ${choice.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemoveChoice(choice.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newChoiceInput.name}
                                    onChange={(e) => setNewChoiceInput(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Choice name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div className="w-24">
                                <input
                                    type="number"
                                    value={newChoiceInput.price}
                                    onChange={(e) => setNewChoiceInput(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="Price"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <button
                                onClick={onAddChoice}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveWithRefresh}
                            disabled={saving}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Option Groups List */}
            {optionGroups.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">
                        Option Groups ({optionGroups.length})
                    </h5>
                    {optionGroups.map(group => (
                        <div key={group.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h6 className="font-medium text-gray-900">{group.name}</h6>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Type: {group.type === 'single' ? '📌 Single Choice' : '✓ Multiple Choices'}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onEdit(group)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteWithRefresh(group.id)}
                                        disabled={saving}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                {group.choices?.map(choice => (
                                    <div key={choice.id} className="flex justify-between">
                                        <span>{choice.name}</span>
                                        <span className="font-medium">+${choice.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
