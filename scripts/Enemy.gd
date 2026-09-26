extends CharacterBody3D
class_name Enemy

signal died(enemy: Enemy)

var target: Node3D
var speed: float = 3.8
var damage: float = 12.0
var max_health: float = 50.0
var current_health: float = 50.0
var attack_cooldown: float = 0.0
var body_mesh: MeshInstance3D

func _ready() -> void:
    add_to_group("enemy_group")
    setup_enemy()

func setup_enemy() -> void:
    body_mesh = MeshInstance3D.new()
    var body_mesh_data = BoxMesh.new()
    body_mesh_data.size = Vector3(1.0, 1.5, 1.0)
    body_mesh.mesh = body_mesh_data
    body_mesh.position = Vector3(0.0, 0.75, 0.0)

    var material = StandardMaterial3D.new()
    material.albedo_color = Color(0.9, 0.2, 0.2)
    body_mesh.material_override = material
    add_child(body_mesh)

    var collision = CollisionShape3D.new()
    var shape = CapsuleShape3D.new()
    collision.shape = shape
    add_child(collision)

func _physics_process(delta: float) -> void:
    attack_cooldown = max(attack_cooldown - delta, 0.0)
    if target == null:
        return

    var direction = target.global_position - global_position
    if direction.length() > 0.1:
        direction = direction.normalized()
        velocity.x = direction.x * speed
        velocity.z = direction.z * speed

    if direction.length() < 1.8:
        velocity.x = 0.0
        velocity.z = 0.0
        if attack_cooldown <= 0.0:
            if target is Player:
                target.take_damage(damage)
            attack_cooldown = 1.2
    move_and_slide()

func take_damage(amount: float) -> void:
    current_health -= amount
    if current_health <= 0.0:
        emit_signal("died", self)
        queue_free()
