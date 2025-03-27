import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getSurah, Surah } from '../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';

interface RouteParams {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  translation?: string;
  audio?: string;
}

const SurahDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { surahNumber, surahName, totalAyahs } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(true);
  const [arabicText, setArabicText] = useState<Ayah[]>([]);
  const [translation, setTranslation] = useState<Ayah[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);

  useEffect(() => {
    loadSurahContent();
    return () => {
      // Cleanup audio when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSurahContent = async () => {
    try {
      setLoading(true);
      // Load Arabic text
      const arabicData = await getSurah(surahNumber, 'quran-uthmani');
      
      // Load audio data
      const audioData = await getSurah(surahNumber, 'ar.alafasy');
      const ayahsWithAudio = arabicData.ayahs.map((ayah: Ayah, index: number) => ({
        ...ayah,
        audio: audioData.ayahs[index]?.audio,
      }));
      setArabicText(ayahsWithAudio);

      // Load English translation
      const translationData = await getSurah(surahNumber, 'en.asad');
      setTranslation(translationData.ayahs);
    } catch (error) {
      console.error('Error loading surah content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async (ayah: Ayah) => {
    try {
      // If there's already a sound playing
      if (sound) {
        // If it's the same ayah, pause it
        if (playingAyah === ayah.number) {
          await sound.pauseAsync();
          setPlayingAyah(null);
        } else {
          // If it's a different ayah, stop current and play new
          await sound.unloadAsync();
          await playAyah(ayah);
        }
      } else {
        // If no sound is playing, play the selected ayah
        await playAyah(ayah);
      }
    } catch (error) {
      console.error('Error handling audio:', error);
    }
  };

  const playAyah = async (ayah: Ayah) => {
    try {
      if (!ayah.audio) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: ayah.audio },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingAyah(ayah.number);

      // Listen for playback status
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAyah(null);
          await newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.background} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.surahName}>{surahName}</Text>
          <Text style={styles.ayahCount}>{totalAyahs} Verses</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        </View>

        {arabicText.map((ayah, index) => (
          <View key={ayah.number} style={styles.ayahContainer}>
            <View style={styles.ayahHeader}>
              <View style={styles.ayahNumberContainer}>
                <Text style={styles.ayahNumber}>{ayah.number}</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.playButton,
                  playingAyah === ayah.number && styles.playingButton
                ]}
                onPress={() => handlePlayPause(ayah)}
              >
                <Ionicons 
                  name={playingAyah === ayah.number ? "pause" : "play"} 
                  size={20} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.arabicText}>{ayah.text}</Text>
            
            {translation[index] && (
              <Text style={styles.translationText}>
                {translation[index].text}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SIZES.padding,
  },
  headerContent: {
    flex: 1,
  },
  surahName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  ayahCount: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  bismillahContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
    marginBottom: SIZES.padding,
  },
  bismillahText: {
    fontSize: SIZES.extraLarge * 1.2,
    color: COLORS.primary,
    textAlign: 'center',
  },
  ayahContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.light,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  ayahNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumber: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: `${COLORS.primary}20`,
  },
  arabicText: {
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: SIZES.extraLarge * 2,
    marginBottom: SIZES.padding,
  },
  translationText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    lineHeight: SIZES.large * 1.5,
  },
});

export default SurahDetailScreen; 