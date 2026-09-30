extends CharacterBody3D

const SPEED = 5.0
const JUMP_VELOCITY = 4.5
const ROTATION_SPEED = 5.0

var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")

@onready var animation_player = $AnimationPlayer

func _ready():
	# Create the robot body parts
	create_robot()
	# Play the idle animation
	animation_player.play("idle")

func create_robot():
	# Robot body - forward leaning stance
	var body = MeshInstance3D.new()
	var body_mesh = BoxMesh.new()
	body_mesh.size = Vector3(0.6, 1.2, 0.4)
	body.mesh = body_mesh
	body.position = Vector3(0, 0.6, 0)
	add_child(body)
	
	# Robot head
	var head = MeshInstance3D.new()
	var head_mesh = BoxMesh.new()
	head_mesh.size = Vector3(0.5, 0.5, 0.5)
	head.mesh = head_mesh
	head.position = Vector3(0, 1.4, 0)
	add_child(head)
	
	# Left arm
	var left_arm = MeshInstance3D.new()
	var arm_mesh = BoxMesh.new()
	arm_mesh.size = Vector3(0.2, 0.8, 0.2)
	left_arm.mesh = arm_mesh
	left_arm.position = Vector3(-0.5, 0.8, 0)
	add_child(left_arm)
	
	# Right arm
	var right_arm = MeshInstance3D.new()
	right_arm.mesh = arm_mesh.duplicate()
	right_arm.position = Vector3(0.5, 0.8, 0)
	add_child(right_arm)
	
	# Left leg
	var left_leg = MeshInstance3D.new()
	var leg_mesh = BoxMesh.new()
	leg_mesh.size = Vector3(0.2, 0.8, 0.2)
	left_leg.mesh = leg_mesh
	left_leg.position = Vector3(-0.2, 0.2, 0)
	add_child(left_leg)
	
	# Right leg
	var right_leg = MeshInstance3D.new()
	right_leg.mesh = leg_mesh.duplicate()
	right_leg.position = Vector3(0.2, 0.2, 0)
	add_child(right_leg)
	
	# Add a material to make it visible
	var material = StandardMaterial3D.new()
	material.albedo_color = Color.BLUE
	
	for child in get_children():
		if child is MeshInstance3D:
			child.set_surface_override_material(0, material)

func _physics_process(delta):
	# Add gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	
	# Handle Jump
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = JUMP_VELOCITY
		animation_player.play("jump")
	
	# Handle Movement
	var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	
	if direction:
		velocity.x = direction.x * SPEED
		velocity.z = direction.z * SPEED
		# Rotate to face direction
		transform.basis = transform.basis.rotated(Vector3.UP, atan2(direction.x, direction.z) * delta * ROTATION_SPEED)
		if animation_player.current_animation != "jump":
			animation_player.play("walk")
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		velocity.z = move_toward(velocity.z, 0, SPEED)
		if animation_player.current_animation != "jump":
			animation_player.play("idle")
	
	move_and_slide()
