// src/data/address.ts
export type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  building?: string;
  gate?: string;
  tag: string;
  note?: string;
  isDefault?: boolean;

  // ➕ thêm mới
  lat?: number;
  lng?: number;
};

// Mock dữ liệu mẫu
export let addresses: Address[] = [
  {
    id: 'a1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: 'THTH Sài Gòn, An Dương Vương, phường 3, Quận 5, Hồ Chí Minh',
    tag: 'Khác',
    isDefault: true,
  },
  {
    id: 'a2',
    name: 'Trần Thị B',
    phone: '0912345678',
    address:
      'Sân bóng chuyền, Đ. An Dương Vương, Phường 3, Quận 5, Hồ Chí Minh',
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

let tempAddress: Partial<Address> | null = null;

export const setTempAddress = (address: Partial<Address>) => {
  tempAddress = {
    ...(tempAddress || {}),
    ...address,
  };
};

// get temp
export const getTempAddress = () => tempAddress;

// clear temp khi cần
export const clearTempAddress = () => {
  tempAddress = null;
};
