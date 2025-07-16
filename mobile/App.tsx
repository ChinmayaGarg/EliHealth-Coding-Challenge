// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RootNavigator from './src/navigation';
import NetworkStatusBanner from './src/components/NetworkStatusBanner';
import UploadRetryHandler from './src/components/uploadRetryHandler';

export type RootStackParamList = {
  Camera: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
     <UploadRetryHandler />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <NetworkStatusBanner />
    </>
  );
}
