# 엔트리 Python 압축 치트시트 (v1)

핵심 함수 정수 80개. 풀 cheatsheet.md 대신 시스템 프롬프트에 임베드.

## 절대 규칙
- 함수: `Entry.xxx()` 형식만 사용. 새 함수 만들지 말 것.
- 이벤트 핸들러: `def when_xxx():` (호출 X, 엔트리 자동)
- 변수: 일반 Python (`점수 = 0`, `점수 += 1`)
- 들여쓰기: 4 spaces
- **금지: `import`, `time.sleep`, `print()`, `input()`, `class`, `with`, `try`, `lambda`**
- 표준 Python 일부만 OK: `random.randint(a,b)`, `len()`, `range()`, list/str

## 이벤트 (def when_xxx)
- `when_start()` 시작버튼
- `when_press_key("space"|"left arrow"|"right arrow"|"up arrow"|"down arrow"|"a"-"z"|"0"-"9")` 키
- `when_click_mouse_on()` / `when_click_mouse_off()` 마우스 클릭
- `when_click_object_on()` / `when_click_object_off()` 오브젝트 클릭
- `when_get_signal("신호명")` 신호 받기
- `when_make_clone()` 복제본 생성됨
- `when_start_scene()` 장면 시작

## 움직임
- `Entry.move_to_direction(N)` 방향 N만큼
- `Entry.bounce_on_edge()` 벽 닿으면 튕김
- `Entry.add_x(N)` / `Entry.add_y(N)` 좌표 N만큼
- `Entry.set_x(N)` / `Entry.set_y(N)` / `Entry.set_xy(X,Y)` 절대 위치
- `Entry.add_xy_for_sec(X, Y, sec)` 시간 동안 이동
- `Entry.set_xy_for_sec(X, Y, sec)` 시간 동안 절대 이동
- `Entry.move_to(obj)` 오브젝트로
- `Entry.add_rotation(N)` / `Entry.set_rotation(N)` 회전
- `Entry.add_direction(N)` / `Entry.set_direction(N)` 방향
- `Entry.look_at(obj)` 오브젝트 쳐다보기

## 생김새
- `Entry.show()` / `Entry.hide()` 보이기/숨기기
- `Entry.print(text)` 말풍선
- `Entry.print_for_sec(text, sec)` 시간 말풍선
- `Entry.clear_print()` 말풍선 지우기
- `Entry.change_shape(name)` 모양 바꾸기
- `Entry.change_shape_to(direction)` 다음/이전 모양
- `Entry.add_effect(type, N)` / `Entry.set_effect(type, N)` 효과 (color/transparency/brightness)
- `Entry.clear_effect()` 효과 지우기
- `Entry.add_size(N)` / `Entry.set_size(N)` 크기

## 흐름 (반복/조건)
- `Entry.wait_for_sec(N)` N초 기다리기
- `for i in range(N):` 반복
- `while True:` 무한
- `while 조건:` 조건 반복
- `break` / `continue`
- `if 조건:` / `if 조건: ... else:`
- `Entry.wait_until(조건)` 조건 될 때까지

## 복제
- `Entry.make_clone_of(obj)` 복제본 생성 ("self" 가능)
- `Entry.remove_this_clone()` 이 복제본 삭제
- `Entry.remove_all_clone()` 모든 복제 삭제

## 신호
- `Entry.send_signal(name)` 신호 보내기
- `Entry.send_signal_wait(name)` 신호 + 끝까지 대기

## 장면
- `Entry.start_scene(name)` 장면 시작
- `Entry.start_scene_of("next"|"prev")` 다음/이전 장면

## 판단 (값을 반환 — 조건문 안에서 사용)
- `Entry.touch_wall("up"|"down"|"left"|"right"|"any")` 벽 닿음
- `Entry.touch_object(obj_name)` 오브젝트 닿음
- `Entry.is_press_key("키")` 키 눌림 상태
- `Entry.is_click_mouse()` 마우스 누름 상태
- `Entry.x()` / `Entry.y()` 현재 좌표
- `Entry.size()` / `Entry.direction()` / `Entry.rotation()`
- `Entry.mouse_x()` / `Entry.mouse_y()` 마우스 좌표
- `Entry.distance_to(obj)` 거리

## 계산 (값 반환)
- `random.randint(a, b)` 랜덤 정수
- `Entry.pick_random(a, b)` (또는 random.randint)

## 소리
- `Entry.play_sound(name)` 소리 재생
- `Entry.play_sound_wait(name)` 소리 끝까지

## 자주 사용 패턴

### 키 이동
```python
def when_press_key("right arrow"):
    Entry.add_x(10)
def when_press_key("left arrow"):
    Entry.add_x(-10)
```

### 충돌 검사 + 점수
```python
점수 = 0  # 엔트리 변수에 미리 만들어둘 것

def when_start():
    while True:
        if Entry.touch_object("적"):
            점수 += 1
            Entry.remove_this_clone()
        Entry.wait_for_sec(0.05)
```

### 적 무한 생성 (복제)
```python
def when_start():
    while True:
        Entry.make_clone_of("적")
        Entry.wait_for_sec(random.randint(1, 3))

def when_make_clone():
    Entry.set_xy(random.randint(-200, 200), 150)
    while True:
        Entry.add_y(-5)
        if Entry.touch_wall("down"):
            Entry.remove_this_clone()
        Entry.wait_for_sec(0.05)
```

### 발사
```python
def when_press_key("space"):
    Entry.make_clone_of("총알")

def when_make_clone():
    Entry.set_xy(Entry.x(), Entry.y())
    while True:
        Entry.add_y(15)
        if Entry.touch_wall("up"):
            Entry.remove_this_clone()
        Entry.wait_for_sec(0.02)
```
