# 🦋 nava-entry

엔트리(Entry, playentry.org) 파이썬 코드 자동 생성 — DeepSeek V3 + 146블록 cheatsheet.

## 사용법

```bash
node nava-entry.mjs "벽돌깨기 게임"
# → 정확한 엔트리 파이썬 코드 출력 → 자현이 복사 → 엔트리에 붙여넣기
```

## 셋업

### 1. 환경변수 (택 1)

```powershell
# DeepSeek (유료, 1M 토큰 $0.14)
[Environment]::SetEnvironmentVariable("DEEPSEEK_API_KEY", "sk-...", "User")

# Gemini Flash 2.0 (무료, https://aistudio.google.com/apikey)
[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "AIza...", "User")
```

### 2. 실행

```bash
node nava-entry.mjs "<게임 아이디어>"
```

## 옵션

```bash
nava-entry "<game>" --raw     # 코드만 (헤더 없이)
nava-entry "<game>" --json    # JSON 응답
nava-entry "<game>" --copy    # 클립보드 자동 복사 (Windows)
```

## 구조

```
nava-entry/
├── nava-entry.mjs    # CLI (DeepSeek API 호출)
├── cheatsheet.md     # 146블록 변환 규칙 (entryjs 자동 추출)
├── blocks.json       # 블록 데이터 (메타)
├── extract.mjs       # entryjs source → cheatsheet 추출기
└── raw/              # entryjs 원본 11개 (block_*.js)
```

## 갱신

엔트리 업데이트 시:

```bash
cd raw
for f in block_start block_moving block_looks block_sound block_judgement block_flow block_calc block_variable block_func block_brush block_text; do
  gh api repos/entrylabs/entryjs/contents/src/playground/blocks/${f}.js --jq .content | base64 -d > ${f}.js
done
cd ..
node extract.mjs
```

## 진화 로드맵 (Phase 1-6)

- [x] **Phase 0**: CLI + cheatsheet (현재)
- [ ] **Phase 1**: 정확도 검증 (자현이 5-10 게임 import 시험)
- [ ] **Phase 2**: 검증된 패턴 라이브러리 (30+ 게임)
- [ ] **Phase 3**: 학생 자율 UI (분할 화면 + 채팅)
- [ ] **Phase 4**: 검증 자동화 (validate + 자가 수정 루프)
- [ ] **Phase 5**: 학원 배포 (LAN 호스팅 + 학생 PC 클라이언트)
- [ ] **Phase 6**: 제품화 (라이선스 + 메트릭 대시보드)

## 라이선스

MIT (코드) / Apache 2.0 (entryjs source 추출 데이터, blocks.json + cheatsheet.md)
