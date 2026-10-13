# 청원여행사 홈페이지 속도·출발지 개선 기록

작성일: 2026-10-13. 기준 커밋: `eab80d5755031026d38199310861e9052c42ce97`.
로컬 작업 브랜치: `improve-home-loading-departure`.

이 기록은 콘텐츠 제작과 코드 리뷰에 사용할 수 있도록 실제 확인한 원인, 변경, 검증 한계를 구분한다. 운영 배포 결과가 아니라 로컬 구현·검증 결과다. 사용자 계정, 고객 자료, 인증키는 포함하지 않았다.

## 요청과 범위

- 홈페이지의 느린 초기 표시와 파란 헤더 중앙 로고 공백을 개선한다.
- 맞춤견적에서 인원 오른쪽 빈 칸에 **출발지 (필수)**를 추가한다. 연한 안내 문구는 **예) 부산, 서울, 대전, 대구**다.
- 기존 화면 구성과 문의 전달 경로를 유지한다. 실제 문의·예약을 보내지 않는다.
- DB, 인증, DNS, 운영 데이터는 수정하지 않는다. push, PR, 병합, 외부 배포는 수행하지 않는다.

저장소에는 `.agents/skills`, `.agents`, `AGENTS.md`가 없었다. 기존 빌드 설정과 관련 컴포넌트를 확인했다.

## 실제 원인과 수정

1. **히어로 설정 반복 요청**: Home 안에서 매번 생성하는 `defaultHeroSlides2` 배열이 `useHeroSlides2` effect 의존성이었다. 응답의 JSON을 새로운 배열로 상태에 넣으면 다시 렌더되어 또 요청했다. 동일 데이터로 재현한 관찰 구간에서 수정 전 21~44회, 수정 후 1회였다. 기본 배열을 모듈 범위로 이동했다.
2. **불필요한 초기 JavaScript**: 모든 경로가 정적 import여서 관리자 팝업 편집기와 상품 상세도 홈페이지 초기 번들에 들어갔다. 홈과 공통 레이아웃은 즉시 유지하고 나머지는 React lazy/Suspense로 분리했다. 테마 loader도 해당 페이지 진입 때 import한다. 기존 관리자 guard와 mode props는 유지했다.
3. **로고 요청의 순차 대기 — 1차 수정**: 기존 Header는 설정 API가 끝나기 전 이미지 자체가 없었다. 현재 공개 로고 SVG 원본을 `public/site-logo.svg`에 보관하고 preload와 즉시 기본 표시를 추가했다. 설정 API 조회는 계속하며 다른 로고 설정이 오면 그 URL을 사용한다. 설정 실패·이미지 오류에는 기본 로고가 유지된다. 관리자 로고 변경 기능을 모킹으로 확인했다. 앞으로 로고를 교체하면 새 설정 도착 전 기본 스냅샷이 잠시 보일 수 있으므로 기본 자산도 함께 갱신하는 것이 좋다.
4. **작은 아이콘의 과도한 이미지 용량**: 기존 전화 PNG는 1,415,844 bytes, Instagram PNG는 444,647 bytes였다. 원본을 유지하고 96px WebP 파생본(2,376 / 3,132 bytes)을 생성해 해당 UI import를 바꿨다. 두 이미지 합계 99.7% 감소. 화면 표시 크기와 디자인은 유지했다.
5. **문서 파싱을 막는 외부 스크립트**: Kakao SDK에 defer, Naver 분석에 async를 적용했다. Naver 설정을 먼저 선언하고 onload에서 분석을 호출하도록 바꿔 초기화 순서를 보존했다. 모킹 검증에서 호출 1회를 확인했다. 상품 상세의 기존 Kakao SDK 준비 대기 코드는 유지했다.
6. **홈 상품 이미지**: 화면 아래 상품 카드 이미지에 lazy loading과 async decoding을 지정했다.

전체 상품 조회의 `select(*)` 축소는 이번 변경에 포함하지 않았다. 상세 화면과 공유하는 데이터 모델 영향을 별도로 검토해야 하는 후속 후보다.

## 출발지 전달

독립 필드 `departure_place`를 추가했다. 날짜 `depart_date`나 목적지 `region`을 재사용하지 않았다.

