import MiniPlayer from "@/components/MiniPlayer";
import { useAudio } from "@/context/AudioContext";
import { Song } from "@/types/index";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Detail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [songDetails, setSongDetails] = useState<Song | undefined>();
    const { currentSong, isPlaying, position, duration, playSong, pauseSong, resumeSong, seekTo } = useAudio();
    
    const URL = `https://vibeplayer.onrender.com/songs/${id}`;
    
    useEffect(() => {
        // Fetch song details
        const fetchSongDetails = async () => {
            try {
                const response = await fetch(URL);
                const data = await response.json();

                if (data && data.message) {
                    const song = data.message;
                    console.log("Fetched song details:", song);
                    
                    // Convert to Song type
                    const formattedSong: Song = {
                        id: song._id,
                        title: song.title,
                        artist: song.artist,
                        coverImage: song.cover_image || null,
                    };
                    
                    setSongDetails(formattedSong);
                    
                    // If no song is currently playing, start this one
                    if (!currentSong) {
                        playSong(formattedSong);
                    }
                }
            } catch (error) {
                console.error("Error fetching song details:", error);
            }
        };

        fetchSongDetails();
    }, [URL]);

    const togglePlayback = () => {
        if (songDetails) {
            if (isPlaying && currentSong?.id === songDetails.id) {
                pauseSong();
            } else {
                if (currentSong?.id === songDetails.id) {
                    resumeSong();
                } else {
                    playSong(songDetails);
                }
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <View className="flex-1 bg-darkBg">
            <StatusBar hidden={true} />

            {/* Header with back button */}
            <View className="px-4 pt-12 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-2">
                    Song Details
                </Text>
            </View>

            {!songDetails ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white">Loading song details...</Text>
                </View>
            ) : (
                <ScrollView className="px-4 pt-6">
                    {/* Album Cover */}
                    <View className="items-center mb-6">
                        <Image
                            source={{ 
                                uri: songDetails.coverImage || 
                                "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL3Jhd3BpeGVsX29mZmljZV80N19hX2JsYWNrX3NpbGhvdWV0dGVfYV9tdXNpY19sb2dvX2ljb25fb25fYV93aF9kZThiOTE0MS00MjAyLTRlNTctOTdkYS0yZmQwYWMxZTdmYzIucG5n.png"
                            }}
                            className="w-64 h-64 rounded-lg"
                            resizeMode="cover"
                        />
                    </View>

                    {/* Song Info */}
                    <View className="mb-6">
                        <Text className="text-white text-2xl font-bold">
                            {songDetails.title}
                        </Text>
                        <Text className="text-gray-400 text-lg">
                            {songDetails.artist}
                        </Text>
                    </View>

                    {/* Progress Slider */}
                    <View className="mb-2">
                        <Slider
                            style={{ width: "100%", height: 40 }}
                            minimumValue={0}
                            maximumValue={duration > 0 ? duration : 200}
                            value={position}
                            minimumTrackTintColor="#1db954"
                            maximumTrackTintColor="#777"
                            thumbTintColor="#1db954"
                            onSlidingComplete={(value) => seekTo(value)}
                        />
                        <View className="flex-row justify-between px-2">
                            <Text className="text-gray-400">
                                {formatTime(position)}
                            </Text>
                            <Text className="text-gray-400">
                                {formatTime(duration)}
                            </Text>
                        </View>
                    </View>

                    {/* Play Controls */}
                    <View className="flex-row justify-center space-x-8 mb-8">
                        <TouchableOpacity
                            className="p-3"
                            onPress={() => seekTo(0)}
                        >
                            <Ionicons
                                name="play-skip-back"
                                size={28}
                                color="white"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-[#1db954] p-4 rounded-full"
                            onPress={togglePlayback}
                        >
                            <Ionicons
                                name={isPlaying && currentSong?.id === songDetails.id ? "pause" : "play"}
                                size={28}
                                color="white"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-3">
                            <Ionicons
                                name="play-skip-forward"
                                size={28}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* Optional: If you want the MiniPlayer to show in this screen too */}
            <MiniPlayer />
        </View>
    );
}
