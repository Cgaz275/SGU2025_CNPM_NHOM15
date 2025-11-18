import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'

const useDronesAdmin = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const dronesCollectionRef = collection(db, 'drones')
    const q = query(dronesCollectionRef, orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dronesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setData(dronesData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Firestore Error fetching drones:", err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { data, loading, error }
}

export default useDronesAdmin
