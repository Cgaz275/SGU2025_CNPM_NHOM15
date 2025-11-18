'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const Counter = ({ productId, cartItemKey, item }) => {

    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    // Use cartItemKey if provided (for cart page), otherwise productId
    const key = cartItemKey || productId;

    const addToCartHandler = () => {
        if (item && item.originalProductId) {
            dispatch(addToCart({
                productId: item.originalProductId,
                quantity: 1,
                restaurantId: item.restaurantId,
                imageUrl: item.imageUrl,
                name: item.name,
                price: item.price,
                selectedChoices: item.selectedChoices,
                basePrice: item.basePrice,
                addonDetails: item.addonDetails
            }));
        } else if (item) {
            dispatch(addToCart({
                productId: item.id,
                quantity: 1,
                restaurantId: item.restaurantId,
                imageUrl: item.imageUrl,
                name: item.name,
                price: item.price,
                selectedChoices: item.selectedChoices,
                basePrice: item.basePrice,
                addonDetails: item.addonDetails
            }));
        } else {
            dispatch(addToCart({ productId: productId || key }));
        }
        const product = item || products.find(p => p.id === productId);
        if (product) {
            toast.success(`${product.name} added to cart!`);
        }
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId: key }));
        const product = item || products.find(p => p.id === productId);
        if (product) {
            toast.success(`${product.name} removed from cart!`);
        }
    }

    // Display quantity from item if available (cart page), otherwise from Redux
    const quantity = item?.quantity || cartItems[key] || 0;

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{quantity}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter
