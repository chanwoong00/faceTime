import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, View, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getHistory, HistoryItem, getResult } from '@/services/api';

const TEAL_COLOR = '#17B8B8';

// 샘플 데이터 (실제로는 API에서 받아옴)
const sampleHistory: HistoryItem[] = [
  {
    id: '1',
    timestamp: '2025-11-12T10:00:00Z',
    condition: '복합성',
    score: 72,
    imageUrl: '',
  },
  {
    id: '2',
    timestamp: '2025-11-05T10:00:00Z',
    condition: '복합성',
    score: 68,
    imageUrl: '',
  },
  {
    id: '3',
    timestamp: '2025-10-28T10:00:00Z',
    condition: '복합성',
    score: 65,
    imageUrl: '',
  },
];

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data.length > 0 ? data : sampleHistory);
    } catch (error) {
      setHistory(sampleHistory);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleItemPress = async (item: HistoryItem) => {
    try {
      const result = await getResult(item.id);
      router.push({
        pathname: '/result',
        params: {
          result: JSON.stringify(result),
          imageUri: item.imageUrl || '',
        },
      });
    } catch (error) {
      router.push({
        pathname: '/result',
        params: {
          imageUri: item.imageUrl || '',
        },
      });
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#4A90E2';
    if (score >= 50) return '#666';
    return '#ff6b6b';
  };

  const getScoreChange = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null;
    const change = currentScore - previousScore;
    return {
      value: change > 0 ? `+${change}` : `${change}`,
      isPositive: change > 0,
    };
  };

  const getTags = (item: HistoryItem, index: number) => {
    const tags = ['모공'];
    if (index === 0) tags.push('피지');
    if (index === 1) tags.push('건조');
    if (index === 2) {
      tags.push('색소침착');
      tags.push('건조');
    }
    return tags;
  };

  // 통계 계산
  const totalDiagnoses = history.length;
  const recentScore = history[0]?.score || 0;
  const scoreImprovement = history.length >= 2 
    ? history[0].score - history[history.length - 1].score 
    : 0;

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const previousScore = index < history.length - 1 ? history[index + 1].score : undefined;
    const scoreChange = getScoreChange(item.score, previousScore);
    const tags = getTags(item, index);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemImagePlaceholder}>
            <IconSymbol name="photo.fill" size={24} color={TEAL_COLOR} />
          </View>
          <View style={styles.itemContent}>
            <ThemedText style={styles.itemDate}>{formatDate(item.timestamp)}</ThemedText>
            <ThemedText style={styles.itemCondition}>피부 타입: {item.condition}</ThemedText>
            <View style={styles.tagsContainer}>
              {tags.map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.itemRight}>
            <ThemedText style={[styles.itemScore, { color: getScoreColor(item.score) }]}>
              {item.score}점
            </ThemedText>
            {scoreChange && (
              <View style={styles.scoreChangeContainer}>
                <IconSymbol
                  name={scoreChange.isPositive ? "arrow.up" : "arrow.down"}
                  size={12}
                  color={scoreChange.isPositive ? '#4A90E2' : '#FF9500'}
                />
                <ThemedText
                  style={[
                    styles.scoreChangeText,
                    { color: scoreChange.isPositive ? '#4A90E2' : '#FF9500' },
                  ]}
                >
                  {scoreChange.isPositive ? '개선' : '하락'}
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && history.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <ThemedText style={styles.title}>진단 기록</ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>히스토리를 불러오는 중...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <ThemedText style={styles.title}>진단 기록</ThemedText>
      </View>
      
      {/* Summary Card */}
      <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
        <View style={styles.summaryItemCol}>
          <ThemedText style={styles.summaryNumber}>{totalDiagnoses}</ThemedText>
          <ThemedText style={styles.summaryLabel}>총 진단 횟수</ThemedText>
        </View>
        <View style={styles.summaryItemCol}>
          <ThemedText style={[styles.summaryNumber, { color: scoreImprovement > 0 ? '#28A745' : '#FF9500' }]}>
            {scoreImprovement > 0 ? '+' : ''}{scoreImprovement}
          </ThemedText>
          <ThemedText style={styles.summaryLabel}>점수 향상</ThemedText>
        </View>
        <View style={styles.summaryItemCol}>
          <ThemedText style={[styles.summaryNumber, { color: TEAL_COLOR }]}>
            {recentScore}
          </ThemedText>
          <ThemedText style={styles.summaryLabel}>최근 점수</ThemedText>
        </View>
      </Animated.View>

      {history.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <IconSymbol name="doc.text" size={64} color="#D0D0D0" />
          </View>
          <ThemedText style={styles.emptyStateTitle}>아직 진단 기록이 없습니다</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            첫 진단을 시작하여{'\n'}나만의 피부 상태를 확인해보세요
          </ThemedText>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push('/(tabs)/diagnosis')}
            activeOpacity={0.8}
          >
            <GradientView
              colors={TEAL_GRADIENT}
              style={styles.emptyStateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <IconSymbol name="camera.fill" size={20} color="#fff" />
              <ThemedText style={styles.emptyStateButtonText}>진단 시작하기</ThemedText>
            </GradientView>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={TEAL_COLOR}
              colors={[TEAL_COLOR]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 20,
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
  summaryItemCol: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: TEAL_COLOR,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  list: {
    padding: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 100,
    gap: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    gap: 16,
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
  itemImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  itemCondition: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tag: {
    backgroundColor: '#E0F7F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: TEAL_COLOR,
    fontWeight: '600',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemScore: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStateButton: {
    borderRadius: 18,
    overflow: 'hidden',
    ...(Platform.OS !== 'web' && {
      shadowColor: TEAL_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(23, 184, 184, 0.3)',
    }),
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
