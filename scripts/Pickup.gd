extends Area3D
class_name Pickup

var value: int = 10
var mesh: MeshInstance3D

func _ready() -> void:
    var sphere = SphereMesh.new()
    sphere.radius = 0.35
    sphere.height = 0.7
    mesh = MeshInstance3D.new()
    mesh.mesh = sphere

    var material = StandardMaterial3D.new()
    material.albedo_color = Color(0.8, 0.8, 0.2)
    mesh.material_override = material
    add_child(mesh)

    var body_shape = CollisionShape3D.new()
    var shape = SphereShape3D.new()
    shape.radius = 0.4
    body_shape.shape = shape
    add_child(body_shape)

    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node3D) -> void:
    if body is Player:
        if body.has_method("collect_scrap"):
            body.collect_scrap(value)
        queue_free()
