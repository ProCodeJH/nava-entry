# 엔트리 블록 → Python 변환 치트시트

총 146블록. 출처: entryjs `src/playground/blocks/block_*.js` 자동 추출.

## 절대 규칙

- `%1`, `%2` 등은 인자 placeholder
- 이벤트는 `def when_xxx():` 형식 (호출하지 않음, 엔트리 런타임이 자동)
- 액션은 `Entry.xxx()` 형식
- 변수는 일반 Python: `점수 = 0`, `점수 += 1`
- 들여쓰기 4 spaces
- 금지: `import`, `time.sleep`, `print()`, `input()`, `class`, `with`, `try`, `lambda`
- 표준 Python 일부 가능: `random.randint(a,b)`, `len()`, `range()`, list/str 메서드

## 시작 (이벤트)

- `when_run_button_click` → `def when_start():`
- `when_some_key_pressed` → `def when_press_key(%2):`
- `mouse_clicked` → `def when_click_mouse_on():`
- `mouse_click_cancled` → `def when_click_mouse_off():`
- `when_object_click` → `def when_click_object_on():`
- `when_object_click_canceled` → `def when_click_object_off():`
- `when_message_cast` → `def when_get_signal(%2):`
- `message_cast` → `Entry.send_signal(%1)`
- `message_cast_wait` → `Entry.send_signal_wait(%1)`
- `when_scene_start` → `def when_start_scene():`
- `start_scene` → `Entry.start_scene(%1)`
- `start_neighbor_scene` → `Entry.start_scene_of(%1)`

## 흐름 (반복/조건)

- `wait_second` → `Entry.wait_for_sec(%1)`
- `repeat_basic` → `for i in range(%1):\n$1`
- `repeat_inf` → `while True:\n$1`
- `repeat_while_true` → `while %1 %2:\n$1`
- `stop_repeat` → `break`
- `continue_repeat` → `continue`
- `_if` → `if %1:\n$1`
- `if_else` → `if %1:\n$1\nelse:\n$2`
- `wait_until_true` → `Entry.wait_until(%1)`
- `stop_object` → `Entry.stop_code(%1)`
- `restart_project` → `Entry.start_again()`
- `when_clone_start` → `def when_make_clone():`
- `create_clone` → `Entry.make_clone_of(%1)`
- `delete_clone` → `Entry.remove_this_clone()`
- `remove_all_clones` → `Entry.remove_all_clone()`

## 움직임

- `move_direction` → `Entry.move_to_direction(%1)`
- `bounce_wall` → `Entry.bounce_on_edge()`
- `move_x` → `Entry.add_x(%1)`
- `move_y` → `Entry.add_y(%1)`
- `move_xy_time` → `Entry.add_xy_for_sec(%2, %3, %1)`
- `locate_x` → `Entry.set_x(%1)`
- `locate_y` → `Entry.set_y(%1)`
- `locate_xy` → `Entry.set_xy(%1, %2)`
- `locate_xy_time` → `Entry.set_xy_for_sec(%2, %3, %1)`
- `locate` → `Entry.move_to(%1)`
- `locate_object_time` → `Entry.move_to_for_sec(%2, %1)`
- `rotate_relative` → `Entry.add_rotation(%1)`
- `direction_relative` → `Entry.add_direction(%1)`
- `rotate_by_time` → `Entry.add_rotation_for_sec(%2, %1)`
- `direction_relative_duration` → `Entry.add_direction_for_sec(%2, %1)`
- `rotate_absolute` → `Entry.set_rotation(%1)`
- `direction_absolute` → `Entry.set_direction(%1)`
- `see_angle_object` → `Entry.look_at(%1)`
- `move_to_angle` → `Entry.move_to_degree(%2, %1)`

## 생김새

- `show` → `Entry.show()`
- `hide` → `Entry.hide()`
- `dialog_time` → `Entry.print_for_sec(%1, %2)`
- `dialog` → `Entry.print(%1)`
- `remove_dialog` → `Entry.clear_print()`
- `change_to_some_shape` → `Entry.change_shape(%1)`
- `change_to_next_shape` → `Entry.change_shape_to(%1)`
- `add_effect_amount` → `Entry.add_effect(%1, %2)`
- `change_effect_amount` → `Entry.set_effect(%1, %2)`
- `erase_all_effects` → `Entry.clear_effect()`
- `change_scale_size` → `Entry.add_size(%1)`
- `set_scale_size` → `Entry.set_size(%1)`
- `flip_x` → `Entry.flip_horizontal()`
- `flip_y` → `Entry.flip_vertical()`
- `change_object_index` → `Entry.send_layer_to(%1)`

## 붓

- `brush_stamp` → `Entry.stamp()`
- `start_drawing` → `Entry.start_drawing()`
- `stop_drawing` → `Entry.stop_drawing()`
- `set_color` → `Entry.set_brush_color_to(%1)`
- `set_random_color` → `Entry.set_brush_color_to_random()`
- `change_thickness` → `Entry.add_brush_size(%1)`
- `set_thickness` → `Entry.set_brush_size(%1)`
- `change_brush_transparency` → `Entry.add_brush_transparency(%1)`
- `set_brush_tranparency` → `Entry.set_brush_transparency(%1)`
- `brush_erase_all` → `Entry.clear_drawing()`

