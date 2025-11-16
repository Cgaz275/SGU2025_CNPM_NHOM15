import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/FirebaseConfig';

const useOptionGroup = (optionGroupId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!optionGroupId) {
            setLoading(false);
            return;
        }

        const fetchOptionGroup = async () => {
            try {
                const optionGroupRef = doc(db, 'optionGroup', optionGroupId);
                const docSnap = await getDoc(optionGroupRef);

                if (docSnap.exists()) {
                    setData({
                        id: docSnap.id,
                        ...docSnap.data(),
                    });
                    setError(null);
                } else {
                    setError(new Error('Option group not found'));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching option group:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchOptionGroup();
    }, [optionGroupId]);

    return { data, loading, error };
};

export default useOptionGroup;
