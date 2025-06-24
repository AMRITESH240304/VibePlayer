import { View, Text } from 'react-native'
import React from 'react'
type NavbarProps = {
  name: string;
};


const Navbar = ({name}:NavbarProps) => {
  return (
    <View>
      <Text className="text-4xl text-white font-semibold">Hi</Text>
      <Text className="text-4xl text-white font-bold">{name} 👋</Text>
    </View>
  )
}

export default Navbar