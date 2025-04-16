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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { PLACEHOLDER_IMAGES } from "../constants/images";
import { Ionicons, Feather } from "@expo/vector-icons";
import { fetchIslamicDate } from "../services/api";

// Prayer times data (in a real app, this would come from an API)
const PRAYER_TIMES = {
  fajr: { hour: 4, minute: 41 },
  sunrise: { hour: 6, minute: 45 },
  dhuhr: { hour: 12, minute: 0 },
  asr: { hour: 15, minute: 14 },
  maghrib: { hour: 18, minute: 2 },
  isha: { hour: 19, minute: 11 },
};

// Helper function to get the next prayer
const getNextPrayer = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const prayers = [
    {
      name: "Fajr",
      time: PRAYER_TIMES.fajr.hour * 60 + PRAYER_TIMES.fajr.minute,
    },
    {
      name: "Sunrise",
      time: PRAYER_TIMES.sunrise.hour * 60 + PRAYER_TIMES.sunrise.minute,
    },
    {
      name: "Dhuhr",
      time: PRAYER_TIMES.dhuhr.hour * 60 + PRAYER_TIMES.dhuhr.minute,
    },
    { name: "Asr", time: PRAYER_TIMES.asr.hour * 60 + PRAYER_TIMES.asr.minute },
    {
      name: "Maghrib",
      time: PRAYER_TIMES.maghrib.hour * 60 + PRAYER_TIMES.maghrib.minute,
    },
    {
      name: "Isha",
      time: PRAYER_TIMES.isha.hour * 60 + PRAYER_TIMES.isha.minute,
    },
  ];

  // Find the next prayer
  for (const prayer of prayers) {
    if (prayer.time > currentTimeInMinutes) {
      return {
        name: prayer.name,
        timeInMinutes: prayer.time,
        hour: Math.floor(prayer.time / 60),
        minute: prayer.time % 60,
      };
    }
  }

  // If all prayers for today have passed, return Fajr for tomorrow
  return {
    name: "Fajr",
    timeInMinutes: prayers[0].time + 24 * 60, // Add 24 hours
    hour: PRAYER_TIMES.fajr.hour,
    minute: PRAYER_TIMES.fajr.minute,
    tomorrow: true,
  };
};

