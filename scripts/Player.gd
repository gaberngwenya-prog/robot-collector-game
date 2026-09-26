extends CharacterBody3D
class_name Player

var speed: float = 6.5
var sprint_speed: float = 9.0
var jump_velocity: float = 4.8
var gravity: float = 18.0
var max_health: float = 100.0
var current_health: float = 100.0
var robot_id: String = "starter"
var robot_color: Color = Color(0.3, 0.7, 1.0)
var selected_weapon: String = "pulse_gun"
var loadout: Array = ["pulse_gun", "shock_saber"]
var fire_cooldown: float = 0.0
var melee_cooldown: float = 0.0
var yaw: float = 0.0
var pitch: float = -0.35
var camera_pivot: Node3D
var body_mesh: MeshInstance3D
var head_mesh: MeshInstance3D
var gun_mesh: MeshInstance3D

func _ready() -> void:
    add_to_group("player_group")
    set_physics_process(true)
    setup_body()
    set_robot(robot_id, robot_color)
    Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func setup_body() -> void:
    body_mesh = MeshInstance3D.new()
    var body_mesh_data = BoxMesh.new()
    body_mesh_data.size = Vector3(1.0, 1.8, 0.8)
    body_mesh.mesh = body_mesh_data
    body_mesh.position = Vector3(0.0, 0.9, 0.0)
    add_child(body_mesh)

    head_mesh = MeshInstance3D.new()
    var head_mesh_data = BoxMesh.new()
    head_mesh_data.size = Vector3(0.8, 0.6, 0.8)
    head_mesh.mesh = head_mesh_data
    head_mesh.position = Vector3(0.0, 1.8, 0.0)
    add_child(head_mesh)

    gun_mesh = MeshInstance3D.new()
    var gun_mesh_data = BoxMesh.new()
    gun_mesh_data.size = Vector3(0.2, 0.2, 1.2)
    gun_mesh.mesh = gun_mesh_data
    gun_mesh.position = Vector3(0.5, 1.4, -0.3)
    add_child(gun_mesh)

    var collision = CollisionShape3D.new()
    var shape = CapsuleShape3D.new()
    collision.shape = shape
    add_child(collision)

    camera_pivot = Node3D.new()
    camera_pivot.position = Vector3(0.0, 1.7, 0.0)
    add_child(camera_pivot)

    var camera = Camera3D.new()
    camera.position = Vector3(0.0, 0.0, 5.0)
    camera.rotation_degrees = Vector3(-10.0, 180.0, 0.0)
    camera_pivot.add_child(camera)

func set_robot(robot_name: String, color: Color) -> void:
    robot_id = robot_name
    robot_color = color
    var robot_def = RobotData.get_robot_data(robot_id)
    speed = robot_def["speed"]
    sprint_speed = speed + 2.0
    jump_velocity = robot_def["jump"]
    max_health = robot_def["max_health"]
    current_health = max_health

    var material = StandardMaterial3D.new()
    material.albedo_color = color
    material.metallic = 0.7
    material.roughness = 0.3
    body_mesh.material_override = material
    head_mesh.material_override = material
    gun_mesh.material_override = material

func _physics_process(delta: float) -> void:
    var input_vec = Vector3.ZERO
    if Input.is_action_pressed("move_forward"):
        input_vec.z -= 1
    if Input.is_action_pressed("move_backward"):
        input_vec.z += 1
    if Input.is_action_pressed("move_left"):
        input_vec.x -= 1
    if Input.is_action_pressed("move_right"):
        input_vec.x += 1

    if not is_on_floor():
        velocity.y -= gravity * delta
    else:
        if Input.is_action_just_pressed("jump"):
            velocity.y = jump_velocity

    var move_speed = speed
    if Input.is_action_pressed("sprint"):
        move_speed = sprint_speed

    var basis = Basis().rotated(Vector3.UP, yaw)
    var move_dir = basis * Vector3(input_vec.x, 0.0, input_vec.z)
    if move_dir.length() > 0.0:
        move_dir = move_dir.normalized()
        velocity.x = move_dir.x * move_speed
        velocity.z = move_dir.z * move_speed
    else:
        velocity.x = move_toward(velocity.x, 0.0, move_speed)
        velocity.z = move_toward(velocity.z, 0.0, move_speed)

    move_and_slide()

    fire_cooldown = max(fire_cooldown - delta, 0.0)
    melee_cooldown = max(melee_cooldown - delta, 0.0)

    camera_pivot.rotation_degrees.x = pitch
    camera_pivot.rotation_degrees.y = yaw
    global_rotation.y = yaw

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
        yaw -= event.relative.x * 0.0025
        pitch -= event.relative.y * 0.0025
        pitch = clamp(pitch, -1.2, 1.2)

    if event is InputEventKey and event.pressed:
        if event.keycode == KEY_1:
            selected_weapon = "pulse_gun"
        elif event.keycode == KEY_2:
            selected_weapon = "shock_saber"

    if event is InputEventMouseButton and event.pressed:
        if event.button_index == MOUSE_BUTTON_LEFT:
            perform_fire()
        elif event.button_index == MOUSE_BUTTON_RIGHT:
            perform_melee()

func perform_fire() -> void:
    if fire_cooldown > 0.0:
        return

    fire_cooldown = RobotData.get_weapon_data(selected_weapon)["cooldown"]
    var weapon_data = RobotData.get_weapon_data(selected_weapon)
    var to_target = -global_transform.basis.z
    var origin = global_position + Vector3(0.0, 1.4, 0.0)
    var end = origin + to_target * weapon_data["range"]

    var space = get_world_3d().direct_space_state
    var query = PhysicsRayQueryParameters3D.create(origin, end)
    query.exclude = [self]
    var result = space.intersect_ray(query)
    if result:
        if result["collider"] is Enemy:
            result["collider"].take_damage(weapon_data["damage"])
    print("Fired ", selected_weapon)

func perform_melee() -> void:
    if melee_cooldown > 0.0:
        return

    var weapon_data = RobotData.get_weapon_data(selected_weapon)
    melee_cooldown = weapon_data["cooldown"]
    for node in get_tree().get_nodes_in_group("enemy_group"):
        if node is Enemy:
            var dist = global_position.distance_to(node.global_position)
            if dist < weapon_data["range"] + 1.0:
                node.take_damage(weapon_data["damage"])

func take_damage(amount: float) -> void:
    current_health -= amount
    if current_health <= 0.0:
        current_health = max_health
        position = Vector3(0.0, 1.0, 0.0)
        print("Player respawned to default robot state")

func collect_scrap(amount: int) -> void:
    var main = get_tree().current_scene
    if main != null and main.has_method("collect_scrap"):
        main.collect_scrap(amount)
