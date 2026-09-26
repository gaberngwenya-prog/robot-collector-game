extends Node3D

var player: Player
var state: Dictionary = {}
var ui_root: CanvasLayer
var scrap_label: Label
var health_label: Label
var robot_label: Label
var robot_button_container: VBoxContainer
var color_button_container: HBoxContainer
var robot_cost_label: Label
var info_label: Label

func _ready() -> void:
    randomize()
    state = RobotProgress.load_state()
    build_world()
    create_player()
    spawn_enemies()
    spawn_pickup(Vector3(4.0, 1.0, 3.0))
    build_ui()
    update_ui()

func build_world() -> void:
    var floor_mesh = MeshInstance3D.new()
    var box = BoxMesh.new()
    box.size = Vector3(30.0, 0.5, 30.0)
    floor_mesh.mesh = box
    floor_mesh.position = Vector3(0.0, -0.25, 0.0)
    add_child(floor_mesh)

    var floor_body = StaticBody3D.new()
    var floor_shape = CollisionShape3D.new()
    var box_shape = BoxShape3D.new()
    box_shape.size = Vector3(30.0, 0.5, 30.0)
    floor_shape.shape = box_shape
    floor_body.add_child(floor_shape)
    floor_body.position = Vector3(0.0, -0.25, 0.0)
    add_child(floor_body)

    var light = DirectionalLight3D.new()
    light.rotation_degrees = Vector3(-35.0, 45.0, 0.0)
    light.light_energy = 1.3
    add_child(light)

    var sky = WorldEnvironment.new()
    var env = Environment.new()
    env.background_mode = Environment.BG_COLOR
    env.background_color = Color(0.08, 0.10, 0.16)
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color(0.5, 0.55, 0.65)
    env.ambient_light_energy = 0.8
    sky.environment = env
    add_child(sky)

func create_player() -> void:
    player = Player.new()
    player.position = Vector3(0.0, 1.2, 0.0)
    add_child(player)
    player.loadout = state.get("unlocked_weapons", ["pulse_gun", "shock_saber"])
    player.selected_weapon = "pulse_gun"
    player.set_robot(state.get("selected_robot", "starter"), state.get("selected_color", Color(0.3, 0.7, 1.0)))

func spawn_enemies() -> void:
    for i in range(3):
        var enemy = Enemy.new()
        enemy.position = Vector3(8.0 + i * 4.0, 1.2, -4.0 + i * 2.0)
        enemy.target = player
        add_child(enemy)
        enemy.connect("died", _on_enemy_died)

func spawn_pickup(pos: Vector3) -> void:
    var pickup = Pickup.new()
    pickup.position = pos
    pickup.value = 15
    add_child(pickup)

func build_ui() -> void:
    ui_root = CanvasLayer.new()
    add_child(ui_root)

    var hud = MarginContainer.new()
    hud.offset_left = 20
    hud.offset_top = 20
    hud.offset_right = 200
    hud.offset_bottom = 200
    ui_root.add_child(hud)

    var hud_vbox = VBoxContainer.new()
    hud.add_child(hud_vbox)

    scrap_label = Label.new()
    scrap_label.text = "Scrap: 0"
    hud_vbox.add_child(scrap_label)

    health_label = Label.new()
    health_label.text = "Health: 100/100"
    hud_vbox.add_child(health_label)

    robot_label = Label.new()
    robot_label.text = "Robot: Starter Bot"
    hud_vbox.add_child(robot_label)

    info_label = Label.new()
    info_label.text = "Collect scrap. Unlock new robots and weapons."
    hud_vbox.add_child(info_label)

    robot_button_container = VBoxContainer.new()
    robot_button_container.position = Vector2(20, 180)
    ui_root.add_child(robot_button_container)

    color_button_container = HBoxContainer.new()
    color_button_container.position = Vector2(20, 450)
    ui_root.add_child(color_button_container)

    robot_cost_label = Label.new()
    robot_cost_label.position = Vector2(20, 500)
    ui_root.add_child(robot_cost_label)

    populate_robot_buttons()
    populate_color_buttons()

func populate_robot_buttons() -> void:
    for child in robot_button_container.get_children():
        child.queue_free()

    var buttons = []
    for robot_id in RobotData.get_robot_ids():
        var robot_def = RobotData.get_robot_data(robot_id)
        var button = Button.new()
        button.text = robot_def["display_name"] + " - " + str(robot_def["cost"]) + " scrap"
        if state["unlocked_robots"].has(robot_id):
            button.text = robot_def["display_name"] + " (Unlocked)"
        if robot_id == state["selected_robot"]:
            button.modulate = Color(0.5, 1.0, 0.6)
        button.pressed.connect(_on_robot_button_pressed.bind(robot_id))
        robot_button_container.add_child(button)
        buttons.append(button)

func populate_color_buttons() -> void:
    for child in color_button_container.get_children():
        child.queue_free()

    var palette = [
        Color(0.3, 0.7, 1.0),
        Color(1.0, 0.45, 0.35),
        Color(0.6, 1.0, 0.4),
        Color(0.95, 0.9, 0.2),
        Color(0.8, 0.45, 1.0),
        Color(0.9, 0.9, 0.9)
    ]

    for color in palette:
        var button = Button.new()
        button.custom_minimum_size = Vector2(32, 32)
        button.modulate = color
        button.pressed.connect(_on_color_button_pressed.bind(color))
        color_button_container.add_child(button)

func _on_robot_button_pressed(robot_id: String) -> void:
    if state["unlocked_robots"].has(robot_id):
        state["selected_robot"] = robot_id
        state["selected_color"] = state.get("selected_color", Color(0.3, 0.7, 1.0))
        player.set_robot(robot_id, state["selected_color"])
        RobotProgress.save_state(state)
        populate_robot_buttons()
        update_ui()
        return

    var robot_def = RobotData.get_robot_data(robot_id)
    if state["scrap"] >= robot_def["cost"]:
        state["scrap"] -= robot_def["cost"]
        state["unlocked_robots"].append(robot_id)
        state["selected_robot"] = robot_id
        player.set_robot(robot_id, state["selected_color"])
        RobotProgress.save_state(state)
        populate_robot_buttons()
        update_ui()
        info_label.text = robot_def["display_name"] + " unlocked!"
    else:
        info_label.text = "Not enough scrap for " + robot_def["display_name"] + "."

func _on_color_button_pressed(color: Color) -> void:
    state["selected_color"] = color
    player.set_robot(state["selected_robot"], color)
    RobotProgress.save_state(state)
    update_ui()

func update_ui() -> void:
    if player == null:
        return

    scrap_label.text = "Scrap: " + str(state["scrap"])
    health_label.text = "Health: " + str(int(player.current_health)) + "/" + str(int(player.max_health))
    robot_label.text = "Robot: " + RobotData.get_robot_data(state["selected_robot"])["display_name"]
    var robot_def = RobotData.get_robot_data(state["selected_robot"])
    robot_cost_label.text = "Current: " + robot_def["display_name"] + " | Color: " + str(state["selected_color"]) 

func _process(_delta: float) -> void:
    if player != null:
        update_ui()

func _on_enemy_died(enemy: Enemy) -> void:
    state["scrap"] += 25
    info_label.text = "Enemy defeated. Scrap +25"
    RobotProgress.save_state(state)
    var count = get_tree().get_nodes_in_group("enemy_group").size()
    if count <= 1:
        spawn_enemies()
    update_ui()

func collect_scrap(amount: int) -> void:
    state["scrap"] += amount
    RobotProgress.save_state(state)
    update_ui()
