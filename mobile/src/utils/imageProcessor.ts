import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import { Alert } from 'react-native';
import { checkImageBrightness, estimateBlur } from './checkImageQuality';
import { addToQueue } from './uploadQueue';

/**
 * Compresses image, checks brightness and blur, uploads or queues based on result.
 * @param originalUri URI of the image to process
 * @param onSuccess Optional callback after successful upload
 * @param onReset Optional callback to reset UI or image state
 */
export const processAndUploadImage = async (
  originalUri: string,
  setImageUri: (uri: string | null) => void,
  setIsUploading: (loading: boolean) => void,
  onSuccess?: (qrCode: string) => void,
  onReset?: () => void
) => {
    let manipulatedImage;
  try {
    // 1. Compress the image
    manipulatedImage = await ImageManipulator.manipulateAsync(
      originalUri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Check brightness
    const isBrightEnough = await checkImageBrightness(manipulatedImage.uri);
    if (!isBrightEnough) {
      setImageUri(null);         // reset the image preview
      setIsUploading(false); 
      Alert.alert('Low Brightness', 'Please retake the photo in better lighting.');
      return;
    }

    // 3. Check blur
    const blurScore = await estimateBlur(manipulatedImage.uri);
    if (blurScore < 150) {
        setImageUri(null);         // reset the image preview
    setIsUploading(false); 
      Alert.alert('Blurry Image', 'Please retake a sharper image.');
      return;
    }

    // 4. Prepare upload
    const fileName = manipulatedImage.uri.split('/').pop()!;
    const formData = new FormData();
    formData.append('image', {
      uri: manipulatedImage.uri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    // 5. Upload
    const { data } = await axios.post('http://localhost:3000/api/test-strips/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    Alert.alert('Success', `QR Code: ${(data as any).qrCode}`);
    onSuccess?.((data as any).qrCode);
    onReset?.();

  } catch (error: any) {
    const isOffline = error?.message?.includes('Network') || !error?.response;
    const fileName = originalUri.split('/').pop()!;
    setImageUri(null);     
    setIsUploading(false); 

    if (isOffline) {
        if (!!manipulatedImage?.uri) {
            await addToQueue({ uri: manipulatedImage.uri, name: fileName });
        } else {
            console.warn('Cannot queue image: resized image uri not undefined.');
        }
    //   await addToQueue({ uri: manipulatedImage!.uri, name: fileName });
      Alert.alert('Offline', 'Upload will retry when back online.');
    } else if (error?.response?.status === 409) {
      Alert.alert('Duplicate', 'This test strip was already submitted.');
    } else {
      Alert.alert('Upload Failed', 'Something went wrong. Please try again.');
    }
  }
};
