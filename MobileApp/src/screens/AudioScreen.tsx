import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

// Import local images
const misharyImage = require('../assets/fattyima.jpg');
const maherImage = require('../assets/ukuk.jpg');
const sudaisImage = require('../assets/halal.jpeg');
const defaultImage = require('../assets/hussary.jpg');

interface RecitationItem {
  id: string;
  title: string;
  reciter: string;
  image: any; // Changed to accept require statements
}

interface Category {
  id: string;
  title: string;
  items: RecitationItem[];
}

const AudioScreen = ({ navigation }) => {
  const [currentTrack, setCurrentTrack] = useState<RecitationItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const greeting = getGreeting();
  
  // Categories data
  const categories: Category[] = [
    {
      id: 'recent',
      title: 'Recently Played',
      items: [
        {
          id: '1',
          title: 'Surah Al-Fatiha',
          reciter: 'Mishary Rashid Alafasy',
          image: misharyImage
        },
        {
          id: '2',
          title: 'Surah Al-Baqarah',
          reciter: 'Abdul Basit Abdul Samad',
          image: defaultImage
        },
        {
          id: '3',
          title: 'Surah Yaseen',
          reciter: 'Saad Al-Ghamdi',
          image: defaultImage
        }
      ]
    },
    {
      id: 'popular',
      title: 'Popular Reciters',
      items: [
        {
          id: '4',
          title: 'Complete Quran',
          reciter: 'Mishary Rashid Alafasy',
          image: misharyImage
        },
        {
          id: '5',
          title: 'Juz Amma',
          reciter: 'Abdur-Rahman As-Sudais',
          image: sudaisImage
        },
        {
          id: '6',
          title: 'Selected Surahs',
          reciter: 'Maher Al-Muaiqly',
          image: maherImage
        }
      ]
    }
  ];

  // Handle playback
  const playAudio = async (item: RecitationItem) => {
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

      setIsPlaying(true);
      setCurrentTrack(item);
      
      // Remove navigation from here
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentTrack(null);
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
    }
  };

  // Render category items
  const renderCategoryItem = ({ item }: { item: RecitationItem }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => playAudio(item)}
    >
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>{item.reciter}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render categories
  const renderCategory = (category: Category) => (
    <View style={styles.categoryContainer} key={category.id}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={category.items}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* <View style={styles.header}>
          <Text style={styles.greetingHeader}>{greeting}</Text>
        </View> */}
        
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to </Text>
          <Text style={styles.quranText}>Quran</Text>
          <Text style={styles.welcomeSubText}>World of Recitations</Text>
        </View>
        
        {/* Category Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabTextActive}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Recitations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Reciters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="play-circle" size={20} color="white" style={{marginTop: 2}} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(category => renderCategory(category))}
        
        {/* Add some padding at the bottom for the player */}
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* Now Playing Bar */}
      {currentTrack && (
        <TouchableOpacity 
          style={styles.nowPlaying}
          onPress={() => navigation.navigate('AudioDetail', { item: currentTrack })}
        >
          <View style={styles.nowPlayingContent}>
            <Image source={currentTrack.image} style={styles.nowPlayingImage} />
            <View style={styles.nowPlayingInfo}>
              <Text style={styles.nowPlayingTitle} numberOfLines={1}>{currentTrack.title}</Text>
              <Text style={styles.nowPlayingSubtitle} numberOfLines={1}>{currentTrack.reciter}</Text>
            </View>
            <View style={styles.nowPlayingControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('AudioDetail', { item: currentTrack });
                }}
              >
                <Ionicons name="play-skip-back" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.playPauseButton}
                onPress={(e) => {
                  e.stopPropagation();
                  togglePlayback();
                }}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  greetingHeader: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    marginTop: 10,
    // alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quranText: {
    color: COLORS.accent2,
    fontSize: 32,
    fontWeight: 'bold',
  },
  welcomeSubText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabActive: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.accent1,
  },
  tabText: {
    color: 'white',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: COLORS.accent1,
    fontSize: 14,
  },
  categoryList: {
    paddingRight: 16,
  },
  categoryItem: {
    width: 150,
    marginRight: 16,
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  itemTextContainer: {
    marginTop: 8,
  },
  itemTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    color: 'gray',
    fontSize: 12,
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 56,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 6,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.accent1,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  nowPlayingImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nowPlayingTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nowPlayingSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  nowPlayingControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
  },
  playPauseButton: {
    padding: 8,
    backgroundColor: COLORS.accent1,
    borderRadius: 20,
  }
});

export default AudioScreen;

