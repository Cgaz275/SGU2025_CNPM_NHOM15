import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import productReducer from "./features/product/productSlice";
import addressReducer from "./features/address/addressSlice";
import ratingReducer from "./features/rating/ratingSlice";
import authReducer from "./features/auth/authSlice";
import adminAuthReducer from "./features/auth/adminAuthSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
      product: productReducer,
      address: addressReducer,
      rating: ratingReducer,
      auth: authReducer,
      adminAuth: adminAuthReducer,
    },
  });
}
