import { Text,View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 36,
          height: 64,
          borderRadius: 50,
          overflow: 'hidden',
          backgroundColor: 'transparent', // crucial for blur to show
          borderWidth: 0.5,
          borderColor: '#ffffff20', // very light border for subtle edge
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={50} // Adjust intensity for more or less blur
            style={{ flex: 1 }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View className="items-center py-3">
              <Ionicons
                name="heart"
                size={20}
                color={focused ? 'red' : 'gray'}
              />
              <Text style={{ fontSize: 7, color: focused ? 'red' : 'gray' }} className='pt-3'>
                Favorites
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: () => <Text className="text-2xl">⚙️</Text>,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
