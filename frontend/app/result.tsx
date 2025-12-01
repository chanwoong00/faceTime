import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ScrollView, TouchableOpacity, Share, Alert, View, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GradientView } from '@/components/GradientView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SkinAnalysisResponse } from '@/services/api';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 임시 데이터 (백엔드에서 받아올 데이터)
  const overallScore = 72;
  const skinType = '복합성';
  const moisture = 45;
  const oil = 65;
  const elasticity = 68;
  const pores = 55;
  const spots = 42;

  const improvements = [
    '하이드레이팅 세럼 사용 권장',
    '주 2회 각질 제거',
    '수분 크림 충분히 도포',
  ];

  let result: SkinAnalysisResponse | null = null;
  let imageUri: string | null = null;

  try {
    if (params.result) {
      result = JSON.parse(params.result as string);
    }
    if (params.imageUri) {
      imageUri = params.imageUri as string;
    }
  } catch (error) {
    // 파싱 실패 시 기본값 사용
  }

  const getScoreStatus = (score: number) => {
    if (score >= 70) return { text: '좋음', color: '#4A90E2' };
    if (score >= 50) return { text: '보통', color: '#666' };
    return { text: '부족', color: '#ff6b6b' };
  };

  const overallStatus = getScoreStatus(overallScore);
  const moistureStatus = getScoreStatus(moisture);
  const oilStatus = getScoreStatus(oil);
  const elasticityStatus = getScoreStatus(elasticity);
  const poresStatus = getScoreStatus(pores);
  const spotsStatus = getScoreStatus(spots);

  const formatDate = () => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `FACETIME 피부 진단 결과\n종합 점수: ${overallScore}점\n피부 타입: ${skinType}`,
      });
    } catch (error) {
      Alert.alert('공유 실패', '결과를 공유할 수 없습니다.');
    }
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
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>진단 결과</ThemedText>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
              <IconSymbol name="square.and.arrow.up" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateContainer}>
            <ThemedText style={styles.dateText}>{formatDate()}</ThemedText>
          </View>

          {/* 진단 이미지 */}
          {imageUri && (
            <View style={styles.imageCard}>
              <Image
                source={{ uri: imageUri }}
                style={styles.diagnosisImage}
                contentFit="cover"
                onLoad={() => setImageLoaded(true)}
                transition={200}
              />
            </View>
          )}

          {/* Overall Score Card */}
          <View style={styles.card}>
            <View style={styles.scoreContainer}>
              <GradientView
                colors={TEAL_GRADIENT}
                style={styles.scoreCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.scoreInner}>
                  <ThemedText style={styles.scoreNumber}>{overallScore}</ThemedText>
                  <ThemedText style={styles.scoreUnit}>점</ThemedText>
                </View>
              </GradientView>
            </View>
            <ThemedText style={styles.scoreLabel}>종합 피부 점수</ThemedText>
            <ThemedText style={[styles.statusText, { color: overallStatus.color }]}>
              {overallStatus.text}
            </ThemedText>
            <View style={styles.skinTypeContainer}>
              <ThemedText style={styles.skinTypeText}>피부 타입: {skinType}</ThemedText>
            </View>
          </View>

          {/* 상세 지표 */}
          <View style={styles.metricsCard}>
            <ThemedText style={styles.sectionTitle}>상세 분석</ThemedText>
            
            {[
              { label: '수분', value: moisture, status: moistureStatus, emoji: '💧', bg: '#E3F2FD' },
              { label: '유분', value: oil, status: oilStatus, emoji: '✨', bg: '#FFF9C4' },
              { label: '탄력', value: elasticity, status: elasticityStatus, emoji: '🔵', bg: '#E8F5E9' },
              { label: '모공', value: pores, status: poresStatus, emoji: '⚫', bg: '#F3E5F5' },
              { label: '색소침착', value: spots, status: spotsStatus, emoji: '🔴', bg: '#FFF3E0', last: true },
            ].map((metric, index) => (
              <View key={index} style={[styles.metricRow, metric.last && styles.metricRowLast]}>
                <View style={styles.metricLeft}>
                  <View style={[styles.metricIcon, { backgroundColor: metric.bg }]}>
                    <ThemedText style={styles.metricEmoji}>{metric.emoji}</ThemedText>
                  </View>
                  <View style={styles.metricInfo}>
                    <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
                    <ThemedText style={styles.metricScore}>{metric.value}점</ThemedText>
                  </View>
                </View>
                <View style={styles.metricRight}>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${metric.value}%`, backgroundColor: metric.status.color }]} />
                  </View>
                  <ThemedText style={[styles.metricStatus, { color: metric.status.color }]}>
                    {metric.status.text}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* 문제점 및 개선사항 */}
          <View style={styles.issuesCard}>
            <ThemedText style={styles.sectionTitle}>주요 개선사항</ThemedText>
            {improvements.map((item, index) => (
              <View key={index} style={styles.improvementItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={TEAL_COLOR} />
                <ThemedText style={styles.improvementText}>{item}</ThemedText>
              </View>
            ))}
          </View>

          {/* Routine Recommendation Button */}
          <TouchableOpacity
            style={styles.routineButton}
            onPress={() => router.push('/(tabs)/routine')}
            activeOpacity={0.8}
          >
            <GradientView
              colors={TEAL_GRADIENT}
              style={styles.routineButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <ThemedText style={styles.routineButtonText}>맞춤 루틴 추천 받기</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#fff" />
            </GradientView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  dateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  imageCard: {
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    aspectRatio: 1,
    maxHeight: Platform.OS === 'web' ? 500 : 400,
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    }),
  },
  diagnosisImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
  },
  card: {
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
  scoreContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS !== 'web' && {
      shadowColor: TEAL_COLOR,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 16px rgba(23, 184, 184, 0.4)',
    }),
  },
  scoreInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 56,
  },
  scoreUnit: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
  },
  skinTypeContainer: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
    alignItems: 'center',
  },
  skinTypeText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  metricsCard: {
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 15,
    padding: 22,
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
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  metricEmoji: {
    fontSize: 26,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  metricScore: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metricRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  progressContainer: {
    width: 110,
    height: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  metricStatus: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  issuesCard: {
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 15,
    padding: 22,
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
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  improvementText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  routineButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 10,
    marginBottom: 30,
    ...(Platform.OS !== 'web' && {
      shadowColor: TEAL_COLOR,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 12px rgba(23, 184, 184, 0.3)',
    }),
  },
  routineButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  routineButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
