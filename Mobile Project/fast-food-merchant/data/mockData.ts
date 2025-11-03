export const categories = [
  { id: 'c1', name: 'Món nước', image: require('@/assets/images/pho.webp') },
  { id: 'c2', name: 'Cơm', image: require('@/assets/images/comtam.jpg') },
  { id: 'c3', name: 'Ăn vặt', image: require('@/assets/images/buncha.jpg') },
  { id: 'c4', name: 'Bánh mì', image: require('@/assets/images/banhmi.png') },
  { id: 'c5', name: 'Hải sản', image: require('@/assets/images/haisan.webp') },
  {
    id: 'c6',
    name: 'Tráng miệng',
    image: require('@/assets/images/trangmieng.jpg'),
  },
  { id: 'c7', name: 'Đồ uống', image: require('@/assets/images/douong.webp') },
  { id: 'c8', name: 'Salad', image: require('@/assets/images/salad.webp') },
  { id: 'c9', name: 'Pizza', image: require('@/assets/images/pizza.jpg') },
  {
    id: 'c10',
    name: 'Burger',
    image: require('@/assets/images/hamburger.webp'),
  },
];

export let restaurants = [
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
        available: true,
        customOptions: [
          {
            id: 'opt1',
            name: 'Chọn size',
            type: 'single', // single hoặc multiple
            options: [
              { label: 'Nhỏ', price: 0 },
              { label: 'Vừa', price: 5000 },
              { label: 'Lớn', price: 10000 },
            ],
          },
          {
            id: 'opt2',
            name: 'Topping thêm',
            type: 'multiple',
            options: [
              { label: 'Thêm trứng', price: 5000 },
              { label: 'Thêm bò tái', price: 10000 },
              { label: 'Thêm nước lèo', price: 3000 },
            ],
          },
        ],
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
        available: true,
        customOptions: [
          {
            id: 'opt1',
            name: 'Chọn phần cơm',
            type: 'single',
            options: [
              { label: 'Ít cơm', price: 0 },
              { label: 'Vừa', price: 0 },
              { label: 'Nhiều cơm', price: 5000 },
            ],
          },
          {
            id: 'opt2',
            name: 'Món kèm thêm',
            type: 'multiple',
            options: [
              { label: 'Trứng ốp la', price: 7000 },
              { label: 'Chả trứng thêm', price: 5000 },
              { label: 'Thêm bì', price: 4000 },
            ],
          },
        ],
      },
    ],
  },
];
