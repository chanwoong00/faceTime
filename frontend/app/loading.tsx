import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, View, Easing, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GradientView } from '@/components/GradientView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { analyzeSkin } from '@/services/api';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

export default function LoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [progressValue, setProgressValue] = useState(0);
  const rotation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 진행률 애니메이션
    const progressInterval = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // 회전 애니메이션
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 펄스 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 실제 분석 시작
    const analyzeImage = async () => {
      try {
        if (params.imageUri) {
          const result = await analyzeSkin(params.imageUri as string);
          
          router.replace({
            pathname: '/result',
            params: {
              result: JSON.stringify(result),
              imageUri: params.imageUri as string,
            },
          });
        }
      } catch (error) {
        router.replace({
          pathname: '/result',
          params: {
            imageUri: params.imageUri as string,
          },
        });
      }
    };

    analyzeImage();

    return () => {
      clearInterval(progressInterval);
    };
  }, [params.imageUri]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <StatusBar style="dark" />
      <GradientView
        colors={['#F8F9FA', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressCircleOuter,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Animated.View
              style={[
                styles.progressCircleInner,
                {
                  transform: [{ rotate }],
                },
              ]}
            />
            <View style={styles.progressInner}>
              <ThemedText style={styles.progressText}>{progressValue}</ThemedText>
              <ThemedText style={styles.progressPercent}>%</ThemedText>
            </View>
          </Animated.View>
        </View>

        {/* Main Heading */}
        <ThemedText style={styles.mainHeading}>피부 진단 중</ThemedText>

        {/* Sub Heading */}
        <ThemedText style={styles.subHeading}>AI가 피부 상태를 분석하고 있습니다</ThemedText>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>잠시만 기다려주세요</ThemedText>
          <ThemedText style={styles.infoText}>
            정확한 분석을 위해 AI가 피부 상태를 검사하고 있습니다
          </ThemedText>
        </View>
      </GradientView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' && {
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
    }),
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressContainer: {
    marginBottom: 50,
  },
  progressCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: TEAL_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  progressCircleInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: 'transparent',
    borderTopColor: TEAL_COLOR,
    borderRightColor: TEAL_COLOR,
  },
  progressInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 42,
    fontWeight: '800',
    color: TEAL_COLOR,
  },
  progressPercent: {
    fontSize: 20,
    color: TEAL_COLOR,
    marginTop: -4,
    fontWeight: '600',
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
    fontWeight: '500',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
