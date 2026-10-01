import { ref } from "vue";

export interface FavoriteHotel {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  badge?: string;
  amenities?: string[];
}

const STORAGE_KEY = "sabay-favorites";
const favorites = ref<FavoriteHotel[]>([]);
let isInitialized = false;

function initFavorites() {
  if (isInitialized || !import.meta.client) return;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    favorites.value = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);
    favorites.value = [];
  }
  isInitialized = true;
}

export function useFavorites() {
  initFavorites();

  function saveFavorites() {
    if (!import.meta.client) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value));
  }

  function isFavorite(id: string) {
    return favorites.value.some((item) => item.id === id);
  }

  function toggleFavorite(hotel: FavoriteHotel) {
    if (isFavorite(hotel.id)) {
      favorites.value = favorites.value.filter((item) => item.id !== hotel.id);
      saveFavorites();
      return;
    }

    favorites.value = [hotel, ...favorites.value];
    saveFavorites();
  }

  function removeFavorite(id: string) {
    favorites.value = favorites.value.filter((item) => item.id !== id);
    saveFavorites();
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}
