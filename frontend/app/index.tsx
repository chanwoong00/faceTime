import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, View, Alert, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GradientView } from '@/components/GradientView';
import { useAuth } from '@/contexts/AuthContext';
import { signUp } from '@/services/api';

const TEAL_COLOR = '#17B8B8';
const TEAL_GRADIENT = ['#17B8B8', '#14A3A3'];

export default function Index() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);  // username이 실제로는 email
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      Alert.alert('입력 오류', '이메일, 비밀번호, 이름을 모두 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, username);  // email, password, name 순서
      console.log('Sign up result:', result);
      
      // 회원가입 성공 후 로그인 화면으로 자동 전환
      const signedUpEmail = email; // 가입한 이메일 저장
      
      // 즉시 로그인 화면으로 전환
      setIsSignUp(false);
      setPassword(''); // 비밀번호 초기화
      setUsername(signedUpEmail); // 로그인 모드에서는 username이 이메일을 담음
      setEmail(''); // email 변수 초기화
      
      // 성공 메시지 표시
      Alert.alert(
        '회원가입 성공', 
        '회원가입이 완료되었습니다.\n이메일과 비밀번호를 입력하여 로그인해주세요.', 
        [{ text: '확인' }]
      );
    } catch (error: any) {
      console.error('Sign up error details:', error);
      const errorMessage = error.message || '회원가입에 실패했습니다.';
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <GradientView
        colors={TEAL_GRADIENT}
        style={[styles.background, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.whitePanel}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <ThemedText style={styles.logoIcon}>✨</ThemedText>
              </View>
              <ThemedText style={styles.brandName}>FACETIME</ThemedText>
              <ThemedText style={styles.tagline}>
                AI 기반 피부 진단으로{'\n'}건강한 피부를 찾아보세요
              </ThemedText>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor="#999"
                  value={isSignUp ? email : username}
                  onChangeText={isSignUp ? setEmail : (text) => {
                    // 로그인 모드일 때도 email 변수에 저장 (실제로는 username 변수지만 email로 사용)
                    setUsername(text);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {isSignUp && (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="이름"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              )}
            </View>

            {/* Login/SignUp Button */}
            <TouchableOpacity
              style={[
                styles.actionButton, 
                ((isSignUp ? (!email.trim() || !password.trim() || !username.trim()) : (!username.trim() || !password.trim())) || loading) && styles.actionButtonDisabled
              ]}
              onPress={isSignUp ? handleSignUp : handleLogin}
              disabled={(isSignUp ? (!email.trim() || !password.trim() || !username.trim()) : (!username.trim() || !password.trim())) || loading}
              activeOpacity={0.8}
            >
              <GradientView
                colors={loading ? ['#999', '#888'] : TEAL_GRADIENT}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText style={styles.actionButtonText}>
                    {isSignUp ? '회원가입' : '로그인'}
                  </ThemedText>
                )}
              </GradientView>
            </TouchableOpacity>

            {/* Sign Up / Login Toggle */}
            <View style={styles.toggleContainer}>
              <ThemedText style={styles.toggleText}>
                {isSignUp ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
                <ThemedText 
                  style={styles.toggleLink} 
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setEmail('');
                  }}
                >
                  {isSignUp ? '로그인' : '회원가입'}
                </ThemedText>
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </GradientView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  whitePanel: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TEAL_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...(Platform.OS !== 'web' && {
      shadowColor: TEAL_COLOR,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 12px rgba(23, 184, 184, 0.4)',
    }),
  },
  logoIcon: {
    fontSize: 50,
  },
  brandName: {
    fontSize: 38,
    fontWeight: '800',
    color: TEAL_COLOR,
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 28,
    gap: 14,
  },
  inputWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  actionButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    marginBottom: 20,
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
  actionButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleLink: {
    color: TEAL_COLOR,
    fontWeight: '700',
  },
});
