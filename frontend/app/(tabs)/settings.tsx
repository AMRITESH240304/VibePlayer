import { Text, View } from "react-native";

export default function Settings() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-white text-xl font-bold">Settings</Text>
      <Text className="text-gray-400 mt-2">App settings will appear here</Text>
    </View>
  );
}
