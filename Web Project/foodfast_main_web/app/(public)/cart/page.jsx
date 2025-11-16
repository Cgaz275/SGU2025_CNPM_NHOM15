'use client'
import Counter from "@/components/Counter";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'VND ';

    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const addressList = useSelector(state => state.address.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('VNPay');
    const [promoCode, setPromoCode] = useState('');
    const [address, setAddress] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [loading, setLoading] = useState(false);

    const createCartArray = async () => {
        setLoading(true);
        setTotalPrice(0);
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            let item = products.find(product => product.id === key);

            // If not found in products, try to fetch from dishes
            if (!item) {
                try {
                    const dishRef = doc(db, 'dishes', key);
                    const dishSnap = await getDoc(dishRef);
                    if (dishSnap.exists()) {
                        item = {
                            id: dishSnap.id,
                            ...dishSnap.data(),
                        };
                    }
                } catch (error) {
                    console.error('Error fetching dish:', error);
                }
            }

            if (item) {
                cartArray.push({
                    ...item,
                    quantity: value,
                });
                setTotalPrice(prev => prev + item.price * value);
            }
        }
        setCartArray(cartArray);
        setLoading(false);
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    const handleApplyPromoCode = () => {
        // Add promo code logic here
        console.log('Applying promo code:', promoCode);
    }

    useEffect(() => {
        createCartArray();
    }, [cartItems, products]);

    const shippingFee = 30000;
    const discount = discountApplied ? 0 : 0;
    const finalTotal = totalPrice + shippingFee - discount;

    return cartArray.length > 0 ? (
        <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-20 py-12">
            <div className="max-w-[1728px] mx-auto">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black mb-12">Your cart item</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Cart Items */}
                    <div className="flex-1 space-y-7">
                        {cartArray.map((item, index) => (
                            <div key={index} className="relative bg-[#FAFAF6] rounded-xl p-8 shadow-sm">
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleDeleteItemFromCart(item.id)}
                                    className="absolute -left-4 -top-4 w-8 h-8 bg-[#366055] rounded-full flex items-center justify-center hover:bg-[#2a4d42] transition"
                                >
                                    <XIcon size={15} className="text-white" />
                                </button>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    {/* Product Image */}
                                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                        {item.images && item.images[0] ? (
                                            <Image
                                                src={item.images[0]}
                                                className="w-auto h-20 object-contain"
                                                alt={item.name}
                                                width={113}
                                                height={113}
                                            />
                                        ) : item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                className="w-auto h-20 object-contain"
                                                alt={item.name}
                                                width={113}
                                                height={113}
                                            />
                                        ) : (
                                            <div className="text-slate-400 text-xs">No image</div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[#366055] text-xl md:text-2xl font-bold leading-tight mb-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-[#03081F] text-sm md:text-base">
                                                {item.category || 'Product Category'}
                                            </p>
                                            <p className="text-[#03081F] text-sm md:text-base">
                                                Unit price: {item.price.toLocaleString()} {currency}
                                            </p>
                                            <p className="text-[#03081F] text-sm md:text-base">
                                                Size: {item.size || 'Standard'}
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm md:text-base">
                                                <span className="text-[#03081F]">Total: </span>
                                                <span className="text-[#FC8A06] text-xl md:text-2xl font-bold">
                                                    {(item.price * item.quantity).toLocaleString()} {currency}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex sm:flex-col items-center justify-center">
                                        <Counter productId={item.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side - Promotion & Order Summary */}
                    <div className="w-full lg:w-[605px] space-y-8">
                        {/* Promotion Code Card */}
                        <div className="bg-[#366055] rounded-[13px] p-6">
                            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-4">Promotion Code</h2>
                            <div className="h-px bg-white mb-6"></div>
                            <p className="text-white text-sm md:text-base font-medium mb-3">Promotion Code</p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="enter code"
                                    className="flex-1 h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base font-[Montserrat] placeholder:text-[#C4C4C4] outline-none"
                                />
                                <button
                                    onClick={handleApplyPromoCode}
                                    className="w-[87px] h-[47px] bg-[#FDFDFD] rounded-md text-[#366055] text-base font-bold font-[Montserrat] hover:bg-white transition"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Delivery Information & Order Summary Card */}
                        <div className="bg-[#366055] rounded-[13px] p-6">
                            {/* Delivery Information */}
                            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-4">Delivery Information</h2>
                            <div className="h-px bg-white mb-6"></div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-white text-sm md:text-base font-medium block mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Address Placeholder"
                                        className="w-full h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base font-[Montserrat] placeholder:text-[#C4C4C4] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-white text-sm md:text-base font-medium block mb-2">
                                        Receiver name
                                    </label>
                                    <input
                                        type="text"
                                        value={receiverName}
                                        onChange={(e) => setReceiverName(e.target.value)}
                                        placeholder="Receiver name placeholder"
                                        className="w-full h-[47px] px-3 bg-[#FDFDFD] rounded-md text-sm md:text-base placeholder:text-[#C4C4C4] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-white text-sm md:text-base font-medium block mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Phone placeholder"
                                        className="w-full h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base font-[Montserrat] placeholder:text-[#C4C4C4] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Order Summary */}
                            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-4">Order Summary</h2>
                            <div className="h-px bg-white mb-6"></div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-white">
                                    <span className="text-base md:text-lg font-semibold">Sub-total:</span>
                                    <span className="text-base md:text-lg font-normal">
                                        {totalPrice.toLocaleString()} {currency}
                                    </span>
                                </div>

                                <div className="flex justify-between text-white">
                                    <span className="text-base md:text-lg font-semibold">Total Items:</span>
                                    <span className="text-base md:text-lg font-normal">
                                        {cartArray.reduce((sum, item) => sum + item.quantity, 0)} Items
                                    </span>
                                </div>

                                <div className="flex justify-between text-white">
                                    <span className="text-base md:text-lg font-semibold">Discount Applied:</span>
                                    <span className="text-base md:text-lg font-normal">
                                        {discountApplied ? `${discount.toLocaleString()} ${currency}` : 'No promotion applied'}
                                    </span>
                                </div>

                                <div className="flex justify-between text-white">
                                    <span className="text-base md:text-lg font-semibold">Shipping Fee:</span>
                                    <span className="text-base md:text-lg font-normal">
                                        {shippingFee.toLocaleString()} {currency}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <h3 className="text-white text-base md:text-lg font-semibold mb-4">Payment Method:</h3>
                                <div className="flex items-center gap-8">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative">
                                            <div className="w-[13px] h-[13px] rounded-full border-2 border-white bg-transparent"></div>
                                            {paymentMethod === 'VNPay' && (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="VNPay"
                                            checked={paymentMethod === 'VNPay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-white text-base md:text-lg">VNPay</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative">
                                            <div className="w-[13px] h-[13px] rounded-full border-2 border-white bg-transparent"></div>
                                            {paymentMethod === 'VISA' && (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="VISA"
                                            checked={paymentMethod === 'VISA'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-white text-base md:text-lg">VISA</span>
                                    </label>
                                </div>
                            </div>

                            <div className="h-px bg-white mb-6"></div>

                            {/* Total */}
                            <div className="text-white text-2xl md:text-3xl font-semibold mb-8">
                                Total: {finalTotal.toLocaleString()} {currency}
                            </div>

                            {/* Place Order Button */}
                            <button className="w-full bg-white text-[#366055] py-4 md:py-5 rounded-lg font-bold text-lg md:text-xl hover:bg-gray-100 transition">
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : loading ? (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC8A06] mx-auto mb-4"></div>
                <h1 className="text-2xl sm:text-4xl font-semibold">Loading cart items...</h1>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
        </div>
    )
}
