import MusicCard from "@/components/MusicCard";
import Navbar from "@/components/Navbar";
import { useAudio } from "@/context/AudioContext";
import { Song } from "@/types/index"; // Adjust the import path as necessary
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Home() {
    const URL = "https://vibeplayer.onrender.com/songs";
    // Specify the type for songs state
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    // Get audio context
    const { setPlaylist, isShuffleOn, toggleShuffle } = useAudio();
    
    // Animation values
    const searchBarWidth = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate content fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        const fetchSongs = async () => {
            try {
                const response = await fetch(URL);
                const data = await response.json();

                // Make sure we're accessing the correct part of the response
                const songsData = data.message || data;
                
                // Convert _id to id and cover_image to coverImage
                const normalizedSongs = songsData.map((song: any) => ({
                    id: song._id,
                    title: song.title,
                    artist: song.artist,
                    coverImage: song.cover_image || null,
                }));

                setSongs(normalizedSongs);
                setFilteredSongs(normalizedSongs);
                setPlaylist(normalizedSongs); // Set the playlist in audio context
                console.log("Normalized songs:", normalizedSongs);
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };

        fetchSongs();
    }, []);

    // Filter songs based on search query
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredSongs(songs);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = songs.filter(
                song => 
                    song.title.toLowerCase().includes(query) || 
                    song.artist.toLowerCase().includes(query)
            );
            setFilteredSongs(filtered);
        }
    }, [searchQuery, songs]);

    // Animate search bar focus/blur
    useEffect(() => {
        Animated.timing(searchBarWidth, {
            toValue: isSearchFocused ? 1.05 : 1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
        }).start();
    }, [isSearchFocused]);

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Header animation based on scroll
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -10],
        extrapolate: 'clamp',
    });

    return (
        <View className="flex-1 bg-darkBg">
            <LinearGradient
                colors={['rgba(50, 30, 100, 0.8)', 'rgba(20, 20, 30, 1)']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                className="flex-1"
            >
                <Animated.View 
                    className="px-6 pt-8"
                    style={{
                        opacity: headerOpacity,
                        transform: [{ translateY: headerTranslateY }],
                    }}
                >
                    <View className="flex-row justify-between items-center">
                        <Navbar name="Amritesh" />
                        
                        {/* Shuffle Button */}
                        <TouchableOpacity
                            onPress={() => {
                                toggleShuffle();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            className={`p-3 rounded-full ${isShuffleOn ? 'bg-purple-500/30' : 'bg-black/30'}`}
                        >
                            <Ionicons 
                                name="shuffle" 
                                size={22} 
                                color={isShuffleOn ? "#a78bfa" : "white"} 
                            />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Animated Search Bar */}
                    <Animated.View 
                        className="mt-6 mb-4"
                        style={{
                            transform: [{ scale: searchBarWidth }],
                        }}
                    >
                        <LinearGradient
                            colors={isSearchFocused ? 
                                ['rgba(80, 70, 170, 0.4)', 'rgba(50, 50, 100, 0.4)'] : 
                                ['rgba(40, 40, 60, 0.6)', 'rgba(30, 30, 50, 0.6)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-full p-[1px]"
                        >
                            <View className="flex-row items-center rounded-full px-4 py-3 bg-[rgba(20,20,30,0.8)]">
                                <Ionicons 
                                    name="search" 
                                    size={20} 
                                    color={isSearchFocused ? "#a78bfa" : "#FFFFFF"} 
                                />
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="Search songs or artists..."
                                    placeholderTextColor="#999999"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    selectionColor="#a78bfa"
                                />
                                {searchQuery !== "" && (
                                    <Pressable 
                                        onPress={handleClearSearch}
                                        className="p-1"
                                    >
                                        <Ionicons 
                                            name="close-circle" 
                                            size={20} 
                                            color="#a78bfa" 
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </LinearGradient>
                    </Animated.View>
                    
                    {/* No results message with animation */}
                    {filteredSongs.length === 0 && searchQuery !== "" && (
                        <Animated.View 
                            className="mt-4 items-center"
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateY: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0]
                                })}]
                            }}
                        >
                            <Ionicons name="search-outline" size={50} color="rgba(255,255,255,0.5)" />
                            <Text className="text-white text-lg mt-2">No songs found</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                Try searching for a different song or artist
                            </Text>
                        </Animated.View>
                    )}
                </Animated.View>
                
                <Animated.ScrollView 
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* Song Results Section */}
                    {filteredSongs.length > 0 && (
                        <Animated.View 
                            className="mt-4 pb-20"
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateY: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })}]
                            }}
                        >
                            <View className="flex-row gap-3 flex-wrap justify-between">
                                {filteredSongs.map((song, index) => (
                                    <Animated.View 
                                        key={song.id}
                                        style={{
                                            opacity: fadeAnim,
                                            transform: [{ 
                                                translateY: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [30 + (index * 10), 0]
                                                })
                                            }]
                                        }}
                                    >
                                        <MusicCard song={song} />
                                    </Animated.View>
                                ))}
                            </View>
                        </Animated.View>
                    )}
                </Animated.ScrollView>
            </LinearGradient>
        </View>
    );
}
