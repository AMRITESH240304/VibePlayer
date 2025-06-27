import { AudioProvider } from '@/context/AudioContext';
import AudioService from '@/services/TrackPlayerService';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import './globals.css';

export default function RootLayout() {
  // Initialize audio service for background playback
  useEffect(() => {
    AudioService.configureAudio();
  }, []);

  return (
    <AudioProvider>
      <View className="flex-1 bg-darkBg">
        <StatusBar hidden={true} />

        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: 'transparent', // Make stack navigator background transparent
            },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="songs/[id]"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </AudioProvider>
  );
}