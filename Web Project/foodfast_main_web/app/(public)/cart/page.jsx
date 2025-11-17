'use client'
import PageTitle from "@/components/PageTitle";
import CartItemCard from "@/components/Cart/CartItemCard";
import PromoCard from "@/components/Cart/PromoCard";
import DeliveryInfoCard from "@/components/Cart/DeliveryInfoCard";
import OrderSummaryCard from "@/components/Cart/OrderSummaryCard";
import { deleteItemFromCart, clearCart } from "@/lib/features/cart/cartSlice";
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

    const { cartItems, itemMetadata } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
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
    const [selectedAddressCreatedAt, setSelectedAddressCreatedAt] = useState(null);

    const createCartArray = async () => {
        setLoading(true);
        setTotalPrice(0);
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            let item = products.find(product => product.id === key);

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

            if (item || itemMetadata[key]) {
                const metadata = itemMetadata[key];
                const finalItem = {
                    id: key,
                    name: item?.name || metadata?.name || 'Unknown Item',
                    price: item?.price || metadata?.price || 0,
                    imageUrl: item?.imageUrl || metadata?.imageUrl,
                    images: item?.images,
                    category: item?.category,
                    size: item?.size,
                    restaurantId: item?.restaurantId,
                    ...item,
                    quantity: value,
                };
                cartArray.push(finalItem);
                setTotalPrice(prev => prev + (finalItem.price * value));
            }
        }
        setCartArray(cartArray);
        setLoading(false);
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    const handleApplyPromoCode = () => {
        console.log('Applying promo code:', promoCode);
    }

    const handleSelectAddress = async (addressData) => {
        setSelectedAddressData(addressData);
        setAddress(addressData.address);
        setDefaultAddressId(addressData.id || '');
        setReceiverName(addressData.name || '');
        setPhoneNumber(addressData.phone || '');

        // If address has an id, fetch createdAt from Firebase
        if (addressData.id) {
            try {
                const addressRef = doc(db, 'address', addressData.id);
                const addressSnap = await getDoc(addressRef);
                if (addressSnap.exists()) {
                    setSelectedAddressCreatedAt(addressSnap.data().createdAt || null);
                }
            } catch (error) {
                console.error('Error fetching address details:', error);
                setSelectedAddressCreatedAt(null);
            }
        } else {
            setSelectedAddressCreatedAt(null);
        }
    };

    useEffect(() => {
        createCartArray();
    }, [cartItems, products]);

    useEffect(() => {
        if (user) {
            setReceiverName(user.name || '');
            setPhoneNumber(user.phone || '');

            const loadDefaultAddress = async () => {
                try {
                    const addressCollectionRef = collection(db, 'address');
                    const addressQuery = query(addressCollectionRef, where('userId', '==', user.uid));
                    const addressSnapshot = await getDocs(addressQuery);

                    if (addressSnapshot.size > 0) {
                        const defaultAddr = addressSnapshot.docs[0];
                        const defaultAddrData = defaultAddr.data();

                        setDefaultAddressId(defaultAddr.id);
                        setAddress(defaultAddrData.address || '');
                        setReceiverName(defaultAddrData.name || user.name || '');
                        setPhoneNumber(defaultAddrData.phone || user.phone || '');
                        setSelectedAddressCreatedAt(defaultAddrData.createdAt || null);

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
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            toast.error('Please login to place an order');
            return;
        }

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
            const restaurantId = cartArray[0]?.restaurantId;

            let restaurantName = '';
            let pickupLatlong = null;
            if (restaurantId) {
                try {
                    const restaurantRef = doc(db, 'restaurants', restaurantId);
                    const restaurantSnap = await getDoc(restaurantRef);
                    if (restaurantSnap.exists()) {
                        const restaurantData = restaurantSnap.data();
                        restaurantName = restaurantData.name || '';
                        pickupLatlong = restaurantData.latlong || null;
                    }
                } catch (error) {
                    console.error('Error fetching restaurant:', error);
                }
            }

            let latlong = null;
            if (selectedAddressData) {
                latlong = new GeoPoint(selectedAddressData.lat, selectedAddressData.lng);
            } else {
                const addressCollectionRef = collection(db, 'address');
                const addressQuery = query(addressCollectionRef, where('userId', '==', user.uid));
                const addressSnapshot = await getDocs(addressQuery);

                if (addressSnapshot.size > 0) {
                    const addressData = addressSnapshot.docs[0].data();
                    if (addressData.latlong) {
                        latlong = addressData.latlong;
                    }
                }
            }

            const orderData = {
                userId: user.uid,
                restaurantId: restaurantId || "",
                default_address_id: defaultAddressId || "",
                items: cartArray.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.imageUrl || item.images?.[0] || "",
                    restaurantId: item.restaurantId || restaurantId || "",
                    restaurant: restaurantName
                })),
                deliveryFee: shippingFee,
                discount: discount,
                discountPercent: discountApplied ? 0 : 0,
                total: finalTotal,
                paymentMethod: paymentMethod,
                isPaid: paymentMethod !== 'COD',
                pickup_latlong: pickupLatlong,
                package_weight_kg: 0.2,
                promotionCode: "",
                address: {
                    address: address,
                    name: receiverName,
                    phone: phoneNumber,
                    latlong: latlong,
                    note: "",
                    user_id: user.uid,
                    id: defaultAddressId || "",
                    createdAt: selectedAddressCreatedAt || ""
                },
                status: 'pending',
                createdAt: serverTimestamp(),
                estimatedDelivery: serverTimestamp(),
            };

            const ordersRef = collection(db, 'orders');
            await addDoc(ordersRef, orderData);

            dispatch(clearCart());

            toast.success('Order placed successfully!');

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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black mb-12">Your cart item</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Cart Items */}
                    <div className="flex-1 space-y-7">
                        {cartArray.map((item, index) => (
                            <CartItemCard
                                key={index}
                                item={item}
                                onDelete={handleDeleteItemFromCart}
                                currency={currency}
                            />
                        ))}
                    </div>

                    {/* Right Side - Promo & Order Summary */}
                    <div className="w-full lg:w-[605px] space-y-8">
                        <PromoCard
                            promoCode={promoCode}
                            setPromoCode={setPromoCode}
                            onApply={handleApplyPromoCode}
                        />

                        <DeliveryInfoCard
                            address={address}
                            setAddress={setAddress}
                            receiverName={receiverName}
                            setReceiverName={setReceiverName}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            onMapClick={() => setIsAddressModalOpen(true)}
                        />

                        <OrderSummaryCard
                            totalPrice={totalPrice}
                            shippingFee={shippingFee}
                            discount={discount}
                            discountApplied={discountApplied}
                            finalTotal={finalTotal}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            onPlaceOrder={handlePlaceOrder}
                            isLoading={placingOrder}
                            currency={currency}
                        />
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
