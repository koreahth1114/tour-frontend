# 청원여행사 3차 디자인 — 로컬 검토본

기준은 직전 로컬 시안 `fb1524022f06a8d848e9424292c2f373ee88173c`이며 `refine-navigation-local`에서 이어서 작업했다. 사용자가 요청한 시각적 추가 개선만 수행했다. push·PR·운영 배포 없음.

## 검토 주소

- 같은 주소: `http://127.0.0.1:4180/review` — 이전 시안 / 최신 시안, 360·390·768·1440px 선택.
- 최신 홈: `http://127.0.0.1:4180/`, 직전 시안 홈: `http://127.0.0.1:4181/`.
- 2차 비교 캡처 기록: `http://127.0.0.1:4180/review-v2`.
- 이 PC에서 서버 재실행: 작업 폴더에서 `node qa/phase3-server.cjs`.
- 로컬 GET 기반 fixture 미리보기이며 문의·예약 쓰기 요청은 차단된다. 외부 공개 이미지 로드에는 인터넷이 필요하다.

## FINDVALUE 변경 이력

| 영역 | 이번 변경 |
|---|---|
| 국가 탭 | PC 18px/태블릿 17px, 굵은 네이비, 64px 높이, 짧은 활성 밑줄 |
| 지역 드롭다운 | 272px 폭, 16px 모서리, 얇은 중립 보더·겹그림자. 국가/전체보기 위계, 한글 지역명 아래 영문 보조 표기, 가벼운 hover 화살표 |
| 견적 CTA | 124px 캡슐형, 간결한 문서 아이콘, 기존 문구·이동 유지 |
| 카카오/전화 | 124×46px 캡슐형, 브랜드 노랑/파랑 유지, 이름이 보이는 공통 곡선·아이콘 원형 배경·미세한 보더 |
| 히어로 상품 | PC 썸네일 88→112px, 정돈된 이미지 비례, 작은 보조 태그·제품명·20px 가격 위계. 기본 1px 테두리, hover 강조 유지 |
| 본문 구조 | 소개의 큰 배경 박스를 걷어내고 여백·가느다란 구분선 사용. 섹션 제목/카드 본문 간격과 가격 위계 정돈 |
| 폰트 | 기존 설치 글꼴 체인을 고객 화면에 명시. Chrome 플랫폼 글꼴 조회로 메뉴·상품명·소개가 실제 Malgun Gothic 사용 확인. 신규 다운로드 없음 |

블루 헤더·로고·큰 히어로 이미지·콘텐츠 순서·상품명·가격·원문·사진·실제 지역 slug와 링크를 유지했다. 모바일 하단 5탭도 유지했다. 추가 데이터 호출·라이브러리·폰트·이미지 자산 없음. 운영 데이터·인증·DNS·DB 스키마 변경 없음.

## 변경 파일

- `src/components/layout/CountryNavigation.tsx`: 지역명 주/보조 표기, 전체보기 위계
- `src/components/layout/Header.tsx`: 견적 버튼 아이콘
- `src/pages/client/Home.tsx`: 히어로 제목·가격 스타일 구분
- `src/styles/client-refinement.css`: 글꼴·메뉴·CTA·홈 비례와 여백

## 검증과 한계

- 통과: Vite production build (더미 환경변수), 변경 TSX 대상 제한 ESLint, diff whitespace 검사.
- 통과: 360/390/768/1440px 가로 넘침 없음, 국가 메뉴 hover/focus/click·방향키·Escape·포커스 순환·포인터 패널 진입, 실제 지역 slug/필터 이동.
- 통과: 검색·견적 이동, 필수 출발지·placeholder 유지, 하단 5개 터치 영역, reduced motion.
- 통과: 상품 7개·상세 사진 9장·가격·원문·이미지 경로 보존, 사진 원본 비율·그리드 유지.
- 통과: 브라우저 pageerror 0건, 문의/예약 쓰기 0건. 상담 href는 코드 변경 없음.
- 실패(기존): 전체 TypeScript 3건 — ProductGrid.tsx:12의 product/item props, ProductDetail.tsx:859의 to 속성 2건. 새 오류 없음. QA TypeScript 6 deprecation은 검사 인자 `--ignoreDeprecations 6.0`으로 제외, 저장소 설정 변경 없음.
- 미실행: 실제 모바일 기기/iOS Safari/실제 문의 전송. 글꼴은 각 사용자 OS에 설치된 체인에 따라 달라질 수 있다.

## 같은 조건 성능 비교

직전 시안 fb15240 대비 이번 변경을 fresh Chrome context로 전후 5회 교차 측정했다. 1440×1000, CPU 4배 제한, RTT 150ms, 다운로드 200,000B/s, API 250ms 지연, 외부 스크립트 600ms 지연, DCL 뒤 6초 관찰. 외부 이미지 편차를 제거하는 동일 SVG fixture(로고 원본)를 사용했으므로 실제 운영 사진 LCP 측정과 다르다.

| 지표 | 직전 시안 중앙값 | 최신 시안 중앙값 |
|---|---:|---:|
| FCP | 2,276ms | 2,284ms |
| LCP (통제 이미지) | 2,276ms | 2,284ms |
| 로고 DOM 표시 감지 | 2,239.2ms | 2,246.9ms |
| Long task 누적 | 1,014ms | 1,021ms |
| 초기 JS+CSS 압축 전송량 | 199,720B | 200,749B |

FCP 차이는 +8ms(+0.35%), 전송량 +1,029B(+0.52%). FCP 범위는 이전 2,224–2,316ms, 이후 2,240–2,448ms로 실행별 변동이 있고 유의한 속도 개선을 주장하지 않는다. 로고 별도 이미지 요청은 양쪽 0회, hero2 요청은 양쪽 1회, 메뉴 열기 전 추가 지역 요청 0회를 유지했다. 10회 모두 브라우저 오류 없음.

## 증거

작업 폴더 `qa/`의 `phase3-tests.json`, `phase3-content-preservation.json`, `phase3-inspect.json`, `phase3-types.txt`, `phase3-layout.json`, `phase3-perf.json`과 `phase3-{before,after}-{360,390,768,1440}-{home,menu,intro,gallery}.png` 32장. 이전 `phase2-*` 증거도 보존했다.

다음 단계는 사용자 시각 검토다. 운영 반영은 별도 요청을 받은 뒤 진행한다.
