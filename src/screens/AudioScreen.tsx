import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  duration: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  year: string;
  tracks: number;
}

const DUMMY_PLAYLIST: PlaylistItem[] = [
  {
    id: '1',
    title: 'Muhammad Ukasha',
    artist: 'Suratul Yuspha',
    imageUrl: 'https://example.com/image1.jpg',
    duration: '5:30'
  },
  {
    id: '2',
    title: 'Imam Fatty ',
    artist: 'Tasirr Fatah',
    imageUrl: 'https://example.com/image2.jpg',
    duration: '6:45'
  },
  {
    id: '3',
    title: 'Imam Fatty',
    artist: 'Tafsir Imam Fatty',
    imageUrl: 'https://example.com/image3.jpg',
    duration: '4:20'
  },
];

const DUMMY_ALBUMS: Album[] = [
  {
    id: '1',
    title: 'Quran Recitation',
    artist: 'Muhammad Ukasha',
    imageUrl: 'https://example.com/album1.jpg',
    year: '2024',
    tracks: 10
  },
  {
    id: '2',
    title: 'Tafsir Collection',
    artist: 'Imam Fatty',
    imageUrl: 'https://example.com/album2.jpg',
    year: '2023',
    tracks: 15
  },
  {
    id: '3',
    title: 'Islamic Lectures',
    artist: 'Various Scholars',
    imageUrl: 'https://example.com/album3.jpg',
    year: '2024',
    tracks: 8
  },
  {
    id: '4',
    title: 'Ramadan Series',
    artist: 'Imam Fatty',
    imageUrl: 'https://example.com/album4.jpg',
    year: '2023',
    tracks: 12
  }
];

const AudioScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('playlist');

  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => navigation.navigate('NowPlaying', { song: item })}
    >
      <View style={styles.songInfo}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.songImage}
            defaultSource={require('../assets/default-song.png')}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.songTitle}>{item.title}</Text>
          <Text style={styles.artistName}>{item.artist}</Text>
        </View>
      </View>
      <View style={styles.songActions}>
        <Text style={styles.duration}>{item.duration}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={styles.albumItem}
      onPress={() => navigation.navigate('AlbumDetail', { album: item })}
    >
      <View style={styles.albumImageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.albumImage}
          defaultSource={require('../assets/default-song.png')}
        />
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.albumArtist}>{item.artist}</Text>
        <Text style={styles.albumDetails}>{item.year} • {item.tracks} tracks</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Your Library</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'playlist' && styles.activeTab]}
        onPress={() => setActiveTab('playlist')}
      >
        <Text style={[styles.tabText, activeTab === 'playlist' && styles.activeTabText]}>Playlists</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'albums' && styles.activeTab]}
        onPress={() => setActiveTab('albums')}
      >
        <Text style={[styles.tabText, activeTab === 'albums' && styles.activeTabText]}>Albums</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {activeTab === 'playlist' ? (
        <FlatList<PlaylistItem>
          data={DUMMY_PLAYLIST}
          renderItem={renderPlaylistItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList<Album>
          data={DUMMY_ALBUMS}
          renderItem={renderAlbumItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View style={styles.miniPlayer}>
        <View style={styles.miniPlayerContent}>
          <View style={styles.miniPlayerLeft}>
            <Image
              source={{ uri: DUMMY_PLAYLIST[0].imageUrl }}
              style={styles.miniPlayerImage}
              defaultSource={require('../assets/default-song.png')}
            />
            <View style={styles.miniPlayerInfo}>
              <Text style={styles.miniPlayerTitle}>{DUMMY_PLAYLIST[0].title}</Text>
              <Text style={styles.miniPlayerArtist}>{DUMMY_PLAYLIST[0].artist}</Text>
            </View>
          </View>
          <View style={styles.miniPlayerControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: SIZES.base * 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  tab: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.medium,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.background,
  },
  listContainer: {
    paddingHorizontal: SIZES.padding,
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.textSecondary}10`,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  songImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginLeft: SIZES.base,
    flex: 1,
  },
  songTitle: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  artistName: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginRight: SIZES.base,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.textSecondary}10`,
  },
  albumImageContainer: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumInfo: {
    marginLeft: SIZES.padding,
    flex: 1,
  },
  albumTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  albumArtist: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  albumDetails: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.textSecondary}10`,
    padding: SIZES.padding,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniPlayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radius / 2,
  },
  miniPlayerInfo: {
    marginLeft: SIZES.base,
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.text,
  },
  miniPlayerArtist: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    marginLeft: SIZES.base * 2,
  },
});

export default AudioScreen;
