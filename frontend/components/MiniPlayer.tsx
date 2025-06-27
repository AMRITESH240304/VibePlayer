import { useAudio } from '@/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';

const MiniPlayer = () => {
  const { currentSong, isPlaying, pauseSong, resumeSong } = useAudio();
  const router = useRouter();
  
  if (!currentSong) return null;
  
  const navigateToSongDetails = () => {
    router.push(`/songs/${currentSong.id}`);
  };
  
  return (
    <Pressable 
      onPress={navigateToSongDetails}
      className="absolute bottom-[110px] left-6 right-6 bg-[#2a2a2a] rounded-lg h-16 flex-row items-center px-3 z-10"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      {/* Song Cover */}
      <Image 
        source={{ 
          uri: currentSong.coverImage || 
            "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL3Jhd3BpeGVsX29mZmljZV80N19hX2JsYWNrX3NpbGhvdWV0dGVfYV9tdXNpY19sb2dvX2ljb25fb25fYV93aF9kZThiOTE0MS00MjAyLTRlNTctOTdkYS0yZmQwYWMxZTdmYzIucG5n.png"
        }}
        className="w-10 h-10 rounded-md mr-3"
      />
      
      {/* Song Info */}
      <View className="flex-1">
        <Text className="text-white font-medium" numberOfLines={1}>{currentSong.title}</Text>
        <Text className="text-gray-400 text-xs" numberOfLines={1}>{currentSong.artist}</Text>
      </View>
      
      {/* Play/Pause Button */}
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          isPlaying ? pauseSong() : resumeSong();
        }}
        className="p-2"
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#1db954" />
      </TouchableOpacity>
    </Pressable>
  );
};

export default MiniPlayer;