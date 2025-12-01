import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Animated, TextInput, Platform, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GradientView } from '@/components/GradientView';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getHistory, getResult, HistoryItem } from '@/services/api';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

type TabType = 'morning' | 'evening' | 'weekly' | 'journal';

interface RoutineItem {
  title: string;
  frequency: string;
  description?: string;
}

const routineData: Record<TabType, RoutineItem[]> = {
  morning: [
    { title: '클렌징 폼', frequency: '매일', description: '미온수로 부드럽게 세안' },
    { title: '토너', frequency: '매일', description: '피부 결 정돈 및 수분 공급' },
    { title: '세럼', frequency: '매일', description: '비타민 C 세럼으로 피부 톤 개선' },
    { title: '보습제', frequency: '매일', description: '가볍고 산뜻한 제형' },
    { title: '자외선 차단제', frequency: '매일', description: 'SPF 50+ PA++++' },
  ],
  evening: [
    { title: '이중 클렌징', frequency: '매일', description: '메이크업과 노폐물을 깨끗이 제거하세요' },
    { title: '토너', frequency: '매일', description: '피부를 정돈하고 수분을 공급하세요' },
    { title: '에센스', frequency: '매일', description: '영양을 공급하고 피부를 회복시키세요' },
    { title: '아이크림', frequency: '매일', description: '눈가 피부를 특별히 케어하세요' },
    { title: '나이트 크림', frequency: '매일', description: '밤 동안 피부를 회복시키세요' },
  ],
  weekly: [
    { title: '각질 제거', frequency: '주 2회', description: '각질을 제거하여 피부를 매끄럽게 하세요' },
    { title: '딥 클렌징 마스크', frequency: '주 1회', description: '모공을 깊이 정화하세요' },
    { title: '시트 마스크', frequency: '주 2-3회', description: '집중 수분 공급으로 피부를 촉촉하게 하세요' },
  ],
  journal: [],
};

