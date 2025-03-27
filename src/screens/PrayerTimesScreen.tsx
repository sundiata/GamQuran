import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getPrayerTimes } from '../services/api';

interface PrayerTime {
  [key: string]: string;
}

const PrayerTimesScreen: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');

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
      hour12: false 
    }));
    setCurrentDate(now.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    // TODO: Implement proper Hijri date conversion
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

  const getPrayerIcon = (prayerName: string) => {
    switch (prayerName.toLowerCase()) {
      case 'imsak':
        return 'moon-outline';
      case 'fajr':
        return 'sunny-outline';
      case 'sunrise':
        return 'sunny-outline';
      case 'dhuhr':
        return 'sunny-outline';
      case 'asr':
        return 'partly-sunny-outline';
      case 'maghrib':
        return 'moon-outline';
      case 'isha':
        return 'moon-outline';
      default:
        return 'time-outline';
    }
  };

  const renderPrayerTime = (name: string, time: string) => (
    <View style={styles.prayerItem}>
      <View style={styles.prayerInfo}>
        <Ionicons name={getPrayerIcon(name)} size={24} color={COLORS.text} />
        <Text style={styles.prayerName}>{name}</Text>
      </View>
      <View style={styles.timeSection}>
        <Text style={styles.prayerTime}>{time}</Text>
        <TouchableOpacity style={styles.reminderButton}>
          <Text style={styles.reminderText}>Reminder Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView 
        style={styles.safeAreaHeader}
        edges={['top']}
      >
        <LinearGradient
          colors={[COLORS.primary, `${COLORS.primary}80`]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.location}>Gambia, Kanifing Layout</Text>
            <Text style={styles.currentTime}>{currentTime}</Text>
            <Text style={styles.nextPrayer}>Maghrib less than 05:23</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.dateSection}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.dateInfo}>
              <Text style={styles.gregorianDate}>{currentDate}</Text>
              <Text style={styles.hijriDate}>{hijriDate}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.prayerList}>
            {prayerTimes && (
              <>
                {renderPrayerTime('Imsak', prayerTimes.Imsak)}
                {renderPrayerTime('Subuh', prayerTimes.Fajr)}
                {renderPrayerTime('Fajr', '05:07')}
                {renderPrayerTime('Dhuha', '06:00')}
                {renderPrayerTime('Dzuhur', prayerTimes.Dhuhr)}
                {renderPrayerTime('Ashar', prayerTimes.Asr)}
                {renderPrayerTime('Maghrib', prayerTimes.Maghrib)}
                {renderPrayerTime('Isya', prayerTimes.Isha)}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeAreaHeader: {
    backgroundColor: COLORS.primary,
  },
  headerGradient: {
    borderBottomLeftRadius: SIZES.radius * 2,
    borderBottomRightRadius: SIZES.radius * 2,
    ...SHADOWS.medium,
  },
  headerContent: {
    padding: SIZES.padding * 2,
    paddingTop: SIZES.padding,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  location: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    opacity: 0.9,
  },
  currentTime: {
    fontSize: SIZES.extraLarge * 2,
    fontWeight: 'bold',
    color: COLORS.background,
    marginVertical: SIZES.padding,
  },
  nextPrayer: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    opacity: 0.9,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  dateInfo: {
    alignItems: 'center',
  },
  gregorianDate: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  hijriDate: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  prayerList: {
    backgroundColor: COLORS.background,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.padding,
  },
  prayerName: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  timeSection: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  reminderButton: {
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
  },
  reminderText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default PrayerTimesScreen;
