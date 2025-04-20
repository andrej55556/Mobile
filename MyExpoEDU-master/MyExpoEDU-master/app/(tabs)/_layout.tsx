import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
          tabBarActiveTintColor: '#afd33d',
          headerStyle: {
          backgroundColor: '#25292e',
          },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          tabBarStyle: {
          backgroundColor: '#25292e',
          },
      }}
      >
      <Tabs.Screen name='index' options={{headerShown: false, tabBarLabel: 'Map',tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "map-sharp" : "map-outline"} color={color} size={24} />}}/>
      {/* <Tabs.Screen name='marker/index' options={{headerShown: false, tabBarLabel: 'Markers', tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "flag" : "flag-outline"} color={color} size={24} />}}/> */}
    </Tabs>
  )
}
