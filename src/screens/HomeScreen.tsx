"use client";

import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { fetchIslamicDate, fetchPrayerTimes } from "../services/api";

// Default coordinates for Banjul, Gambia
const DEFAULT_LATITUDE = 13.4549;
const DEFAULT_LONGITUDE = -16.579;

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState("");
  const [countdown, setCountdown] = useState("00:00:00");
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    hour: number;
    minute: number;
    tomorrow?: boolean;
  }>({
    name: "Fajr",
    hour: 5,
    minute: 15,
  });
  const [progress, setProgress] = useState(0);
  const [islamicDate, setIslamicDate] = useState("");
  const [location, setLocation] = useState("Banjul, Gambia");
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [prayerStatuses, setPrayerStatuses] = useState({});
  const [animation] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Initialize and update time-related states
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);

      try {
        // Get Islamic date using the API
        const hijriDate = await fetchIslamicDate();
        setIslamicDate(hijriDate.format);

        // Get prayer times from the API
        const prayerData = await fetchPrayerTimes(
          DEFAULT_LATITUDE,
          DEFAULT_LONGITUDE
        );

        // Format prayer times for display
        const formattedPrayerTimes = [
          {
            name: "Fajr",
            time: formatTimeObject(prayerData.fajr),
            icon: "sunrise",
          },
          {
            name: "Dhuhr",
            time: formatTimeObject(prayerData.dhuhr),
            icon: "sun",
          },
          {
            name: "Asr",
            time: formatTimeObject(prayerData.asr),
            icon: "sun",
          },
          {
            name: "Maghrib",
            time: formatTimeObject(prayerData.maghrib),
            icon: "sunset",
          },
          {
            name: "Isha",
            time: formatTimeObject(prayerData.isha),
            icon: "moon",
          },
        ];

        setPrayerTimes(formattedPrayerTimes);
        updatePrayerTimesAndStatuses(formattedPrayerTimes);
      } catch (error) {
        console.error("Error initializing app:", error);
        // Fallback to mock data if API fails
        setIslamicDate("9 Ramadhan 1444 H");
        initializeWithMockData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Start timers
    const timeInterval = setInterval(() => {
      updateCurrentTime();
    }, 1000);

    // Start animation
    startAnimation();

    return () => {
      clearInterval(timeInterval);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Format time string from API (24-hour format) to time object
  const formatTimeObject = (timeStr) => {
    if (!timeStr) return { hour: 0, minute: 0 };

    // Remove any trailing text (like "(IST)")
    const cleanTime = timeStr.split(" ")[0];

    const [hours, minutes] = cleanTime.split(":");
    return {
      hour: Number.parseInt(hours, 10),
      minute: Number.parseInt(minutes, 10),
    };
  };

  // Initialize with mock data (fallback)
  const initializeWithMockData = () => {
    // Set mock prayer times
    const mockPrayerTimes = [
      { name: "Fajr", time: { hour: 4, minute: 41 }, icon: "sunrise" },
      { name: "Dhuhr", time: { hour: 12, minute: 0 }, icon: "sun" },
      { name: "Asr", time: { hour: 15, minute: 14 }, icon: "sun" },
      { name: "Maghrib", time: { hour: 18, minute: 2 }, icon: "sunset" },
      { name: "Isha", time: { hour: 19, minute: 11 }, icon: "moon" },
    ];

    setPrayerTimes(mockPrayerTimes);
    updatePrayerTimesAndStatuses(mockPrayerTimes);
  };

  // Animation for prayer cards
  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Update current time and countdown
  const updateCurrentTime = () => {
    const now = new Date();

    // Update current time display
    const hours = now.getHours();
    const minutes = now.getMinutes();
    setCurrentTime(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );

    // Update prayer times and statuses if available
    if (prayerTimes.length > 0) {
      updatePrayerTimesAndStatuses(prayerTimes);
    }
  };

  // Update prayer times and statuses
  const updatePrayerTimesAndStatuses = (prayers) => {
    if (!prayers || prayers.length === 0) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Format prayer times and determine statuses
    const formattedPrayers = prayers.map((prayer) => {
      const timeInMinutes = prayer.time.hour * 60 + prayer.time.minute;
      const formattedTime = formatTime(prayer.time.hour, prayer.time.minute);

      let status = "pending";
      if (currentTimeInMinutes > timeInMinutes) {
        status = "completed";
      }

      return {
        ...prayer,
        formattedTime,
        timeInMinutes,
        status,
      };
    });

    // Find the next prayer
    let nextPrayerIndex = -1;
    for (let i = 0; i < formattedPrayers.length; i++) {
      if (formattedPrayers[i].status === "pending") {
        nextPrayerIndex = i;
        break;
      }
    }

    // If all prayers are completed, the next prayer is tomorrow's Fajr
    if (nextPrayerIndex === -1) {
      nextPrayerIndex = 0;
      formattedPrayers[0].tomorrow = true;
    }

    // Mark the next prayer
    formattedPrayers[nextPrayerIndex].status = "next";

    // Set the next prayer for countdown
    const next = formattedPrayers[nextPrayerIndex];
    setNextPrayer({
      name: next.name,
      hour: next.time.hour,
      minute: next.time.minute,
      tomorrow: next.tomorrow,
    });

    // Calculate countdown to next prayer
    let timeDiffInMinutes = next.timeInMinutes - currentTimeInMinutes;

    if (timeDiffInMinutes < 0) {
      // If next prayer is tomorrow
      timeDiffInMinutes += 24 * 60;
    }

    const countdownHours = Math.floor(timeDiffInMinutes / 60);
    const countdownMinutes = Math.floor(timeDiffInMinutes % 60);
    const countdownSeconds = 59 - now.getSeconds();

    setCountdown(
      `${countdownHours.toString().padStart(2, "0")}:${countdownMinutes
        .toString()
        .padStart(2, "0")}:${countdownSeconds.toString().padStart(2, "0")}`
    );

    // Calculate progress for the countdown circle
    const totalDuration = 300; // 5 hours in minutes
    const newProgress = 1 - timeDiffInMinutes / totalDuration;
    setProgress(Math.min(Math.max(newProgress, 0), 1));

    // Update prayer times state
    setPrayerTimes(formattedPrayers);

    // Create status object for the daily prayers section
    const statuses = {};
    formattedPrayers.forEach((prayer) => {
      statuses[prayer.name.toLowerCase()] = prayer.status;
    });

    setPrayerStatuses(statuses);
  };

  // Helper function to format time
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Handle search input
  const handleSearch = (text) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to simulate API call delay
    if (text.length > 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        // Mock search results
        const mockResults = [
          {
            surahNumber: 1,
            surahName: "Al-Fatiha",
            verseNumber: 1,
            text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          },
          {
            surahNumber: 2,
            surahName: "Al-Baqarah",
            verseNumber: 255,
            text: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.",
          },
          {
            surahNumber: 112,
            surahName: "Al-Ikhlas",
            verseNumber: 1,
            text: 'Say, "He is Allah, [who is] One."',
          },
        ].filter(
          (item) =>
            item.surahName.toLowerCase().includes(text.toLowerCase()) ||
            item.text.toLowerCase().includes(text.toLowerCase())
        );

        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Navigate to prayer times page
  const navigateToPrayerTimes = () => {
    navigation.navigate("PrayerTimesScreen");
  };

  // Navigate to audio page
  const navigateToAudios = () => {
    navigation.navigate("AudioScreen");
  };

  // Navigate to feature screens
  const navigateToFeature = (screenName) => {
    navigation.navigate(screenName);
  };

  const renderCountdownCircle = () => {
    const rotation = progress * 360;

    return (
      <View style={styles.circleContainer}>
        <View style={[styles.outerCircle, { borderColor: colors.secondary }]}>
          {/* Progress circle */}
          <View
            style={[styles.fullCircle, { backgroundColor: colors.secondary }]}
          />
          {/* White overlay */}
          <View
            style={[
              styles.whiteOverlay,
              {
                transform: [
                  { rotateZ: "-90deg" },
                  { rotateZ: `${rotation}deg` },
                ],
                backgroundColor: isDarkMode
                  ? colors.background
                  : colors.background,
              },
            ]}
          />
          {/* Inner white circle with content */}
          <View
            style={[
              styles.contentCircle,
              {
                backgroundColor: isDarkMode
                  ? colors.background
                  : colors.background,
              },
            ]}
          >
            <Text style={[styles.nextPrayerName, { color: colors.text }]}>
              {nextPrayer.name}
            </Text>
            <Text style={[styles.countdownTime, { color: colors.text }]}>
              {countdown}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFeatureButton = (icon, label, screenName) => (
    <TouchableOpacity
      style={styles.featureButton}
      onPress={() => navigateToFeature(screenName)}
    >
      <View
        style={[
          styles.featureIconContainer,
          { backgroundColor: colors.primary },
        ]}
      >
        {icon}
      </View>
      <Text style={[styles.featureLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const getPrayerStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: `${colors.prayerCompleted}20`,
          color: colors.prayerCompleted,
          text: "Completed",
        };
      case "next":
        return {
          backgroundColor: `${colors.prayerNext}30`,
          color: colors.prayerNext,
          text: "Next",
        };
      default:
        return {
          backgroundColor: `${colors.prayerPending}20`,
          color: colors.prayerPending,
          text: "Pending",
        };
    }
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchQuery.length < 3) return null;

    if (isSearching) {
      return (
        <View
          style={[
            styles.searchResultsContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.searchingText, { color: colors.textSecondary }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.length >= 3) {
      return (
        <View
          style={[
            styles.searchResultsContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
            No results found
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.searchResultsContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Text style={[styles.searchResultsTitle, { color: colors.text }]}>
          Search Results
        </Text>
        {searchResults.slice(0, 5).map((result, index) => (
          <TouchableOpacity key={index} style={styles.searchResultItem}>
            <Text style={[styles.searchResultSurah, { color: colors.primary }]}>
              {result.surahNumber}. {result.surahName} - Verse{" "}
              {result.verseNumber}
            </Text>
            <Text
              style={[styles.searchResultText, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {result.text}
            </Text>
          </TouchableOpacity>
        ))}
        {searchResults.length > 5 && (
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={[styles.viewMoreText, { color: colors.primary }]}>
              View more results
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.headerBackground}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>
          Loading prayer times...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.headerBackground}
      />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Header with Search */}
      <View
        style={[styles.header, { backgroundColor: colors.headerBackground }]}
      >
        {/* Top Header Row */}
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.islamicDate, { color: colors.textLight }]}>
              {islamicDate}
            </Text>
            <Text style={[styles.location, { color: colors.textLight }]}>
              {location}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textLight }]}
            placeholder="Search surah, narrators or keywords"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {renderSearchResults()}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Time Display */}
        <View
          style={[
            styles.timeDisplay,
            { backgroundColor: colors.headerBackground },
          ]}
        >
          <Text style={[styles.currentTime, { color: colors.textLight }]}>
            {currentTime}
          </Text>
          <Text style={[styles.timeInfo, { color: colors.textLight }]}>
            {nextPrayer.name} · {countdown} left
          </Text>

          {/* Prayer Times Row */}
          <View style={styles.prayerTimesRow}>
            {prayerTimes.map((prayer, index) => (
              <View key={index} style={styles.prayerTimeItem}>
                <Feather
                  name={prayer.icon}
                  size={20}
                  color={colors.textLight}
                />
                <Text
                  style={[styles.prayerTimeLabel, { color: colors.textLight }]}
                >
                  {prayer.name}
                </Text>
                <Text
                  style={[styles.prayerTimeValue, { color: colors.textLight }]}
                >
                  {prayer.formattedTime}
                </Text>
              </View>
            ))}
          </View>

          {/* Indicator */}
          <View style={styles.indicator}>
            <View
              style={[
                styles.indicatorDot,
                { backgroundColor: colors.secondary },
              ]}
            />
          </View>
        </View>

        {/* All Features */}
        <View
          style={[
            styles.featuresSection,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Features
          </Text>
          <View style={styles.featuresGrid}>
            {renderFeatureButton(
              <Ionicons
                name="book-outline"
                size={24}
                color={colors.textLight}
              />,
              "Quran",
              "Quran"
            )}
            {renderFeatureButton(
              <Ionicons
                name="volume-high-outline"
                size={24}
                color={colors.textLight}
              />,
              "Adzan",
              "Adzan"
            )}
            {renderFeatureButton(
              <Ionicons
                name="compass-outline"
                size={24}
                color={colors.textLight}
              />,
              "Qibla",
              "Qibla"
            )}
            {renderFeatureButton(
              <Ionicons
                name="heart-outline"
                size={24}
                color={colors.textLight}
              />,
              "Donation",
              "Donation"
            )}
            {renderFeatureButton(
              <Ionicons
                name="grid-outline"
                size={24}
                color={colors.textLight}
              />,
              "All",
              "AllFeatures"
            )}
          </View>
        </View>

        {/* Favorites */}
        <View
          style={[
            styles.favoritesSection,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Favourites
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesContainer}
          >
            <TouchableOpacity
              style={[
                styles.favoriteChip,
                { backgroundColor: colors.primaryTransparent },
              ]}
              onPress={() =>
                navigation.navigate("SurahDetailScreen", { surahId: 67 })
              }
            >
              <Text
                style={[styles.favoriteChipText, { color: colors.primary }]}
              >
                67. Al-Mulk
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.favoriteChip,
                { backgroundColor: colors.primaryTransparent },
              ]}
              onPress={() =>
                navigation.navigate("SurahDetailScreen", { surahId: 2 })
              }
            >
              <Text
                style={[styles.favoriteChipText, { color: colors.primary }]}
              >
                2. Al-Baqarah
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.favoriteChip,
                { backgroundColor: colors.primaryTransparent },
              ]}
              onPress={() =>
                navigation.navigate("SurahDetailScreen", { surahId: 19 })
              }
            >
              <Text
                style={[styles.favoriteChipText, { color: colors.primary }]}
              >
                19. Maryam
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Continue Listening */}
        <View
          style={[
            styles.continueListeningSection,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Continue Listening
          </Text>
          <TouchableOpacity
            style={[
              styles.continueListeningCard,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={() =>
              navigation.navigate("NowPlayingScreen", { surahId: 2 })
            }
          >
            <Image
              source={{
                uri: "https://placeholder-images.com/surahs/alBaqarah",
              }}
              style={[
                styles.surahThumbnail,
                { backgroundColor: colors.primaryTransparent },
              ]}
            />
            <View style={styles.continueListeningInfo}>
              <Text
                style={[styles.continueListeningTitle, { color: colors.text }]}
              >
                2. Al-Baqarah
              </Text>
              <Text
                style={[
                  styles.continueListeningSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                The Cow
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: "22%", backgroundColor: colors.primary },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  18:00/88:00
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: colors.secondaryTransparent },
              ]}
            >
              <Ionicons name="play" size={24} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Daily Prayers - Enhanced */}
        <View
          style={[
            styles.dailyPrayersSection,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Daily Prayers
            </Text>
            <TouchableOpacity onPress={navigateToPrayerTimes}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.prayersListContainer,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            {prayerTimes.map((prayer, index) => {
              const statusStyle = getPrayerStatusStyle(prayer.status);
              const isNext = prayer.status === "next";

              // Create animated styles for the "next" prayer
              const animatedStyle = isNext
                ? {
                    transform: [
                      {
                        scale: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.03],
                        }),
                      },
                    ],
                    shadowOpacity: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 0.3],
                    }),
                  }
                : {};

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.enhancedPrayerItem,
                    isNext && styles.nextPrayerItem,
                    { borderBottomColor: colors.divider },
                    animatedStyle,
                  ]}
                >
                  <View
                    style={[
                      styles.prayerIconContainer,
                      { backgroundColor: "rgba(0, 0, 0, 0.05)" },
                    ]}
                  >
                    <Feather
                      name={prayer.icon}
                      size={24}
                      color={isNext ? colors.secondary : colors.primary}
                    />
                  </View>
                  <View style={styles.prayerNameTime}>
                    <Text
                      style={[
                        styles.prayerName,
                        { color: colors.text },
                        isNext && [
                          styles.nextPrayerText,
                          { color: colors.primary },
                        ],
                      ]}
                    >
                      {prayer.name}
                    </Text>
                    <Text
                      style={[
                        styles.prayerSchedule,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {prayer.formattedTime}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.prayerStatus,
                      { backgroundColor: statusStyle.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusStyle.color }]}
                    >
                      {statusStyle.text}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Recent Audios */}
        <View
          style={[
            styles.recentAudiosContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Audios
            </Text>
            <TouchableOpacity onPress={navigateToAudios}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentAudiosScroll}
          >
            <TouchableOpacity
              style={[
                styles.audioCard,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() =>
                navigation.navigate("NowPlayingScreen", {
                  reciterId: 1,
                  surahId: 1,
                })
              }
            >
              <View
                style={[
                  styles.reciterImageContainer,
                  { backgroundColor: colors.primaryTransparent },
                ]}
              >
                <Image
                  source={{
                    uri: "https://placeholder-images.com/reciters/misharyRashid",
                  }}
                  style={styles.reciterImage}
                />
              </View>
              <View style={styles.audioInfo}>
                <Text style={[styles.reciterName, { color: colors.text }]}>
                  Mishary Rashid
                </Text>
                <Text
                  style={[styles.surahName, { color: colors.textSecondary }]}
                >
                  Surah Al-Fatiha
                </Text>
              </View>
              <Ionicons name="play-circle" size={24} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.audioCard,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() =>
                navigation.navigate("AudioPlayer", { reciterId: 2, surahId: 2 })
              }
            >
              <View
                style={[
                  styles.reciterImageContainer,
                  { backgroundColor: colors.primaryTransparent },
                ]}
              >
                <Image
                  source={{
                    uri: "https://placeholder-images.com/reciters/abdulRahman",
                  }}
                  style={styles.reciterImage}
                />
              </View>
              <View style={styles.audioInfo}>
                <Text style={[styles.reciterName, { color: colors.text }]}>
                  Abdul Rahman
                </Text>
                <Text
                  style={[styles.surahName, { color: colors.textSecondary }]}
                >
                  Surah Al-Baqarah
                </Text>
              </View>
              <Ionicons name="play-circle" size={24} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.audioCard,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() =>
                navigation.navigate("AudioPlayer", {
                  reciterId: 3,
                  surahId: 36,
                })
              }
            >
              <View
                style={[
                  styles.reciterImageContainer,
                  { backgroundColor: colors.primaryTransparent },
                ]}
              >
                <Image
                  source={{
                    uri: "https://placeholder-images.com/reciters/maherMuaiqly",
                  }}
                  style={styles.reciterImage}
                />
              </View>
              <View style={styles.audioInfo}>
                <Text style={[styles.reciterName, { color: colors.text }]}>
                  Maher Al Muaiqly
                </Text>
                <Text
                  style={[styles.surahName, { color: colors.textSecondary }]}
                >
                  Surah Yasin
                </Text>
              </View>
              <Ionicons name="play-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  islamicDate: {
    fontSize: 16,
    fontWeight: "500",
  },
  location: {
    fontSize: 14,
    opacity: 0.8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 8,
  },
  searchResultsContainer: {
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  searchResultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchResultSurah: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchResultText: {
    fontSize: 14,
    marginTop: 2,
  },
  searchingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: "center",
  },
  viewMoreButton: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  timeDisplay: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  timeInfo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  prayerTimesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  prayerTimeItem: {
    alignItems: "center",
  },
  prayerTimeLabel: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 2,
  },
  prayerTimeValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  indicator: {
    alignItems: "center",
    marginTop: 16,
  },
  indicatorDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  // Favorites Section
  favoritesSection: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  favoritesContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  favoriteChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  favoriteChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Continue Listening Section
  continueListeningSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  continueListeningCard: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  surahThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  continueListeningInfo: {
    flex: 1,
  },
  continueListeningTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueListeningSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // Features Section
  featuresSection: {
    padding: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureButton: {
    width: "18%",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  // Daily Prayers Section - Enhanced
  dailyPrayersSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "500",
  },
  prayersListContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  enhancedPrayerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  nextPrayerItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
  },
  prayerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  prayerNameTime: {
    flex: 1,
    marginLeft: 8,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  nextPrayerText: {
    fontWeight: "700",
  },
  prayerSchedule: {
    fontSize: 14,
  },
  prayerStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Recent Audios Section
  recentAudiosContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  recentAudiosScroll: {
    paddingBottom: 16,
  },
  audioCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginRight: 16,
    width: 280,
  },
  reciterImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 16,
  },
  reciterImage: {
    width: "100%",
    height: "100%",
  },
  audioInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  surahName: {
    fontSize: 14,
  },
  circleContainer: {
    position: "relative",
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderWidth: 2,
  },
  fullCircle: {
    position: "absolute",
    width: "96%",
    height: "96%",
    borderRadius: 50,
    top: "2%",
    left: "2%",
  },
  whiteOverlay: {
    position: "absolute",
    width: "200%",
    height: "200%",
    left: "-50%",
    top: "-50%",
    borderRadius: 999,
    zIndex: 2,
  },
  contentCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  nextPrayerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  countdownTime: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
