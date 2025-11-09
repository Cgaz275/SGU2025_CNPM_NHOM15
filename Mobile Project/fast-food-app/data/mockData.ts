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

export const restaurants = [
  {
    id: 'r1',
    name: 'Phở Thìn',
    image: require('@/assets/images/phothin.png'),
    distance: '0.8 km',
    rating: 4.8,
    categories: ['c1'],
    address: '1 Hẻm 197 Trần Bình Trọng, Phường 3, Quận 5, Hồ Chí Minh',
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
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Vừa', price: 5000 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Trứng chần', price: 5000 },
              { name: 'Thịt thêm', price: 15000 },
              { name: 'Bò viên', price: 7000 },
            ],
          },
          {
            name: 'Gia vị',
            type: 'text',
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
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Vừa', price: 5000 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Thịt thêm', price: 15000 },
              { name: 'Gân bò', price: 8000 },
              { name: 'Hành phi', price: 3000 },
            ],
          },
          {
            name: 'Gia vị',
            type: 'text',
            placeholder: 'Ví dụ: ít nước, thêm sa tế...',
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
    address: '25 Hẻm 120 Trần Bình Trọng, Phường 2, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd3',
        name: 'Cơm tấm sườn bì chả',
        image: require('@/assets/images/comtam.jpg'),
        price: 55000,
        categoryId: 'c2',
        description: 'Cơm tấm với sườn nướng, bì và chả trứng thơm ngon.',
        optionGroups: [
          {
            name: 'Loại cơm',
            type: 'single',
            choices: [
              { name: 'Ít mỡ', price: 0 },
              { name: 'Bình thường', price: 0 },
              { name: 'Thêm mỡ hành', price: 3000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Thêm trứng ốp la', price: 8000 },
              { name: 'Thêm sườn', price: 20000 },
              { name: 'Thêm chả', price: 7000 },
            ],
          },
          {
            name: 'Ghi chú',
            type: 'text',
            placeholder: 'Ví dụ: nhiều nước mắm, ít đồ chua...',
          },
        ],
      },
      {
        id: 'd4',
        name: 'Cơm tấm trứng ốp la',
        image: require('@/assets/images/comtam2.webp'),
        price: 45000,
        categoryId: 'c2',
        description: 'Cơm tấm đơn giản nhưng đầy đủ năng lượng cho bữa trưa.',
        optionGroups: [
          {
            name: 'Trứng',
            type: 'single',
            choices: [
              { name: 'Lòng đào', price: 2000 },
              { name: 'Chín kỹ', price: 0 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Thêm chả', price: 7000 },
              { name: 'Thêm bì', price: 5000 },
            ],
          },
          {
            name: 'Ghi chú',
            type: 'text',
            placeholder: 'Ví dụ: thêm đồ chua, ít mỡ...',
          },
        ],
      },
    ],
  },

  {
    id: 'r4',
    name: 'Bún Chả Hương Liên',
    image: require('@/assets/images/bunchahuonglien.webp'),
    distance: '2.5 km',
    rating: 4.6,
    categories: ['c1', 'c3'],
    address: '25 Phan Văn Trị, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd5',
        name: 'Bún chả Hà Nội',
        image: require('@/assets/images/buncha.jpg'),
        price: 50000,
        categoryId: 'c1',
        description: 'Thịt nướng đậm vị, bún tươi, nước chấm chuẩn vị Bắc.',
        optionGroups: [
          {
            name: 'Phần thịt',
            type: 'single',
            choices: [
              { name: 'Thịt nạc', price: 0 },
              { name: 'Thịt ba chỉ', price: 5000 },
              { name: 'Thêm thịt', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Thêm chả', price: 7000 },
              { name: 'Thêm bún', price: 5000 },
              { name: 'Thêm rau sống', price: 3000 },
            ],
          },
          {
            name: 'Ghi chú',
            type: 'text',
            placeholder: 'Ví dụ: ít tỏi, thêm ớt...',
          },
        ],
      },

      {
        id: 'd6',
        name: 'Nem cua bể',
        image: require('@/assets/images/buncha2.webp'),
        price: 40000,
        categoryId: 'c3',
        description:
          'Nem cua bể giòn rụm, nhân cua tươi ngon đặc trưng miền Bắc.',
        optionGroups: [
          {
            name: 'Phần ăn',
            type: 'single',
            choices: [
              { name: '1 cái', price: 0 },
              { name: '2 cái', price: 35000 },
              { name: '3 cái', price: 65000 },
            ],
          },
          {
            name: 'Nước chấm',
            type: 'single',
            choices: [
              { name: 'Ít', price: 0 },
              { name: 'Vừa', price: 0 },
              { name: 'Nhiều', price: 2000 },
            ],
          },
          {
            name: 'Ghi chú',
            type: 'text',
            placeholder: 'Ví dụ: thêm rau sống, nhiều tỏi...',
          },
        ],
      },
    ],
  },

  {
    id: 'r11',
    name: 'Mì Quảng Bà Mua',
    image: require('@/assets/images/miquangbamua.jpeg'),
    distance: '3.2 km',
    rating: 4.5,
    categories: ['c4'],
    address: '119/44 Nguyễn Văn Cừ, Phường 2, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd7',
        name: 'Mì Quảng gà',
        image: require('@/assets/images/pho.webp'),
        price: 55000,
        categoryId: 'c4',
        description: 'Mì Quảng truyền thống với gà ta dai mềm.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Trứng', price: 5000 },
              { name: 'Thịt thêm', price: 15000 },
            ],
          },
          { name: 'Ghi chú', type: 'text', placeholder: 'Ví dụ: thêm ớt...' },
        ],
      },
      {
        id: 'd8',
        name: 'Mì Quảng tôm',
        image: require('@/assets/images/pho.webp'),
        price: 60000,
        categoryId: 'c4',
        description: 'Mì Quảng tôm tươi, nước lèo thơm ngon.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Trứng', price: 5000 },
              { name: 'Tôm thêm', price: 20000 },
            ],
          },
          { name: 'Ghi chú', type: 'text', placeholder: 'Ví dụ: ít rau...' },
        ],
      },
    ],
  },

  {
    id: 'r5',
    name: 'Hải Sản Ông Già',
    image: require('@/assets/images/haisanonggia.jpg'),
    distance: '5.0 km',
    rating: 4.7,
    categories: ['c5'],
    address: '8 Hẻm 111 Trần Bình Trọng, Phường 2, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd9',
        name: 'Tôm hấp bia',
        image: require('@/assets/images/pho.webp'),
        price: 120000,
        categoryId: 'c5',
        description: 'Tôm tươi hấp cùng bia, giữ nguyên vị ngọt.',
        optionGroups: [
          {
            name: 'Số lượng',
            type: 'single',
            choices: [
              { name: '5 con', price: 0 },
              { name: '10 con', price: 110000 },
            ],
          },
          {
            name: 'Gia vị',
            type: 'text',
            placeholder: 'Ví dụ: nhiều tiêu, ít muối...',
          },
        ],
      },
      {
        id: 'd10',
        name: 'Sò điệp nướng mỡ hành',
        image: require('@/assets/images/pho.webp'),
        price: 90000,
        categoryId: 'c5',
        description: 'Sò điệp tươi nướng mỡ hành thơm lừng.',
        optionGroups: [
          {
            name: 'Số lượng',
            type: 'single',
            choices: [
              { name: '5 con', price: 0 },
              { name: '10 con', price: 85000 },
            ],
          },
          { name: 'Ghi chú', type: 'text', placeholder: 'Ví dụ: thêm ớt...' },
        ],
      },
    ],
  },

  {
    id: 'r6',
    name: 'Snack & Fastfood',
    image: require('@/assets/images/snack.png'),
    distance: '1.8 km',
    rating: 4.3,
    categories: ['c6', 'c10'],
    address: 'Hẻm 85 Trần Bình Trọng, Phường 1, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd11',
        name: 'Khoai tây chiên',
        image: require('@/assets/images/pho.webp'),
        price: 30000,
        categoryId: 'c6',
        description: 'Khoai tây chiên giòn rụm.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Sốt',
            type: 'multiple',
            choices: [
              { name: 'Mayonnaise', price: 5000 },
              { name: 'Ketchup', price: 0 },
            ],
          },
        ],
      },
      {
        id: 'd12',
        name: 'Gà rán',
        image: require('@/assets/images/pho.webp'),
        price: 70000,
        categoryId: 'c10',
        description: 'Gà rán giòn, thịt mềm.',
        optionGroups: [
          {
            name: 'Sốt',
            type: 'single',
            choices: [
              { name: 'Cay', price: 0 },
              { name: 'Ngọt', price: 0 },
            ],
          },
          { name: 'Ghi chú', type: 'text', placeholder: 'Ví dụ: thêm tiêu...' },
        ],
      },
    ],
  },

  {
    id: 'r7',
    name: 'Kem & Tráng miệng',
    image: require('@/assets/images/kem.jpg'),
    distance: '2.1 km',
    rating: 4.6,
    categories: ['c7'],
    address: '131 Trần Bình Trọng, Phường 2, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd13',
        name: 'Kem dừa',
        image: require('@/assets/images/pho.webp'),
        price: 45000,
        categoryId: 'c7',
        description: 'Kem dừa thơm mát, vị ngọt dịu.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Ly nhỏ', price: 0 },
              { name: 'Ly lớn', price: 10000 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Trái cây', price: 5000 },
              { name: 'Sô cô la', price: 7000 },
            ],
          },
        ],
      },
      {
        id: 'd14',
        name: 'Chè thập cẩm',
        image: require('@/assets/images/pho.webp'),
        price: 40000,
        categoryId: 'c7',
        description: 'Chè nhiều loại topping, thơm ngon.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Lớn', price: 10000 },
            ],
          },
          {
            name: 'Ghi chú',
            type: 'text',
            placeholder: 'Ví dụ: ít đá, nhiều đường...',
          },
        ],
      },
    ],
  },

  {
    id: 'r8',
    name: 'Trà sữa Royal',
    image: require('@/assets/images/royal.webp'),
    distance: '1.5 km',
    rating: 4.4,
    categories: ['c8'],
    address: '289 An Dương Vương, Phường 3, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd15',
        name: 'Trà sữa trân châu',
        image: require('@/assets/images/pho.webp'),
        price: 40000,
        categoryId: 'c8',
        description: 'Trà sữa ngọt vừa, trân châu dai mềm.',
        optionGroups: [
          {
            name: 'Size',
            type: 'single',
            choices: [
              { name: 'Nhỏ', price: 0 },
              { name: 'Lớn', price: 5000 },
            ],
          },
          {
            name: 'Đường',
            type: 'single',
            choices: [
              { name: 'Ít', price: 0 },
              { name: 'Vừa', price: 0 },
              { name: 'Ngọt', price: 5000 },
            ],
          },
          {
            name: 'Đá',
            type: 'single',
            choices: [
              { name: 'Ít', price: 0 },
              { name: 'Vừa', price: 0 },
              { name: 'Đá nhiều', price: 0 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'r9',
    name: 'Salad House',
    image: require('@/assets/images/salad.png'),
    distance: '2.0 km',
    rating: 4.5,
    categories: ['c9'],
    address: '303 An Dương Vương, Phường 3, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd16',
        name: 'Salad gà nướng',
        image: require('@/assets/images/pho.webp'),
        price: 60000,
        categoryId: 'c9',
        description: 'Salad nhiều rau, gà nướng thơm.',
        optionGroups: [
          {
            name: 'Dressing',
            type: 'single',
            choices: [
              { name: 'Mayonnaise', price: 0 },
              { name: 'Chanh', price: 0 },
            ],
          },
          {
            name: 'Topping',
            type: 'multiple',
            choices: [
              { name: 'Bơ', price: 10000 },
              { name: 'Hạt óc chó', price: 15000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'r10',
    name: 'Bánh Mì Huỳnh Hoa',
    image: require('@/assets/images/bbhh.png'),
    distance: '1.0 km',
    rating: 4.8,
    categories: ['c3', 'c10'],
    address: '34A Trần Bình Trọng, Phường 4, Quận 5, Hồ Chí Minh',
    dishes: [
      {
        id: 'd17',
        name: 'Bánh mì đặc biệt',
        image: require('@/assets/images/pho.webp'),
        price: 40000,
        categoryId: 'c3',
        description: 'Bánh mì thịt, pate, trứng, rau thơm.',
        optionGroups: [
          {
            name: 'Thêm',
            type: 'multiple',
            choices: [
              { name: 'Ớt', price: 2000 },
              { name: 'Ngò', price: 0 },
            ],
          },
          { name: 'Ghi chú', type: 'text', placeholder: 'Ví dụ: ít pate...' },
        ],
      },
    ],
  },
];
