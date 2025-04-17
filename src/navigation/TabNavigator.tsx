import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "../screens/HomeScreen";
import PrayerTimesScreen from "../screens/PrayerTimesScreen";
import QuranScreen from "../screens/QuranScreen";
import SurahDetailScreen from "../screens/SurahDetailScreen";
import AudioScreen from "../screens/AudioScreen";
import NowPlayingScreen from "../screens/NowPlayingScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AlbumDetailScreen from "../screens/AlbumDetailScreen";
import { COLORS, SIZES } from "../constants/theme";

const Tab = createBottomTabNavigator();
const QuranStack = createNativeStackNavigator();
const AudioStack = createNativeStackNavigator();

const QuranNavigator = () => {
  return (
    <QuranStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <QuranStack.Screen name="QuranList" component={QuranScreen} />
      <QuranStack.Screen
        name="SurahDetailScreen"
        component={SurahDetailScreen}
      />
    </QuranStack.Navigator>
  );
};

const AudioNavigator = () => {
  return (
    <AudioStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AudioStack.Screen name="AudioList" component={AudioScreen} />
      <AudioStack.Screen
        name="NowPlayingScreen"
        component={AlbumDetailScreen}
      />
    </AudioStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopWidth: 1,
            borderTopColor: `${COLORS.textSecondary}10`,
            height: Platform.OS === "ios" ? 88 : 68,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            paddingBottom: 4,
          },
          tabBarIconStyle: {
            marginBottom: -3,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Prayer Times"
          component={PrayerTimesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Quran"
          component={QuranNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Audio"
          component={AudioNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="headset" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default TabNavigator;