export default function RoutineTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('morning');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalData, setJournalData] = useState({
    productName: '',
    productType: '',
    satisfaction: 0,
    memo: '',
  });
  const [savedJournals, setSavedJournals] = useState<Record<string, any>>({});
  const [showJournalDetail, setShowJournalDetail] = useState(false);
  const [skinType, setSkinType] = useState<string | null>(null);
  const [hasDiagnosis, setHasDiagnosis] = useState(false);
  const [showProductTypeDropdown, setShowProductTypeDropdown] = useState(false);
  
  const productTypes = [
    '클렌저',
    '토너',
    '세럼',
    '에센스',
    '크림',
    '로션',
    '선크림',
    '마스크',
    '스크럽',
    '기타',
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // 최근 진단 결과 가져오기
  useEffect(() => {
    const loadRecentDiagnosis = async () => {
      try {
        const history = await getHistory();
        if (history && history.length > 0) {
          const recentItem = history[0];
          try {
            const result = await getResult(recentItem.id);
            if (result?.result?.condition) {
              setSkinType(result.result.condition);
              setHasDiagnosis(true);
            }
          } catch (error) {
            // getResult 실패 시 history의 condition 사용
            if (recentItem.condition) {
              setSkinType(recentItem.condition);
              setHasDiagnosis(true);
            }
          }
        }
      } catch (error) {
        // 진단 기록이 없거나 오류 발생 시 기본값 유지
        setHasDiagnosis(false);
      }
    };

    loadRecentDiagnosis();
  }, []);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const renderJournal = () => {
    if (showJournalDetail) {
      const dateKey = formatDate(selectedDate);
      const journal = savedJournals[dateKey];
      
      if (!journal) {
        return (
          <View style={styles.journalContainer}>
            <View style={styles.journalDetailHeader}>
              <TouchableOpacity onPress={() => setShowJournalDetail(false)}>
                <IconSymbol name="chevron.left" size={24} color="#333" />
              </TouchableOpacity>
              <ThemedText style={styles.journalDetailTitle}>일지 상세</ThemedText>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.journalDetailContent}>
              <ThemedText style={styles.journalDetailEmpty}>선택한 날짜에 저장된 기록이 없습니다.</ThemedText>
            </View>
          </View>
        );
      }
      
      return (
        <View style={styles.journalContainer}>
          <View style={styles.journalDetailHeader}>
            <TouchableOpacity onPress={() => setShowJournalDetail(false)}>
              <IconSymbol name="chevron.left" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.journalDetailTitle}>일지 상세</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.journalDetailContent}>
            <View style={styles.journalDetailCard}>
              <ThemedText style={styles.journalDetailDate}>{formatDate(selectedDate)}</ThemedText>
              
              <View style={styles.journalDetailItem}>
                <ThemedText style={styles.journalDetailLabel}>제품명</ThemedText>
                <ThemedText style={styles.journalDetailValue}>{journal.productName || '-'}</ThemedText>
              </View>
              
              <View style={styles.journalDetailItem}>
                <ThemedText style={styles.journalDetailLabel}>제품 종류</ThemedText>
                <ThemedText style={styles.journalDetailValue}>{journal.productType || '-'}</ThemedText>
              </View>
              
              <View style={styles.journalDetailItem}>
                <ThemedText style={styles.journalDetailLabel}>만족도</ThemedText>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol
                      key={star}
                      name={star <= journal.satisfaction ? "star.fill" : "star"}
                      size={24}
                      color={star <= journal.satisfaction ? '#FFD700' : '#E0E0E0'}
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.journalDetailItem}>
                <ThemedText style={styles.journalDetailLabel}>메모</ThemedText>
                <ThemedText style={styles.journalDetailMemo}>{journal.memo || '-'}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      );
    }
    
    if (showJournalForm) {
      return (
        <View style={styles.journalForm}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setShowJournalForm(false)}>
              <IconSymbol name="chevron.left" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.formTitle}>새 기록 추가</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <ThemedText style={styles.formSubtitle}>제품 사용 내역을 기록하세요</ThemedText>
          
          <ScrollView 
            style={styles.formScrollView}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>날짜</ThemedText>
              <View style={styles.dateInput}>
                <ThemedText style={styles.dateText}>{formatDate(selectedDate)}</ThemedText>
                <IconSymbol name="calendar" size={20} color={TEAL_COLOR} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>제품명</ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="사용한 제품 이름을 입력하세요"
                placeholderTextColor="#999"
                value={journalData.productName}
                onChangeText={(text) => setJournalData({ ...journalData, productName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>제품 종류</ThemedText>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.selectInput}
                  onPress={() => setShowProductTypeDropdown(!showProductTypeDropdown)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={journalData.productType ? styles.selectText : styles.selectPlaceholder}>
                    {journalData.productType || '제품 종류를 선택하세요'}
                  </ThemedText>
                  <IconSymbol 
                    name={showProductTypeDropdown ? "chevron.up" : "chevron.down"} 
                    size={16} 
                    color="#999" 
                  />
                </TouchableOpacity>
                {showProductTypeDropdown && (
                  <View style={styles.dropdownList}>
                    {productTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dropdownItem,
                          journalData.productType === type && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setJournalData({ ...journalData, productType: type });
                          setShowProductTypeDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <ThemedText 
                          style={[
                            styles.dropdownItemText,
                            journalData.productType === type && styles.dropdownItemTextSelected,
                          ]}
                        >
                          {type}
                        </ThemedText>
                        {journalData.productType === type && (
                          <IconSymbol name="checkmark" size={16} color={TEAL_COLOR} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>만족도</ThemedText>
              <View style={styles.starsWrapper}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setJournalData({ ...journalData, satisfaction: star })}
                      activeOpacity={0.7}
                      style={styles.starButton}
                    >
                      <IconSymbol
                        name="star.fill"
                        size={36}
                        color={star <= journalData.satisfaction ? '#FFD700' : '#E0E0E0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {journalData.satisfaction > 0 && (
                  <ThemedText style={styles.satisfactionText}>
                    {journalData.satisfaction}점
                  </ThemedText>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>메모</ThemedText>
              <TextInput
                style={styles.memoInput}
                placeholder="예: 피부가 따가웠음, 흡수 잘 됨, 촉촉함 등"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={journalData.memo}
                onChangeText={(text) => setJournalData({ ...journalData, memo: text })}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                const dateKey = formatDate(selectedDate);
                setSavedJournals({
                  ...savedJournals,
                  [dateKey]: { ...journalData, date: selectedDate },
                });
                Alert.alert('알림', '기록이 저장되었습니다!');
                setShowJournalForm(false);
                setJournalData({ productName: '', productType: '', satisfaction: 0, memo: '' });
              }}
            >
              <GradientView
                colors={TEAL_GRADIENT}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ThemedText style={styles.saveButtonText}>저장하기</ThemedText>
              </GradientView>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.journalContainer}>
        <ThemedText style={styles.journalInstruction}>
          사용 중인 화장품과 피부 반응을 기록하여{'\n'}나만의 관리 일지를 만들어보세요.
        </ThemedText>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => {
                const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                setCurrentMonth(prevMonth);
              }}
            >
              <IconSymbol name="chevron.left" size={20} color="#666" />
            </TouchableOpacity>
            <ThemedText style={styles.calendarMonth}>
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                setCurrentMonth(nextMonth);
              }}
            >
              <IconSymbol name="chevron.right" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <View key={day} style={styles.calendarDayHeader}>
                <ThemedText style={styles.calendarDayText}>{day}</ThemedText>
              </View>
            ))}
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const startDayOfWeek = firstDay.getDay();
              const daysInMonth = lastDay.getDate();
              
              const days = [];
              // 빈 칸 채우기
              for (let i = 0; i < startDayOfWeek; i++) {
                days.push(null);
              }
              // 날짜 채우기
              for (let day = 1; day <= daysInMonth; day++) {
                days.push(day);
              }
              
              return days.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.calendarDay} />;
                }
                
                const date = new Date(year, month, day);
                const dateKey = formatDate(date);
                const hasJournal = savedJournals[dateKey];
                const isSelected = 
                  selectedDate.getFullYear() === year &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getDate() === day;
                const isToday = 
                  new Date().getFullYear() === year &&
                  new Date().getMonth() === month &&
                  new Date().getDate() === day;
                
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.calendarDay,
                      isToday && styles.calendarDayToday,
                      isSelected && styles.calendarDaySelected,
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      if (hasJournal) {
                        setShowJournalDetail(true);
                      }
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.calendarDayNumber,
                        isSelected && styles.calendarDayNumberSelected,
                      ]}
                    >
                      {day}
                    </ThemedText>
                    {hasJournal && (
                      <View style={styles.calendarDayDot} />
                    )}
                  </TouchableOpacity>
                );
              });
            })()}
          </View>
        </View>

        <View style={styles.journalButtons}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() => setShowJournalForm(true)}
          >
            <GradientView
              colors={TEAL_GRADIENT}
              style={styles.addRecordButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
              <ThemedText style={styles.addRecordButtonText}>새 기록 추가</ThemedText>
            </GradientView>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.viewRecordsButton}
            onPress={() => {
              const dateKey = formatDate(selectedDate);
              if (savedJournals[dateKey]) {
                setShowJournalDetail(true);
              } else {
                Alert.alert('알림', '선택한 날짜에 저장된 기록이 없습니다.');
              }
            }}
          >
            <ThemedText style={styles.viewRecordsButtonText}>이전 기록 확인하기</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>피부 루틴 추천</ThemedText>
            <ThemedText style={styles.subtitle}>
              {hasDiagnosis && skinType ? `${skinType} 피부 맞춤 루틴` : '맞춤 루틴 추천'}
            </ThemedText>
          </View>

          {/* Info Banner */}
          <View style={styles.banner}>
            <GradientView
              colors={TEAL_GRADIENT}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="sparkles" size={28} color="#fff" />
              <ThemedText style={styles.bannerTitle}>맞춤형 스킨케어 루틴</ThemedText>
              <ThemedText style={styles.bannerText}>
                {hasDiagnosis && skinType 
                  ? `${skinType} 피부를 위한 AI 추천 루틴입니다.\n일관되게 실천하면 2-4주 내에 개선 효과를 느낄 수 있습니다.`
                  : '피부 진단을 완료하면 나만의 맞춤 루틴을 추천받을 수 있습니다.\n일관되게 실천하면 2-4주 내에 개선 효과를 느낄 수 있습니다.'}
              </ThemedText>
            </GradientView>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {[
              { key: 'morning' as TabType, label: '아침', icon: 'sun.max.fill' },
              { key: 'evening' as TabType, label: '저녁', icon: 'moon.fill' },
              { key: 'weekly' as TabType, label: '주간', icon: 'calendar' },
              { key: 'journal' as TabType, label: '피부일지', icon: 'book.fill' },
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

          {/* Content */}
          {activeTab === 'journal' ? (
            renderJournal()
          ) : !hasDiagnosis ? (
            <View style={styles.noDiagnosisContainer}>
              <IconSymbol name="sparkles" size={64} color="#D0D0D0" />
              <ThemedText style={styles.noDiagnosisTitle}>맞춤 루틴을 받으려면</ThemedText>
              <ThemedText style={styles.noDiagnosisText}>
                먼저 피부 진단을 완료해주세요{'\n'}진단 결과를 바탕으로 나만의 루틴을 추천해드립니다
              </ThemedText>
              <TouchableOpacity
                style={styles.noDiagnosisButton}
                onPress={() => router.push('/(tabs)/diagnosis')}
                activeOpacity={0.8}
              >
                <GradientView
                  colors={TEAL_GRADIENT}
                  style={styles.noDiagnosisButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconSymbol name="camera.fill" size={20} color="#fff" />
                  <ThemedText style={styles.noDiagnosisButtonText}>진단 시작하기</ThemedText>
                </GradientView>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.routineList}>
              {routineData[activeTab].map((item, index) => (
                <View key={index} style={styles.routineCard}>
                  <View style={styles.routineLeft}>
                    <View style={styles.routineNumber}>
                      <ThemedText style={styles.routineNumberText}>{index + 1}</ThemedText>
                    </View>
                    <View style={styles.routineContent}>
                      <ThemedText style={styles.routineTitle}>{item.title}</ThemedText>
                      {item.description && (
                        <ThemedText style={styles.routineDescription}>{item.description}</ThemedText>
                      )}
                      <ThemedText style={styles.routineFrequency}>{item.frequency}</ThemedText>
                    </View>
                  </View>
                </View>
              ))}
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
  header: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  banner: {
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...(Platform.OS !== 'web' && {
      shadowColor: TEAL_COLOR,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 16px rgba(23, 184, 184, 0.25)',
    }),
  },
  bannerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 12,
    marginBottom: 12,
  },
  bannerText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.95,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 20,
    gap: 8,
    flexWrap: 'wrap',
  },
  tab: {
    flex: 1,
    minWidth: '22%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#E0F7F7',
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: TEAL_COLOR,
    fontWeight: '700',
  },
  routineList: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 30,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
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
  routineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  routineNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: TEAL_COLOR,
  },
  routineContent: {
    flex: 1,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  routineDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 7,
    lineHeight: 19,
  },
  routineFrequency: {
    fontSize: 13,
    color: TEAL_COLOR,
    fontWeight: '600',
  },
  journalContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 30,
  },
  journalInstruction: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: '#E0F7F7',
  },
  calendarDaySelected: {
    backgroundColor: TEAL_COLOR,
  },
  calendarDayNumber: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  calendarDayNumberSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarDayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEAL_COLOR,
  },
  journalButtons: {
    gap: 12,
  },
  addRecordButton: {
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
  addRecordButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  addRecordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewRecordsButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: TEAL_COLOR,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  viewRecordsButtonText: {
    color: TEAL_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  journalForm: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 30,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  formSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  formContent: {
    paddingBottom: 30,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
  },
  selectText: {
    fontSize: 15,
    color: '#333',
  },
  selectPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    maxHeight: 200,
    overflow: 'hidden',
    zIndex: 1000,
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 1000,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 50,
  },
  dropdownItemSelected: {
    backgroundColor: '#E0F7F7',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: TEAL_COLOR,
    fontWeight: '700',
  },
  starsWrapper: {
    position: 'relative',
    zIndex: 0,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingVertical: 8,
  },
  starButton: {
    padding: 2,
  },
  memoInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
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
  saveButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  journalDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  journalDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  journalDetailContent: {
    padding: 20,
  },
  journalDetailEmpty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 40,
  },
  journalDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
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
  journalDetailDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  journalDetailItem: {
    marginBottom: 20,
  },
  journalDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  journalDetailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  journalDetailMemo: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  noDiagnosisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    minHeight: 400,
  },
  noDiagnosisTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  noDiagnosisText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  noDiagnosisButton: {
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
  noDiagnosisButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 8,
  },
  noDiagnosisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  satisfactionText: {
    marginTop: 8,
    fontSize: 14,
    color: TEAL_COLOR,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 10,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#E0F7F7',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalItemTextSelected: {
    color: TEAL_COLOR,
    fontWeight: '700',
  },
});
