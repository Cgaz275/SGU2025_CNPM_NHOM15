import { useState, useEffect } from "react";
import { collection, onSnapshot, limit, query, doc, getDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";

const usePromotionalDishes = (limitCount = 6) => {
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
                        const dishIds = promoData.applied_dish || [];

                        // Fetch all dishes inside applied_dish[]
                        const dishes = await Promise.all(
                            dishIds.map(async (dishId) => {
                                const dishRef = doc(db, "dishes", dishId);
                                const dishSnap = await getDoc(dishRef);

                                return dishSnap.exists()
                                    ? { id: dishId, ...dishSnap.data() }
                                    : { id: dishId, name: "Unknown Dish", imageUrl: "" };
                            })
                        );

                        return {
                            id: promoDoc.id,
                            code: promoData.code,
                            discount_percentage: promoData.discount_percentage,
                            restaurantId: promoData.restaurantID,
                            minPrice: promoData.minPrice,

                            // 👇 All dishes in the promotion
                            appliedDishes: dishes,

                            // 👇 Keep compatibility with your current UI
                            dishName: dishes[0]?.name || "Unknown Dish",
                            imageUrl: dishes[0]?.imageUrl || "",
                        };
                    })
                );

                setData(result);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Error fetching promotions:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [limitCount]);

    return { data, loading, error };
};

export default usePromotionalDishes;