- 초기 상태와 완료 후 reset에 빈 문자열을 포함한다.
- label/input 연결, required 속성, 공백 제거 필수 검증을 적용한다.
- 공백만 있으면 버튼이 비활성화된다. 정상 입력은 trim 후 전달한다.
- `EstimatePayload` → 이메일 API 매핑 → `EstimateEmailParams` → 기존 Web3Forms 메시지 본문 `- 출발지: ...`까지 연결했다.
- API 함수와 이메일 함수에서도 빈 출발지를 차단한다.
- **DB 스키마 변경은 필요하지 않으며 수행하지 않았다.**

## 1차 구현의 같은 조건 전후 측정 (아래 최종 보완으로 대체)

Chrome headless, 1440×1000, 새 브라우저 context, 캐시 없음, localhost gzip 정적 서버, CPU 4배 감속, RTT 설정 150ms, 다운로드 200,000 bytes/s. 외부 스크립트 응답 지연 600ms, 공개 API 응답 지연 250ms. 공개 페이지에서 읽은 데이터 응답을 로컬 재생했다. 일반 외부 이미지는 동일 SVG fixture로 대체하고 로고는 실제 SVG를 사용했다. 날짜에 따라 달라지는 팝업 조회는 빈 배열을 반환했다. 각 탐색의 DOMContentLoaded 후 6.5초 동안 관찰, before/after 교대로 3회 측정했다.

**이 수치는 원인 분리를 위한 통제된 로컬 실험이다. 실제 운영 LCP, 실사용자 속도, Lighthouse 점수가 아니다.** 로고 표시 시각은 첫 프레임에서 화면에 보이고 이미지가 로드된 시점이다.

| 지표 | 전 | 후 | 해석 |
|---|---:|---:|---|
| 초기 엔트리 JS (Vite 출력) | 1,275.23 KB | 556.17 KB | 약 56% 감소 |
| 초기 엔트리 JS gzip (Vite 출력) | 351.29 KB | 166.18 KB | 약 53% 감소 |
| 브라우저 측정 JS encoded bytes | 348,701 | 164,811 | 서버 gzip 설정 차이로 Vite 추정과 조금 다름 |
| 로고 표시 중앙값 | 3,786 ms | 2,310 ms | 약 39% 단축 |
| FCP 중앙값 | 3,040 ms | 2,236 ms | 약 26% 단축 |
| 실험 LCP 중앙값 | 3,040 ms | 2,236 ms | 이미지 fixture 조건에만 해당 |
| 히어로2 요청 수 | 21 / 44 / 44 | 1 / 1 / 1 | 반복 요청 제거 |
| long task 합계 중앙값 | 904 ms | 1,074 ms | 개선되지 않음; 이 지표의 개선은 주장하지 않음 |

로고 각 회차(ms): 전 3786 / 3790 / 3733, 후 2310 / 2351 / 2118.
느린 CPU·네트워크 조건에서는 변경 후에도 React 초기 실행 시간이 필요하다. “모든 환경에서 0초 표시”를 보장하지 않는다.

## 검증 결과

**통과**

- 최종 Vite 프로덕션 빌드. 테스트 전용 공개 URL 형식과 더미 키만 사용했다. 엔트리 500KB 초과 경고는 남는다.
- 변경 TS/TSX 파일의 제한된 ESLint 정적 검사: TypeScript parser, no-unreachable, no-duplicate-case, no-constant-condition, no-dupe-args, no-async-promise-executor. 기존 lint 스크립트/설정이 없어 별도 QA 설정으로 실행했다. 프로젝트 전체 권장 lint 통과를 의미하지 않는다.
- `git diff --check`.
- 데스크톱 1440px: 인원과 출발지가 같은 줄이고 출발지가 오른쪽임.
- 모바일 390px: 한 열 배치와 가로 넘침 없음.
- 필수/공백 입력 차단, 정상 입력 활성화, trim한 출발지가 모킹된 이메일 본문에 포함됨.
- 로고 설정 API 실패 시 기본 표시, 다른 설정 URL 반영.
- FAQ 지연 경로, 비로그인 관리자 guard → 로그인 화면, Naver 초기화 1회.
- 위 브라우저 검사에서 수집한 페이지 실행 오류 없음.
- 외부 POST는 Playwright route에서 성공 응답으로 모킹. 실제 Web3Forms 제출은 0건.

**실패 또는 제한**

