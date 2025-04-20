import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

interface Reciter {
  id: string;
  name: string;
  language: string;
}

const AudioScreen = ({ navigation }) => {
  const [reciters, setReciters] = useState<Reciter[]>([
    { id: '1', name: 'Mishary Rashid Alafasy', language: 'Arabic' },
    { id: '2', name: 'Abdul Basit Abdul Samad', language: 'Arabic' },
    { id: '3', name: 'Saad Al-Ghamdi', language: 'Arabic' },
    { id: '4', name: 'Abdur-Rahman As-Sudais', language: 'Arabic' },
    { id: '5', name: 'Maher Al-Muaiqly', language: 'Arabic' },
  ]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAudio = async (reciter: Reciter) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // For now, we'll just simulate audio playback
      // In a real implementation, you would load actual audio files
      setIsPlaying(true);
      setCurrentReciter(reciter);

    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
      setIsPlaying(false);
      setCurrentReciter(null);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Error', 'Failed to control playback. Please try again.');
    }
  };

  const renderReciterItem = ({ item }: { item: Reciter }) => (
    <TouchableOpacity 
      style={styles.reciterItem}
      onPress={() => playAudio(item)}
    >
      <View style={styles.reciterInfo}>
        <View style={styles.imageContainer}>
          <Ionicons name="person-circle" size={50} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.reciterName}>{item.name}</Text>
          <Text style={styles.reciterLanguage}>{item.language}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => playAudio(item)}
      >
        <Ionicons 
          name={currentReciter?.id === item.id && isPlaying ? "pause" : "play"} 
          size={24} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Quran Reciters</Text>
      </LinearGradient>

      <FlatList
        data={reciters}
        renderItem={renderReciterItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {currentReciter && (
        <View style={styles.miniPlayer}>
          <View style={styles.miniPlayerContent}>
            <View style={styles.miniPlayerLeft}>
              <Ionicons name="person-circle" size={40} color={COLORS.primary} />
              <View style={styles.miniPlayerInfo}>
                <Text style={styles.miniPlayerTitle} numberOfLines={1}>
                  {currentReciter.name}
                </Text>
                <Text style={styles.miniPlayerArtist} numberOfLines={1}>
                  {currentReciter.language}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={togglePlayback}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  reciterInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
  },
  textContainer: {
    flex: 1,
  },
  reciterName: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
  },
  reciterLanguage: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  playButton: {
    padding: SIZES.base,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.medium,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
  },
  miniPlayerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayerInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  miniPlayerTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
  },
  miniPlayerArtist: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  controlButton: {
    padding: SIZES.base,
  },
});

export default AudioScreen;

