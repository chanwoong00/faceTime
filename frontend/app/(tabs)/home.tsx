import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GradientView } from '@/components/GradientView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { getHistory, getResult, HistoryItem } from '@/services/api';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [lineChartData, setLineChartData] = useState<Array<{ date: string; score: number }>>([]);
  const [recentDiagnosis, setRecentDiagnosis] = useState<{ date: string; score: number } | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 진단 기록 불러오기
  useEffect(() => {
    const loadDiagnosisData = async () => {
      try {
        const history = await getHistory();
        if (history && history.length > 0) {
          setHasHistory(true);
          
          // 최근 진단 정보
          const recent = history[0];
          const recentDate = new Date(recent.timestamp);
          setRecentDiagnosis({
            date: `${recentDate.getFullYear()}년 ${recentDate.getMonth() + 1}월 ${recentDate.getDate()}일`,
            score: recent.score,
          });

          // 그래프 데이터 생성 (최근 6개)
          const chartData = history.slice(0, 6).reverse().map((item, index) => {
            const date = new Date(item.timestamp);
            return {
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              score: item.score,
            };
          });
          setLineChartData(chartData);
        } else {
          setHasHistory(false);
          // 샘플 데이터 (첫 진단 전)
          setLineChartData([
            { date: '11/6', score: 65 },
            { date: '11/8', score: 68 },
            { date: '11/10', score: 69 },
            { date: '11/12', score: 68 },
            { date: '11/14', score: 70 },
            { date: '11/18', score: 69 },
          ]);
        }
      } catch (error) {
        setHasHistory(false);
      }
    };

    loadDiagnosisData();
  }, []);

  const handleStartDiagnosis = () => {
    router.push('/(tabs)/diagnosis');
  };

  const maxScore = 100;
  const chartHeight = 120;
  const minScore = lineChartData.length > 0 ? Math.min(...lineChartData.map(d => d.score)) : 0;
  const maxScoreValue = lineChartData.length > 0 ? Math.max(...lineChartData.map(d => d.score)) : 100;
  const scoreRange = maxScoreValue - minScore || 1;

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
            </View>
            
            <ThemedText style={styles.guideText}>
              카메라로 얼굴을 촬영하여{'\n'}AI 기반 피부 분석을 받아보세요
            </ThemedText>
            
            <ThemedText style={styles.infoText}>
              첫 진단은 나만의 피부 기준이 아직 없어 일반 표준 데이터를 기준으로 분석됩니다.
            </ThemedText>
            
            <ThemedText style={styles.infoText}>
              진단이 누적될수록 점점 더 정확한 결과를 확인하실 수 있습니다. 🌿
            </ThemedText>
          </View>

          {/* Diagnosis Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.diagnosisButton}
              onPress={handleStartDiagnosis}
              activeOpacity={0.8}
            >
              <GradientView
                colors={TEAL_GRADIENT}
                style={styles.diagnosisButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="camera.fill" size={22} color="#fff" />
                <ThemedText style={styles.diagnosisButtonText}>진단 시작</ThemedText>
              </GradientView>
            </TouchableOpacity>
          </View>

          {/* Current Skin Status Data */}
          {lineChartData.length > 0 ? (
            <View style={styles.card}>
              <ThemedText style={styles.cardTitle}>현재 피부 상태 데이터</ThemedText>
              <View style={styles.graphArea}>
              {/* Y-axis labels */}
              <View style={styles.yAxisContainer}>
                {[100, 75, 50, 25, 0].map((value) => (
                  <ThemedText key={value} style={styles.yAxisLabel}>{value}</ThemedText>
                ))}
              </View>
              
              {/* Line Chart */}
              <View style={styles.lineChartContainer}>
                <View style={styles.lineChart}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((value) => (
                    <View
                      key={value}
                      style={[
                        styles.gridLine,
                        { bottom: `${(value / maxScore) * 100}%` },
                      ]}
                    />
                  ))}
                  
                  {/* Line chart with connecting lines */}
                  <View style={styles.dataLine}>
                    {/* Draw connecting lines first (behind points) */}
                    {lineChartData.map((item, index) => {
                      if (index === lineChartData.length - 1) return null;
                      
                      const normalizedScore = ((item.score - minScore) / scoreRange) * chartHeight;
                      const nextItem = lineChartData[index + 1];
                      const nextNormalized = ((nextItem.score - minScore) / scoreRange) * chartHeight;
                      
                      const itemWidth = 100 / lineChartData.length;
                      const startX = (index * itemWidth) + (itemWidth / 2);
                      const endX = ((index + 1) * itemWidth) + (itemWidth / 2);
                      
                      const dx = endX - startX;
                      const dy = nextNormalized - normalizedScore;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                      
                      return (
                        <View
                          key={`line-${index}`}
                          style={[
                            styles.lineSegment,
                            {
                              bottom: normalizedScore,
                              left: `${startX}%`,
                              width: distance,
                              height: 2,
                              transform: [{ rotate: `${angle}deg` }],
                            },
                          ]}
                        />
                      );
                    })}
                    
                    {/* Draw data points on top */}
                    {lineChartData.map((item, index) => {
                      const normalizedScore = ((item.score - minScore) / scoreRange) * chartHeight;
                      const itemWidth = 100 / lineChartData.length;
                      const xPosition = (index * itemWidth) + (itemWidth / 2);
                      
                      return (
                        <React.Fragment key={`point-${index}`}>
                          {/* Data point */}
                          <View
                            style={[
                              styles.dataPoint,
                              { 
                                bottom: normalizedScore - 4,
                                left: `${xPosition}%`,
                                marginLeft: -4,
                              },
                            ]}
                          />
                          {/* Value label */}
                          <ThemedText 
                            style={[
                              styles.dataPointValue, 
                              { 
                                bottom: normalizedScore - 20,
                                left: `${xPosition}%`,
                                marginLeft: -10,
                              }
                            ]}
                          >
                            {item.score}
                          </ThemedText>
                        </React.Fragment>
                      );
                    })}
                  </View>
                  
                  {/* X-axis labels */}
                  <View style={styles.xAxisContainer}>
                    {lineChartData.map((item, index) => (
                      <ThemedText key={index} style={styles.xAxisLabel}>
                        {item.date}
                      </ThemedText>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
          ) : (
            <View style={styles.card}>
              <ThemedText style={styles.cardTitle}>현재 피부 상태 데이터</ThemedText>
              <View style={styles.emptyGraphContainer}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={48} color="#D0D0D0" />
                <ThemedText style={styles.emptyGraphText}>
                  아직 진단 기록이 없습니다{'\n'}첫 진단을 시작해보세요!
                </ThemedText>
                <TouchableOpacity
                  style={styles.emptyGraphButton}
                  onPress={handleStartDiagnosis}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.emptyGraphButtonText}>진단 시작하기</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent Diagnosis Summary */}
          {hasHistory && recentDiagnosis ? (
            <View style={styles.card}>
              <ThemedText style={styles.cardTitle}>최근 진단 요약</ThemedText>
              <View style={styles.summaryContent}>
                <TouchableOpacity 
                  style={styles.summaryItem}
                  onPress={() => router.push('/(tabs)/history')}
                  activeOpacity={0.7}
                >
                  <View style={styles.summaryIcon}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color={TEAL_COLOR} />
                  </View>
                  <View style={styles.summaryTextContainer}>
                    <ThemedText style={styles.summaryTitle}>마지막 진단</ThemedText>
                    <ThemedText style={styles.summaryDate}>{recentDiagnosis.date}</ThemedText>
                  </View>
                  <View style={styles.summaryScore}>
                    <ThemedText style={styles.summaryScoreText}>{recentDiagnosis.score}점</ThemedText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewHistoryButton}
                  onPress={() => router.push('/(tabs)/history')}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.viewHistoryButtonText}>전체 기록 보기</ThemedText>
                  <IconSymbol name="chevron.right" size={16} color={TEAL_COLOR} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <ThemedText style={styles.cardTitle}>최근 진단 요약</ThemedText>
              <View style={styles.emptySummaryContainer}>
                <IconSymbol name="doc.text" size={48} color="#D0D0D0" />
                <ThemedText style={styles.emptySummaryText}>
                  아직 진단 기록이 없습니다
                </ThemedText>
                <TouchableOpacity
                  style={styles.emptySummaryButton}
                  onPress={handleStartDiagnosis}
                  activeOpacity={0.7}
                >
                  <GradientView
                    colors={TEAL_GRADIENT}
                    style={styles.emptySummaryButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <IconSymbol name="camera.fill" size={18} color="#fff" />
                    <ThemedText style={styles.emptySummaryButtonText}>첫 진단 시작하기</ThemedText>
                  </GradientView>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: TEAL_COLOR + '20',
    ...(Platform.OS !== 'web' && {
      shadowColor: TEAL_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 5,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(23, 184, 184, 0.2)',
    }),
  },
  logo: {
    width: 80,
    height: 80,
  },
  guideText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  diagnosisButton: {
    borderRadius: 28,
    overflow: 'hidden',
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
  diagnosisButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    gap: 10,
  },
  diagnosisButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  graphArea: {
    minHeight: 200,
    position: 'relative',
  },
  yAxisContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 30,
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  lineChartContainer: {
    marginLeft: 35,
    marginRight: 10,
  },
  lineChart: {
    height: 150,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dataLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 30,
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL_COLOR,
    position: 'absolute',
  },
  dataPointValue: {
    fontSize: 10,
    color: TEAL_COLOR,
    fontWeight: '600',
    position: 'absolute',
    width: 20,
    textAlign: 'center',
  },
  lineSegment: {
    position: 'absolute',
    backgroundColor: TEAL_COLOR,
    transformOrigin: 'left center',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  summaryContent: {
    paddingVertical: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    gap: 15,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E0F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 13,
    color: '#666',
  },
  summaryScore: {
    backgroundColor: TEAL_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  summaryScoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    gap: 6,
  },
  viewHistoryButtonText: {
    fontSize: 15,
    color: TEAL_COLOR,
    fontWeight: '600',
  },
  emptyGraphContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyGraphText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyGraphButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#E0F7F7',
  },
  emptyGraphButtonText: {
    fontSize: 14,
    color: TEAL_COLOR,
    fontWeight: '600',
  },
  emptySummaryContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySummaryText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptySummaryButton: {
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
  emptySummaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptySummaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
