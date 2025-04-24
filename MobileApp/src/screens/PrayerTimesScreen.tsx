import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { getPrayerTimes } from '../services/api';

interface PrayerTime {
  [key: string]: string;
}

const { width } = Dimensions.get('window');

const PrayerTimesScreen: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [nextPrayer, setNextPrayer] = useState({ name: 'Fajr', time: '05:00', remaining: '2h 30m' });

  useEffect(() => {
    fetchPrayerTimes();
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }));
    setCurrentDate(now.toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    setHijriDate('28 Rabi\'ul awal, 1445 H');
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

  const prayers = [
    { id: 1, name: 'Fajr', time: '05:00', icon: 'sunrise' as const },
    { id: 2, name: 'Sunrise', time: '06:30', icon: 'sun' as const },
    { id: 3, name: 'Dhuhr', time: '12:30', icon: 'sun' as const },
    { id: 4, name: 'Asr', time: '15:45', icon: 'sun' as const },
    { id: 5, name: 'Maghrib', time: '18:15', icon: 'sunset' as const },
    { id: 6, name: 'Isha', time: '19:45', icon: 'moon' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.location}>Gambia, Kanifing Layout</Text>
            <Text style={styles.date}>{currentDate}</Text>
            <Text style={styles.hijriDate}>{hijriDate}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Prayer Card */}
      <View style={styles.nextPrayerCard}>
        <View style={styles.nextPrayerContent}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          <Text style={styles.remainingTime}>Remaining Time: {nextPrayer.remaining}</Text>
        </View>
      </View>

      {/* Prayer Times List */}
      <ScrollView style={styles.prayerList} showsVerticalScrollIndicator={false}>
        {prayers.map((prayer) => (
          <View key={prayer.id} style={styles.prayerItem}>
            <View style={styles.prayerItemLeft}>
              <View style={styles.iconContainer}>
                <Feather name={prayer.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.prayerInfo}>
                <Text style={styles.prayerName}>{prayer.name}</Text>
                <Text style={styles.prayerTime}>{prayer.time}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons 
                name="notifications-outline" 
                size={22} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  location: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.background,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: 2,
  },
  hijriDate: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPrayerCard: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  nextPrayerContent: {
    padding: 20,
    alignItems: 'center',
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.background,
    marginBottom: 4,
  },
  nextPrayerTime: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: 8,
  },
  remainingTime: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.9,
  },
  prayerList: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  prayerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  prayerInfo: {
    flex: 1,
    marginRight: 12,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PrayerTimesScreen;
