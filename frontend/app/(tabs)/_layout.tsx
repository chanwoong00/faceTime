import { Tabs, Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#17B8B8',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="routine"
        options={{
          title: '루틴',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="star.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: '진단',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="camera.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <View style={{ 
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
              <View style={{
                position: 'absolute',
                top: -20,
                width: 70,
                height: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <HapticTab 
                  {...props}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: '#17B8B8',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...(Platform.OS !== 'web' && {
                      shadowColor: '#17B8B8',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }),
                    ...(Platform.OS === 'web' && {
                      boxShadow: '0 4px 8px rgba(23, 184, 184, 0.3)',
                    }),
                  }}
                >
                  <IconSymbol size={32} name="house.fill" color="#fff" />
                </HapticTab>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="clock.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내정보',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="person.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
