// lib/mocks/graphql/generators.ts
import { faker } from "@faker-js/faker";
import {
  IRestaurant,
  ICategory,
  IFood,
  IVariation,
  IAddon,
  IZone,
  IOpeningTime,
  ITimeSlot,
  IReview,
} from "../../utils/interfaces/restaurants.interface";

// Faker helper
export function fakeString(field?: string) {
  switch (field) {
    case "_id":
      return faker.string.uuid();
    case "name":
      return faker.person.fullName();
    case "title":
      return faker.commerce.productName();
    case "description":
      return faker.lorem.sentence();
    case "slug":
      return faker.helpers.slugify(faker.commerce.productName());
    case "image":
    case "logo":
      return faker.image.url();
    case "phone":
      return faker.phone.number();
    default:
      return faker.word.words(2);
  }
}

export function fakeNumber(field?: string) {
  switch (field) {
    case "deliveryTime":
    case "minimumOrder":
    case "price":
    case "tax":
      return faker.number.int({ min: 1, max: 100 });
    case "rating":
    case "reviewAverage":
      return parseFloat(
        faker.number.float({ min: 0, max: 5, fractionDigits: 1 }).toFixed(1)
      );
    default:
      return faker.number.int({ min: 1, max: 100 });
  }
}

export function fakeBoolean() {
  return faker.datatype.boolean();
}

export function fakeCoordinates(): [number, number] {
  return [faker.location.longitude(), faker.location.latitude()];
}

export function fakeTimeSlot(): ITimeSlot {
  return {
    startTime: [`${faker.number.int({ min: 0, max: 23 })}:00`],
    endTime: [`${faker.number.int({ min: 0, max: 23 })}:59`],
  };
}

export function fakeOpeningTime(): IOpeningTime {
  return {
    day: faker.date.weekday(),
    times: [fakeTimeSlot(), fakeTimeSlot()],
  };
}

export function fakeAddon(): IAddon {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    quantityMinimum: 1,
    quantityMaximum: 5,
    options: [
      {
        _id: faker.string.uuid(),
        title: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: fakeNumber("price"),
      },
    ],
  };
}

export function fakeVariation(): IVariation {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.productName(),
    price: fakeNumber("price"),
    discounted: fakeBoolean(),
    addons: [fakeAddon()._id!], // chỉ lấy id để tương thích interface
    isOutOfStock: fakeBoolean(),
  };
}

export function fakeFood(): IFood {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.productName(),
    image: faker.image.url(),
    description: faker.lorem.sentence(),
    subCategory: faker.commerce.department(),
    restaurant: faker.string.uuid(),
    variations: [fakeVariation(), fakeVariation()],
    isOutOfStock: fakeBoolean(),
  };
}

export function fakeCategory(): ICategory {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.department(),
    foods: [fakeFood(), fakeFood()],
  };
}

export function fakeZone(): IZone {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.department(),
    tax: fakeNumber("tax"),
  };
}

export function fakeReview(): IReview {
  return {
    _id: faker.string.uuid(),
    rating: fakeNumber("rating"),
    description: faker.lorem.sentence(),
    createdAt: faker.date.past().toISOString(),
    order: {
      _id: faker.string.uuid(),
      user: {
        _id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    },
  };
}

export function fakeReviewData() {
  const reviews = [fakeReview(), fakeReview(), fakeReview()];
  const totalRatings = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  return {
    total: reviews.length,
    ratings: totalRatings / reviews.length,
    reviews,
  };
}

export function fakeRestaurant(): IRestaurant {
  return {
    _id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.url(),
    logo: faker.image.url(),
    address: faker.location.streetAddress(),
    deliveryTime: fakeNumber("deliveryTime"),
    minimumOrder: fakeNumber("minimumOrder"),
    rating: fakeNumber("rating"),
    isActive: fakeBoolean(),
    isAvailable: fakeBoolean(),
    commissionRate: fakeNumber(),
    tax: fakeNumber("tax"),
    shopType: faker.commerce.department(),
    cuisines: [faker.commerce.department(), faker.commerce.department()],
    reviewCount: 3,
    reviewAverage: fakeNumber("reviewAverage"),
    location: { coordinates: fakeCoordinates() },
    orderId: faker.string.uuid(),
    orderPrefix: faker.helpers.slugify(faker.commerce.productName()),
    slug: faker.helpers.slugify(faker.commerce.productName()),
    reviewData: fakeReviewData(),
    categories: [fakeCategory(), fakeCategory()],
    options: [],
    addons: [fakeAddon()],
    zone: fakeZone(),
    openingTimes: [fakeOpeningTime(), fakeOpeningTime()],
    deliveryInfo: {
      deliveryFee: fakeNumber("price"),
      deliveryTime: fakeNumber("deliveryTime"),
      minimumOrder: fakeNumber("minimumOrder"),
    },
  };
}