// Helper function to format time
const formatTime = (hour, minute) => {
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

export default function HomeScreen({ navigation }) {
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
  const [location, setLocation] = useState("Jakarta, Indonesia");
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

        // Initialize prayer times with mock data
        initializeWithMockData();
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

  // Initialize with mock data
  const initializeWithMockData = () => {
    // Set mock prayer times
    const mockPrayerTimes = [
      { name: "Fajr", time: PRAYER_TIMES.fajr, icon: "sunrise" },
      { name: "Dhuhr", time: PRAYER_TIMES.dhuhr, icon: "sun" },
      { name: "Asr", time: PRAYER_TIMES.asr, icon: "sun" },
      { name: "Maghrib", time: PRAYER_TIMES.maghrib, icon: "sunset" },
      { name: "Isha", time: PRAYER_TIMES.isha, icon: "moon" },
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
    // In a real app with proper navigation setup, you would use:
    // navigation.navigate('PrayerTimes', { prayerTimes });

    // For now, just show an alert to avoid navigation errors
    Alert.alert(
      "Navigation",
      "This would navigate to the Prayer Times screen in a complete app.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  // Navigate to audio page
  const navigateToAudios = () => {
    // In a real app with proper navigation setup, you would use:
    // navigation.navigate('Audios');

    // For now, just show an alert to avoid navigation errors
    Alert.alert(
      "Navigation",
      "This would navigate to the Audios screen in a complete app.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const renderCountdownCircle = () => {
    const rotation = progress * 360;

    return (
      <View style={styles.circleContainer}>
        <View style={[styles.outerCircle, { borderColor: COLORS.secondary }]}>
          {/* Progress circle */}
          <View style={styles.fullCircle} />
          {/* White overlay */}
          <View
            style={[
              styles.whiteOverlay,
              {
                transform: [
                  { rotateZ: "-90deg" },
                  { rotateZ: `${rotation}deg` },
                ],
              },
            ]}
          />
          {/* Inner white circle with content */}
          <View style={styles.contentCircle}>
            <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
            <Text style={styles.countdownTime}>{countdown}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFeatureButton = (icon, label, onPress) => (
    <TouchableOpacity
      style={styles.featureButton}
      onPress={() => {
        Alert.alert(
          "Feature Navigation",
          `This would navigate to the ${label} screen in a complete app.`,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }}
    >
      <View style={styles.featureIconContainer}>{icon}</View>
      <Text style={styles.featureLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const getPrayerStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: `${COLORS.prayerCompleted}20`,
          color: COLORS.prayerCompleted,
          text: "Completed",
        };
      case "next":
        return {
          backgroundColor: `${COLORS.prayerNext}30`,
          color: COLORS.prayerNext,
          text: "Next",
        };
      default:
        return {
          backgroundColor: `${COLORS.prayerPending}20`,
          color: COLORS.prayerPending,
          text: "Pending",
        };
    }
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchQuery.length < 3) return null;

    if (isSearching) {
      return (
        <View style={styles.searchResultsContainer}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.length >= 3) {
      return (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.searchResultsTitle}>Search Results</Text>
        {searchResults.slice(0, 5).map((result, index) => (
          <TouchableOpacity key={index} style={styles.searchResultItem}>
            <Text style={styles.searchResultSurah}>
              {result.surahNumber}. {result.surahName} - Verse{" "}
              {result.verseNumber}
            </Text>
            <Text style={styles.searchResultText} numberOfLines={2}>
              {result.text}
            </Text>
          </TouchableOpacity>
        ))}
        {searchResults.length > 5 && (
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View more results</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.headerBackground}
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.headerBackground}
      />

      {/* Header with Search */}
      <View style={styles.header}>
        {/* Top Header Row */}
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.islamicDate}>{islamicDate}</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
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
                color={COLORS.textLight}
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
        <View style={styles.timeDisplay}>
          <Text style={styles.currentTime}>{currentTime}</Text>
          <Text style={styles.timeInfo}>
            {nextPrayer.name} · {countdown} left
          </Text>

          {/* Prayer Times Row */}
          <View style={styles.prayerTimesRow}>
            {prayerTimes.map((prayer, index) => (
              <View key={index} style={styles.prayerTimeItem}>
                <Feather
                  name={prayer.icon}
                  size={20}
                  color={COLORS.textLight}
                />
                <Text style={styles.prayerTimeLabel}>{prayer.name}</Text>
                <Text style={styles.prayerTimeValue}>
                  {prayer.formattedTime}
                </Text>
              </View>
            ))}
          </View>

          {/* Indicator */}
          <View style={styles.indicator}>
            <View style={styles.indicatorDot} />
          </View>
        </View>

        {/* All Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>All Features</Text>
          <View style={styles.featuresGrid}>
            {renderFeatureButton(
              <Ionicons
                name="book-outline"
                size={24}
                color={COLORS.textLight}
              />,
              "Quran",
              () => Alert.alert("Navigation", "Navigating to Quran screen.")
            )}
            {renderFeatureButton(
              <Ionicons
                name="volume-high-outline"
                size={24}
                color={COLORS.textLight}
              />,
              "Adzan",
              () => Alert.alert("Navigation", "Navigating to Adhan screen.")
            )}
            {renderFeatureButton(
              <Ionicons
                name="compass-outline"
                size={24}
                color={COLORS.textLight}
              />,
              "Qibla",
              () => Alert.alert("Navigation", "Navigating to Qibla screen.")
            )}
            {renderFeatureButton(
              <Ionicons
                name="heart-outline"
                size={24}
                color={COLORS.textLight}
              />,
              "Donation",
              () => Alert.alert("Navigation", "Navigating to Donation screen.")
            )}
            {renderFeatureButton(
              <Ionicons
                name="grid-outline"
                size={24}
                color={COLORS.textLight}
              />,
              "All",
              () => Alert.alert("Navigation", "Navigating to All screen.")
            )}
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.favoritesSection}>
          <Text style={styles.sectionLabel}>Favourites</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesContainer}
          >
            <TouchableOpacity style={styles.favoriteChip}>
              <Text style={styles.favoriteChipText}>67. Al-Mulk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteChip}>
              <Text style={styles.favoriteChipText}>2. Al-Baqarah</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteChip}>
              <Text style={styles.favoriteChipText}>19. Maryam</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Continue Listening */}
        <View style={styles.continueListeningSection}>
          <Text style={styles.sectionTitle}>Continue Listening</Text>
          <TouchableOpacity style={styles.continueListeningCard}>
            <Image
              source={{ uri: PLACEHOLDER_IMAGES.surahs.alBaqarah }}
              style={styles.surahThumbnail}
            />
            <View style={styles.continueListeningInfo}>
              <Text style={styles.continueListeningTitle}>2. Al-Baqarah</Text>
              <Text style={styles.continueListeningSubtitle}>The Cow</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "22%" }]} />
                </View>
                <Text style={styles.progressText}>18:00/88:00</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Daily Prayers - Enhanced */}
        <View style={styles.dailyPrayersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Prayers</Text>
            <TouchableOpacity onPress={navigateToPrayerTimes}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.prayersListContainer}>
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
                    animatedStyle,
                  ]}
                >
                  <View style={styles.prayerIconContainer}>
                    <Feather
                      name={prayer.icon}
                      size={24}
                      color={isNext ? COLORS.secondary : COLORS.primary}
                    />
                  </View>
                  <View style={styles.prayerNameTime}>
                    <Text
                      style={[
                        styles.prayerName,
                        isNext && styles.nextPrayerText,
                      ]}
                    >
                      {prayer.name}
                    </Text>
                    <Text style={styles.prayerSchedule}>
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
        <View style={styles.recentAudiosContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Audios</Text>
            <TouchableOpacity onPress={navigateToAudios}>
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentAudiosScroll}
          >
            <TouchableOpacity style={styles.audioCard}>
              <View style={styles.reciterImageContainer}>
                <Image
                  source={{ uri: PLACEHOLDER_IMAGES.reciters.misharyRashid }}
                  style={styles.reciterImage}
                />
              </View>
              <View style={styles.audioInfo}>
                <Text style={styles.reciterName}>Mishary Rashid</Text>
                <Text style={styles.surahName}>Surah Al-Fatiha</Text>
              </View>
              <Ionicons name="play-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.audioCard}>
              <View style={styles.reciterImageContainer}>
                <Image
                  source={{ uri: PLACEHOLDER_IMAGES.reciters.abdulRahman }}
                  style={styles.reciterImage}
                />
              </View>
              <View style={styles.audioInfo}>
                <Text style={styles.reciterName}>Abdul Rahman</Text>
                <Text style={styles.surahName}>Surah Al-Baqarah</Text>
              </View>
              <Ionicons name="play-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.audioCard}>
              <View style={styles.reciterImageContainer}>
                <Image
                  source={{ uri: PLACEHOLDER_IMAGES.reciters.maherMuaiqly }}
                  style={styles.reciterImage}
                />
              </View>
              <View style={styles.audioInfo}>
                <Text style={styles.reciterName}>Maher Al Muaiqly</Text>
                <Text style={styles.surahName}>Surah Yasin</Text>
              </View>
              <Ionicons name="play-circle" size={24} color={COLORS.primary} />
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
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.padding,
    color: COLORS.primary,
    fontSize: SIZES.medium,
  },
  header: {
    backgroundColor: COLORS.headerBackground,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  islamicDate: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.textLight,
  },
  location: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
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
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.textLight,
    fontSize: SIZES.medium,
  },
  clearSearchButton: {
    padding: SIZES.base,
  },
  searchResultsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  searchResultsTitle: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  searchResultItem: {
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  searchResultSurah: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.primary,
  },
  searchResultText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchingText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SIZES.base,
  },
  noResultsText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  viewMoreButton: {
    alignItems: "center",
    paddingVertical: SIZES.base,
    marginTop: SIZES.base,
  },
  viewMoreText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  timeDisplay: {
    backgroundColor: COLORS.headerBackground,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
    borderBottomLeftRadius: SIZES.radius * 2,
    borderBottomRightRadius: SIZES.radius * 2,
    ...SHADOWS.medium,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SIZES.padding,
  },
  timeInfo: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: SIZES.padding,
  },
  prayerTimesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.padding,
  },
  prayerTimeItem: {
    alignItems: "center",
  },
  prayerTimeLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 2,
  },
  prayerTimeValue: {
    fontSize: SIZES.small,
    fontWeight: "500",
    color: COLORS.textLight,
  },
  indicator: {
    alignItems: "center",
    marginTop: SIZES.padding,
  },
  indicatorDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
  // Favorites Section
  favoritesSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  sectionLabel: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  favoritesContainer: {
    flexDirection: "row",
    paddingVertical: SIZES.base,
  },
  favoriteChip: {
    backgroundColor: COLORS.primaryTransparent,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: 20,
    marginRight: SIZES.base,
  },
  favoriteChipText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: "500",
  },
  // Continue Listening Section
  continueListeningSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  continueListeningCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginVertical: SIZES.base,
    alignItems: "center",
    ...SHADOWS.light,
  },
  surahThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SIZES.base,
    backgroundColor: COLORS.primaryTransparent,
  },
  continueListeningInfo: {
    flex: 1,
  },
  continueListeningTitle: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
  continueListeningSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
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
    marginRight: SIZES.base,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryTransparent,
    justifyContent: "center",
    alignItems: "center",
  },
  // Features Section
  featuresSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureButton: {
    width: "18%",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...SHADOWS.light,
  },
  featureLabel: {
    fontSize: SIZES.small,
    color: COLORS.text,
    textAlign: "center",
  },
  // Daily Prayers Section - Enhanced
  dailyPrayersSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  viewAllText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: "500",
  },
  prayersListContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  enhancedPrayerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  nextPrayerItem: {
    backgroundColor: `${COLORS.secondary}10`,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  prayerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base,
  },
  prayerNameTime: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  prayerName: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  nextPrayerText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  prayerSchedule: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  prayerStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius / 2,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: "500",
  },
  // Recent Audios Section
  recentAudiosContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  recentAudiosScroll: {
    paddingBottom: SIZES.padding,
  },
  audioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
    width: 280,
    ...SHADOWS.light,
  },
  reciterImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: SIZES.padding,
    backgroundColor: COLORS.primaryTransparent,
  },
  reciterImage: {
    width: "100%",
    height: "100%",
  },
  audioInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  surahName: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.secondary,
    top: "2%",
    left: "2%",
  },
  whiteOverlay: {
    position: "absolute",
    width: "200%",
    height: "200%",
    backgroundColor: COLORS.background,
    left: "-50%",
    top: "-50%",
    borderRadius: 999,
    zIndex: 2,
  },
  contentCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  nextPrayerName: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  countdownTime: {
    fontSize: SIZES.small,
    fontWeight: "500",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
});
