import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

export async function openUrl(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url).catch(() => undefined);
  }
}
