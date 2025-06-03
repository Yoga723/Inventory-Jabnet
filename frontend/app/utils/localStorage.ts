// File ini dibuat agar mudah untuk mengetahui dan tracking item-item localStorage yg digunakan di project ini
// Bila ingin menambahkan item baru untuk disimpan di localStorage, tinggal masukkan di object "StorageKeys" dibawah ini

export enum StorageKeys {
  // Nama_Variabel = "nama key yg menjelaskan item yg akan disimpan di localStorage"
  THEME = "light",
  LOGIN_INFO = "login_info",
  USERSTATE = "userInfo",
}

// Function untuk memasukkan value kedalam item kemudian menyimpannya di localStorage
export const setLocalStorageItem = (key: StorageKeys, value: unknown): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  }
};

// Function untuk mengambil item yang disimpan di localStorage. Hanya memerlukan key dari item tersebut untuk digunakan.
export const getLocalStorageItem = <Type>(key: StorageKeys): Type | null => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as Type;
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return null;
      }
    }
  }
  return null;
};

// Function untuk menghapus item & valuenya yang disimpan di localStorage.
export const removeLocalStorageItem = (key: StorageKeys): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
