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
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CameraCapturedPicture } from 'expo-camera';
import { Camera } from 'expo-camera';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';


type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Camera'
>;

const CameraScreen = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
//   const cameraRef = useRef<ExpoCamera>(null);
const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }



  const takePicture = async () => {
    // alert("Pressed");
    // if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
    // }
  };

  const retake = () => {
    setImageUri(null);
  };

  const submitPhoto = async () => {
    if (!imageUri) return;

    setIsUploading(true);
    const formData = new FormData();

    const fileName = imageUri.split('/').pop()!;
    const fileType = 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: fileType,
    } as any);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/test-strips/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Upload successful:', response?.data);
      Alert.alert('Success', `QR Code: ${(response?.data as any)?.qrCode}`);
      setImageUri(null);
    } catch (error: any) {
      console.error('Upload failed:', error?.response?.data || error.message);
      Alert.alert('Upload Failed', 'Could not upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      {!imageUri ? (
        <>
          {/* <Camera ref={cameraRef} style={styles.camera} type={'back'}/> */}
          <CameraView style={styles.camera} facing={"back"} ref={cameraRef}/>
          {/* <Camera style={styles.camera} type={CameraType?.back} ref={cameraRef} /> */}
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
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  controls: {
    padding: 20,
    alignItems: 'center',
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
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '90%',
    height: '60%',
    borderRadius: 10,
    marginBottom: 20,
  },
});
