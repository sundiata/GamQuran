import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { getPrayerTimes } from '../services/api';

interface PrayerTime {
  [key: string]: string;
}

const HomeScreen = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('00:13:30');
  const [nextPrayer, setNextPrayer] = useState('Dhuhr');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchPrayerTimes();
    startCountdown();
  }, []);

  const startCountdown = () => {
    const updateCountdown = () => {
      const now = new Date();
      const targetTime = new Date();
      
      // Set target time to next Dhuhr (example: 13:30)
      targetTime.setHours(13, 30, 0, 0);
      
      // If target time has passed today, set for tomorrow
      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const timeDiff = targetTime.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      // Format countdown string without negative sign
      const timeLeft = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setCountdown(timeLeft);
      
      // Calculate progress (1 = complete, 0 = just started)
      const totalSecondsLeft = hours * 3600 + minutes * 60 + seconds;
      const totalDuration = 24 * 3600; // 24 hours in seconds
      const newProgress = 1 - (totalSecondsLeft / totalDuration);
      setProgress(newProgress);
    };

    // Update immediately
    updateCountdown();
    
    // Update every second but avoid setState on unmounted component
    let mounted = true;
    const timer = setInterval(() => {
      if (mounted) {
        updateCountdown();
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  };

  const fetchPrayerTimes = async () => {
    try {
      const times = await getPrayerTimes();
      setPrayerTimes(times);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGoalItem = (label: string, progress: string, color: string) => (
    <View style={styles.goalItem}>
      <Text style={styles.goalText}>{progress} {label}</Text>
      <View style={[styles.progressDot, { backgroundColor: color }]} />
    </View>
  );

  const renderCountdownCircle = () => {
    const rotation = progress * 360;
    
    // Calculate the border color based on progress
    const calculateBorderColor = () => {
      // Convert hex to RGB for interpolation
      const r = Math.round(lerp(0, 224, progress)); // From 0 to E0
      const g = Math.round(lerp(200, 224, progress)); // From C8 to E0
      const b = Math.round(lerp(83, 224, progress)); // From 53 to E0
      return `rgb(${r}, ${g}, ${b})`;
    };

    return (
      <View style={styles.nextPrayerCard}>
        <View style={styles.circleContainer}>
          <View style={[styles.outerCircle, { borderColor: calculateBorderColor() }]}>
            {/* Green circle */}
            <View style={styles.fullCircle} />
            {/* White overlay */}
            <View style={[styles.whiteOverlay, {
              transform: [
                { rotateZ: '-90deg' },
                { rotateZ: `${rotation}deg` }
              ]
            }]} />
            {/* Inner white circle with content */}
            <View style={styles.contentCircle}>
              <Text style={styles.nextPrayerName}>{nextPrayer}</Text>
              <Text style={styles.countdownTime}>{countdown}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Add linear interpolation helper function at the top of the component
  const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.location}>Maintal</Text>
            <View style={styles.headerIcons}>
              {/* <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="diamond-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="person-outline" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.date}>26 Ramadan, 1446</Text>
        </View>

        {/* Sunrise Card */}
        <View style={styles.sunriseCard}>
          <View style={styles.cardContent}>
            <View style={styles.sunriseInfo}>
              <Text style={styles.sunriseTitle}>Sunrise</Text>
              <Text style={styles.sunriseTime}>6:14 AM</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All prayers</Text>
              </TouchableOpacity>
            </View>
            {renderCountdownCircle()}
          </View>
        </View>

        {/* Prayer Times Bar */}
        <View style={styles.prayerBar}>
          <View style={styles.prayerTime}>
            <Text style={styles.prayerLabel}>Fajr</Text>
            <Text style={styles.prayerTimeText}>4:21 AM</Text>
          </View>
          <View style={styles.moonIcon}>
            <Ionicons name="moon-outline" size={24} color={COLORS.background} />
          </View>
          <View style={styles.prayerTime}>
            <Text style={styles.prayerLabel}>Iftar</Text>
            <Text style={styles.prayerTimeText}>6:48 PM</Text>
          </View>
        </View>

        {/* Daily Goals - Prayer Times List */}
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>Daily Prayers</Text>
          <View style={styles.prayersList}>
            <View style={styles.prayerItem}>
              <View style={styles.prayerNameTime}>
                <Text style={styles.prayerName}>Fajr</Text>
                <Text style={styles.prayerSchedule}>4:21 AM</Text>
              </View>
              <View style={[styles.prayerStatus, styles.prayerPending]}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            </View>

            <View style={styles.prayerItem}>
              <View style={styles.prayerNameTime}>
                <Text style={styles.prayerName}>Dhuhr</Text>
                <Text style={styles.prayerSchedule}>1:30 PM</Text>
              </View>
              <View style={[styles.prayerStatus, styles.prayerNext]}>
                <Text style={styles.statusText}>Next</Text>
              </View>
            </View>

            <View style={styles.prayerItem}>
              <View style={styles.prayerNameTime}>
                <Text style={styles.prayerName}>Asr</Text>
                <Text style={styles.prayerSchedule}>4:45 PM</Text>
              </View>
              <View style={[styles.prayerStatus, styles.prayerPending]}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            </View>

            <View style={styles.prayerItem}>
              <View style={styles.prayerNameTime}>
                <Text style={styles.prayerName}>Maghrib</Text>
                <Text style={styles.prayerSchedule}>6:48 PM</Text>
              </View>
              <View style={[styles.prayerStatus, styles.prayerPending]}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            </View>

            <View style={styles.prayerItem}>
              <View style={styles.prayerNameTime}>
                <Text style={styles.prayerName}>Isha</Text>
                <Text style={styles.prayerSchedule}>8:15 PM</Text>
              </View>
              <View style={[styles.prayerStatus, styles.prayerPending]}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Audios */}
        <View style={styles.recentAudiosContainer}>
          <Text style={styles.sectionTitle}>Recent Audios</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentAudiosScroll}
          >
            <TouchableOpacity style={styles.audioCard}>
              <View style={styles.reciterImageContainer}>
                <Image 
                  source={{ uri: 'https://i.imgur.com/7kPpBQH.jpg' }} 
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
                  source={{ uri: 'https://i.imgur.com/QYkJwkH.jpg' }} 
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
                  source={{ uri: 'https://i.imgur.com/L8UeEsy.jpg' }} 
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
  bottom: 40,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 1.5,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.textSecondary}10`,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base * 1.5,
  },
  location: {
    fontSize: SIZES.extraLarge * 1.2,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  iconButton: {
    padding: SIZES.base,
    backgroundColor: `${COLORS.textSecondary}10`,
    borderRadius: SIZES.radius,
  },
  date: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  sunriseCard: {
    width: '90%',
    alignSelf: 'center', 
    bottom: 60,
    marginHorizontal: SIZES.padding * 2,
    marginVertical: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sunriseInfo: {
    flex: 1,
  },
  sunriseTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  sunriseTime: {
    fontSize: SIZES.extraLarge * 1.2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  viewAllButton: {
    backgroundColor: `${COLORS.background}20`,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontWeight: '500',
  },
  prayerBar: {
    width: '90%',
    alignSelf: 'center', 
    bottom: 60,
    marginHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerTime: {
    flex: 1,
    alignItems: 'center',
  },
  prayerLabel: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.background,
    marginBottom: SIZES.base / 2,
  },
  prayerTimeText: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.background,
  },
  moonIcon: {
    backgroundColor: `${COLORS.background}20`,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
  },
  goalsContainer: {
    marginHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.padding * 2,
    bottom: 60,
    width: '90%',
    alignSelf: 'center', 
  },
  goalsTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  prayersList: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.textSecondary}20`,
  },
  prayerNameTime: {
    flex: 1,
  },
  prayerName: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  prayerSchedule: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  prayerStatus: {
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.radius / 2,
    marginLeft: SIZES.base,
  },
  prayerPending: {
    backgroundColor: `${COLORS.primary}20`,
  },
  prayerNext: {
    backgroundColor: COLORS.secondary,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.primary,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  goalText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextPrayerCard: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
  },
  fullCircle: {
    position: 'absolute',
    width: '96%',
    height: '96%',
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    top: '2%',
    left: '2%',
  },
  whiteOverlay: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    backgroundColor: COLORS.background,
    left: '-50%',
    top: '-50%',
    borderRadius: 999,
    zIndex: 2,
  },
  contentCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  nextPrayerName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  countdownTime: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  recentAudiosContainer: {
    paddingTop: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  recentAudiosScroll: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
    width: 280,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reciterImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: SIZES.padding,
  },
  reciterImage: {
    width: '100%',
    height: '100%',
  },
  audioInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  surahName: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
