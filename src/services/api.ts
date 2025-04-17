import axios from "axios";
import { API_ENDPOINTS, DEFAULT_PARAMS } from "../constants/api";

const BASE_URL = "http://api.alquran.cloud/v1";

// Types
export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: "text" | "audio";
  type: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

// API Functions
export const getEditions = async (
  format?: "text" | "audio",
  language?: string
) => {
  try {
    const params = new URLSearchParams();
    if (format) params.append("format", format);
    if (language) params.append("language", language);

    const response = await axios.get(
      `${BASE_URL}/edition${params.toString() ? "?" + params.toString() : ""}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching editions:", error);
    throw error;
  }
};

export const getSurahs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/surah`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    throw error;
  }
};

export const getSurah = async (
  surahNumber: number,
  edition: string = "quran-uthmani"
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/surah/${surahNumber}/${edition}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching surah:", error);
    throw error;
  }
};

export const getAyah = async (
  reference: string | number,
  edition: string = "quran-uthmani"
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/ayah/${reference}/${edition}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching ayah:", error);
    throw error;
  }
};

export const searchQuran = async (
  keyword: string,
  surah: number | "all" = "all",
  language: string = "en"
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/search/${keyword}/${surah}/${language}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error searching Quran:", error);
    throw error;
  }
};

export const getQuranAudio = async (edition: string = "ar.alafasy") => {
  try {
    const response = await axios.get(`${BASE_URL}/quran/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching Quran audio:", error);
    throw error;
  }
};

// Keep the existing prayer times API
export const getPrayerTimes = async (city = "Banjul", country = "Gambia") => {
  try {
    const response = await axios.get(
      "http://api.aladhan.com/v1/timingsByCity",
      {
        params: {
          city,
          country,
          method: 4,
        },
      }
    );
    return response.data.data.timings;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
};

export const getQuranChapters = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.QURAN_CHAPTERS);
    return response.data.chapters;
  } catch (error) {
    console.error("Error fetching Quran chapters:", error);
    throw error;
  }
};

export const getChapterVerses = async (chapterId: number) => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.QURAN_VERSES}/${chapterId}`
    );
    return response.data.verses;
  } catch (error) {
    console.error("Error fetching chapter verses:", error);
    throw error;
  }
};

export const getQuranRecitations = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.QURAN_AUDIO);
    return response.data.recitations;
  } catch (error) {
    console.error("Error fetching recitations:", error);
    throw error;
  }
};

export const fetchIslamicDate = async () => {
  try {
    // Using the Aladhan API to get Islamic date
    const response = await fetch("https://api.aladhan.com/v1/gToH", {
      method: "GET",
    });

    const data = await response.json();

    if (data.code === 200 && data.data) {
      const hijri = data.data.hijri;
      return {
        day: hijri.day,
        month: hijri.month.en, 
        monthArabic: hijri.month.ar, 
        year: hijri.year,
        format: `${hijri.day} ${hijri.month.en} ${hijri.year} H`,
      };
    }

    throw new Error("Failed to fetch Islamic date");
  } catch (error) {
    console.error("Error fetching Islamic date:", error);
    // Fallback to calculated date if API fails
    return getCalculatedIslamicDate();
  }
};

// Function to fetch prayer times based on location
export const fetchPrayerTimes = async (latitude, longitude, method = 2) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Using the Aladhan API to get prayer times
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=${method}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      return {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
      };
    }

    throw new Error("Failed to fetch prayer times");
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    // Return default prayer times if API fails
    return getDefaultPrayerTimes();
  }
};

// Function to get user's location
export const getUserLocation = async () => {
  try {
    // Using a geolocation API to get location based on IP
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    return {
      city: data.city,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      formatted: `${data.city}, ${data.country_name}`,
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    // Return default location if API fails
    return {
      city: "Mecca",
      country: "Saudi Arabia",
      latitude: 21.4225,
      longitude: 39.8262,
      formatted: "Mecca, Saudi Arabia",
    };
  }
};

// Fallback function to calculate Islamic date if API fails
const getCalculatedIslamicDate = () => {
  // Simple calculation (not accurate for all cases)
  const today = new Date();
  const gregorianYear = today.getFullYear();
  const hijriYear = Math.floor(
    gregorianYear - 622 + (gregorianYear - 622) / 32
  );

  // Simplified month mapping (not accurate)
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

  const monthIndex = (today.getMonth() + 10) % 12; // Simplified offset
  const day = today.getDate();

  return {
    day: day,
    month: hijriMonths[monthIndex],
    monthArabic: "",
    year: hijriYear,
    format: `${day} ${hijriMonths[monthIndex]} ${hijriYear} H`,
  };
};

// Default prayer times if API fails
const getDefaultPrayerTimes = () => {
  return {
    fajr: "05:15",
    sunrise: "06:45",
    dhuhr: "12:30",
    asr: "15:45",
    maghrib: "18:15",
    isha: "19:45",
  };
};

// Function to search Quran content
// export const searchQuran = async (query) => {
//   try {
//     // Using the Quran.com API to search
//     const response = await fetch(
//       `https://api.quran.com/api/v4/search?q=${encodeURIComponent(
//         query
//       )}&size=10`
//     );
//     const data = await response.json();

//     if (data.search && data.search.results) {
//       return data.search.results.map((result) => ({
//         surahNumber: result.verse.chapter_number,
//         surahName: result.verse.chapter_name,
//         verseNumber: result.verse.verse_number,
//         text: result.text,
//       }));
//     }

//     return [];
//   } catch (error) {
//     console.error("Error searching Quran:", error);
//     return [];
//   }
// };
