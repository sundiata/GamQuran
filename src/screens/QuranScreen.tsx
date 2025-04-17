import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { getSurahs, Surah } from "../services/api";

type QuranStackParamList = {
  QuranList: undefined;
  SurahDetailScreen: {
    surahNumber: number;
    surahName: string;
    totalAyahs: number;
  };
};

const QuranScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<QuranStackParamList>>();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      const data = await getSurahs();
      setSurahs(data);
    } catch (error) {
      console.error("Error loading surahs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahPress = (surah: Surah) => {
    navigation.navigate("SurahDetailScreen", {
      surahNumber: surah.number,
      surahName: surah.englishName,
      totalAyahs: surah.numberOfAyahs,
    });
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={styles.surahCard}
      onPress={() => handleSurahPress(item)}
    >
      <View style={styles.surahNumberContainer}>
        <Text style={styles.surahNumber}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <View>
          <Text style={styles.surahName}>{item.englishName}</Text>
          <Text style={styles.surahTranslation}>
            {item.englishNameTranslation}
          </Text>
        </View>
        <View style={styles.surahMetadata}>
          <Text style={styles.surahType}>{item.revelationType}</Text>
          <Text style={styles.versesCount}>{item.numberOfAyahs} verses</Text>
        </View>
      </View>
      <Text style={styles.arabicName}>{item.name}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>The Holy Quran</Text>
        <Text style={styles.headerSubtitle}>114 Surahs</Text>
      </View>

      <FlatList
        data={surahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: "bold",
    color: COLORS.background,
    marginBottom: SIZES.base,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    opacity: 0.8,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  surahCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.light,
  },
  surahNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding,
  },
  surahNumber: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.primary,
  },
  surahInfo: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  surahName: {
    fontSize: SIZES.large,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  surahTranslation: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  surahMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  surahType: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SIZES.base,
    paddingVertical: 2,
    borderRadius: SIZES.radius / 2,
    marginRight: SIZES.base,
  },
  versesCount: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  arabicName: {
    fontSize: SIZES.large,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default QuranScreen;
