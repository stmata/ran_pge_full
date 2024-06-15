import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

export const useImagePicker = (storageKey) => {
  const [image, setImage] = useState(null);

  // Fonction pour sauvegarder l'URI de l'image dans SecureStore
  const saveImageToSecureStore = async (imageUri) => {
    await SecureStore.setItemAsync(storageKey, imageUri);
  };

  // Fonction pour charger l'URI de l'image depuis SecureStore
  const loadImageFromSecureStore = async () => {
    const imageUri = await SecureStore.getItemAsync(storageKey);
    if (imageUri) {
      setImage(imageUri);
    }
  };

  // Appelé une fois au montage du composant pour charger une image existante
  useEffect(() => {
    loadImageFromSecureStore();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      saveImageToSecureStore(result.assets[0].uri);
    }
  };

  return [image, pickImage];
};
