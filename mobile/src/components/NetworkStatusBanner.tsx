import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import throttle from 'lodash.throttle';

const SCREEN_WIDTH = Dimensions.get('window').width;

const NetworkStatusBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerColor, setBannerColor] = useState('#4CAF50');
  const translateY = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    const handleConnectivityChange = throttle((state) => {
      if (state.isConnected && !isConnected) {
        showFloatingBanner('Back Online', '#4CAF50'); // Green
      } else if (!state.isConnected && isConnected) {
        showFloatingBanner('You are offline', '#ff4d4f'); // Red
      }
      setIsConnected(state.isConnected);
    }, 1000);

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return () => unsubscribe();
  }, [isConnected]);

  const showFloatingBanner = (message: string, color: string) => {
    setBannerText(message);
    setBannerColor(color);
    setShowBanner(true);

    Animated.timing(translateY, {
      toValue: 40,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowBanner(false);
        });
      }, 3000);
    });
  };

  if (!showBanner) return null;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bannerColor, transform: [{ translateY }] }]}>
      <Text style={styles.text}>{bannerText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxWidth: SCREEN_WIDTH * 0.9,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NetworkStatusBanner;
