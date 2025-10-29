// lib/mocks/countries.mock.ts
import { GET_COUNTRIES, GET_CITIES } from "@/lib/api/graphql/queries/Countries";

export const countriesMock = [
  {
    request: {
      query: GET_COUNTRIES,
    },
    result: {
      data: {
        getCountries: [
          { _id: "1", name: "Vietnam", flag: "🇻🇳" },
          { _id: "2", name: "Japan", flag: "🇯🇵" },
        ],
      },
    },
  },
  {
    request: {
      query: GET_CITIES,
      variables: { id: "1" },
    },
    result: {
      data: {
        getCitiesByCountry: {
          id: "1",
          name: "Vietnam",
          cities: [
            { id: "hcm", name: "Ho Chi Minh City", latitude: 10.8231, longitude: 106.6297 },
            { id: "hn", name: "Hanoi", latitude: 21.0278, longitude: 105.8342 },
          ],
        },
      },
    },
  },
];
