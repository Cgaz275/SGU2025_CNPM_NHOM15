export const categories = [
  {
    id: 'c1',
    name: 'Món nước',
    image: require('@/assets/images/pho.webp'),
  },
  {
    id: 'c2',
    name: 'Cơm',
    image: require('@/assets/images/comtam.jpg'),
  },
  {
    id: 'c3',
    name: 'Ăn vặt',
    image: require('@/assets/images/buncha.jpg'),
  },
];

export const restaurants = [
  {
    id: 'r1',
    name: 'Phở Thìn',
    image: require('@/assets/images/phothin.png'),
    distance: '0.8 km',
    rating: 4.8,
    categories: ['c1'],
    dishes: [
      {
        id: 'd1',
        name: 'Phở bò tái',
        image: require('@/assets/images/pho.webp'),
        price: 45000,
        categoryId: 'c1',
        description:
          'Phở bò tái nước dùng đậm đà, hương vị truyền thống Hà Nội.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single', // chỉ được chọn 1
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Vừa', price: 5000 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple', // chọn nhiều
            choices: [
              { name: 'Trứng chần', price: 5000 },
              { name: 'Thịt thêm', price: 15000 },
              { name: 'Bò viên', price: 7000 },
            ],
          },
          {
            name: 'Gia vị',
            type: 'text', // cho phép nhập ghi chú tự do
            placeholder: 'Ví dụ: ít hành, thêm ớt...',
          },
        ],
      },
      {
        id: 'd2',
        name: 'Phở bò chín nạm gầu',
        image: require('@/assets/images/pho2.jpg'),
        price: 50000,
        categoryId: 'c1',
        description:
          'Phở bò chín nạm gầu thơm ngon, nước dùng thanh và ngọt tự nhiên.',
        options: ['Ít hành', 'Thêm ớt'],
      },
    ],
  },
  {
    id: 'r2',
    name: 'Cơm Tấm Ba Ghiền',
    image: require('@/assets/images/comtambaghien.jpg'),
    distance: '1.2 km',
    rating: 4.7,
    categories: ['c2'],
    dishes: [
      {
        id: 'd3',
        name: 'Cơm tấm sườn bì chả',
        image: require('@/assets/images/comtam.jpg'),
        price: 55000,
        categoryId: 'c2',
        description: 'Cơm tấm với sườn nướng, bì và chả trứng thơm ngon.',
        options: ['Ít mỡ', 'Nhiều nước mắm'],
      },
      {
        id: 'd4',
        name: 'Cơm tấm trứng ốp la',
        image: require('@/assets/images/comtam2.webp'),
        price: 45000,
        categoryId: 'c2',
        description: 'Cơm tấm đơn giản nhưng đầy đủ năng lượng cho bữa trưa.',
        options: ['Trứng lòng đào', 'Thêm đồ chua'],
      },
    ],
  },
  {
    id: 'r3',
    name: 'Bún Chả Hương Liên',
    image: require('@/assets/images/bunchahuonglien.webp'),
    distance: '2.5 km',
    rating: 4.6,
    categories: ['c1', 'c3'],
    dishes: [
      {
        id: 'd5',
        name: 'Bún chả Hà Nội',
        image: require('@/assets/images/buncha.jpg'),
        price: 50000,
        categoryId: 'c1',
        description: 'Thịt nướng đậm vị, bún tươi, nước chấm chuẩn vị Bắc.',
        options: ['Thêm chả', 'Ít tỏi'],
      },
      {
        id: 'd6',
        name: 'Nem cua bể',
        image: require('@/assets/images/buncha2.webp'),
        price: 40000,
        categoryId: 'c3',
        description:
          'Nem cua bể giòn rụm, nhân cua tươi ngon đặc trưng miền Bắc.',
        options: ['Thêm rau sống', 'Thêm nước chấm'],
      },
    ],
  },
];
