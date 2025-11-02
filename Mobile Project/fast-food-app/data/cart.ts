export type CartItem = {
  id: string;
  restaurantId: string; // 🏠 Nhà hàng
  name: string;
  price: number;
  quantity: number;
  image: any;
  options?: Record<string, any>; // 🧩 Tùy chọn (size, topping, ghi chú...)
};

let cart: CartItem[] = [];

export const getCart = () => cart;

// 🧩 Thêm vào giỏ (nếu khác nhà hàng thì clear)
export const addToCart = (item: CartItem) => {
  if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
    console.log('⚠️ Khác nhà hàng, xoá giỏ cũ.');
    cart = [];
  }

  const existing = cart.find(
    (x) =>
      x.id === item.id &&
      x.restaurantId === item.restaurantId &&
      JSON.stringify(x.options || {}) === JSON.stringify(item.options || {})
  );

  if (existing) {
    existing.quantity += item.quantity;
    console.log(`🔁 Cộng thêm số lượng cho món: ${item.name}`);
  } else {
    cart.push(item);
    console.log(`🆕 Thêm món mới: ${item.name}`);
  }

  console.log('📦 Giỏ hàng hiện tại:', JSON.stringify(cart, null, 2));
};

// ⚙️ Cập nhật số lượng
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
    console.log(`⚙️ Cập nhật số lượng món ${item.name}: ${item.quantity}`);
  } else {
    console.log('❌ Không tìm thấy món để cập nhật.');
  }

  console.log('📦 Giỏ hàng hiện tại:', JSON.stringify(cart, null, 2));
};

// ❌ Xoá món cụ thể
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
  console.log(`🗑️ Đã xoá món có id=${id}`);
  console.log('📦 Giỏ hàng hiện tại:', JSON.stringify(cart, null, 2));
};

// 🧹 Xoá toàn bộ giỏ
export const clearCart = () => {
  cart = [];
  console.log('🧹 Đã xoá toàn bộ giỏ hàng.');
};
