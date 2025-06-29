import MiniPlayer from "@/components/MiniPlayer";
import SoundWave from "@/components/SoundWave";
import { useAudio } from "@/context/AudioContext";
import { Song } from "@/types/index";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Image, Text, TouchableOpacity, View } from "react-native";

export default function Detail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [songDetails, setSongDetails] = useState<Song | undefined>();
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { 
        currentSong, 
        isPlaying, 
        position, 
        duration, 
        playSong, 
        pauseSong, 
        resumeSong, 
        seekTo,
        playNext,
        playPrevious,
        isShuffleOn,
        toggleShuffle,
        setPlaylist
    } = useAudio();
    
    // Animation refs
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
    
    const URL = `https://vibeplayer.onrender.com/songs/${id}`;
    const ALL_SONGS_URL = "https://vibeplayer.onrender.com/songs";
    
    useEffect(() => {
        // Start entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5))
            })
        ]).start();

        // Fetch all songs for playlist functionality
        const fetchAllSongs = async () => {
            try {
                const response = await fetch(ALL_SONGS_URL);
                const data = await response.json();

                if (data) {
                    const songsData = data.message || data;
                    
                    // Convert to Song type
                    const formattedSongs: Song[] = songsData.map((song: any) => ({
                        id: song._id,
                        title: song.title,
                        artist: song.artist,
                        coverImage: song.cover_image || null,
                    }));
                    
                    setAllSongs(formattedSongs);
                    setPlaylist(formattedSongs);
                }
            } catch (error) {
                console.error("Error fetching all songs:", error);
            }
        };

        // Fetch song details
        const fetchSongDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(URL);
                const data = await response.json();

                if (data && data.message) {
                    const song = data.message;
                    
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllSongs();
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
        
        // Add haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleNextSong = () => {
        playNext();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePreviousSong = () => {
        playPrevious();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleShuffleToggle = () => {
        toggleShuffle();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };
    
    const isSongPlaying = isPlaying && currentSong?.id === songDetails?.id;

    // Update songDetails when currentSong changes
    useEffect(() => {
        if (currentSong && currentSong.id !== songDetails?.id) {
            setSongDetails(currentSong);
            
            // Update URL parameter without triggering a full navigation
            router.setParams({ id: currentSong.id });
        }
    }, [currentSong]);

    return (
        <View className="flex-1">
            <LinearGradient
                colors={['rgba(40, 20, 80, 1)', 'rgba(20, 20, 30, 1)']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                className="flex-1"
            >
                <StatusBar hidden={true} />

                {/* Header with back button */}
                <Animated.View 
                    className="px-4 pt-12 flex-row items-center justify-between"
                    style={{ opacity: fadeAnim }}
                >
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        className="p-2 bg-black/20 rounded-full"
                        style={{ elevation: 3 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">
                        Now Playing
                    </Text>
                    <TouchableOpacity 
                        onPress={handleShuffleToggle} 
                        className={`p-2 rounded-full ${isShuffleOn ? 'bg-purple-500/30' : 'bg-black/20'}`}
                    >
                        <Ionicons 
                            name="shuffle" 
                            size={24} 
                            color={isShuffleOn ? "#a78bfa" : "white"} 
                        />
                    </TouchableOpacity>
                </Animated.View>

                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-white">Loading song details...</Text>
                    </View>
                ) : (
                    <Animated.ScrollView 
                        className="px-4 pt-6"
                        style={{ opacity: fadeAnim }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Album Cover with Sound Wave */}
                        <Animated.View 
                            className="items-center mb-8"
                            style={{ transform: [{ scale: scaleAnim }] }}
                        >
                            <LinearGradient
                                colors={['rgba(80, 70, 170, 0.4)', 'rgba(50, 50, 100, 0.4)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-3xl p-[1.5px] shadow-lg"
                                style={{ elevation: 10 }}
                            >
                                <View className="w-64 h-64 rounded-3xl overflow-hidden bg-black/40 justify-center items-center">
                                    {/* Album art as background */}
                                    {songDetails?.coverImage && (
                                        <Image
                                            source={{ uri: songDetails.coverImage }}
                                            className="absolute w-full h-full opacity-50"
                                            resizeMode="cover"
                                            blurRadius={2}
                                        />
                                    )}
                                    
                                    {/* Sound wave visualization */}
                                    <View className="w-full h-full justify-center items-center">
                                        <SoundWave 
                                            isPlaying={isSongPlaying} 
                                            color="#a78bfa"
                                            barCount={40}
                                        />
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        {/* Song Info */}
                        <Animated.View 
                            className="mb-8"
                            style={{ 
                                opacity: fadeAnim,
                                transform: [{ 
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }]
                            }}
                        >
                            <Text className="text-white text-2xl font-bold text-center">
                                {songDetails?.title}
                            </Text>
                            <Text className="text-gray-400 text-lg text-center mt-1">
                                {songDetails?.artist}
                            </Text>
                        </Animated.View>

                        {/* Progress Slider */}
                        <Animated.View 
                            className="mb-2"
                            style={{ 
                                opacity: fadeAnim,
                                transform: [{ 
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0]
                                    })
                                }]
                            }}
                        >
                            <Slider
                                style={{ width: "100%", height: 40 }}
                                minimumValue={0}
                                maximumValue={duration > 0 ? duration : 200}
                                value={position}
                                minimumTrackTintColor="#a78bfa"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="#a78bfa"
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
                        </Animated.View>

                        {/* Play Controls */}
                        <Animated.View 
                            className="flex-row justify-center items-center space-x-8 mb-8 mt-4"
                            style={{ 
                                opacity: fadeAnim,
                                transform: [{ 
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [40, 0]
                                    })
                                }]
                            }}
                        >
                            <TouchableOpacity
                                className="p-3 bg-black/20 rounded-full"
                                onPress={handlePreviousSong}
                            >
                                <Ionicons
                                    name="play-skip-back"
                                    size={28}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-[#a78bfa] p-6 rounded-full"
                                onPress={togglePlayback}
                                style={{ elevation: 5 }}
                            >
                                <Ionicons
                                    name={isSongPlaying ? "pause" : "play"}
                                    size={32}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="p-3 bg-black/20 rounded-full"
                                onPress={handleNextSong}
                            >
                                <Ionicons
                                    name="play-skip-forward"
                                    size={28}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.ScrollView>
                )}

                {/* Optional: If you want the MiniPlayer to show in this screen too */}
                <MiniPlayer />
            </LinearGradient>
        </View>
    );
}