## 소리

- `sound_something_with_block` → `Entry.play_sound(%1)`
- `sound_something_second_with_block` → `Entry.play_sound_for_sec(%1, %2)`
- `sound_from_to` → `Entry.play_sound_from_to(%1, %2, %3)`
- `sound_something_wait_with_block` → `Entry.play_sound_and_wait(%1)`
- `sound_something_second_wait_with_block` → `Entry.play_sound_for_sec_and_wait(%1, %2)`
- `sound_from_to_and_wait` → `Entry.play_sound_from_to_and_wait(%1, %2, %3)`
- `sound_volume_change` → `Entry.add_sound_volume(%1)`
- `sound_volume_set` → `Entry.set_sound_volume(%1)`
- `get_sound_speed` → `Entry.stop_sound()`
- `sound_speed_change` → `Entry.stop_sound()`
- `sound_speed_set` → `Entry.stop_sound()`
- `sound_silent_all` → `Entry.stop_sound()`
- `play_bgm` → `Entry.stop_sound()`
- `stop_bgm` → `Entry.stop_sound()`
- `get_sound_volume` → `Entry.value_of_sound_volume()`
- `get_sound_duration` → `Entry.value_of_sound_length_of(%2)`

## 판단

- `is_clicked` → `Entry.is_mouse_clicked()`
- `is_press_some_key` → `Entry.is_key_pressed(%1)`
- `reach_something` → `Entry.is_touched(%2)`
- `boolean_basic_operator` → `(%1 %2 %3)`
- `boolean_and_or` → `(%1 %2 %3)`
- `boolean_not` → `not (%2)`
- `is_boost_mode` → `Entry.is_boost_mode()`
- `is_current_device_type` → `Entry.is_current_device_type(%1)`
- `is_touch_supported` → `Entry.is_touch_supported()`

## 계산

- `calc_basic` → `(%1 %2 %3)`
- `calc_rand` → `random.randint(%2, %4)`
- `coordinate_mouse` → `Entry.value_of_mouse_pointer(%2)`
- `coordinate_object` → `Entry.value_of_object(%2, %4)`
- `quotient_and_mod` → `(%2 %6 %4)`
- `calc_operation` → `(%2 ** 2)`
- `get_project_timer_value` → `Entry.value_of_timer()`
- `choose_project_timer_action` → `Entry.timer(%2)`
- `set_visible_project_timer` → `Entry.timer_view(%2)`
- `get_date` → `Entry.value_of_current_time(%2)`
- `distance_something` → `Entry.value_of_distance_to(%2)`
- `get_user_name` → `Entry.value_of_username()`
- `get_nickname` → `Entry.value_of_nickname()`
- `length_of_string` → `len(%2)`
- `combine_something` → `(%2 + %4)`
- `index_of_string` → `%2.find(%4)`
- `replace_string` → `%2.replace(%4, %6)`
- `change_string_case` → `%2.upper()`
- `get_block_count` → `Entry.get_block_count(%1)`
- `get_boolean_value` → `Entry.value_of_username()`

## 자료 (변수/리스트)

- `ask_and_wait` → `Entry.input(%1)`
- `get_canvas_input_value` → `Entry.answer()`
- `set_visible_answer` → `Entry.answer_view(%1)`
- `get_variable` → `%1`
- `change_variable` → `%1 += %2`
- `set_variable` → `%1 = %2`
- `show_variable` → `Entry.show_variable(%1)`
- `hide_variable` → `Entry.hide_variable(%1)`
- `add_value_to_list` → `%2.append(%1)`
- `remove_value_from_list` → `%2.pop(%1)`
- `insert_value_to_list` → `%2.insert(%3, %1)`
- `length_of_list` → `len(%2)`
- `is_included_in_list` → `%4 in %2`
- `show_list` → `Entry.show_list(%1)`
- `hide_list` → `Entry.hide_list(%1)`

## 함수

- `set_func_variable` → `%1 = %2`
- `function_create_value` → `%1`
- `function_field_label` → `name`
- `function_field_string` → `value`
- `function_field_boolean` → `boolean`
- `function_create` → `%1`

## 글상자

- `text_read` → `Entry.contents_of_textbox(%1)`
- `text_write` → `Entry.write_text(%1)`
- `text_append` → `Entry.append_text(%1)`
- `text_prepend` → `Entry.prepend_text(%1)`
- `text_change_effect` → `Entry.changeTextEffect(` / `, ` / `)`
- `text_change_font` → `Entry.text_change_font(` / `)`
- `text_change_font_color` → `Entry.text_change_font_color(` / `)`
- `text_change_bg_color` → `Entry.text_change_bg_color(` / `)`
- `text_flush` → `Entry.clear_text()`
