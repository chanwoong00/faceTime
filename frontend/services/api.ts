import API_CONFIG from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@facetime_token';

// 개발 모드: 백엔드 서버 없이 테스트할 수 있도록 모의 데이터 사용
const USE_MOCK_DATA = true; // true로 설정하면 백엔드 없이 테스트 가능

export interface LoginRequest {
  email: string;  // 백엔드는 email 사용
  password: string;
}

export interface LoginResponse {
  accessToken?: string;  // 백엔드는 accessToken 사용
  token?: string;  // 호환성을 위해 유지
  user?: {
    id: string;
    username: string;
    email?: string;
  };
  message?: string;
}

export interface SignUpRequest {
  email: string;  // 백엔드는 email 필수
  password: string;
  name: string;  // 백엔드는 name 사용 (username이 아님)
}

export interface SignUpResponse {
  message: string;
  user?: {
    id: string;
    username: string;
  };
}

export interface SkinAnalysisRequest {
  image: string; // base64 encoded image or FormData
}

export interface SkinAnalysisResponse {
  id: string;
  result: {
    condition: string; // 피부 상태 (예: "건조", "지성", "민감성" 등)
    score: number; // 점수 (0-100)
    recommendations: string[]; // 권장 사항
    issues?: string[]; // 발견된 문제점
  };
  timestamp: string;
  imageUrl?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  condition: string;
  score: number;
  imageUrl?: string;
}

/**
 * API 요청 헤더 가져오기 (토큰 포함)
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * 사용자 로그인
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @returns 로그인 응답 (토큰 포함)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  // 개발용 모의 데이터 (백엔드 서버 없이 테스트)
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션
    return {
      accessToken: 'mock-token-' + Date.now(),
      token: 'mock-token-' + Date.now(),
      user: {
        id: '1',
        username: email.split('@')[0],
        email: email,
      },
    };
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),  // 백엔드는 email 사용
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
      throw new Error(errorData.message || `로그인 실패: ${response.status}`);
    }

    const data = await response.json();
    // 백엔드는 accessToken을 반환하므로 호환성 처리
    return {
      ...data,
      token: data.accessToken || data.token,  // accessToken을 token으로도 사용
      user: data.user || {
        id: '',
        username: email.split('@')[0],
        email: email,
      },
    };
  } catch (error: any) {
    // 네트워크 에러 처리
    if (error.message?.includes('fetch') || error.message?.includes('Network') || error.name === 'TypeError') {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    
    // 기존 에러 메시지가 있으면 그대로 사용
    if (error.message) {
      throw error;
    }
    
    throw new Error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

/**
 * 사용자 회원가입
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @param name - 사용자 이름
 * @returns 회원가입 응답
 */
export async function signUp(email: string, password: string, name: string): Promise<SignUpResponse> {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNUP}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),  // 백엔드는 email, password, name 사용
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `회원가입 실패: ${response.status} ${response.statusText}` };
      }
      throw new Error(errorData.message || errorData.error || `회원가입 실패: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // 네트워크 에러 처리
    if (error.message?.includes('fetch') || error.message?.includes('Network') || error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    
    // 기존 에러 메시지가 있으면 그대로 사용
    if (error.message) {
      throw error;
    }
    
    throw new Error('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

/**
 * 피부 이미지를 분석합니다.
 * @param imageUri - 이미지 URI (로컬 파일 경로)
 * @returns 분석 결과
 */
export async function analyzeSkin(imageUri: string): Promise<SkinAnalysisResponse> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const formData = new FormData();
    
    // 이미지 파일을 FormData에 추가
    // @ts-ignore - React Native FormData 타입 이슈
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'skin-image.jpg',
    } as any);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * 진단 히스토리를 조회합니다.
 * @returns 진단 히스토리 목록
 */
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HISTORY}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * 특정 진단 결과를 조회합니다.
 * @param id - 진단 결과 ID
 * @returns 진단 결과
 */
export async function getResult(id: string): Promise<SkinAnalysisResponse> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESULT}/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