- `npm run build`: sitemap 단계가 로컬 운영 환경변수 부재로 실패. 이후 Vite 빌드를 별도로 통과했다. sitemap 생성·운영 환경 통합 빌드는 아직 미검증이다.
- 전체 TypeScript 검사: 기준과 최종 모두 동일한 기존 오류 3건. `ProductGrid.tsx:12`의 ProductCard prop 불일치, `ProductDetail.tsx:857`의 `.to` 속성 접근 2건. 신규 오류는 없다. 임시 TypeScript 6 실행의 기존 설정 deprecation을 피하려고 `--ignoreDeprecations 6.0`을 사용했다.
- 실제 관리자 인증 세션, 실제 카카오 공유·분석 서버, 실메일 도착, 운영 사이트 배포 후 성능은 미검증이다.
- 요청 이미지 2장은 공식 Library materialization을 시도했으나 Windows helper가 `os.setxattr` 미지원으로 실패했다. 지정한 두 최종 이미지 경로 모두 파일 부재를 확인했다. 원본 첨부 픽셀 검사는 미완료이며 부모가 전달한 위치 설명과 실제 홈페이지를 사용했다. 임의 경로/다운로드로 우회하지 않았다.
- 내장 브라우저는 Windows 플랫폼 디렉터리 오류로 시작되지 않아 별도 headless Chrome으로 로컬 UI를 확인했다.

## 파일과 증거

변경 파일: `index.html`, `src/routes/index.tsx`, `src/pages/client/Home.tsx`, `src/components/layout/Header.tsx`, `src/components/common/KakaoFloating.tsx`, `src/assets/insta.webp`, `src/assets/phone.webp`, `public/site-logo.svg`, `src/pages/client/EstimatePage.tsx`, `src/api/estimate.api.ts`, `src/utils/emailService.ts`, 본 기록.

저장소 옆 `../qa/`에 검증 자료를 보관했다:

- `results.json`: 전후 원시 측정값과 검증 결과
- `ui-results.json`: 최종 빌드 UI 재검증
- `verify.cjs`: 외부 네트워크를 모킹하는 재현 스크립트
- `before/`, `after/`: 비교용 빌드
- `before-desktop.png`, `after-desktop.png`, `estimate-1440.png`, `estimate-390.png`: 로컬 화면 증거
- `types-before.txt`, `types-final.txt`, `final-build.txt`: 타입/빌드 결과
- `eslint.config.mjs`: 제한된 정적 검사 설정

로컬 검증 재실행은 작업공간 루트에서 `node qa/verify.cjs`, UI만 확인하려면 환경변수 `UI_ONLY=1`을 지정한다. 테스트 도구는 저장소 의존성을 바꾸지 않고 별도 qa 폴더에 설치했다.

## 다음 단계

코드는 로컬 브랜치의 작업 트리에 남아 있다. commit/push/PR/main 병합/외부 배포는 수행하지 않았다. 다음에는 변경 검토 후 승인된 게시 절차를 진행하고, 실제 배포 주소에서 같은 조건의 재측정과 브랜드 설정·카카오 기능을 확인해야 한다. 기존 타입 오류를 고치는 작업은 별도로 결정할 수 있다.

## 추가 검토: 기존 검사 실패의 정확한 내용

전체 타입 검사의 기존 진단은 다음과 같다. 기준 및 최종 결과 파일을 비교했을 때 동일했다.

- `src/components/home/ProductGrid.tsx(12,41)` — TS2322. `ProductCard`는 `item: CardItem` prop을 요구하지만 이 사용처는 `product={p}`를 넘긴다.
- `src/pages/client/ProductDetail.tsx(857,67)` — TS2339. 타입이 `{ label: string }`인 `t`에서 key 생성에 `t.to`를 읽는다.
- 같은 파일 `(857,101)` — TS2339. 같은 `t.to`를 `TagChip`의 `to` prop으로 넘긴다.

`npm run build`는 `npm run sitemap && vite build` 순서다. `scripts/generate-sitemap.mjs`는 `VITE_SUPABASE_ANON_KEY`가 없으면 `.env.local`을 읽으려 한다. 이 로컬 체크아웃에는 그 파일도 없어 키를 얻지 못했고 `process.exit(1)`로 종료했다. `VITE_SUPABASE_URL`에는 스크립트 기본값이 있으므로 직접 종료 원인은 URL 자체가 아니라 익명 API 키 부재다. 따라서 이 명령에서는 Vite 단계까지 도달하지 않았다. 별도 Vite 빌드는 더미 테스트 키로 통과했으며, 운영 자격증명 값을 읽거나 출력하지 않았다.


