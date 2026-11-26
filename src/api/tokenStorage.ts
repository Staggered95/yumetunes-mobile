import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "yumetunes_access_token";

let cachedToken: string | null | undefined = undefined;

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    if (cachedToken !== undefined) {
      return cachedToken;
    }
    try {
      cachedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      return cachedToken;
    } catch (err) {
      console.warn("Failed to read token from SecureStore:", err);
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    cachedToken = token;
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (err) {
      console.warn("Failed to save token to SecureStore:", err);
    }
  },

  async clearAccessToken(): Promise<void> {
    cachedToken = null;
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } catch (err) {
      console.warn("Failed to clear token from SecureStore:", err);
    }
  },
};