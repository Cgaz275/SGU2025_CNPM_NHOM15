'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { MapPin, Phone, Mail, Star, ChevronLeft, AlertCircle, X, Plus, Edit2, Trash2 } from 'lucide-react'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'
import { formatPrice, convertToDate } from '@/utils/currencyFormatter'

export default function StoreDetailPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.storeId

  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [promotions, setPromotions] = useState([])
  const [merchant, setMerchant] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [showPromoDetail, setShowPromoDetail] = useState(false)
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [savingPromo, setSavingPromo] = useState(false)
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    detail: '',
    discount_percentage: '',
    minPrice: '',
    expiryDate: '',
    usage_limit: ''
  })
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [showDishForm, setShowDishForm] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [savingDish, setSavingDish] = useState(false)
  const [uploadingDishImage, setUploadingDishImage] = useState(false)
  const [dishFormData, setDishFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: ''
  })
  const [showOptionGroupForm, setShowOptionGroupForm] = useState(false)
  const [editingOptionGroup, setEditingOptionGroup] = useState(null)
  const [savingOptionGroup, setSavingOptionGroup] = useState(false)
  const [dishOptionGroups, setDishOptionGroups] = useState([])
  const [loadingOptionGroups, setLoadingOptionGroups] = useState(false)
  const [optionGroupFormData, setOptionGroupFormData] = useState({
    name: '',
    type: 'single',
    choices: []
  })
  const [newChoiceInput, setNewChoiceInput] = useState({ name: '', price: '' })

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        // Fetch restaurant
        const restaurantRef = doc(db, 'restaurants', storeId)
        const restaurantSnap = await getDoc(restaurantRef)

        if (!restaurantSnap.exists()) {
          toast.error('Restaurant not found')
          router.push('/admin/stores')
          return
        }

        const restaurantData = {
          id: restaurantSnap.id,
          ...restaurantSnap.data()
        }
        setRestaurant(restaurantData)

        // Fetch merchant details
        const merchantRef = doc(db, 'user', restaurantData.userId)
        const merchantSnap = await getDoc(merchantRef)
        if (merchantSnap.exists()) {
          setMerchant({
            id: merchantSnap.id,
            ...merchantSnap.data()
          })
        }

        // Fetch categories
        const categoriesRef = doc(db, 'restaurant_categories', restaurantData.userId)
        const categoriesSnap = await getDoc(categoriesRef)
        if (categoriesSnap.exists()) {
          const data = categoriesSnap.data()
          setCategories(data.category_list || [])
        }

        // Fetch dishes
        const dishesCollectionRef = collection(db, 'dishes')
        const dishesQuery = query(dishesCollectionRef, where('restaurantId', '==', storeId))
        const dishesSnap = await getDocs(dishesQuery)
        setDishes(dishesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })))

        // Fetch promotions
        const promotionsCollectionRef = collection(db, 'promotions_restaurant')
        const promotionsQuery = query(promotionsCollectionRef, where('restaurantId', '==', storeId))
        const promotionsSnap = await getDocs(promotionsQuery)
        setPromotions(promotionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })))

        setLoading(false)
      } catch (error) {
        console.error('Error fetching restaurant details:', error)
        toast.error('Failed to load restaurant details')
        setLoading(false)
      }
    }

    fetchRestaurantDetails()
  }, [storeId, router])

  const handleToggleStatus = async () => {
    if (!restaurant) return

    setTogglingStatus(true)
    try {
      const restaurantRef = doc(db, 'restaurants', storeId)
      await updateDoc(restaurantRef, {
        is_enable: !restaurant.is_enable
      })

      setRestaurant({
        ...restaurant,
        is_enable: !restaurant.is_enable
      })

      toast.success(`Restaurant ${!restaurant.is_enable ? 'enabled' : 'banned'} successfully`)
    } catch (error) {
      console.error('Error updating restaurant status:', error)
      toast.error('Failed to update restaurant status')
    } finally {
      setTogglingStatus(false)
    }
  }

  const validatePromoForm = () => {
    if (!promoFormData.code.trim()) {
      toast.error('Promo code is required')
      return false
    }
    if (!promoFormData.detail.trim()) {
      toast.error('Description is required')
      return false
    }
    if (!promoFormData.discount_percentage || promoFormData.discount_percentage <= 0 || promoFormData.discount_percentage > 100) {
      toast.error('Discount percentage must be between 1 and 100')
      return false
    }
    if (!promoFormData.minPrice || promoFormData.minPrice < 0) {
      toast.error('Minimum price must be 0 or greater')
      return false
    }
    if (!promoFormData.expiryDate) {
      toast.error('Expiry date is required')
      return false
    }
    const expiryDate = new Date(promoFormData.expiryDate)
    if (expiryDate < new Date()) {
      toast.error('Expiry date must be in the future')
      return false
    }
    if (!promoFormData.usage_limit || promoFormData.usage_limit <= 0) {
      toast.error('Usage limit must be greater than 0')
      return false
    }
    return true
  }

  const handlePromoInputChange = (e) => {
    const { name, value } = e.target
    setPromoFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePromoSubmit = async (e) => {
    e.preventDefault()

    if (!validatePromoForm()) return

    try {
      setSavingPromo(true)
      const promoData = {
        code: promoFormData.code.toUpperCase(),
        detail: promoFormData.detail,
        discount_percentage: parseFloat(promoFormData.discount_percentage),
        minPrice: parseFloat(promoFormData.minPrice),
        expiryDate: new Date(promoFormData.expiryDate).toISOString(),
        is_enable: true,
        usage_count: editingPromo?.usage_count || 0,
        usage_limit: parseInt(promoFormData.usage_limit),
        restaurantId: storeId,
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

      setPromoFormData({
        code: '',
        detail: '',
        discount_percentage: '',
        minPrice: '',
        expiryDate: '',
        usage_limit: ''
      })
      setEditingPromo(null)
      setShowPromoForm(false)

      // Refresh promotions list
      const promotionsCollectionRef = collection(db, 'promotions_restaurant')
      const promotionsQuery = query(promotionsCollectionRef, where('restaurantId', '==', storeId))
      const promotionsSnap = await getDocs(promotionsQuery)
      setPromotions(promotionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))
    } catch (error) {
      console.error('Error saving promotion:', error)
      toast.error('Failed to save promotion')
    } finally {
      setSavingPromo(false)
    }
  }

  const handleEditPromo = (promo) => {
    setEditingPromo(promo)
    const expiryDateObj = convertToDate(promo.expiryDate)
    const expiryDate = expiryDateObj.toISOString().split('T')[0]
    setPromoFormData({
      code: promo.code,
      detail: promo.detail,
      discount_percentage: promo.discount_percentage.toString(),
      minPrice: promo.minPrice.toString(),
      expiryDate: expiryDate,
      usage_limit: promo.usage_limit.toString()
    })
    setShowPromoForm(true)
  }

  const handleDeletePromo = async (promoId) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deleteDoc(doc(db, 'promotions_restaurant', promoId))
        toast.success('Promotion deleted successfully')

        // Refresh promotions list
        const promotionsCollectionRef = collection(db, 'promotions_restaurant')
        const promotionsQuery = query(promotionsCollectionRef, where('restaurantId', '==', storeId))
        const promotionsSnap = await getDocs(promotionsQuery)
        setPromotions(promotionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })))
      } catch (error) {
        console.error('Error deleting promotion:', error)
        toast.error('Failed to delete promotion')
      }
    }
  }

  const handleCancelPromoForm = () => {
    setShowPromoForm(false)
    setEditingPromo(null)
    setPromoFormData({
      code: '',
      detail: '',
      discount_percentage: '',
      minPrice: '',
      expiryDate: '',
      usage_limit: ''
    })
  }

  // Category Management Functions
  const generateCategoryId = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name')
      return
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      toast.error('This category already exists')
      return
    }

    setSavingCategory(true)
    try {
      const newCat = {
        id: generateCategoryId(newCategory),
        name: newCategory
      }

      const updatedCategories = [...categories, newCat]
      const docRef = doc(db, 'restaurant_categories', storeId)

      await setDoc(docRef, {
        category_list: updatedCategories,
        restaurant_id: storeId,
        updatedAt: new Date()
      }, { merge: true })

      setCategories(updatedCategories)
      setNewCategory('')
      setShowCategoryForm(false)
      toast.success('Category added successfully')
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Failed to add category')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleEditCategory = (id, currentName) => {
    setEditingCategory(id)
    setEditingCategoryName(currentName)
  }

  const handleSaveEditCategory = async (id) => {
    if (!editingCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === editingCategoryName.toLowerCase())) {
      toast.error('This category name already exists')
      return
    }

    setSavingCategory(true)
    try {
      const updatedCategories = categories.map(cat =>
        cat.id === id ? { ...cat, name: editingCategoryName } : cat
      )

      const docRef = doc(db, 'restaurant_categories', storeId)
      await updateDoc(docRef, {
        category_list: updatedCategories,
        updatedAt: new Date()
      })

      setCategories(updatedCategories)
      setEditingCategory(null)
      setEditingCategoryName('')
      toast.success('Category updated successfully')
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Dishes in this category will not be deleted.')) {
      return
    }

    setSavingCategory(true)
    try {
      const updatedCategories = categories.filter(cat => cat.id !== id)

      const docRef = doc(db, 'restaurant_categories', storeId)
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
      setSavingCategory(false)
    }
  }

  // Dish Management Functions
  const uploadDishImage = async (file) => {
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

  const handleDishFileSelect = async (e) => {
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
      setUploadingDishImage(true)
      const downloadURL = await uploadDishImage(file)
      setDishFormData(prev => ({
        ...prev,
        imageUrl: downloadURL
      }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingDishImage(false)
    }
  }

  const handleDishInputChange = (e) => {
    const { name, value } = e.target
    setDishFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveDish = async () => {
    if (!dishFormData.name || !dishFormData.price || !dishFormData.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    if (isNaN(parseFloat(dishFormData.price)) || parseFloat(dishFormData.price) < 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSavingDish(true)
    try {
      const dishData = {
        name: dishFormData.name,
        description: dishFormData.description,
        price: parseFloat(dishFormData.price),
        categoryId: dishFormData.categoryId,
        restaurantId: storeId,
        is_enable: true,
        updatedAt: new Date()
      }

      if (dishFormData.imageUrl) {
        dishData.images = [dishFormData.imageUrl]
      }

      if (editingDish) {
        await updateDoc(doc(db, 'dishes', editingDish.id), dishData)
        setDishes(dishes.map(d => d.id === editingDish.id ? { ...d, ...dishData } : d))
        toast.success('Dish updated successfully')
      } else {
        const newDocRef = doc(collection(db, 'dishes'))
        dishData.createdAt = new Date()
        await setDoc(newDocRef, dishData)
        setDishes([...dishes, { id: newDocRef.id, ...dishData }])
        toast.success('Dish added successfully')
      }

      setDishFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: ''
      })
      setEditingDish(null)
      setShowDishForm(false)
    } catch (error) {
      console.error('Error saving dish:', error)
      toast.error('Failed to save dish')
    } finally {
      setSavingDish(false)
    }
  }

  const handleEditDish = (dish) => {
    setDishFormData({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      categoryId: dish.categoryId,
      imageUrl: (dish.images && dish.images[0]) || ''
    })
    setEditingDish(dish)
    setShowDishForm(true)
    fetchOptionGroupsForDish(dish.id)
  }

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) {
      return
    }

    setSavingDish(true)
    try {
      await deleteDoc(doc(db, 'dishes', dishId))
      setDishes(dishes.filter(d => d.id !== dishId))
      toast.success('Dish deleted successfully')
    } catch (error) {
      console.error('Error deleting dish:', error)
      toast.error('Failed to delete dish')
    } finally {
      setSavingDish(false)
    }
  }

  const handleCancelDishForm = () => {
    setShowDishForm(false)
    setEditingDish(null)
    setDishFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      imageUrl: ''
    })
    setShowOptionGroupForm(false)
    setEditingOptionGroup(null)
    setOptionGroupFormData({
      name: '',
      type: 'single',
      choices: []
    })
    setNewChoiceInput({ name: '', price: '' })
    setDishOptionGroups([])
  }

  // OptionGroup Management Functions
  const fetchOptionGroupsForDish = async (dishId) => {
    try {
      setLoadingOptionGroups(true)
      const q = query(collection(db, 'optionGroup'), where('dishId', '==', dishId))
      const querySnapshot = await getDocs(q)
      const groups = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDishOptionGroups(groups)
    } catch (error) {
      console.error('Error fetching option groups:', error)
    } finally {
      setLoadingOptionGroups(false)
    }
  }

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
      id: Math.random().toString(36).substr(2, 9),
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

    setSavingOptionGroup(true)
    try {
      const optionGroupData = {
        name: optionGroupFormData.name,
        type: optionGroupFormData.type || 'single',
        dishId: editingDish.id,
        restaurantId: storeId,
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

        if (!Array.isArray(editingDish.optionGroup)) {
          editingDish.optionGroup = []
        }
        const updatedDish = {
          ...editingDish,
          optionGroup: [...(editingDish.optionGroup || []), newDocRef.id]
        }
        await updateDoc(doc(db, 'dishes', editingDish.id), {
          optionGroup: updatedDish.optionGroup
        })
        setEditingDish(updatedDish)

        toast.success('Option group added successfully')
      }

      setOptionGroupFormData({
        name: '',
        type: 'single',
        choices: []
      })
      setEditingOptionGroup(null)
      setShowOptionGroupForm(false)
      setNewChoiceInput({ name: '', price: '' })

      await fetchOptionGroupsForDish(editingDish.id)
    } catch (error) {
      console.error('Error saving option group:', error)
      toast.error('Failed to save option group')
    } finally {
      setSavingOptionGroup(false)
    }
  }

  const handleDeleteOptionGroup = async (optionGroupId) => {
    if (!window.confirm('Are you sure you want to delete this option group?')) {
      return
    }

    setSavingOptionGroup(true)
    try {
      await deleteDoc(doc(db, 'optionGroup', optionGroupId))

      if (editingDish) {
        const updatedDish = { ...editingDish }
        updatedDish.optionGroup = Array.isArray(updatedDish.optionGroup)
          ? updatedDish.optionGroup.filter(id => id !== optionGroupId)
          : []

        await updateDoc(doc(db, 'dishes', editingDish.id), {
          optionGroup: updatedDish.optionGroup
        })
        setEditingDish(updatedDish)
      }

      toast.success('Option group deleted successfully')
      await fetchOptionGroupsForDish(editingDish.id)
    } catch (error) {
      console.error('Error deleting option group:', error)
      toast.error('Failed to delete option group')
    } finally {
      setSavingOptionGroup(false)
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

  const handleCancelOptionGroupForm = () => {
    setShowOptionGroupForm(false)
    setEditingOptionGroup(null)
    setOptionGroupFormData({
      name: '',
      type: 'single',
      choices: []
    })
    setNewChoiceInput({ name: '', price: '' })
  }

  if (loading) return <Loading />

  if (!restaurant) return (
    <div className="flex items-center justify-center h-80">
      <p className="text-xl text-slate-600">Restaurant not found</p>
    </div>
  )

  return (
    <div className="mb-28">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#366055] hover:text-[#284840] font-medium mb-4"
        >
          <ChevronLeft size={20} />
          Back to Stores
        </button>
      </div>

      {/* Status Banner */}
      {!restaurant.is_enable && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Restaurant Banned</h3>
            <p className="text-red-800 text-sm">This restaurant is currently banned and will not appear in customer view</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Restaurant Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant Basic Info */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex gap-6 mb-6 flex-col md:flex-row">
              {restaurant.imageUrl && (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.round(restaurant.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-800">{restaurant.rating || 0} / 5</span>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  {restaurant.address && (
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{restaurant.address}</span>
                    </p>
                  )}
                  {merchant && (
                    <>
                      <p className="flex items-center gap-2">
                        <Phone size={16} className="flex-shrink-0" />
                        {merchant.phone || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={16} className="flex-shrink-0" />
                        {merchant.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap pt-4 border-t border-slate-200">
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  restaurant.is_enable
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {togglingStatus ? 'Updating...' : (restaurant.is_enable ? 'Disable Restaurant' : 'Enable Restaurant')}
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Restaurant Categories</h2>
              {!showCategoryForm && (
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center gap-2 bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition font-medium"
                >
                  <Plus size={20} />
                  Add Category
                </button>
              )}
            </div>

            {showCategoryForm && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={savingCategory}
                    className="bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition font-medium disabled:opacity-50"
                  >
                    {savingCategory ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryForm(false)
                      setNewCategory('')
                    }}
                    className="bg-slate-300 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-400 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between gap-4">
                    {editingCategory === category.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                        />
                        <button
                          onClick={() => handleSaveEditCategory(category.id)}
                          disabled={savingCategory}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null)
                            setEditingCategoryName('')
                          }}
                          className="bg-slate-400 text-white px-3 py-2 rounded-lg hover:bg-slate-500 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-slate-800">{category.name}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category.id, category.name)}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-6">No categories added yet</p>
            )}
          </div>

          {/* Dishes Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Dishes ({dishes.length})</h2>
              {!showDishForm && (
                <button
                  onClick={() => setShowDishForm(true)}
                  className="flex items-center gap-2 bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition font-medium"
                >
                  <Plus size={20} />
                  Add Dish
                </button>
              )}
            </div>

            {showDishForm && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {editingDish ? 'Edit Dish' : 'Add New Dish'}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Dish Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={dishFormData.name}
                        onChange={handleDishInputChange}
                        placeholder="e.g., Pad Thai"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="categoryId"
                        value={dishFormData.categoryId}
                        onChange={handleDishInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={dishFormData.price}
                        onChange={handleDishInputChange}
                        placeholder="e.g., 150000"
                        min="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Image
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDishFileSelect}
                          disabled={uploadingDishImage}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                        />
                        {uploadingDishImage && <span className="text-sm text-slate-600">Uploading...</span>}
                      </div>
                      {dishFormData.imageUrl && (
                        <img src={dishFormData.imageUrl} alt="preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={dishFormData.description}
                      onChange={handleDishInputChange}
                      placeholder="Dish description"
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                    ></textarea>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveDish}
                      disabled={savingDish}
                      className="flex-1 bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition font-medium disabled:opacity-50"
                    >
                      {savingDish ? 'Saving...' : (editingDish ? 'Update Dish' : 'Add Dish')}
                    </button>
                    <button
                      onClick={handleCancelDishForm}
                      className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {editingDish && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-800">Option Groups for this Dish</h3>
                      {!showOptionGroupForm && (
                        <button
                          onClick={() => setShowOptionGroupForm(true)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          <Plus size={20} />
                          Add Option Group
                        </button>
                      )}
                    </div>

                    {showOptionGroupForm && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-4">
                          {editingOptionGroup ? 'Edit Option Group' : 'Add Option Group'}
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Option Group Name *
                            </label>
                            <input
                              type="text"
                              value={optionGroupFormData.name}
                              onChange={(e) => setOptionGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Size, Spice Level, Add-ons"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                              Selection Type *
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                <input
                                  type="radio"
                                  name="optionType"
                                  value="single"
                                  checked={optionGroupFormData.type === 'single'}
                                  onChange={(e) => setOptionGroupFormData(prev => ({ ...prev, type: e.target.value }))}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">Single Choice</p>
                                  <p className="text-xs text-slate-600">Customer can select one option (e.g., Size)</p>
                                </div>
                              </label>

                              <label className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                <input
                                  type="radio"
                                  name="optionType"
                                  value="multiple"
                                  checked={optionGroupFormData.type === 'multiple'}
                                  onChange={(e) => setOptionGroupFormData(prev => ({ ...prev, type: e.target.value }))}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">Multiple Choices</p>
                                  <p className="text-xs text-slate-600">Customer can select multiple options (e.g., Add-ons)</p>
                                </div>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Choices
                            </label>
                            <div className="space-y-2 mb-3">
                              {optionGroupFormData.choices.map(choice => (
                                <div key={choice.id} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">{choice.name}</p>
                                    <p className="text-xs text-slate-600">
                                      +{formatPrice(choice.price)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveChoice(choice.id)}
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
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                              </div>
                              <button
                                onClick={handleAddChoiceToOptionGroup}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <button
                              onClick={handleSaveOptionGroup}
                              disabled={savingOptionGroup}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                            >
                              {savingOptionGroup ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelOptionGroupForm}
                              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {loadingOptionGroups && (
                      <p className="text-slate-600 text-center py-4">Loading option groups...</p>
                    )}

                    {!loadingOptionGroups && dishOptionGroups.length > 0 && (
                      <div className="space-y-3">
                        {dishOptionGroups.map(group => (
                          <div key={group.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="font-medium text-slate-900">{group.name}</h5>
                                <p className="text-xs text-slate-500 mt-1">
                                  Type: {group.type === 'single' ? '📌 Single Choice' : '✓ Multiple Choices'}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditOptionGroup(group)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteOptionGroup(group.id)}
                                  disabled={savingOptionGroup}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              {group.choices?.map(choice => (
                                <div key={choice.id} className="flex justify-between">
                                  <span>{choice.name}</span>
                                  <span className="font-medium">+{formatPrice(choice.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!loadingOptionGroups && dishOptionGroups.length === 0 && !showOptionGroupForm && (
                      <p className="text-slate-600 text-center py-4">No option groups added yet</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {dishes.length > 0 ? (
              <div className="space-y-4">
                {dishes.map((dish) => {
                  if (showDishForm && editingDish && dish.id === editingDish.id) {
                    return null
                  }
                  return (
                    <div key={dish.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        {dish.images && dish.images.length > 0 && (
                          <img
                            src={dish.images[0]}
                            alt={dish.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{dish.name}</h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{dish.description || 'No description'}</p>
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className="font-bold text-slate-800">
                              {formatPrice(parseFloat(dish.price || 0))}
                            </span>
                            {dish.is_enable ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Inactive</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => handleEditDish(dish)}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition flex items-center gap-1"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish.id)}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded transition flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-6">No dishes added yet</p>
            )}
          </div>

          {/* Promotions Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Promotions ({promotions.length})</h2>
              {!showPromoForm && (
                <button
                  onClick={() => setShowPromoForm(true)}
                  className="flex items-center gap-2 bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition font-medium"
                >
                  <Plus size={20} />
                  New Promotion
                </button>
              )}
            </div>

            {showPromoForm && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {editingPromo ? 'Edit Promotion' : 'Create Promotion'}
                </h3>
                <form onSubmit={handlePromoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Promotion Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={promoFormData.code}
                        onChange={handlePromoInputChange}
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
                        value={promoFormData.discount_percentage}
                        onChange={handlePromoInputChange}
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
                        value={promoFormData.minPrice}
                        onChange={handlePromoInputChange}
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
                        value={promoFormData.expiryDate}
                        onChange={handlePromoInputChange}
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
                        value={promoFormData.usage_limit}
                        onChange={handlePromoInputChange}
                        placeholder="e.g., 50"
                        min="1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description/Details *
                    </label>
                    <textarea
                      name="detail"
                      value={promoFormData.detail}
                      onChange={handlePromoInputChange}
                      placeholder="e.g., Get 20% off on all items"
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                    ></textarea>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={savingPromo}
                      className="flex-1 bg-[#366055] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d42] transition font-medium disabled:opacity-50"
                    >
                      {savingPromo ? 'Saving...' : (editingPromo ? 'Update Promotion' : 'Create Promotion')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPromoForm}
                      className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {promotions.length > 0 ? (
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800">{promo.detail || 'Promotion'}</h3>
                            {promo.code && (
                              <p className="text-sm text-slate-500 mt-1">Code: <span className="font-mono font-bold text-slate-700">{promo.code}</span></p>
                            )}
                          </div>
                        </div>
                        {promo.discount_percentage && (
                          <p className="text-lg font-bold text-green-600 mt-2">
                            {promo.discount_percentage}% off
                          </p>
                        )}
                        {promo.expiryDate && (
                          <p className="text-xs text-slate-600 mt-2">
                            Expires: {convertToDate(promo.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {promo.is_enable ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap">Active</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">Inactive</span>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPromo(promo)}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition flex items-center gap-1"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded transition flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-6">No promotions added yet</p>
            )}
          </div>
        </div>

        {/* Right Column - Merchant Info */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 sticky top-20">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Merchant Information</h3>

            {merchant ? (
              <div className="space-y-4">
                {merchant.image && (
                  <img
                    src={merchant.image}
                    alt={merchant.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Name</p>
                  <p className="font-semibold text-slate-800">{merchant.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-slate-800 break-all">{merchant.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Phone</p>
                  <p className="font-semibold text-slate-800">{merchant.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Role</p>
                  <p className="font-semibold text-slate-800 capitalize">{merchant.role}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-600">Merchant information not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Promotion Detail Modal */}
      {showPromoDetail && selectedPromotion && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Promotion Details</h2>
              <button
                onClick={() => {
                  setShowPromoDetail(false)
                  setSelectedPromotion(null)
                }}
                className="text-slate-500 hover:text-slate-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Code</p>
                  <p className="font-mono font-bold text-slate-800 text-lg">{selectedPromotion.code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Status</p>
                  {selectedPromotion.is_enable ? (
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">Active</span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium">Inactive</span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Detail</p>
                  <p className="text-slate-800">{selectedPromotion.detail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Discount</p>
                  <p className="text-lg font-bold text-green-600">{selectedPromotion.discount_percentage ? `${selectedPromotion.discount_percentage}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Min Price</p>
                  <p className="text-slate-800">{selectedPromotion.minPrice ? formatPrice(selectedPromotion.minPrice) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Expiry Date</p>
                  <p className="text-slate-800">
                    {selectedPromotion.expiryDate
                      ? convertToDate(selectedPromotion.expiryDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Usage Count</p>
                  <p className="text-slate-800">{selectedPromotion.usage_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium mb-1">Usage Limit</p>
                  <p className="text-slate-800">{selectedPromotion.usage_limit || 'Unlimited'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPromoDetail(false)
                  setSelectedPromotion(null)
                }}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
