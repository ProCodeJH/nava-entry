# 🦋 nava-entry

> ⚠️ **DEPRECATED in favor of [entry-ai-tutor](https://github.com/ProCodeJH/entry-ai-tutor)** (자현 학원 production system)
>
> nava-entry = 단일 CLI (DeepSeek/Gemini → Python 코드).
> entry-ai-tutor = 풀 학원 시스템 (11 모드 + 4 AI 어댑터 + 챌린지 + 학생 도구 70개 + .ent 다운로드 + 인기 21종 cover 100%).
>
> **자현 본인 사용**: nava-entry CLI도 OK (Gemini Flash Lite 무료, 빠른 prompt → 코드).
> **학원 운영**: entry-ai-tutor 전용 (학생 30명 동시, 강사 도구, 비용 가드).

엔트리(Entry, playentry.org) 파이썬 코드 자동 생성 — Gemini Flash Lite (default) / DeepSeek V3 + 146블록 cheatsheet.

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

## 진화 로드맵 — DEPRECATED

| Phase | 상태 | 비고 |
|---|---|---|
| Phase 0 | ✅ | CLI + cheatsheet |
| Phase 1 | ✅ 90% | Gemini Flash Lite 9/10 게임 통과 |
| Phase 1.5 | ✅ | Provider 추상화 + 자가 수정 + 검증 시스템 |
| Phase 2-6 | **DEPRECATED** | entry-ai-tutor가 모든 기능 우월하게 구현 |

→ Phase 2+ 는 [entry-ai-tutor](https://github.com/ProCodeJH/entry-ai-tutor) 에서 진행.

**nava-entry는 단일 CLI 도구로만 유지** (자현 본인 빠른 prompt 용).

## 라이선스

MIT (코드) / Apache 2.0 (entryjs source 추출 데이터, blocks.json + cheatsheet.md)
