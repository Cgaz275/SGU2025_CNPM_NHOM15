import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'

const useDroneStationsAdmin = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const stationsCollectionRef = collection(db, 'droneStation')
    const q = query(stationsCollectionRef, orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const stationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setData(stationsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Firestore Error fetching drone stations:", err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { data, loading, error }
}

export default useDroneStationsAdmin
