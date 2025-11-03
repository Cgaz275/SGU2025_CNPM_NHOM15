import { gql } from "@apollo/client";
import { MockedResponse } from "@apollo/client/testing";
import {
  RELATED_ITEMS,
  RECENT_ORDER_RESTAURANTS,
  MOST_ORDER_RESTAURANTS,
  NEAR_BY_RESTAURANTS_PREVIEW,
  GET_RESTAURANT_BY_ID_SLUG,
  GET_REVIEWS_BY_RESTAURANT,
  GET_CATEGORIES_SUB_CATEGORIES_LIST,
  GET_POPULAR_SUB_CATEGORIES_LIST,
  GET_SUB_CATEGORIES,
  RESTAURANTS_FRAGMENT,
} from "@/lib/api/graphql/queries/restaurants";

gql`${RESTAURANTS_FRAGMENT}`;


export interface IRestaurantLocation {
  coordinates: [number, number];
}




// === 🇻🇳 DỮ LIỆU GIẢ (MOCK DATA) ===
const hoChiMinhRestaurants = [
  {
    _id: "r001",
    name: "Pizza Town HCM",
    image: "/assets/images/restaurants/pizza-town-hcm.jpg",
    logo: "/assets/images/restaurants/pizza-town-logo.png",
    address: "123 Le Loi, District 1, Ho Chi Minh City",
    deliveryTime: 25,
    minimumOrder: 50000,
    rating: 4.5,
    isActive: true,
    isAvailable: true,
    reviewAverage: 4.5,
    cuisines: ["Italian", "Fast Food"],
    location: { coordinates: [0, 0] } as IRestaurantLocation,
    shopType: "restaurant", // ✅ thêm dòng này
    slug: "saigon-pizza-town", // ✅ thêm dòng này
  },
  {
    _id: "r002",
    name: "Saigon Coffee Hub",
    image: "/assets/images/restaurants/saigon-coffee.jpg",
    logo: "/assets/images/restaurants/saigon-coffee-logo.png",
    address: "45 Nguyen Hue, District 1, Ho Chi Minh City",
    deliveryTime: 15,
    minimumOrder: 30000,
    rating: 4.8,
    isActive: true,
    isAvailable: true,
    reviewAverage: 4.8,
    cuisines: ["Vietnamese", "Cafe"],
    location: { coordinates: [0, 0] } as IRestaurantLocation,
    shopType: "restaurant", // ✅ thêm dòng này
    slug: "saigon-coffe-hub", // ✅ thêm dòng này
  },
];

const hanoiRestaurants = [
  {
    _id: "r003",
    name: "Hanoi Pho Corner",
    image: "/assets/images/restaurants/hanoi-pho.jpg",
    logo: "/assets/images/restaurants/hanoi-pho-logo.png",
    address: "25 Tran Hung Dao, Hoan Kiem, Hanoi",
    deliveryTime: 20,
    minimumOrder: 40000,
    rating: 4.6,
    isActive: true,
    isAvailable: true,
    reviewAverage: 4.6,
    cuisines: ["Vietnamese", "Traditional"],
    location: { coordinates: [0, 0] } as IRestaurantLocation,
    shopType: "restaurant", // ✅ thêm dòng này
    slug: "hanoi-pho-corner", // ✅ thêm dòng này
  },
  {
    _id: "r004",
    name: "Capital Tea House",
    image: "/assets/images/restaurants/hanoi-tea.jpg",
    logo: "/assets/images/restaurants/hanoi-tea-logo.png",
    address: "88 Ly Thuong Kiet, Hoan Kiem, Hanoi",
    deliveryTime: 10,
    minimumOrder: 20000,
    rating: 4.3,
    isActive: true,
    isAvailable: true,
    reviewAverage: 4.3,
    cuisines: ["Tea", "Snacks"],
    location: { coordinates: [0, 0] } as IRestaurantLocation,
    shopType: "restaurant", // ✅ thêm dòng này
    slug: "hanoi-tea-house", // ✅ thêm dòng này
  },
];

