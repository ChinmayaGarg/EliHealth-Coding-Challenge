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
import { processAndUploadImage } from '../utils/imageProcessor';
import * as ImageManipulator from 'expo-image-manipulator';

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
    requestPermission().then(({ status }) => {
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to proceed.');
      }
    });
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const rotated = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ rotate: 90 }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
      setImageUri(rotated.uri);
    }
  };

  const resetImage = () => setImageUri(null);

  const handleSubmit = async () => {
  if (!imageUri) return;
  setIsUploading(true);

  await processAndUploadImage(imageUri, setImageUri, setIsUploading, (qrCode) => {
    console.log('Upload successful with QR:', qrCode);
  }, () => {
    resetImage();
  });

  setIsUploading(false);
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
            <TouchableOpacity style={styles.button} onPress={handleCapture}>
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
              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isUploading}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.link} onPress={resetImage}>
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
