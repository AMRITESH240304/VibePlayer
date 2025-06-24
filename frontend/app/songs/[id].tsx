import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function Detail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Use the useAudioPlayer hook with the audio source directly
  const audioPlayer = useAudioPlayer(require('../../assets/audio/song.mp3'));
  
  useEffect(() => {
    // Set up interval to update current position
    const intervalId = setInterval(async () => {
      const current = await audioPlayer.currentTime;
      setPosition(current || 0);
      
      const total = await audioPlayer.duration;
      if (total && total > 0) setTotalDuration(total);
    }, 500);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const togglePlayback = async () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      await audioPlayer.pause();
    } else {
      await audioPlayer.play();
    }
  };
  
  const formatTime = (seconds:any) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const song = {
    id: id as string,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverImage: "https://i.scdn.co/image/ab67616d0000b273d2ef07c23298b42dbb4ce3f6",
    duration: "3:20",
    music: "https://p.scdn.co/mp3-preview/1c2f8b5d4e6c7f8a9b0c5e2f3d4e5f6a7b8c9d0e",
    releaseYear: 2020
  };

  return (
    <View className="flex-1 bg-darkBg">
      <StatusBar hidden={true} />
      
      {/* Header with back button */}
      <View className="px-4 pt-12 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-2">Song Details</Text>
      </View>
      
      <ScrollView className="px-4 pt-6">
        {/* Album Cover */}
        <View className="items-center mb-6">
          <Image
            source={{ uri: song.coverImage }}
            className="w-64 h-64 rounded-lg"
            resizeMode="cover"
          />
        </View>
        
        {/* Song Info */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold">{song.title}</Text>
          <Text className="text-gray-400 text-lg">{song.artist}</Text>
          <Text className="text-gray-500">Album: {song.album} • {song.releaseYear}</Text>
          <Text className="text-gray-500">Duration: {song.duration}</Text>
        </View>
        
        {/* Progress Slider */}
        <View className="mb-2">
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={0}
            maximumValue={totalDuration > 0 ? totalDuration : 200}
            value={position}
            minimumTrackTintColor="#1db954"
            maximumTrackTintColor="#777"
            thumbTintColor="#1db954"
            onSlidingComplete={(value) => audioPlayer.seekTo(value)}
          />
          <View className="flex-row justify-between px-2">
            <Text className="text-gray-400">{formatTime(position)}</Text>
            <Text className="text-gray-400">{formatTime(totalDuration)}</Text>
          </View>
        </View>
        
        {/* Play Controls */}
        <View className="flex-row justify-center space-x-8 mb-8">
          <TouchableOpacity className="p-3" onPress={() => audioPlayer.seekTo(0)}>
            <Ionicons name="play-skip-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-[#1db954] p-4 rounded-full"
            onPress={togglePlayback}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="p-3">
            <Ionicons name="play-skip-forward" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}