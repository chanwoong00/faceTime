import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Web viewport styles
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Use requestAnimationFrame to ensure DOM is ready
  if (typeof window !== 'undefined') {
    const setupWebStyles = () => {
      if (document.getElementById('web-viewport-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'web-viewport-styles';
      style.textContent = `
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
        body {
          background-color: #F8F9FA;
        }
      `;
      document.head.appendChild(style);
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupWebStyles);
    } else {
      setupWebStyles();
    }
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            contentStyle: Platform.OS === 'web' ? styles.webContent : undefined,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="loading" options={{ headerShown: false }} />
          <Stack.Screen name="result" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="routine" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#17B8B8" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  webContent: {
    width: '100%',
    maxWidth: '100%',
    margin: 0,
    padding: 0,
  },
});
