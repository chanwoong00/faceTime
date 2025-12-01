# 피부 진단 앱 (FaceTime)

AI 기반 피부 진단 애플리케이션의 프론트엔드입니다.

## 기능

- 📸 카메라로 피부 사진 촬영
- 🖼️ 갤러리에서 사진 선택
- 🤖 AI 기반 피부 상태 분석
- 📊 분석 결과 및 권장 사항 표시
- 📝 진단 기록 조회

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 백엔드 서버 URL을 설정하세요:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

또는 `config/api.ts` 파일에서 직접 수정할 수 있습니다.

### 3. 앱 실행

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹 브라우저에서 실행
npm run web
```

## 백엔드 연결

백엔드 API는 다음 엔드포인트를 제공해야 합니다:

- `POST /api/analyze` - 피부 이미지 분석
- `GET /api/history` - 진단 히스토리 조회
- `GET /api/result/:id` - 특정 진단 결과 조회

API 요청/응답 형식은 `services/api.ts` 파일을 참조하세요.

## 프로젝트 구조

```
skin-app/
├── app/                 # 앱 화면
│   ├── (tabs)/         # 탭 네비게이션
│   │   ├── index.tsx   # 메인 화면 (피부 진단)
│   │   └── history.tsx # 히스토리 화면
│   └── result.tsx      # 결과 화면
├── components/         # 재사용 가능한 컴포넌트
├── config/            # 설정 파일
│   └── api.ts         # API 설정
├── services/          # API 서비스
│   └── api.ts         # 백엔드 API 호출
└── constants/         # 상수 정의
```

## 백엔드 API 수정

백엔드 API 구조가 다를 경우, `services/api.ts` 파일을 수정하여 맞춰주세요.

### 예시: 이미지 전송 방식 변경

백엔드가 base64 인코딩된 이미지를 요구하는 경우:

```typescript
// 이미지를 base64로 변환
import * as FileSystem from 'expo-file-system';

const base64 = await FileSystem.readAsStringAsync(imageUri, {
  encoding: FileSystem.EncodingType.Base64,
});

const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: `data:image/jpeg;base64,${base64}`,
  }),
});
```

## 기술 스택

- React Native
- Expo
- TypeScript
- Expo Router
- Expo Image Picker

## 라이선스

MIT
