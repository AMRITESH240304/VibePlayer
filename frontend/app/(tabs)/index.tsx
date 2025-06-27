import MusicCard from "@/components/MusicCard";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import { View,ScrollView } from "react-native";
import { Song } from "@/types/index"; // Adjust the import path as necessary

export default function Home() {
    const URL = "https://vibeplayer.onrender.com/songs";
    // Specify the type for songs state
    const [songs, setSongs] = useState<Song[]>([]);

    useEffect(() => {
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
                console.log("Normalized songs:", normalizedSongs);
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };

        fetchSongs();
    }, []);

    return (
        <View className="flex-1 bg-darkBg px-6 pt-8">
            <View>
                <Navbar name="Amritesh" />
            </View>
            <ScrollView className="flex-1 px-2">
                <View className="flex-row gap-3 flex-wrap justify-between mt-4 pb-20">
                    {songs.map((song) => (
                        <MusicCard key={song.id} song={song} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
