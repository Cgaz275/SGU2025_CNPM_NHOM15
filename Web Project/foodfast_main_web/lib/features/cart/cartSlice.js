import { createSlice } from '@reduxjs/toolkit'

// Simple hash function to create unique keys for addon combinations
const hashChoices = (obj) => {
    let hash = 0
    const str = JSON.stringify(obj)
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
        restaurantId: null,
        itemMetadata: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, quantity = 1, restaurantId, imageUrl, name, price, selectedChoices, basePrice, addonDetails } = action.payload

            // Create a unique cart item key when selectedChoices exist
            // This allows same product with different addons to be separate cart items
            let cartItemKey = productId
            if (selectedChoices && Object.keys(selectedChoices).length > 0) {
                const choicesHash = hashChoices(selectedChoices)
                cartItemKey = `${productId}_${choicesHash}`
            }

            if (state.cartItems[cartItemKey]) {
                state.cartItems[cartItemKey] += quantity
            } else {
                state.cartItems[cartItemKey] = quantity
            }
            if (imageUrl || name || price) {
                state.itemMetadata[cartItemKey] = {
                    imageUrl,
                    name,
                    price,
                    basePrice: basePrice || price,
                    selectedChoices: selectedChoices || {},
                    addonDetails: addonDetails || [],
                    originalProductId: productId,
                }
            }
            if (restaurantId) {
                state.restaurantId = restaurantId
            }
            state.total += quantity
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] <= 0) {
                    delete state.cartItems[productId]
                    delete state.itemMetadata[productId]
                }
            }
            state.total = Math.max(0, state.total - 1)
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
            delete state.itemMetadata[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
            state.restaurantId = null
            state.itemMetadata = {}
        },
        restoreCart: (state, action) => {
            const { cartItems, total, restaurantId, itemMetadata } = action.payload
            state.cartItems = cartItems || {}
            state.total = total || 0
            state.restaurantId = restaurantId || null
            state.itemMetadata = itemMetadata || {}
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, restoreCart } = cartSlice.actions

export default cartSlice.reducer
