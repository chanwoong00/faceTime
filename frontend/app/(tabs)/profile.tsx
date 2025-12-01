import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';

const TEAL_COLOR = '#17B8B8';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>내 정보</ThemedText>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileImage}>
              <ThemedText style={styles.profileEmoji}>👤</ThemedText>
            </View>
            <ThemedText style={styles.profileName}>{user?.username || '사용자'}</ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email || 'user@example.com'}</ThemedText>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('프로필 수정', '프로필 수정 기능은 준비 중입니다.')}
              activeOpacity={0.7}
            >
              <IconSymbol name="person.fill" size={22} color={TEAL_COLOR} />
              <ThemedText style={styles.menuText}>프로필 수정</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#D0D0D0" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('알림 설정', '알림 설정 기능은 준비 중입니다.')}
              activeOpacity={0.7}
            >
              <IconSymbol name="bell.fill" size={22} color={TEAL_COLOR} />
              <ThemedText style={styles.menuText}>알림 설정</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#D0D0D0" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('비밀번호 변경', '비밀번호 변경 기능은 준비 중입니다.')}
              activeOpacity={0.7}
            >
              <IconSymbol name="lock.fill" size={22} color={TEAL_COLOR} />
              <ThemedText style={styles.menuText}>비밀번호 변경</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#D0D0D0" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('앱 정보', 'FACETIME v1.0.0\nAI 기반 피부 진단 앱')}
              activeOpacity={0.7}
            >
              <IconSymbol name="info.circle.fill" size={22} color={TEAL_COLOR} />
              <ThemedText style={styles.menuText}>앱 정보</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#D0D0D0" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.logoutButtonText}>로그아웃</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    ...(Platform.OS === 'web' && {
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#333',
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    marginBottom: 15,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    }),
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: TEAL_COLOR + '20',
  },
  profileEmoji: {
    fontSize: 55,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#ff6b6b',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.1)',
    }),
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 17,
    fontWeight: '700',
  },
});
