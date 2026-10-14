# 승인 디자인과 국가 안내문 배포 준비

승인된 프레임형 히어로 `72e2d59`까지의 모든 로컬 디자인 개선과 베트남/호주 안내문을 함께 반영하는 릴리스다. 변경 파일은 `src/pages/client/ThemeProductsPage.tsx`이며 DB 쓰기는 없다.

베트남·호주 제목은 각각 “베트남 골프여행 안내”, “호주 골프여행 안내”. 본문은 “[국가] 골프여행 상품과 지역별 일정을 한눈에 살펴보세요. 청원여행사에서 여행 일정과 인원에 맞는 골프패키지 및 맞춤 골프투어를 상담하실 수 있습니다.”이다.

공개 등록 데이터에는 베트남 하노이/호치민, 호주 시드니 지역이 있으나 상품 변경에 따라 부정확해질 수 있는 상세 포함사항·직항·인기 주장 없이 안내형 문구를 사용했다. 비어 있는 안내 필드와 베트남의 기존 한 줄 임시 본문 “베트남 골프”에 적용한다. 이후 관리자가 의미 있는 안내를 입력하면 관리자 문구가 우선된다. 일본·중국 안내문은 수정하지 않는다.

배포 전 원격 main은 `4ded462b8c128f9776614e94986e81ad26128de7`로 확인했고 로컬 HEAD의 조상이다. 강제 push나 기존 원격 변경 덮어쓰기는 필요하지 않다. 목표는 GitHub `koreahth1114/tour-frontend` main, FINDVALUE Vercel 프로젝트 `prj_LBKTV0n8I1sAsrVAT5ZmkkgQp6Pp`, team `team_f7l6NiwI6oEmgdYwthz5hXmU`의 production이다.

로컬 Vite 빌드·변경 파일 제한 ESLint·diff whitespace 검사를 통과했다. 전체 타입 검사는 기존 3건(ProductGrid props 1건, ProductDetail to 2건)이 남아 있다. 국가별 PC/모바일 결과와 배포 전후 캡처는 작업 폴더 `qa/release-countries-*.json`, `qa/release-*.png`에 보존한다. 실제 문의·예약은 전송하지 않는다. 배포 성공 여부와 최종 운영 확인은 별도 실행 증거를 기준으로 보고하며 이 문서는 성공을 선행 주장하지 않는다.
