import axios from 'axios';
import { API_ENDPOINTS, DEFAULT_PARAMS } from '../constants/api';

const BASE_URL = 'http://api.alquran.cloud/v1';

// Types
export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'text' | 'audio';
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
export const getEditions = async (format?: 'text' | 'audio', language?: string) => {
  try {
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    if (language) params.append('language', language);
    
    const response = await axios.get(`${BASE_URL}/edition${params.toString() ? '?' + params.toString() : ''}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching editions:', error);
    throw error;
  }
};

export const getSurahs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/surah`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
};

export const getSurah = async (surahNumber: number, edition: string = 'quran-uthmani') => {
  try {
    const response = await axios.get(`${BASE_URL}/surah/${surahNumber}/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw error;
  }
};

export const getAyah = async (reference: string | number, edition: string = 'quran-uthmani') => {
  try {
    const response = await axios.get(`${BASE_URL}/ayah/${reference}/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ayah:', error);
    throw error;
  }
};

export const searchQuran = async (keyword: string, surah: number | 'all' = 'all', language: string = 'en') => {
  try {
    const response = await axios.get(`${BASE_URL}/search/${keyword}/${surah}/${language}`);
    return response.data.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
};

export const getQuranAudio = async (edition: string = 'ar.alafasy') => {
  try {
    const response = await axios.get(`${BASE_URL}/quran/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Quran audio:', error);
    throw error;
  }
};

// Keep the existing prayer times API
export const getPrayerTimes = async (city = 'Banjul', country = 'Gambia') => {
  try {
    const response = await axios.get('http://api.aladhan.com/v1/timingsByCity', {
      params: {
        city,
        country,
        method: 4, // Umm Al-Qura University, Makkah
      },
    });
    return response.data.data.timings;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

export const getQuranChapters = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.QURAN_CHAPTERS);
    return response.data.chapters;
  } catch (error) {
    console.error('Error fetching Quran chapters:', error);
    throw error;
  }
};

export const getChapterVerses = async (chapterId: number) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.QURAN_VERSES}/${chapterId}`);
    return response.data.verses;
  } catch (error) {
    console.error('Error fetching chapter verses:', error);
    throw error;
  }
};

export const getQuranRecitations = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.QURAN_AUDIO);
    return response.data.recitations;
  } catch (error) {
    console.error('Error fetching recitations:', error);
    throw error;
  }
}; 