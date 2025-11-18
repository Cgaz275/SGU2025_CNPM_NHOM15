'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { MapPin, Phone, Mail, Star, ChevronLeft, AlertCircle } from 'lucide-react'
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
        const promotionsCollectionRef = collection(db, 'promotions')
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
            <h2 className="text-xl font-bold text-slate-800 mb-4">Restaurant Categories</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-medium text-slate-800">{category.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-6">No categories added yet</p>
            )}
          </div>

          {/* Dishes Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Dishes ({dishes.length})</h2>
            {dishes.length > 0 ? (
              <div className="space-y-4">
                {dishes.map((dish) => (
                  <div key={dish.id} className="border border-slate-200 rounded-lg p-4 flex gap-4">
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
                      <div className="flex items-center gap-4 mt-3">
                        <span className="font-bold text-slate-800">
                          {formatPrice(parseFloat(dish.price || 0))}
                        </span>
                        {dish.mrp && parseFloat(dish.mrp) > parseFloat(dish.price) && (
                          <span className="text-sm line-through text-slate-500">
                            {formatPrice(parseFloat(dish.mrp))}
                          </span>
                        )}
                        {dish.is_enable ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-6">No dishes added yet</p>
            )}
          </div>

          {/* Promotions Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Promotions ({promotions.length})</h2>
            {promotions.length > 0 ? (
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{promo.title || 'Promotion'}</h3>
                        <p className="text-sm text-slate-600 mt-1">{promo.description || 'No description'}</p>
                        {promo.discountValue && (
                          <p className="text-lg font-bold text-green-600 mt-2">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : formatPrice(promo.discountValue)} off
                          </p>
                        )}
                      </div>
                      {promo.is_enable ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap ml-4">Active</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap ml-4">Inactive</span>
                      )}
                    </div>
                    {promo.expiryDate && (
                      <p className="text-xs text-slate-600 mt-3">
                        Expires: {convertToDate(promo.expiryDate).toLocaleDateString()}
                      </p>
                    )}
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
    </div>
  )
}
