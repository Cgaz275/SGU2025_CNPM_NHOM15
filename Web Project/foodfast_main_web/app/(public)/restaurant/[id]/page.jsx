'use client'
import { useState, useEffect, use } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import RestaurantHero from '@/components/Restaurants/RestaurantHero'
import CategoryTabs from '@/components/Restaurants/CategoryTabs'
import MenuSection from '@/components/Restaurants/MenuSectionV2'
import SimilarRestaurants from '@/components/Restaurants/SimilarRestaurants'
import RestaurantMap from '@/components/Restaurants/RestaurantMap'
import PageTitle from '@/components/PageTitle'
import useDishesByRestaurant from '@/hooks/useDishesByRestaurant'
import toast from 'react-hot-toast'
import { addToCart, clearCart } from '@/lib/features/cart/cartSlice'
import ClearCartConfirmModal from '@/components/Modals/ClearCartConfirmModal'

export default function RestaurantDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise)
    const dispatch = useDispatch()
    const [restaurant, setRestaurant] = useState(null)
    const [loadingRestaurant, setLoadingRestaurant] = useState(true)
    const [activeCategory, setActiveCategory] = useState('offers')
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [pendingOrderData, setPendingOrderData] = useState(null)

    const { data: dishes, loading: loadingDishes } = useDishesByRestaurant(params.id)
    const cartRestaurantId = useSelector(state => state.cart.restaurantId)
    const cartItems = useSelector(state => state.cart.cartItems)

    // Fetch restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const docRef = doc(db, 'restaurants', params.id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setRestaurant({
                        id: docSnap.id,
                        ...docSnap.data()
                    })
                } else {
                    console.error('Restaurant not found')
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
            restaurantId: params.id
        }))
        toast.success(`${orderData.dishName} added to cart!`)
    }

    const handleConfirmClearCart = () => {
        if (pendingOrderData) {
            dispatch(clearCart())
            dispatch(addToCart({
                productId: pendingOrderData.dishId,
                quantity: pendingOrderData.quantity,
                restaurantId: params.id
            }))
            toast.success(`${pendingOrderData.dishName} added to cart!`)
            setIsConfirmModalOpen(false)
            setPendingOrderData(null)
        }
    }

    // Get unique categories from dishes
    const categories = Array.from(new Set(dishes.map(d => d.categoryId || 'other'))).map((categoryId, index) => ({
        id: index,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        slug: categoryId
    }))

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

    const similarRestaurants = [
        {
            id: 1,
            name: "McDonald's London",
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/74bc30f073608985a75282e391fa71fa0632b74a?width=476'
        },
        {
            id: 2,
            name: 'Papa Johns',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/2c6abd496ed1aaf3d3a5d50641504bd08c7267e8?width=476'
        },
        {
            id: 3,
            name: 'KFC West London',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/10c184839f607d9bcfadeeec99186afd373ac726?width=476'
        },
        {
            id: 4,
            name: 'Texas Chicken',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/97e33e77de602323414921ad13c780bc5dd264a4?width=476'
        },
        {
            id: 5,
            name: 'Burger King',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/6ecdd4fee68dd0afc09ee17e93e3ec1d2ac0e2ad?width=476'
        },
        {
            id: 6,
            name: 'Shaurma 1',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/32d344eecd2c5adfb2987658e1a6649065145c35?width=476'
        }
    ]

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
                    {Object.entries(groupedDishes).map(([categoryId, categoryDishes]) => (
                        <MenuSection
                            key={categoryId}
                            title={categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
                            items={categoryDishes}
                            sectionId={categoryId}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            )}

            {/* Map Section */}
            <RestaurantMap restaurant={restaurant} />

            {/* Similar Restaurants */}
            <SimilarRestaurants restaurants={similarRestaurants} />

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
        </>
    )
}
