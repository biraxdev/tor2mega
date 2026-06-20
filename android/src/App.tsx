import React, { useEffect, useState } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { isAuthenticated } from "./api";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import DownloadsScreen from "./screens/DownloadsScreen";
import AddUrlScreen from "./screens/AddUrlScreen";
import VideosScreen from "./screens/VideosScreen";
import PlayerScreen from "./screens/PlayerScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#0f0f17", borderTopColor: "#1a1a2e" },
        tabBarActiveTintColor: "#a78bfa",
        tabBarInactiveTintColor: "#555",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Library"
        component={VideosScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="film" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="download" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={AddUrlScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    isAuthenticated().then(setAuthed);
  }, []);

  if (authed === null) return null;

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!authed ? (
          <Stack.Screen name="Login">
            {(props: any) => <LoginScreen {...props} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Player" component={PlayerScreen} options={{ headerShown: true, headerTintColor: "#fff", headerStyle: { backgroundColor: "#0f0f17" } }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