## 최종 보완: 로고는 첫 화면과 같은 프레임에 표시

앞선 2.31초는 문서 탐색 시작 기준이며 첫 화면 이후 2.31초를 기다렸다는 뜻이 아니다. Element Timing 재검사에서 1차 구현의 로고 이미지 페인트가 FCP보다 48~68ms 늦었다. decoding=sync만으로는 제거되지 않아 그 접근을 대체했다. 최종 `BrandLogo.tsx`는 검토한 원본 SVG를 번들에 포함해 첫 React 렌더에서 인라인 SVG로 그린다. 기본 로고의 별도 이미지 요청과 preload를 제거했다. API에서 다른 로고 URL을 받으면 기존처럼 그 이미지를 표시하고 이미지 오류 시 인라인 기본 로고로 대체한다. 외부 API의 임의 SVG 마크업을 삽입하지 않는다.

최종 빌드 초기 JS는 591.58KB / gzip 181.09KB로, 기준 1275.23KB / 351.29KB보다 각각 약 54% / 48% 작다. 1차 구현보다 약 15KB gzip을 더 써서 로고의 독립적인 이미지 디코딩 지연을 없앴다.

동일 CPU/네트워크/fixture 조건에서 Chrome trace의 실제 첫 헤더 프레임을 비교했다. trace screenshot은 프레임 샘플이므로 타임스탬프 차이를 정확한 추가 지연으로 해석하지 않는다.

| 최종 비교 | 기준 | 최종 |
|---|---:|---:|
| FCP 중앙값 | 3,072ms | 2,116ms |
| 최초 헤더 프레임에 중앙 로고 포함 | 0/3회 | 3/3회 |
| 기본 로고 이미지 요청 | 설정 응답 후 시작 | 0회 |
| 히어로2 요청 | 23~25회 | 1회 |

최종 SVG DOM 삽입은 1589~1620ms, FCP는 2096~2224ms였다. 로고는 FCP 전에 같은 렌더 트리에 준비됐다. 기준 영상에서는 첫 화면의 중앙이 비어 있었고 이후 약 397~503ms 시점의 프레임에서 로고가 관찰됐다. 최종 영상에서는 첫 헤더 프레임부터 로고가 있었다. 설정 응답을 5초 늦춘 별도 검증에서도 FCP 약 2124ms에 로고가 있고, 설정 요청은 2230ms에 시작해 7233ms에 끝났다. 따라서 최종 기본 로고는 설정 조회 완료에 의존하지 않는다.

최종 변경 뒤 Vite 빌드, 변경 로고 컴포넌트 정적 검사, 데스크톱·모바일 폼 모킹, 설정 실패·다른 로고 URL 반영 검사를 다시 통과했다. 타입 진단은 기존 3건 그대로다. 실제 문의는 보내지 않았다.

추가 변경 파일: `src/components/common/BrandLogo.tsx`, `src/assets/site-logo.svg`. `index.html`의 1차 로고 preload는 최종 제거했다.

`docs/evidence/`에 첫 프레임 전후 이미지, 출발지 화면, 최종 원시 타이밍과 UI 검사 결과를 보관했다. 로컬의 `qa/first-frame.cjs`와 `qa/first-frame-final.json`에 재현 코드와 원시 결과가 있다.

## 적용 승인 및 배포 범위 확인

검증 후 바로 적용하라는 사용자 승인을 받았다. FINDVALUE의 tour-frontend 프로젝트와 새 주소는 이 저장소 main의 기준 커밋 배포로 확인됐다. GitHub 기준 커밋에는 기존 jaeyoons-projects 프로젝트와 FINDVALUE 프로젝트 두 Vercel 성공 상태가 있었다. 다만 기존 chungwontour.com의 소유·배포 정보는 현재 FINDVALUE 권한에서 403/404로 조회되지 않는다. 새 프로젝트의 기존 Git 배포 흐름을 사용하며, 기존 도메인 적용 여부는 배포 후 공개 페이지에서 별도로 확인한다. DNS·권한·요금 변경은 하지 않는다. 되돌릴 기준 커밋은 문서 상단의 eab80d5이며, 새 변경 커밋을 revert하는 방식으로 복구할 수 있다. 적용 결과는 별도 배포 기록에 남긴다.
