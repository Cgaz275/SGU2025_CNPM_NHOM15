import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../FirebaseConfig';

export default function UploadImageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // restaurantDocId

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiKey = '95bec918c13c0eee27f992de0543be72';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.1, // 🔥 giảm dung lượng file
      allowsEditing: true,
      base64: true, // 🔥 LẤY BASE64 TRỰC TIẾP (không cần manipulator)
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPreview(asset.uri);

      uploadImage(asset.base64!);
    }
  };

  const uploadImage = async (base64: string) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('image', base64);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: form,
      });

      const json = await res.json();
      const url = json.data.url;

      await updateDoc(doc(db, 'restaurants', id as string), {
        imageUrl: url,
      });

      router.back();
    } catch (err) {
      console.log('Upload error:', err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn ảnh đại diện</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={pickImage}
      >
        <Text style={styles.btnText}>Chọn ảnh</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 20 }}
        />
      )}

      {preview && (
        <Image
          source={{ uri: preview }}
          style={styles.preview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  btn: {
    backgroundColor: '#D7A359',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  preview: {
    width: 220,
    height: 220,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
});
