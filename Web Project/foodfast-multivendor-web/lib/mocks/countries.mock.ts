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
          { _id: "1", name: "Vietnam", flag: "/assets/images/png/vietnam_logo_flag.png" },
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
            { id: "hcm", name: "Ho Chi Minh City", latitude: 0, longitude: 0 },
            { id: "hn", name: "Hanoi", latitude: 0, longitude: 0 },
          ],
        },
      },
    },
  },
];
