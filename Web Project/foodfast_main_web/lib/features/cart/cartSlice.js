import { createSlice } from '@reduxjs/toolkit'

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
            const { productId, quantity = 1, restaurantId, imageUrl, name, price } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId] += quantity
            } else {
                state.cartItems[productId] = quantity
            }
            if (imageUrl || name || price) {
                state.itemMetadata[productId] = {
                    imageUrl,
                    name,
                    price,
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
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
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
