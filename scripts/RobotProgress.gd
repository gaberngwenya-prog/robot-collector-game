extends RefCounted
class_name RobotProgress

const SAVE_PATH = "user://robot_progress.cfg"

static func default_state() -> Dictionary:
    return {
        "selected_robot": "starter",
        "selected_color": Color(0.3, 0.7, 1.0),
        "unlocked_robots": ["starter"],
        "unlocked_weapons": ["pulse_gun", "shock_saber"],
        "scrap": 0,
        "selected_weapon": "pulse_gun"
    }

static func save_state(state: Dictionary) -> void:
    var config = ConfigFile.new()
    config.set_value("progress", "selected_robot", state.get("selected_robot", "starter"))
    config.set_value("progress", "selected_color", state.get("selected_color", Color(0.3, 0.7, 1.0)))
    config.set_value("progress", "unlocked_robots", PackedStringArray(state.get("unlocked_robots", ["starter"])))
    config.set_value("progress", "unlocked_weapons", PackedStringArray(state.get("unlocked_weapons", ["pulse_gun", "shock_saber"])))
    config.set_value("progress", "scrap", int(state.get("scrap", 0)))
    config.set_value("progress", "selected_weapon", state.get("selected_weapon", "pulse_gun"))
    var error = config.save(SAVE_PATH)
    if error != OK:
        print("Failed to save progress: ", error)

static func load_state() -> Dictionary:
    var config = ConfigFile.new()
    var error = config.load(SAVE_PATH)
    if error != OK:
        return default_state()

    var state = default_state()
    state["selected_robot"] = config.get_value("progress", "selected_robot", "starter")
    state["selected_color"] = config.get_value("progress", "selected_color", Color(0.3, 0.7, 1.0))
    state["unlocked_robots"] = Array(config.get_value("progress", "unlocked_robots", ["starter"]))
    state["unlocked_weapons"] = Array(config.get_value("progress", "unlocked_weapons", ["pulse_gun", "shock_saber"]))
    state["scrap"] = int(config.get_value("progress", "scrap", 0))
    state["selected_weapon"] = config.get_value("progress", "selected_weapon", "pulse_gun")
    return state
