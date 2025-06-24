import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Song = {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
};

type MusicCardProps = {
  song: Song;
};

export default function MusicCard({song} : MusicCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/songs/${song.id}`);
  };

  return (
    <TouchableOpacity 
      className="w-40 h-56 bg-[#1e1e1e] rounded-2xl p-3 mr-4"
      onPress={handlePress}
    >
      {/* Album Cover */}
      <Image
        source={{ uri: song.coverImage }}
        className="w-full h-36 rounded-lg mb-2"
        resizeMode="cover"
      />

      {/* Song Title */}
      <Text className="text-white font-semibold text-sm" numberOfLines={1}>
        {song.title}
      </Text>

      {/* Artist Name and Play Button */}
      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-gray-400 text-xs" numberOfLines={1}>
          {song.artist}
        </Text>
        <TouchableOpacity 
          className="bg-[#1db954] p-1 rounded-full"
          onPress={(e) => {
            e.stopPropagation();
            // Handle play functionality here
          }}
        >
          <Ionicons name="play" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
