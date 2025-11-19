'use client'

import { useState } from 'react'
import RestaurantBasicInfo from './RestaurantBasicInfo'
import RestaurantCategories from './RestaurantCategories'
import DishManagement from './DishManagement'
import RestaurantPromotions from './RestaurantPromotions'
import MerchantOrders from './MerchantOrders'

export default function MerchantRestaurantEditor({ user }) {
    const [activeTab, setActiveTab] = useState('basic')

    if (!user?.uid) {
        return null
    }

    const tabs = [
        { id: 'basic', label: 'Restaurant Info' },
        { id: 'categories', label: 'Categories'},
        { id: 'dishes', label: 'Dishes'},
        { id: 'promotions', label: 'Promotions'},
        { id: 'orders', label: 'Orders'}
    ]

    return (
        <div className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#366055] mb-6">
                Restaurant Management
            </h2>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                <div className="flex gap-2 sm:gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 sm:py-4 px-3 sm:px-4 font-medium transition-colors border-b-2 -mb-[2px] whitespace-nowrap text-sm sm:text-base ${
                                activeTab === tab.id
                                    ? 'border-[#366055] text-[#366055]'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <span className="hidden sm:inline">{tab.icon} </span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8">
                {activeTab === 'basic' && <RestaurantBasicInfo restaurantId={user.uid} />}
                {activeTab === 'categories' && <RestaurantCategories restaurantId={user.uid} />}
                {activeTab === 'dishes' && <DishManagement restaurantId={user.uid} />}
                {activeTab === 'promotions' && <RestaurantPromotions restaurantId={user.uid} />}
                {activeTab === 'orders' && <MerchantOrders restaurantId={user.uid} />}
            </div>
        </div>
    )
}
