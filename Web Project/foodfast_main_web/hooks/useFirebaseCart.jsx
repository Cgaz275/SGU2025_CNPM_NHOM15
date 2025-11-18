import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import { clearCart, restoreCart } from '../lib/features/cart/cartSlice';

const useFirebaseCart = () => {
  const cartState = useSelector(state => state.cart);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const syncTimeoutRef = useRef(null);
  const prevCartItemsRef = useRef(null);

  // Sync cart to Firebase whenever cart state changes
  useEffect(() => {
    if (!user?.uid) return;

    const performSync = async () => {
      if (!user?.uid) {
        console.warn('Cannot sync cart: user UID is missing');
        return;
      }

      try {
        const userCartRef = doc(db, 'user', user.uid, 'cart', 'items');

        // Build data object, only including restaurantId if it's defined
        const cartData = {
          cartItems: cartState.cartItems,
          total: cartState.total,
          itemMetadata: cartState.itemMetadata,
          lastUpdated: serverTimestamp(),
        };

        // Only include restaurantId if it's not null/undefined
        if (cartState.restaurantId !== null && cartState.restaurantId !== undefined) {
          cartData.restaurantId = cartState.restaurantId;
        }

        // Save the current cart state to Firebase
        await setDoc(userCartRef, cartData, { merge: true });
        console.log('Cart synced to Firebase successfully', { cartItemCount: Object.keys(cartState.cartItems).length, total: cartState.total });
      } catch (error) {
        console.error('Error syncing cart to Firebase:', error);
        console.error('User UID:', user?.uid);
        console.error('Cart data:', cartState);
      }
    };

    // Determine if items were deleted by comparing previous and current cart items
    const currentItemIds = Object.keys(cartState.cartItems);
    const currentItemCount = currentItemIds.length;
    const prevItemIds = prevCartItemsRef.current ? Object.keys(prevCartItemsRef.current) : [];
    const prevItemCount = prevItemIds.length;

    // Items were deleted if the count decreased
    const itemsWereDeleted = prevItemCount > 0 && currentItemCount < prevItemCount;

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    if (itemsWereDeleted) {
      // Sync deletions immediately without debounce
      performSync();
    } else {
      // Debounce additions/quantity changes by 500ms
      syncTimeoutRef.current = setTimeout(performSync, 500);
    }

    prevCartItemsRef.current = cartState.cartItems;

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cartState, user?.uid]);

  // Load cart from Firebase when user logs in
  useEffect(() => {
    if (!user?.uid) {
      // Don't clear cart - allow local cart to persist even when not logged in
      return;
    }

    const loadCartFromFirebase = async () => {
      try {
        const userCartRef = doc(db, 'user', user.uid, 'cart', 'items');
        const cartSnapshot = await getDoc(userCartRef);

        if (cartSnapshot.exists()) {
          const { cartItems, total, restaurantId, itemMetadata } = cartSnapshot.data();
          dispatch(restoreCart({ cartItems, total, restaurantId, itemMetadata }));
        }
      } catch (error) {
        console.error('Error loading cart from Firebase:', error);
      }
    };

    loadCartFromFirebase();
  }, [user?.uid, dispatch]);

  return { cartState, user };
};

export default useFirebaseCart;
