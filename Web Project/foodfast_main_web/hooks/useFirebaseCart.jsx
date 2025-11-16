import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/FirebaseConfig';
import { clearCart, restoreCart } from '../lib/features/cart/cartSlice';

const useFirebaseCart = () => {
  const cartState = useSelector(state => state.cart);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const syncTimeoutRef = useRef(null);

  // Sync cart to Firebase whenever cart state changes
  useEffect(() => {
    if (!user?.uid) return;

    // Clear existing timeout to avoid multiple syncs
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync operation by 1 second to avoid excessive Firebase writes
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const userCartRef = doc(db, 'user', user.uid, 'cart', 'items');
        
        // Save the current cart state to Firebase
        await setDoc(userCartRef, {
          cartItems: cartState.cartItems,
          total: cartState.total,
          lastUpdated: new Date().toISOString(),
        }, { merge: true });
      } catch (error) {
        console.error('Error syncing cart to Firebase:', error);
      }
    }, 1000);

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
          const { cartItems, total } = cartSnapshot.data();
          dispatch(restoreCart({ cartItems, total }));
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
