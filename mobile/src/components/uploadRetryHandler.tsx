import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getQueue, clearQueue } from '../utils/uploadQueue';
import axios from 'axios';
import { View } from 'react-native';

const UploadRetryHandler = () => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        const queue = await getQueue();

        for (const item of queue) {
          const formData = new FormData();
          formData.append('image', {
            uri: item.uri,
            name: item.name,
            type: 'image/jpeg',
          } as any);

          try {
            await axios.post('http://localhost:3000/api/test-strips/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log(`Retry successful for ${item.name}`);
          } catch (err) {
            console.log(`Retry failed for ${item.name}`);
          }
        }

        await clearQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  return <View />;
};

export default UploadRetryHandler;
