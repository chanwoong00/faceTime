import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const TEAL_COLOR = '#17B8B8';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    if (!username || !password) {
      return;
    }
    router.replace('/(tabs)/home');
  };

  const handleSignUp = () => {
    // 회원가입 화면으로 이동 (나중에 구현)
    console.log('회원가입');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={[styles.background, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, (!username || !password) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!username || !password}
          >
            <ThemedText style={styles.loginButtonText}>로그인</ThemedText>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <ThemedText style={styles.signUpText}>
              계정이 없으신가요?{' '}
              <ThemedText style={styles.signUpLink} onPress={handleSignUp}>
                회원가입
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: TEAL_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  whitePanel: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: TEAL_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: TEAL_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 45,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: TEAL_COLOR,
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
    gap: 15,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: TEAL_COLOR,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: TEAL_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signUpContainer: {
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    color: TEAL_COLOR,
    fontWeight: '600',
  },
});
