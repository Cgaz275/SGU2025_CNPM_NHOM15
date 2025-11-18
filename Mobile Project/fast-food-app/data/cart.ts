// data/cart.ts
export type CartItem = {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
  options?: Record<string, any>;
};

let cart: CartItem[] = [];

export const getCart = () => cart;

export const addToCart = (item: CartItem) => {
  console.log('🟢 Thêm vào cart:', JSON.stringify(item, null, 2));

  // Xoá giỏ cũ nếu khác nhà hàng
  if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
    console.log('⚠️ Khác nhà hàng, xoá giỏ cũ.');
    cart = [];
  }

  // Chuẩn hóa options price về number
  const options = item.options
    ? Object.fromEntries(
        Object.entries(item.options).map(([k, v]) => {
          // Nếu là array → map từng phần tử
          if (Array.isArray(v)) {
            return [
              k,
              v.map((o) => ({
                ...o,
                price: Number(o.price || 0),
              })),
            ];
          }

          // Nếu là object có name → normalize
          if (typeof v === 'object' && v !== null && 'name' in v) {
            return [k, { ...v, price: Number(v.price || 0) }];
          }

          // Còn lại, không đụng vô (text, string, số…)
          return [k, v];
        })
      )
    : undefined;

  const existing = cart.find(
    (x) =>
      x.id === item.id &&
      x.restaurantId === item.restaurantId &&
      JSON.stringify(x.options || {}) === JSON.stringify(options || {})
  );

  if (existing) {
    existing.quantity += item.quantity;
    console.log(`🔁 Cộng thêm số lượng: ${item.name}`);
  } else {
    cart.push({ ...item, options });
    console.log(`🆕 Thêm món mới: ${item.name}`);
  }

  console.log('📦 Giỏ hiện tại:', JSON.stringify(cart, null, 2));
};

export const updateQuantity = (
  id: string,
  restaurantId: string,
  quantity: number,
  options?: Record<string, any>
) => {
  const item = cart.find(
    (x) =>
      x.id === id &&
      x.restaurantId === restaurantId &&
      JSON.stringify(x.options || {}) === JSON.stringify(options || {})
  );
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
};

export const removeFromCart = (
  id: string,
  restaurantId: string,
  options?: Record<string, any>
) => {
  cart = cart.filter(
    (x) =>
      !(
        x.id === id &&
        x.restaurantId === restaurantId &&
        JSON.stringify(x.options || {}) === JSON.stringify(options || {})
      )
  );
};

export const clearCart = () => {
  cart = [];
};
