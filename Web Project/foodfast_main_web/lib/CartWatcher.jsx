"use client";

import useFirebaseCart from "@/hooks/useFirebaseCart";

export default function CartWatcher() {
  // This hook handles all cart synchronization with Firebase
  useFirebaseCart();

  return null;
}
