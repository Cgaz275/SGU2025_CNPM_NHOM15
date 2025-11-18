import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'

const useOrdersAdmin = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ordersCollectionRef = collection(db, 'orders')
    const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setData(ordersData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Firestore Error fetching orders:", err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { data, loading, error }
}

export default useOrdersAdmin
