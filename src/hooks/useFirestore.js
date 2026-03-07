import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useCollection(collectionName, options = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let q;
        const ref = collection(db, collectionName);
        const constraints = [];

        if (options.whereField && options.whereValue !== undefined) {
            constraints.push(where(options.whereField, '==', options.whereValue));
        }
        if (options.orderByField) {
            constraints.push(orderBy(options.orderByField, options.orderDirection || 'desc'));
        }

        q = constraints.length > 0 ? query(ref, ...constraints) : ref;

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const result = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(result);
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [collectionName, options.whereField, options.whereValue, options.orderByField, options.orderDirection]);

    return { data, loading, error };
}
