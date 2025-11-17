'use client'
import { useState, useEffect, use } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import RestaurantHero from '@/components/Restaurants/RestaurantHero'
import CategoryTabs from '@/components/Restaurants/CategoryTabs'
import MenuSection from '@/components/Restaurants/MenuSectionV2'
import SimilarRestaurants from '@/components/Restaurants/SimilarRestaurants'
import RestaurantMap from '@/components/Restaurants/RestaurantMap'
import PageTitle from '@/components/PageTitle'
import useDishesByRestaurant from '@/hooks/useDishesByRestaurant'
import useCurrentUser from '@/hooks/useCurrentUser'
import toast from 'react-hot-toast'
import { addToCart, clearCart } from '@/lib/features/cart/cartSlice'
import ClearCartConfirmModal from '@/components/Modals/ClearCartConfirmModal'
import MerchantOwnRestaurantModal from '@/components/Modals/MerchantOwnRestaurantModal'

export default function RestaurantDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise)
    const dispatch = useDispatch()
    const { user } = useCurrentUser()
    const [restaurant, setRestaurant] = useState(null)
    const [categoryList, setCategoryList] = useState([])
    const [similarRestaurants, setSimilarRestaurants] = useState([])
    const [selectedCategoryId, setSelectedCategoryId] = useState(null)
    const [loadingRestaurant, setLoadingRestaurant] = useState(true)
    const [loadingSimilar, setLoadingSimilar] = useState(false)
    const [activeCategory, setActiveCategory] = useState('offers')
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [pendingOrderData, setPendingOrderData] = useState(null)
    const [isMerchantOwnRestaurantModalOpen, setIsMerchantOwnRestaurantModalOpen] = useState(false)

    const { data: dishes, loading: loadingDishes } = useDishesByRestaurant(params.id)
    const cartRestaurantId = useSelector(state => state.cart.restaurantId)
    const cartItems = useSelector(state => state.cart.cartItems)

    // Check if current user owns this restaurant
    const isUserOwnRestaurant = user?.uid === params.id

    // Fetch restaurant data and categories
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const docRef = doc(db, 'restaurants', params.id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const restaurantData = {
                        id: docSnap.id,
                        ...docSnap.data()
                    }
                    setRestaurant(restaurantData)

                    console.log('Restaurant data:', restaurantData)

                    // Try to get category from multiple sources
                    let categoryId = null

                    // First, check if restaurant has categories array
                    if (restaurantData.categories && Array.isArray(restaurantData.categories) && restaurantData.categories.length > 0) {
                        categoryId = restaurantData.categories[0]
                    }
                    // Second, check if restaurant has a single category field
                    else if (restaurantData.category) {
                        categoryId = restaurantData.category
                    }

                    if (categoryId) {
                        setSelectedCategoryId(categoryId)
                        console.log('Selected category ID:', categoryId)
                    }
                } else {
                    console.error('Restaurant not found')
                }

                // Fetch categories from restaurant_categories collection
                const catDocRef = doc(db, 'restaurant_categories', params.id)
                const catDocSnap = await getDoc(catDocRef)
                if (catDocSnap.exists()) {
                    const data = catDocSnap.data()
                    setCategoryList(data.category_list || [])
                    console.log('Category list:', data.category_list)
                }
            } catch (error) {
                console.error('Error fetching restaurant:', error)
            } finally {
                setLoadingRestaurant(false)
            }
        }

        if (params.id) {
            fetchRestaurant()
        }
    }, [params.id])

    // Fetch similar restaurants by category
    useEffect(() => {
        const fetchSimilarRestaurants = async () => {
            if (!params.id) {
                setSimilarRestaurants([])
                return
            }

            setLoadingSimilar(true)
            try {
                const restaurantsRef = collection(db, 'restaurants')
                const querySnapshot = await getDocs(restaurantsRef)

                const allRestaurants = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data()

                    // Skip current restaurant
                    if (doc.id === params.id) return

                    if (!data.name) return

                    let hasMatchingCategory = false

                    if (selectedCategoryId) {
                        // Use same logic as AllRestaurant page
                        hasMatchingCategory = data.category === selectedCategoryId ||
                                           data.categories?.includes(selectedCategoryId)
                    } else {
                        // If no category selected, include all restaurants
                        hasMatchingCategory = true
                    }

                    // Add restaurant if it matches the category
                    if (hasMatchingCategory) {
                        allRestaurants.push({
                            id: doc.id,
                            ...data
                        })
                    }
                })

                console.log('Found similar restaurants:', allRestaurants.length, 'for category:', selectedCategoryId)

                // Sort by rating descending
                allRestaurants.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))

                setSimilarRestaurants(allRestaurants)
            } catch (error) {
                console.error('Error fetching similar restaurants:', error)
                setSimilarRestaurants([])
            } finally {
                setLoadingSimilar(false)
            }
        }

        fetchSimilarRestaurants()
    }, [params.id, selectedCategoryId])

    // Group dishes by category
    const groupedDishes = dishes.reduce((acc, dish) => {
        const category = dish.categoryId || 'other'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(dish)
        return acc
    }, {})

    const handleAddToCart = (orderData) => {
        // Check if current user owns this restaurant
        if (isUserOwnRestaurant) {
            setIsMerchantOwnRestaurantModalOpen(true)
            return
        }

        // Check if cart has items from a different restaurant
        if (cartRestaurantId && cartRestaurantId !== params.id && Object.keys(cartItems).length > 0) {
            setPendingOrderData(orderData)
            setIsConfirmModalOpen(true)
            return
        }

        // If cart is empty or from same restaurant, add the item
        dispatch(addToCart({
            productId: orderData.dishId,
            quantity: orderData.quantity,
            restaurantId: params.id,
            imageUrl: orderData.imageUrl,
            name: orderData.dishName,
            price: orderData.price
        }))
        toast.success(`${orderData.dishName} added to cart!`)
    }

    const handleConfirmClearCart = () => {
        if (pendingOrderData) {
            dispatch(clearCart())
            dispatch(addToCart({
                productId: pendingOrderData.dishId,
                quantity: pendingOrderData.quantity,
                restaurantId: params.id,
                imageUrl: pendingOrderData.imageUrl,
                name: pendingOrderData.dishName,
                price: pendingOrderData.price
            }))
            toast.success(`${pendingOrderData.dishName} added to cart!`)
            setIsConfirmModalOpen(false)
            setPendingOrderData(null)
        }
    }

    // Get categories from restaurant_categories collection
    const categories = categoryList && Array.isArray(categoryList)
        ? categoryList.map((category, index) => ({
            id: category.id || index,
            name: category.name || category,
            slug: category.id || category
        }))
        : []

    if (loadingRestaurant) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC8A06] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading restaurant...</p>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-xl text-red-600">Restaurant not found</p>
                </div>
            </div>
        )
    }


    return (
        <>
            <PageTitle title={`${restaurant.name} | FoodFast`} />

            {/* Hero Section */}
            <RestaurantHero restaurant={restaurant} />

            {/* Title */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-8">
                <h2 className="text-black text-2xl md:text-3xl lg:text-[32px] font-bold">
                    All Offers from {restaurant.name}
                </h2>
            </div>

            {/* Category Navigation */}
            {categories.length > 0 && (
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            )}

            {/* Menu Sections */}
            {loadingDishes ? (
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC8A06] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu items...</p>
                </div>
            ) : dishes.length === 0 ? (
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
                    <p className="text-gray-600 text-lg">No menu items available</p>
                </div>
            ) : (
                <div className="mt-8 md:mt-12">
                    {Object.entries(groupedDishes).map(([categoryId, categoryDishes]) => {
                        // Find the category name from categoryList
                        const categoryName = categoryList.find(cat => cat.id === categoryId)?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
                        return (
                            <MenuSection
                                key={categoryId}
                                title={categoryName}
                                items={categoryDishes}
                                sectionId={categoryId}
                                onAddToCart={handleAddToCart}
                            />
                        )
                    })}
                </div>
            )}

            {/* Map Section */}
            <RestaurantMap restaurant={restaurant} />

            {/* Similar Restaurants */}
            <SimilarRestaurants
                restaurants={similarRestaurants}
                categoryId={selectedCategoryId}
            />

            {/* Clear Cart Confirmation Modal */}
            <ClearCartConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false)
                    setPendingOrderData(null)
                }}
                onConfirm={handleConfirmClearCart}
                currentRestaurantName="Your Current Restaurant"
                newRestaurantName={restaurant?.name || 'This Restaurant'}
            />

            {/* Merchant Own Restaurant Modal */}
            <MerchantOwnRestaurantModal
                isOpen={isMerchantOwnRestaurantModalOpen}
                restaurantName={restaurant?.name || 'Your Restaurant'}
                onClose={() => setIsMerchantOwnRestaurantModalOpen(false)}
            />
        </>
    )
}
