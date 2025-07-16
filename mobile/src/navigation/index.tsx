import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';

export type RootStackParamList = {
  Camera: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Camera" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Scan Test Strip' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Submission History' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
