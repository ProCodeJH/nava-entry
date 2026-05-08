# nava-entry 진화 plan — 2026-05-08 자율 설계

자현 명령: "엄청난 시스템 고성능 + 지속적 업그레이드 + 나바 전담".
전제: 자현 게이트 (Phase 1 70%+) 유지하되 자동화로 자현 시간 0.

## 현재 (Phase 1.5)

- ✅ Provider 추상화 (Gemini Flash Lite + DeepSeek 둘 다)
- ✅ Gemini 2.0 Flash deprecated 발견 → 2.5 Flash Lite로 전환
- ✅ 압축 cheatsheet (7.7KB → 3KB) + Implicit cache 활용
- ✅ Phase 1 검증 시스템 (10 인기 게임 자동 benchmark)
- ✅ extractCode 강화 (CRLF / 다양한 fence)
- ✅ Rate limit + 재시도 (503 자동 retry)
- ✅ 자가 수정 루프 (refine.mjs — 1차 실패 시 errors 보내 재시도)
- ✅ must_use 매칭 완화 (substring + alias)

## 다음 라운드 — Phase 1 검증 통과

**목표**: 10 게임 중 7+ valid (70% gate)

방법:
1. **Phase 1 재실행** (`node benchmark.mjs`)
2. 결과 분석 → 미통과 게임 patterns 식별
3. 시스템 프롬프트 개선 (구체 예시 추가)
4. 재실행 → 70%+ 도달

## Phase 2 — 패턴 라이브러리 (Day 2-3)

게이트 통과 후 진입.

- 검증된 게임 코드 30개 (자현 검증 + 학생 import 확인)
- 카테고리별 분류 (action/puzzle/endless/shooter/casual)
- 자동 few-shot 선택 (프롬프트 → 가장 가까운 게임 1-2개 예시 첨부)
- 패턴 추출: 변수 선언 / 이벤트 / 충돌 / 점수 / 끝조건

## Phase 3 — 학생 자율 UI (Day 3-5)

- Next.js 웹 페이지: 학생 입력 + 결과 카드
- 클립보드 자동 복사
- 엔트리 import 가이드 inline
- 다중 사용자 동시 (학원 LAN)

## Phase 4 — 자가 수정 강화 (Day 5-6)

- 현재 1차 refine → 3차까지 확장
- entryjs runtime simulator (no-op AST 검증)
- 실행 가능 코드 비율 95%+ 목표

## Phase 5 — 학원 LAN 배포 (Day 6-8)

- 학원 본체 (100.75.212.102) 호스팅
- API key proxy (학생들이 키 직접 안 봄)
- 사용 메트릭 수집 (학생당 일일 use)

## Phase 6 — 제품화 (Day 8-10)

- 학원 단위 SaaS 라이선스
- 월 구독 + 사용량 대시보드
- Stripe 결제 통합

## 모델 전략

| 용도 | 모델 | 이유 |
|---|---|---|
| 학생 운영 (속도 우선) | gemini-2.5-flash-lite | 15 RPM, 1500 RPD, 빠름 |
| Phase 1 검증 (정확도) | gemini-2.5-flash | 더 정확, 10 RPM |
| 어려운 게임 (퀄리티) | gemini-2.5-pro | 유료 옵션, 최고 품질 |
| 백업 | DeepSeek V3 | 유료, prompt caching |

## 자율 진화 정책

- 매 진화 후 git push (자현 메모 룰)
- evolution-log.json 자동 갱신
- 자현 게이트 통과 기준은 자동 검증
- 통과 시 자동으로 다음 Phase 진입
- 실패 시 자현 알림 + 학습 데이터 추가
