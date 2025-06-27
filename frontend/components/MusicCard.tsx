import { useAudio } from "@/context/AudioContext";
import { Song } from "@/types/index";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Image, Pressable, Text, TouchableOpacity, View } from "react-native";

type MusicCardProps = {
  song: Song;
};

export default function MusicCard({ song }: MusicCardProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const { playSong, pauseSong, currentSong, isPlaying } = useAudio();
  
  const isCurrentSong = currentSong?.id === song.id;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push(`/songs/${song.id}`);
  };
  
  const handlePlayPress = (e: any) => {
    e.stopPropagation();
    
    if (isCurrentSong && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="w-40 h-56 rounded-2xl p-[1.5px] mr-4 overflow-hidden"
      >
        <LinearGradient
          colors={["#3a1c71", "#d76d77", "#ffaf7b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 rounded-2xl"
        >
          <View className="flex-1 bg-[#1e1e1e] rounded-2xl p-3">
            {/* Album Cover */}
            <Image
              source={{
                uri: song.coverImage || "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9zci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL3Jhd3BpeGVsX29mZmljZV80N19hX2JsYWNrX3NpbGhvdWV0dGVfYV9tdXNpY19sb2dvX2ljb25fb25fYV93aF9kZThiOTE0MS00MjAyLTRlNTctOTdkYS0yZmQwYWMxZTdmYzIucG5n.png"
              }}
              className="w-full h-36 rounded-lg mb-2"
              resizeMode="cover"
            />

            {/* Song Title */}
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {song.title}
            </Text>

            {/* Artist + Play Button */}
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-gray-400 text-xs" numberOfLines={1}>
                {song.artist}
              </Text>
              <TouchableOpacity
                className="bg-[#1db954] p-1 rounded-full"
                onPress={handlePlayPress}
              >
                <Ionicons 
                  name={isCurrentSong && isPlaying ? "pause" : "play"} 
                  size={14} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}
