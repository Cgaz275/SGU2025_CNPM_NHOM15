'use client'
import Counter from "@/components/Counter";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { XIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, GeoPoint } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import useCurrentUser from "@/hooks/useCurrentUser";
import AuthModal from "@/components/Modals/AuthModal";
import AddressPickerModal from "@/components/Modals/AddressPickerModal";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'VND ';

    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const addressList = useSelector(state => state.address.list);
    const { user, isAuthenticated } = useCurrentUser();
    const router = useRouter();

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
    const [placingOrder, setPlacingOrder] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddressData, setSelectedAddressData] = useState(null);
    const [defaultAddressId, setDefaultAddressId] = useState(null);

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

    const handleSelectAddress = (addressData) => {
        setSelectedAddressData(addressData);
        setAddress(addressData.address);
        setDefaultAddressId(addressData.id);
        setReceiverName(addressData.name || '');
        setPhoneNumber(addressData.phone || '');
    };

    useEffect(() => {
        createCartArray();
    }, [cartItems, products]);

    useEffect(() => {
        if (user) {
            setReceiverName(user.name || '');
            setPhoneNumber(user.phone || '');

            // Load user's default address
            const loadDefaultAddress = async () => {
                try {
                    const addressCollectionRef = collection(db, 'address');
                    const addressQuery = query(addressCollectionRef, where('userId', '==', user.uid));
                    const addressSnapshot = await getDocs(addressQuery);

                    if (addressSnapshot.size > 0) {
                        // Get the first address as default
                        const defaultAddr = addressSnapshot.docs[0];
                        const defaultAddrData = defaultAddr.data();

                        setDefaultAddressId(defaultAddr.id);
                        setAddress(defaultAddrData.address || '');
                        setReceiverName(defaultAddrData.name || user.name || '');
                        setPhoneNumber(defaultAddrData.phone || user.phone || '');

                        // Set selected address data for later use
                        setSelectedAddressData({
                            id: defaultAddr.id,
                            address: defaultAddrData.address,
                            name: defaultAddrData.name,
                            phone: defaultAddrData.phone,
                            lat: defaultAddrData.latlong?.latitude,
                            lng: defaultAddrData.latlong?.longitude,
                        });
                    }
                } catch (error) {
                    console.error('Error loading default address:', error);
                }
            };

            loadDefaultAddress();
        }
    }, [user]);

    const shippingFee = 0;
    const discount = discountApplied ? 0 : 0;
    const finalTotal = totalPrice + shippingFee - discount;

    const handlePlaceOrder = async () => {
        // Check if user is logged in
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            toast.error('Please login to place an order');
            return;
        }

        // Validate required fields
        if (!address || !receiverName || !phoneNumber) {
            toast.error('Please fill in all delivery information');
            return;
        }

        if (cartArray.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setPlacingOrder(true);

        try {
            // Get restaurant ID from the first item (assuming single restaurant per order)
            const restaurantId = cartArray[0]?.restaurantId;

            // Fetch restaurant name
            let restaurantName = '';
            if (restaurantId) {
                try {
                    const restaurantRef = doc(db, 'restaurants', restaurantId);
                    const restaurantSnap = await getDoc(restaurantRef);
                    if (restaurantSnap.exists()) {
                        restaurantName = restaurantSnap.data().name || '';
                    }
                } catch (error) {
                    console.error('Error fetching restaurant:', error);
                }
            }

            // Fetch user's address data to include latlong
            let latlong = null;
            if (selectedAddressData) {
                // Create GeoPoint from selected address data
                latlong = new GeoPoint(selectedAddressData.lat, selectedAddressData.lng);
            } else {
                // Try to get from user's default address in Firestore
                const addressCollectionRef = collection(db, 'address');
                const addressQuery = query(addressCollectionRef, where('userId', '==', user.uid));
                const addressSnapshot = await getDocs(addressQuery);

                if (addressSnapshot.size > 0) {
                    const addressData = addressSnapshot.docs[0].data();
                    if (addressData.latlong) {
                        // latlong is already a GeoPoint from Firestore
                        latlong = addressData.latlong;
                    }
                }
            }

            // Prepare order data matching the exact Firestore schema
            const orderData = {
                // User and restaurant info
                userId: user.uid,
                restaurantId: restaurantId || "",
                default_address_id: defaultAddressId || "",

                // Items (array of menu items)
                items: cartArray.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.imageUrl || item.images?.[0] || "",
                    restaurantId: item.restaurantId || restaurantId || "",
                    restaurant: restaurantName
                })),

                // Order summary totals
                deliveryFee: shippingFee,
                discount: discount,
                discountPercent: discountApplied ? 0 : 0,
                total: finalTotal,

                // Payment information
                paymentMethod: paymentMethod,
                isPaid: paymentMethod !== 'COD',

                // Delivery information (address as nested object)
                address: {
                    address: address,
                    name: receiverName,
                    phone: phoneNumber,
                    latlong: latlong,
                    note: ""
                },

                // Order status
                status: 'pending',

                // Timestamps
                createdAt: serverTimestamp(),
                estimatedDelivery: serverTimestamp(),
            };

            // Save to Firebase
            const ordersRef = collection(db, 'orders');
            const docRef = await addDoc(ordersRef, orderData);

            // Clear cart
            dispatch(clearCart());

            toast.success('Order placed successfully!');

            // Redirect to orders page
            setTimeout(() => {
                router.push('/orders');
            }, 1000);

        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

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
                                    className="flex-1 h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base placeholder:text-[#C4C4C4] outline-none"
                                />
                                <button
                                    onClick={handleApplyPromoCode}
                                    className="w-[87px] h-[47px] bg-[#FDFDFD] rounded-md text-[#366055] text-base hover:bg-white transition"
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
                                    <label className="text-white text-sm md:text-base block mb-2">
                                        Address
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Address Placeholder"
                                            className="flex-1 h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base placeholder:text-[#C4C4C4] outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="h-[47px] px-3 md:px-4 bg-[#FDFDFD] text-[#366055] rounded-md hover:bg-white transition flex items-center gap-2 font-medium"
                                        >
                                            <MapPin size={18} />
                                            <span className="hidden sm:inline text-sm">Map</span>
                                        </button>
                                    </div>
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
                                        className="w-full h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base] placeholder:text-[#C4C4C4] outline-none"
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
                                            {paymentMethod === 'COD' && (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-white text-base md:text-lg">COD</span>
                                    </label>
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
                            <button
                                onClick={handlePlaceOrder}
                                disabled={placingOrder}
                                className="w-full bg-white text-[#366055] py-4 md:py-5 rounded-lg font-bold text-lg md:text-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {placingOrder ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            <AddressPickerModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSelectAddress={handleSelectAddress}
            />
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
