import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GradientView } from '@/components/GradientView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

type TabType = 'morning' | 'evening' | 'weekly';

interface RoutineItem {
  title: string;
  frequency: string;
}

const routineData: Record<TabType, RoutineItem[]> = {
  morning: [
    { title: '클렌징', frequency: '매일' },
    { title: '토너', frequency: '매일' },
    { title: '세럼', frequency: '매일' },
    { title: '크림', frequency: '매일' },
    { title: '선크림', frequency: '매일' },
  ],
  evening: [
    { title: '이중 클렌징', frequency: '매일' },
    { title: '토너', frequency: '매일' },
    { title: '에센스', frequency: '매일' },
    { title: '아이크림', frequency: '매일' },
    { title: '나이트 크림', frequency: '매일' },
  ],
  weekly: [
    { title: '각질 제거', frequency: '주 2회' },
    { title: '딥 클렌징 마스크', frequency: '주 1회' },
    { title: '시트 마스크', frequency: '주 2-3회' },
  ],
};

export default function RoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const skinType = '복합성';
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartRoutine = (item: RoutineItem) => {
    Alert.alert(
      '루틴 시작',
      `${item.title} 루틴을 시작하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '시작', 
          onPress: () => {
            Alert.alert('알림', `${item.title} 루틴이 시작되었습니다!`);
          }
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
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/home')} 
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <IconSymbol name="chevron.left" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <ThemedText style={styles.headerTitle}>피부 루틴 추천</ThemedText>
              <ThemedText style={styles.headerSubtitle}>{skinType} 피부 맞춤 루틴</ThemedText>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Info Banner */}
          <View style={styles.banner}>
            <GradientView
              colors={TEAL_GRADIENT}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.bannerTitle}>맞춤형 스킨케어 루틴</ThemedText>
              <ThemedText style={styles.bannerText}>
                {skinType} 피부를 위한 AI 추천 루틴입니다. 일관되게 실천하면 2-4주 내에 개선 효과를 느낄 수 있습니다.
              </ThemedText>
            </GradientView>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {[
              { key: 'morning' as TabType, label: '아침', icon: 'sun.max.fill' },
              { key: 'evening' as TabType, label: '저녁', icon: 'moon.fill' },
              { key: 'weekly' as TabType, label: '주간', icon: 'cloud.fill' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <IconSymbol 
                  name={tab.icon as any} 
                  size={18} 
                  color={activeTab === tab.key ? TEAL_COLOR : '#999'} 
                />
                <ThemedText style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Routine Items */}
          <View style={styles.routineList}>
            {routineData[activeTab].map((item, index) => (
              <View key={index} style={styles.routineCard}>
                <IconSymbol name="checkmark.circle.fill" size={28} color="#51cf66" />
                <View style={styles.routineContent}>
                  <ThemedText style={styles.routineTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.routineFrequency}>{item.frequency}</ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.routineBadge}
                  onPress={() => handleStartRoutine(item)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.routineBadgeText}>시작하기</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  banner: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: TEAL_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerGradient: {
    padding: 24,
  },
  bannerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  bannerText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    opacity: 0.95,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#E0F7F7',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: TEAL_COLOR,
    fontWeight: '700',
  },
  routineList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  routineContent: {
    flex: 1,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 7,
  },
  routineFrequency: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  routineBadge: {
    backgroundColor: TEAL_COLOR,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: TEAL_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  routineBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
