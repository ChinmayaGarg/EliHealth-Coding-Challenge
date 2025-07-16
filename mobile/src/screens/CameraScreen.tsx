import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { RootStackParamList } from '../../App';
import { checkImageBrightness } from '../utils/checkImageQuality';

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Camera'
>;

const CameraScreen = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const cameraRef = useRef<any>(null);
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Camera permission is required to continue.');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setImageUri(photo.uri);
  };

  const retake = () => setImageUri(null);

  const submitPhoto = async () => {
    if (!imageUri) return;

    setIsUploading(true);

    const isBrightEnough = await checkImageBrightness(imageUri);
    if (!isBrightEnough) {
      Alert.alert('Image Too Dark', 'Please take a clearer picture in better lighting.');
      setIsUploading(false);
      setImageUri(null);
      return;
    }

    const formData = new FormData();
    const fileName = imageUri.split('/').pop()!;
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    try {
      const { data } = await axios.post('http://localhost:3000/api/test-strips/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', `QR Code: ${(data as any)?.qrCode}`);
      setImageUri(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Alert.alert('Duplicate', 'This test strip has already been submitted.');
      } else {
        console.error('Upload failed:', error?.response?.data || error.message);
        Alert.alert('Upload Failed', 'Could not upload image.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!imageUri ? (
        <>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          <View style={styles.controls}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('History')}>
              <Text style={styles.linkText}>Go to History</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          {isUploading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={submitPhoto}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.link} onPress={retake}>
                <Text style={styles.linkText}>Retake</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  message: {
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  controls: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  preview: {
    width: '90%',
    height: '60%',
    borderRadius: 10,
    marginBottom: 20,
  },
});
