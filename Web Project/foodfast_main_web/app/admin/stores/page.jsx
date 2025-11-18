'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, X } from 'lucide-react'
import useMerchantsWithRestaurants from '@/hooks/useMerchantsWithRestaurants'
import useCategories from '@/hooks/useCategories'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'

const ITEMS_PER_PAGE = 6

export default function AdminStores() {
  const { data: merchants, loading: merchantsLoading, error: merchantsError } = useMerchantsWithRestaurants()
  const { data: categories, loading: categoriesLoading } = useCategories()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedMerchant, setExpandedMerchant] = useState(null)
  const [togglingRestaurant, setTogglingRestaurant] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter merchants and restaurants based on search and category
  const filteredData = useMemo(() => {
    return merchants.map(merchant => {
      const filteredRestaurants = merchant.restaurants.filter(restaurant => {
        const matchesSearch =
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = !selectedCategory ||
          restaurant.category === selectedCategory ||
          restaurant.categories?.includes(selectedCategory)

        return matchesSearch && matchesCategory
      })

      return {
        ...merchant,
        restaurants: filteredRestaurants
      }
    }).filter(merchant => merchant.restaurants.length > 0 || searchQuery || selectedCategory)
  }, [merchants, searchQuery, selectedCategory])

  // Create a map of category IDs to names
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach(cat => {
      map[cat.id] = cat.name
    })
    return map
  }, [categories])

  // Flatten restaurants for pagination
  const allRestaurants = useMemo(() => {
    const restaurants = []
    filteredData.forEach(merchant => {
      merchant.restaurants.forEach(restaurant => {
        restaurants.push({
          ...restaurant,
          merchantId: merchant.id,
          merchantName: merchant.name,
          merchantEmail: merchant.email,
          merchantPhone: merchant.phone,
          categoryName: restaurant.category ? categoryMap[restaurant.category] : null
        })
      })
    })
    return restaurants
  }, [filteredData, categoryMap])

  // Pagination calculation
  const totalPages = Math.ceil(allRestaurants.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRestaurants = allRestaurants.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  const handleToggleRestaurantStatus = async (restaurantId, currentStatus) => {
    setTogglingRestaurant(restaurantId)
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId)
      await updateDoc(restaurantRef, {
        is_enable: !currentStatus
      })
      toast.success(`Restaurant ${!currentStatus ? 'enabled' : 'banned'} successfully`)
    } catch (error) {
      console.error('Error updating restaurant status:', error)
      toast.error('Failed to update restaurant status')
    } finally {
      setTogglingRestaurant(null)
    }
  }

  return !merchantsLoading ? (
    <div className="text-slate-500 mb-28">
      <div className="mb-8">
        <h1 className="text-2xl mb-6"><span className="text-slate-800 font-medium">Merchant</span> Stores Management</h1>
        
        {/* Search and Filter Section */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by restaurant name, merchant name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter size={20} className="text-slate-400" />
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !selectedCategory
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {!categoriesLoading && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants List with Pagination */}
      {allRestaurants.length > 0 ? (
        <div>
          <div className="flex flex-col gap-4">
            {paginatedRestaurants.map((restaurant) => (
              <div
                key={`${restaurant.merchantId}-${restaurant.id}`}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center"
              >
                {/* Restaurant Image */}
                {restaurant.imageUrl && (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Restaurant Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">{restaurant.name}</h3>

                  <p className="text-sm text-slate-600 mt-2">
                    <span className="font-medium">Merchant:</span> {restaurant.merchantName}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span className="text-slate-600">
                      Rating: <span className="font-medium">{restaurant.rating || 0} / 5</span>
                    </span>
                    <span className={`font-medium ${restaurant.is_enable ? 'text-green-600' : 'text-red-600'}`}>
                      {restaurant.is_enable ? '✓ Active' : '✗ Banned'}
                    </span>
                    {restaurant.categoryName && (
                      <span className="text-slate-600">
                        Category: <span className="font-medium">{restaurant.categoryName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Link
                    href={`/admin/stores/${restaurant.id}`}
                    className="px-4 py-2 bg-[#366055] text-white rounded-lg hover:bg-[#32574D] transition text-center font-medium text-sm"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleToggleRestaurantStatus(restaurant.id, restaurant.is_enable)}
                    disabled={togglingRestaurant === restaurant.id}
                    className={`px-4 py-2 rounded-lg transition text-center font-medium text-sm ${
                      restaurant.is_enable
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:opacity-50`}
                  >
                    {togglingRestaurant === restaurant.id ? 'Updating...' : (restaurant.is_enable ? 'Disable' : 'Enable')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === page
                      ? 'bg-slate-800 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center mt-6 text-slate-600">
            <p>
              Showing {startIndex + 1} to {Math.min(endIndex, allRestaurants.length)} of {allRestaurants.length} restaurant{allRestaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80 bg-white rounded-lg border border-slate-200">
          <h1 className="text-xl text-slate-600 font-medium">
            {searchQuery || selectedCategory ? 'No restaurants found matching your filters' : 'No restaurants available'}
          </h1>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  )
}
