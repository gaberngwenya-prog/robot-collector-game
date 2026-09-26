extends Node
class_name ShopManager

signal shop_opened
signal shop_closed
signal item_purchased(item_id: String, item_type: String)
signal item_unlocked(item_id: String, item_type: String)

var is_open: bool = false
var player_state: Dictionary = {}

func _ready() -> void:
    player_state = RobotProgress.load_state()

func open_shop() -> void:
    if is_open:
        return
    is_open = true
    emit_signal("shop_opened")
    Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func close_shop() -> void:
    if not is_open:
        return
    is_open = false
    emit_signal("shop_closed")
    Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func purchase_robot(robot_id: String) -> bool:
    var robot_data = RobotData.get_robot_data(robot_id)
    var cost = robot_data["cost"]
    
    # Check if already unlocked
    if player_state["unlocked_robots"].has(robot_id):
        return false
    
    # Check if enough scrap
    if player_state["scrap"] < cost:
        return false
    
    # Purchase
    player_state["scrap"] -= cost
    player_state["unlocked_robots"].append(robot_id)
    player_state["selected_robot"] = robot_id
    RobotProgress.save_state(player_state)
    emit_signal("item_purchased", robot_id, "robot")
    emit_signal("item_unlocked", robot_id, "robot")
    return true

func purchase_weapon(weapon_id: String) -> bool:
    var weapon_data = RobotData.get_weapon_data(weapon_id)
    var cost = weapon_data["cost"]
    
    # Check if already unlocked
    if player_state["unlocked_weapons"].has(weapon_id):
        return false
    
    # Check if enough scrap
    if player_state["scrap"] < cost:
        return false
    
    # Purchase
    player_state["scrap"] -= cost
    player_state["unlocked_weapons"].append(weapon_id)
    RobotProgress.save_state(player_state)
    emit_signal("item_purchased", weapon_id, "weapon")
    emit_signal("item_unlocked", weapon_id, "weapon")
    return true

func get_player_scrap() -> int:
    return player_state["scrap"]

func set_player_scrap(amount: int) -> void:
    player_state["scrap"] = amount
    RobotProgress.save_state(player_state)

func add_scrap(amount: int) -> void:
    player_state["scrap"] += amount
    RobotProgress.save_state(player_state)

func is_robot_unlocked(robot_id: String) -> bool:
    return player_state["unlocked_robots"].has(robot_id)

func is_weapon_unlocked(weapon_id: String) -> bool:
    return player_state["unlocked_weapons"].has(weapon_id)

func reload_state() -> void:
    player_state = RobotProgress.load_state()

func get_state() -> Dictionary:
    return player_state.duplicate()
