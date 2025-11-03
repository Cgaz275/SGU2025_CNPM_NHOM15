  // Queries
  import { NEAR_BY_RESTAURANTS_PREVIEW } from "@/lib/api/graphql/queries/restaurants";
  // UseQuery
  import { useQuery } from "@apollo/client";
  // interface
  import {
    INearByRestaurantsPreviewData,
    IRestaurant,
  } from "../utils/interfaces/restaurants.interface";
  // context
  // import { useUserAddress } from "../context/address/address.context";

  const useNearByRestaurantsPreview = (
    enabled = true,
    page = 1,
    limit = 100,
  shopType = "restaurant" // ✅ giá trị mặc định thật // <-- 🔑 allow passing
  ) => {
  //   const { userAddress } = useUserAddress();
  // const userLongitude = Number(userAddress?.location?.coordinates[0]) || Number(0);
  // const userLatitude = Number(userAddress?.location?.coordinates[1]) || Number(0);
  const userLongitude = 0.0;
const userLatitude = 0.0;



    const { data, loading, error, networkStatus, fetchMore } =  
      useQuery<INearByRestaurantsPreviewData>(NEAR_BY_RESTAURANTS_PREVIEW, {
        variables: {
          latitude: userLatitude,
          longitude: userLongitude,
          shopType: shopType ?? "restaurant", // 🔑 pass down if provided
          page,
          limit,
        },
        fetchPolicy: "cache-and-network",
        skip: !enabled,
        notifyOnNetworkStatusChange: true,
      });


    const queryData: IRestaurant[] =
      data?.nearByRestaurantsPreview?.restaurants ?? [];

    const groceriesData: IRestaurant[] =
      queryData?.filter(
        (item) => item?.shopType?.toLowerCase() === "grocery"
      ) ?? [];

    const restaurantsData: IRestaurant[] =
      queryData?.filter(
        (item) => item?.shopType?.toLowerCase() === "restaurant"
      ) ?? [];

  console.log({ latitude: userLatitude, longitude: userLongitude, page, limit, shopType });
  console.log("useQuery data:", data);
  console.log("useQuery error:", error);
  console.log("useQuery networkStatus:", networkStatus);


  return {
    queryData,
    loading,
    error,
    networkStatus,
    groceriesData,
    restaurantsData,
    fetchMore, // expose for infinite scroll
  };

    
  };



  export default useNearByRestaurantsPreview;
