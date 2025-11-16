import { useState, useEffect } from "react";
import { collection, onSnapshot, limit, query, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/FirebaseConfig";

const usePromotionalRestaurants = (limitCount = 6) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const promotionsCollectionRef = collection(db, "promotions_restaurant");
        const q = query(promotionsCollectionRef, limit(limitCount));

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const result = await Promise.all(
                    snapshot.docs.map(async (promoDoc) => {
                        const promoData = promoDoc.data();
                        const restaurantId = promoData.restaurantID;

                        // Fetch restaurant data
                        const restaurantRef = doc(db, "restaurants", restaurantId);
                        const restaurantSnap = await getDoc(restaurantRef);

                        const restaurantData = restaurantSnap.exists()
                            ? { id: restaurantId, ...restaurantSnap.data() }
                            : { 
                                id: restaurantId, 
                                name: "Unknown Restaurant", 
                                imageUrl: "",
                                address: "",
                                rating: 0
                              };

                        return {
                            id: promoDoc.id,
                            code: promoData.code,
                            discount_percentage: promoData.discount_percentage,
                            minPrice: promoData.minPrice,
                            restaurantId: restaurantId,
                            restaurantName: restaurantData.name,
                            restaurantImageUrl: restaurantData.imageUrl,
                            address: restaurantData.address,
                            rating: restaurantData.rating,
                            categories: restaurantData.categories || [],
                        };
                    })
                );

                setData(result);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Error fetching promotional restaurants:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [limitCount]);

    return { data, loading, error };
};

export default usePromotionalRestaurants;
