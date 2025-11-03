import { MockedResponse } from "@apollo/client/testing";
import { countriesMock } from "../countries.mock";
import { NEAR_BY_RESTAURANTS_PREVIEW } from "@/lib/api/graphql/queries/restaurants";
import { fakeRestaurant } from "./generators";

export const mocks: MockedResponse[] = [
  ...countriesMock,
  {
    request: {
      query: NEAR_BY_RESTAURANTS_PREVIEW,
      variables: {
        latitude: 0,
        longitude: 0,
        page: 1,
        limit: 100,
        shopType: "restaurant",
      },
    },
    result: {
      data: {
        nearByRestaurantsPreview: {
          restaurants: [fakeRestaurant(), fakeRestaurant(), fakeRestaurant()],
        },
      },
    },
  },
];
