// src/data/address.ts

export type Address = {
  id: string;
  name: string; // tên người nhận
  phone: string;
  address: string;
  building?: string;
  gate?: string;
  tag: string; // loại địa chỉ: "Nhà riêng", "Văn phòng"...
  note?: string;
  isDefault?: boolean;
};

// Mock dữ liệu mẫu
export let addresses: Address[] = [
  {
    id: 'a1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Láng, Hà Nội',
    tag: 'Nhà riêng',
    isDefault: true,
  },
  {
    id: 'a2',
    name: 'Trần Thị B',
    phone: '0912345678',
    address: '456 Phố Huế, Hà Nội',
    tag: 'Văn phòng',
    isDefault: false,
  },
];

// 🧩 Lấy toàn bộ địa chỉ
export const getAddresses = () => addresses;

// ➕ Thêm địa chỉ mới
export const addAddress = (newAddress: Omit<Address, 'id'>) => {
  const id = 'a' + (addresses.length + 1);
  const address = { id, ...newAddress };

  // Nếu newAddress là mặc định, reset mấy cái khác
  if (newAddress.isDefault) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
  }

  addresses.push(address);
  return address;
};

// 🗑 Xóa địa chỉ
export const removeAddress = (id: string) => {
  addresses = addresses.filter((a) => a.id !== id);
};

// ⭐ Đặt địa chỉ mặc định
export const setDefaultAddress = (id: string) => {
  addresses = addresses.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }));
};

// 🔍 Lấy địa chỉ mặc định
export const getDefaultAddress = () => addresses.find((a) => a.isDefault);
