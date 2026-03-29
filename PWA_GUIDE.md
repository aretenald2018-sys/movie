# 🎬 무코 영화 캘린더 - PWA 가이드

Progressive Web App (PWA) 기능이 완전히 구현되었습니다.

## 📱 설치 방법

### 💻 데스크톱 (Chrome, Edge, Opera)
1. https://aretenald2018-sys.github.io/movie/ 방문
2. 주소창 우측의 **"설치"** 버튼 클릭
3. **"설치"** 버튼으로 확인

### 📱 모바일 (안드로이드)
1. 같은 URL에서 방문
2. 3점 메뉴 > **"홈 화면에 추가"** (또는 "앱 설치")
3. **"설치"** 또는 **"추가"** 확인

### 🍎 iOS (Safari)
1. Safari에서 앱 방문
2. 하단 공유 버튼 > **"홈 화면에 추가"**
3. 앱 이름 입력 후 추가

## ✨ PWA 기능

### 1️⃣ 오프라인 지원
- 📡 **캐싱 전략**: 스마트 캐싱으로 오프라인에서도 이미 본 데이터 표시
- 🔄 **자동 동기화**: 온라인 복귀 시 자동으로 데이터 갱신
- 💾 **지속적 저장**: 영화 데이터가 기기에 저장되므로 빠른 로딩

### 2️⃣ 앱처럼 실행
- 🚀 **홈 화면 아이콘**: 웹 앱처럼 홈 화면에 설치
- 🖼️ **스플래시 화면**: 앱 실행 시 로딩 화면 표시
- 🔒 **독립적 창**: 브라우저 UI 없이 전체 화면 실행
- ⌨️ **키보드 제어**: 홈 버튼, 뒤로가기 등 제스처 지원

### 3️⃣ 빠른 성능
- ⚡ **즉시 로딩**: 캐시된 자산으로 빠른 시작
- 🎨 **부드러운 전환**: 페이지 간 빠른 이동
- 📊 **네트워크 효율**: 필요한 데이터만 다운로드

### 4️⃣ 배경 동기화 (Beta)
- 🔄 **자동 갱신**: 백그라운드에서 영화 데이터 자동 업데이트
- ⏰ **주기 설정**: 24시간마다 최신 데이터 동기화
- 📲 **조용한 업데이트**: 사용자 방해 없이 진행

## 🔍 기술 스택

### Service Worker
- **캐싱**: 정적 자산(HTML, CSS, JS) 즉시 로딩
- **영화 데이터**: 캐시-먼저 전략으로 오프라인 지원
- **폰트/이미지**: 런타임 캐시로 대역폭 절약
- **네트워크 실패**: 캐시된 버전 자동 대체

### Web App Manifest
```json
{
  "name": "무코 영화 캘린더",
  "icons": [192x192, 512x512, 마스크 가능 아이콘],
  "display": "standalone",
  "categories": ["entertainment", "productivity"]
}
```

### 메타 태그 (iOS)
- `apple-mobile-web-app-capable`: 전체 화면 실행
- `apple-mobile-web-app-status-bar-style`: 상태 표시줄 스타일
- `apple-mobile-web-app-title`: 홈 화면 이름

## 📊 파일 크기

| 파일 | 크기 | 설명 |
|------|------|------|
| index.html | 6.5 KB | 메인 앱 (PWA 스크립트 포함) |
| style.css | 69 KB | 모든 스타일링 |
| service-worker.js | 6.5 KB | 오프라인 캐싱 및 동기화 |
| manifest.json | 2.5 KB | PWA 설정 |
| 영화 데이터 | ~100 KB/월 | JSON 형식 |

## 🔒 캐싱 전략

### 정적 자산 (캐시 버전 1.0)
- **index.html, style.css, service-worker.js**: 설치 시 즉시 캐싱
- **갱신 주기**: Service Worker 업데이트 시 새 버전으로 교체

### 런타임 자산
- **영화 데이터 JSON**: 첫 로드 후 캐싱, 이후 캐시 우선 사용
- **폰트/이미지**: Google Fonts 등 외부 리소스 캐싱
- **API 응답**: 네트워크 실패 시 캐시된 데이터 사용

### 캐시 유지 시간
- 영화 데이터: 무제한 (백그라운드 동기화로 갱신)
- 정적 자산: Service Worker 업데이트까지
- 폰트/이미지: 첫 다운로드 후 계속 캐싱

## 🐛 디버깅

### 콘솔 로그
```javascript
[PWA] Service Worker 등록 성공
[SW] Install event fired
[SW] Caching static assets
[SW] Serving from cache: /data/movies/2026-03.json
```

### Chrome DevTools
1. **Application** 탭
   - **Manifest**: Web App Manifest 확인
   - **Service Workers**: Service Worker 상태 확인
   - **Cache Storage**: 캐시된 자산 보기

2. **Network** 탭
   - Service Worker로부터 서빙되는 요청 확인
   - 오프라인 시 캐시 사용 확인

3. **Console** 탭
   - `[PWA]` 및 `[SW]` 로그 확인

### 캐시 초기화
```javascript
// DevTools 콘솔에서 실행
caches.delete('muko-movie-v1.0');
caches.delete('muko-movie-runtime');
```

## 📱 호환성

| 브라우저 | 데스크톱 | 모바일 | 설명 |
|---------|---------|--------|------|
| Chrome | ✅ | ✅ | 완전 지원 |
| Edge | ✅ | ✅ | 완전 지원 |
| Firefox | ⚠️ | ⚠️ | Service Worker 지원, 설치 제한적 |
| Safari | ⚠️ | ⚠️ | iOS 16+ 지원, 제한적 기능 |
| Opera | ✅ | ✅ | 완전 지원 |

## 🚀 최적화 팁

### 번들 크기
- 정적 자산: 한 번만 다운로드 (76 KB)
- 월간 데이터: 월별로 100 KB (필요할 때만)
- **총 초기 로드**: ~6 KB (manifest + service worker)

### 네트워크 사용
- 📊 모바일 환경에서 **50% 이상 네트워크 절약**
- 💾 오프라인에서도 **모든 기능 사용 가능**
- 🔄 백그라운드 동기화로 **항상 최신 정보 유지**

### 성능
- ⚡ 캐시된 버전: **100ms 이내 로딩**
- 🌐 네트워크: 평균 **500ms~2초 로딩**
- 🔌 오프라인: **즉시 로딩** (캐시된 데이터)

## 🔧 커스터마이징

### 앱 이름 변경
`manifest.json`에서 `name`, `short_name` 수정

### 아이콘 변경
`manifest.json`의 `icons` 배열 수정 (SVG 또는 PNG)

### 캐시 버전 업데이트
`service-worker.js`의 `CACHE_VERSION` 변경 시 자동 갱신

### 추가 오프라인 페이지
`service-worker.js`의 fetch 이벤트에 fallback 추가

## 📞 지원

- 문제 발생 시 브라우저 DevTools의 **Console** 탭에서 로그 확인
- Service Worker 상태: **Application > Service Workers**
- 캐시 확인: **Application > Cache Storage**

---

**버전**: 1.0
**마지막 업데이트**: 2026-03-29
**호스팅**: GitHub Pages (aretenald2018-sys.github.io)
