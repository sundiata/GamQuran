"use client";

import { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SIZES } from "../constants/theme";
import { PLACEHOLDER_IMAGES } from "../constants/images";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// Prayer times data (in a real app, this would come from an API)
const PRAYER_TIMES = {
  fajr: { hour: 5, minute: 15 },
  sunrise: { hour: 6, minute: 45 },
  dhuhr: { hour: 13, minute: 30 },
  asr: { hour: 14, minute: 45 },
  maghrib: { hour: 19, minute: 25 },
  isha: { hour: 20, minute: 25 },
};

// Helper function to convert Gregorian to Hijri date
const getHijriDate = () => {
  // This is a simplified conversion - in a real app, use a proper Hijri calendar library
  const today = new Date();
  const gregorianYear = today.getFullYear();
  const gregorianMonth = today.getMonth();
  const gregorianDay = today.getDate();

  // Approximate conversion (this is not accurate, just for demonstration)
  // In a real app, use a proper Hijri calendar library like hijri-date or moment-hijri
  const hijriYear = Math.floor(
    gregorianYear - 622 + (gregorianYear - 622) / 32
  );
  const hijriMonth = (gregorianMonth + 1) % 12; // Simplified
  const hijriDay = gregorianDay; // Simplified

  // Month names in Arabic
  const hijriMonths = [
    "Muharram",
    "Safar",
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    "Jumada al-Awwal",
    "Jumada al-Thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ];

  return `${hijriDay} ${hijriMonths[hijriMonth]} ${hijriYear} H`;
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

export default function HomeScreen() {
  // Use the theme context
  const { colors, shadows, isDarkMode } = useTheme();

  const [currentTime, setCurrentTime] = useState("");
  const [countdown, setCountdown] = useState("00:00:00");
  const [nextPrayer, setNextPrayer] = useState({
    name: "Fajr",
    hour: 5,
    minute: 15,
  });
  const [progress, setProgress] = useState(0);
  const [islamicDate, setIslamicDate] = useState("");
  const [location, setLocation] = useState("Salaji, Gambia");
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [prayerStatuses, setPrayerStatuses] = useState({});
  const [animation] = useState(new Animated.Value(0));

  // Initialize and update time-related states
  useEffect(() => {
    // Set Islamic date
    setIslamicDate(getHijriDate());

    // Get user's location (in a real app, use Geolocation API)
    // For demo, we'll use the hardcoded location

    // Initialize prayer times and statuses
    updatePrayerTimesAndStatuses();

    // Start timers
    const timeInterval = setInterval(() => {
      updateCurrentTime();
      updatePrayerTimesAndStatuses();
    }, 1000);

    // Start animation
    startAnimation();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

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

    // Get next prayer
    const next = getNextPrayer();
    setNextPrayer(next);

    // Calculate countdown to next prayer
    const nextPrayerTimeInMinutes = next.timeInMinutes;
    const currentTimeInMinutes = hours * 60 + minutes;
    let timeDiffInMinutes = nextPrayerTimeInMinutes - currentTimeInMinutes;

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
    // Assuming the total duration between prayers is 5 hours (300 minutes) on average
    const totalDuration = 300;
    const newProgress = 1 - timeDiffInMinutes / totalDuration;
    setProgress(Math.min(Math.max(newProgress, 0), 1));
  };

  // Update prayer times and statuses
  const updatePrayerTimesAndStatuses = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const prayers = [
      { name: "Fajr", time: PRAYER_TIMES.fajr, icon: "sunrise" },
      { name: "Dhuhr", time: PRAYER_TIMES.dhuhr, icon: "sun" },
      { name: "Asr", time: PRAYER_TIMES.asr, icon: "sun" },
      { name: "Maghrib", time: PRAYER_TIMES.maghrib, icon: "sunset" },
      { name: "Isha", time: PRAYER_TIMES.isha, icon: "moon" },
    ];

    // Format prayer times and determine statuses
    const formattedPrayers = prayers.map((prayer) => {
      const timeInMinutes = prayer.time.hour * 60 + prayer.time.minute;
      const formattedTime = formatTime(prayer.time.hour, prayer.time.minute);

      let status = "pending";
      if (currentTimeInMinutes > timeInMinutes) {
        status = "completed";
      } else if (
        currentTimeInMinutes < timeInMinutes &&
        nextPrayer.name === prayer.name
      ) {
        status = "next";
      }

      return {
        ...prayer,
        formattedTime,
        timeInMinutes,
        status,
      };
    });

    setPrayerTimes(formattedPrayers);

    // Create status object for the daily prayers section
    const statuses = {};
    formattedPrayers.forEach((prayer) => {
      statuses[prayer.name.toLowerCase()] = prayer.status;
    });

    setPrayerStatuses(statuses);
  };

  const renderCountdownCircle = () => {
    const rotation = progress * 360;

    return (
      <View style={styles.circleContainer}>
        <View style={[styles.outerCircle, { borderColor: colors.primary }]}>
          {/* Progress circle */}
          <View
            style={[styles.fullCircle, { backgroundColor: colors.primary }]}
          />
          {/* White overlay */}
          <View
            style={[
              styles.whiteOverlay,
              {
                backgroundColor: colors.background,
                transform: [
                  { rotateZ: "-90deg" },
                  { rotateZ: `${rotation}deg` },
                ],
              },
            ]}
          />
          {/* Inner white circle with content */}
          <View
            style={[
              styles.contentCircle,
              { backgroundColor: colors.background },
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

  const renderFeatureButton = (icon, label) => (
    <TouchableOpacity style={styles.featureButton}>
      <View
        style={[
          styles.featureIconContainer,
          { backgroundColor: colors.tertiary },
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

      {/* Header with Audio Book and Search */}
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
          />
        </View>
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
              { backgroundColor: colors.cardBackground, ...shadows.light },
            ]}
          >
            <Image
              source={{ uri: PLACEHOLDER_IMAGES.surahs.alBaqarah }}
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
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.primary, width: "22%" },
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

        {/* Features Section */}
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
              "Quran"
            )}
            {renderFeatureButton(
              <Ionicons
                name="volume-high-outline"
                size={24}
                color={colors.textLight}
              />,
              "Adzan"
            )}
            {renderFeatureButton(
              <Ionicons
                name="compass-outline"
                size={24}
                color={colors.textLight}
              />,
              "Qibla"
            )}
            {renderFeatureButton(
              <Ionicons
                name="heart-outline"
                size={24}
                color={colors.textLight}
              />,
              "Donation"
            )}
            {renderFeatureButton(
              <Ionicons
                name="grid-outline"
                size={24}
                color={colors.textLight}
              />,
              "All"
            )}
          </View>
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
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.prayersListContainer,
              { backgroundColor: colors.cardBackground, ...shadows.medium },
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
                    {
                      backgroundColor: isNext
                        ? `${colors.primary}10`
                        : colors.cardBackground,
                      borderBottomColor: colors.divider,
                    },
                    isNext && {
                      borderLeftWidth: 3,
                      borderLeftColor: colors.primary,
                    },
                    animatedStyle,
                  ]}
                >
                  <View
                    style={[
                      styles.prayerIconContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.05)",
                      },
                    ]}
                  >
                    <Feather
                      name={prayer.icon}
                      size={24}
                      color={isNext ? colors.primary : colors.tertiary}
                    />
                  </View>
                  <View style={styles.prayerNameTime}>
                    <Text
                      style={[
                        styles.prayerName,
                        { color: colors.text },
                        isNext && { color: colors.primary, fontWeight: "700" },
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
            <TouchableOpacity>
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
                { backgroundColor: colors.cardBackground, ...shadows.light },
              ]}
            >
              <View
                style={[
                  styles.reciterImageContainer,
                  { backgroundColor: colors.primaryTransparent },
                ]}
              >
                <Image
                  source={{ uri: PLACEHOLDER_IMAGES.reciters.misharyRashid }}
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
                { backgroundColor: colors.cardBackground, ...shadows.light },
              ]}
            >
              <View
                style={[
                  styles.reciterImageContainer,
                  { backgroundColor: colors.primaryTransparent },
                ]}
              >
                <Image
                  source={{ uri: PLACEHOLDER_IMAGES.reciters.abdulRahman }}
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
                { backgroundColor: colors.cardBackground, ...shadows.light },
              ]}
            >
              <View
                style={[
                  styles.reciterImageContainer,
                  { backgroundColor: colors.primaryTransparent },
                ]}
              >
                <Image
                  source={{ uri: PLACEHOLDER_IMAGES.reciters.maherMuaiqly }}
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
  header: {
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
  },
  location: {
    fontSize: SIZES.small,
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
  audioBookTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    marginBottom: SIZES.base,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    marginBottom: SIZES.base,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: SIZES.medium,
  },
  scrollView: {
    flex: 1,
  },
  timeDisplay: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
    borderBottomLeftRadius: SIZES.radius * 2,
    borderBottomRightRadius: SIZES.radius * 2,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: SIZES.padding,
  },
  timeInfo: {
    fontSize: SIZES.medium,
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
    marginTop: 4,
    marginBottom: 2,
  },
  prayerTimeValue: {
    fontSize: SIZES.small,
    fontWeight: "500",
  },
  indicator: {
    alignItems: "center",
    marginTop: SIZES.padding,
  },
  indicatorDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  // Favorites Section
  favoritesSection: {
    padding: SIZES.padding,
  },
  sectionLabel: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    marginBottom: SIZES.base,
  },
  favoritesContainer: {
    flexDirection: "row",
    paddingVertical: SIZES.base,
  },
  favoriteChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: 20,
    marginRight: SIZES.base,
  },
  favoriteChipText: {
    fontSize: SIZES.small,
    fontWeight: "500",
  },
  // Continue Listening Section
  continueListeningSection: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "600",
    marginBottom: SIZES.base,
  },
  continueListeningCard: {
    flexDirection: "row",
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginVertical: SIZES.base,
    alignItems: "center",
  },
  surahThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SIZES.base,
  },
  continueListeningInfo: {
    flex: 1,
  },
  continueListeningTitle: {
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
  continueListeningSubtitle: {
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
    borderRadius: 2,
    marginRight: SIZES.base,
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
    padding: SIZES.padding,
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: SIZES.small,
    textAlign: "center",
  },
  // Daily Prayers Section - Enhanced
  dailyPrayersSection: {
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  viewAllText: {
    fontSize: SIZES.medium,
    fontWeight: "500",
  },
  prayersListContainer: {
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  enhancedPrayerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
  },
  prayerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
  },
  prayerSchedule: {
    fontSize: SIZES.small,
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
  },
  recentAudiosScroll: {
    paddingBottom: SIZES.padding,
  },
  audioCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
    width: 280,
  },
  reciterImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: SIZES.padding,
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
    marginBottom: 2,
  },
  surahName: {
    fontSize: SIZES.small,
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
    fontSize: SIZES.medium,
    fontWeight: "bold",
    marginBottom: 2,
  },
  countdownTime: {
    fontSize: SIZES.small,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