// === 🧩 MOCK CHO APOLLO CLIENT ===
export const restaurantMocks: MockedResponse[] = [
  // 🔹 RELATED_ITEMS
  {
    request: { query: RELATED_ITEMS, variables: { itemId: "food001", restaurantId: "r001" } },
    result: { data: { relatedItems: ["food002", "food003", "food004"] } },
  },

  // 🔹 RECENT_ORDER_RESTAURANTS
  {
    request: { query: RECENT_ORDER_RESTAURANTS, variables: { latitude: 0, longitude: 0 } },
    result: { data: { recentOrderRestaurantsPreview: hoChiMinhRestaurants } },
  },

  // 🔹 MOST_ORDER_RESTAURANTS
  {
    request: {
      query: MOST_ORDER_RESTAURANTS,
      variables: { latitude: 0, longitude: 0, page: 1, limit: 100, shopType: "restaurant" },
    },
    result: { data: { mostOrderedRestaurantsPreview: hoChiMinhRestaurants } },
  },

  // 🔹 NEAR_BY_RESTAURANTS_PREVIEW 
  {
    request: {  
      query: NEAR_BY_RESTAURANTS_PREVIEW,
      variables: { latitude: 0, longitude: 0, page: 1, limit: 100, shopType: "restaurant" },
    },
    result: {
      data: {
        nearByRestaurantsPreview: {
          restaurants: [...hanoiRestaurants, ...hoChiMinhRestaurants],
        },
      },
    },
  },

  // 🔹 GET_RESTAURANT_BY_ID_SLUG
  {
    request: { query: GET_RESTAURANT_BY_ID_SLUG, variables: { id: "r001", slug: "pizza-town-hcm" } },
    result: {
      data: {
        restaurant: {
          ...hoChiMinhRestaurants[0],
          orderPrefix: "PZ",
          phone: "+84987654321",
          username: "pizzatown_owner",
          commissionRate: 10,
          tax: 10,
        },
      },
    },
  },

  // 🔹 GET_REVIEWS_BY_RESTAURANT
  {
    request: { query: GET_REVIEWS_BY_RESTAURANT, variables: { restaurant: "r003" } },
    result: {
      data: {
        reviewsByRestaurant: {
          total: 2,
          ratings: [5, 4],
          reviews: [
            {
              _id: "rv002",
              rating: 5,
              description: "Phở cực kỳ ngon, nước trong và đậm đà!",
              createdAt: "2025-02-10",
              order: { user: { _id: "u002", name: "Tran Thi B", email: "tranb@example.com" } },
              restaurant: { _id: "r003", name: "Hanoi Pho Corner" },
            },
          ],
        },
      },
    },
  },

  // 🔹 GET_CATEGORIES_SUB_CATEGORIES_LIST
  {
    request: { query: GET_CATEGORIES_SUB_CATEGORIES_LIST, variables: { storeId: "r001" } },
    result: {
      data: {
        fetchCategoryDetailsByStoreId: [
          {
            id: "cat01",
            label: "Pizza",
            url: "/pizza",
            items: [
              { id: "sub01", label: "Pepperoni", url: "/pizza/pepperoni" },
              { id: "sub02", label: "Hawaiian", url: "/pizza/hawaiian" },
            ],
          },
        ],
      },
    },
  },

  // 🔹 GET_POPULAR_SUB_CATEGORIES_LIST
  {
    request: { query: GET_POPULAR_SUB_CATEGORIES_LIST, variables: { restaurantId: "r003" } },
    result: {
      data: { popularItems: [{ id: "foodPho01", count: 230 }, { id: "foodPho02", count: 180 }] },
    },
  },

  // 🔹 GET_SUB_CATEGORIES
  {
    request: { query: GET_SUB_CATEGORIES },
    result: {
      data: {
        subCategories: [
          { _id: "sub01", title: "Classic", parentCategoryId: "cat01" },
          { _id: "sub02", title: "Spicy", parentCategoryId: "cat01" },
        ],
      },
    },
  },
];

export default restaurantMocks;
