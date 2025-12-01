import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, View, Animated } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GradientView } from '@/components/GradientView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

export default function DiagnosisScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [scaleAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          '권한 필요',
          '카메라 및 갤러리 접근 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result;
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        
        // 로딩 화면으로 이동
        router.push({
          pathname: '/loading',
          params: { imageUri },
        });
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
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
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconCircle}>
              <IconSymbol name="camera.fill" size={44} color={TEAL_COLOR} />
            </View>
          </Animated.View>
          
          <ThemedText style={styles.title}>피부 진단</ThemedText>
          <ThemedText style={styles.subtitle}>
            사진을 촬영하거나 갤러리에서 선택하여{'\n'}피부 상태를 분석하세요
          </ThemedText>
          
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <IconSymbol name="lightbulb.fill" size={16} color={TEAL_COLOR} />
              <ThemedText style={styles.tipText}>밝은 곳에서 촬영하세요</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol name="lightbulb.fill" size={16} color={TEAL_COLOR} />
              <ThemedText style={styles.tipText}>얼굴 전체가 보이도록 촬영하세요</ThemedText>
            </View>
          </View>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                contentFit="cover"
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => pickImage('camera')}
              activeOpacity={0.8}
            >
              <GradientView
                colors={TEAL_GRADIENT}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="camera.fill" size={26} color="#fff" />
                <ThemedText style={styles.buttonText}>카메라로 촬영</ThemedText>
              </GradientView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => pickImage('gallery')}
              activeOpacity={0.8}
            >
              <IconSymbol name="photo.fill" size={26} color={TEAL_COLOR} />
              <ThemedText style={[styles.buttonText, styles.galleryButtonText]}>
                갤러리에서 선택
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
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
    flexGrow: 1,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0F7F7',
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  tipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7F7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: '#f0f0f0',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    }),
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    gap: 14,
  },
  cameraButton: {
    borderRadius: 18,
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
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    gap: 10,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: TEAL_COLOR,
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 18,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  galleryButtonText: {
    color: TEAL_COLOR,
  },
});
