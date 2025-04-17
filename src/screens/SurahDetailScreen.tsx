"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { getSurah } from "../services/api";
import { useRoute, useNavigation } from "@react-navigation/native";

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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      console.log(`Loading surah number: ${surahNumber}`);

      // Load Arabic text
      const arabicData = await getSurah(surahNumber, "quran-uthmani");

      if (!arabicData || !arabicData.ayahs) {
        throw new Error("Failed to load Arabic text");
      }

      setArabicText(arabicData.ayahs);

      // Load English translation
      const translationData = await getSurah(surahNumber, "en.asad");

      if (translationData && translationData.ayahs) {
        setTranslation(translationData.ayahs);
      }

      // Try to load audio data
      try {
        const audioData = await getSurah(surahNumber, "ar.alafasy");

        if (audioData && audioData.ayahs) {
          // Add audio URLs to the Arabic text
          const ayahsWithAudio = arabicData.ayahs.map(
            (ayah: Ayah, index: number) => ({
              ...ayah,
              audio: audioData.ayahs[index]?.audio,
            })
          );

          setArabicText(ayahsWithAudio);
        }
      } catch (audioError) {
        console.error("Error loading audio data:", audioError);
        // Continue without audio if it fails
      }
    } catch (error) {
      console.error("Error loading surah content:", error);
      setError("Failed to load surah content. Please try again later.");
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
      console.error("Error handling audio:", error);
    }
  };

  const playAyah = async (ayah: Ayah) => {
    try {
      if (!ayah.audio) {
        Alert.alert(
          "Audio not available",
          "Audio for this verse is not available."
        );
        return;
      }

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
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio. Please try again.");
    }
  };

  console.log(surahName);

  if (loading) {
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
            <Text style={styles.ayahCount}>Loading...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading surah content...</Text>
        </View>
      </View>
    );
  }

  if (error) {
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
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSurahContent}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {surahNumber !== 9 && ( // Surah At-Tawbah (9) doesn't start with Bismillah
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillahText}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </Text>
          </View>
        )}

        {arabicText.map((ayah, index) => (
          <View key={ayah.number} style={styles.ayahContainer}>
            <View style={styles.ayahHeader}>
              <View style={styles.ayahNumberContainer}>
                <Text style={styles.ayahNumber}>{ayah.number}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  playingAyah === ayah.number && styles.playingButton,
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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: SIZES.padding,
  },
  headerContent: {
    flex: 1,
  },
  surahName: {
    fontSize: SIZES.extraLarge,
    fontWeight: "bold",
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
    alignItems: "center",
    paddingVertical: SIZES.padding * 2,
    marginBottom: SIZES.padding,
  },
  bismillahText: {
    fontSize: SIZES.extraLarge * 1.2,
    color: COLORS.primary,
    textAlign: "center",
  },
  ayahContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.light,
  },
  ayahHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  ayahNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  ayahNumber: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.primary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
  },
  playingButton: {
    backgroundColor: `${COLORS.primary}20`,
  },
  arabicText: {
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    textAlign: "right",
    lineHeight: SIZES.extraLarge * 2,
    marginBottom: SIZES.padding,
  },
  translationText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    lineHeight: SIZES.large * 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding * 2,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: "center",
    marginVertical: SIZES.padding,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
});

export default SurahDetailScreen;
