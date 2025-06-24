import MusicCard from "@/components/MusicCard";
import Navbar from "@/components/Navbar";
import { View } from "react-native";

export default function Home() {

    const songs = [
    {
      id: "1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      coverImage: "https://i.scdn.co/image/ab67616d0000b273d2ef07c23298b42dbb4ce3f6"
    },
    {
      id: "2",
      title: "Save Your Tears",
      artist: "The Weeknd",
      coverImage: "https://i.scdn.co/image/ab67616d0000b273c6af5ffa661a365b72b2ff97"
    },
  ];
  return (
    <View className="flex-1 bg-darkBg px-6 pt-8">
      <View >
        <Navbar name="Amritesh"/>
      </View>
      <View className="flex-row gap-3 flex-wrap justify-between mt-4">
        {songs.map((song) => (<MusicCard key={song.id} song={song} />))}
      </View>
    </View>
  );
}
