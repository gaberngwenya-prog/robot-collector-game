extends RefCounted
class_name RobotData

static func get_robot_ids() -> Array:
    return ["starter", "scout", "brute", "vanguard"]

static func get_robot_data(robot_id: String) -> Dictionary:
    var robots = {
        "starter": {
            "display_name": "Starter Bot",
            "cost": 0,
            "color": Color(0.3, 0.7, 1.0),
            "speed": 6.5,
            "jump": 4.8,
            "max_health": 100.0,
            "gun_damage": 20.0,
            "melee_damage": 28.0
        },
        "scout": {
            "display_name": "Scout Bot",
            "cost": 75,
            "color": Color(0.5, 1.0, 0.5),
            "speed": 8.0,
            "jump": 5.5,
            "max_health": 90.0,
            "gun_damage": 18.0,
            "melee_damage": 25.0
        },
        "brute": {
            "display_name": "Brute Bot",
            "cost": 120,
            "color": Color(1.0, 0.45, 0.35),
            "speed": 5.5,
            "jump": 4.2,
            "max_health": 140.0,
            "gun_damage": 24.0,
            "melee_damage": 40.0
        },
        "vanguard": {
            "display_name": "Vanguard Bot",
            "cost": 180,
            "color": Color(0.8, 0.45, 1.0),
            "speed": 6.3,
            "jump": 5.0,
            "max_health": 125.0,
            "gun_damage": 26.0,
            "melee_damage": 32.0
        }
    }
    return robots.get(robot_id, robots["starter"])

static func get_weapon_data(weapon_id: String) -> Dictionary:
    var weapons = {
        "pulse_gun": {
            "display_name": "Pulse Gun",
            "damage": 20.0,
            "range": 20.0,
            "cooldown": 0.18,
            "cost": 0
        },
        "shock_saber": {
            "display_name": "Shock Saber",
            "damage": 32.0,
            "range": 2.8,
            "cooldown": 0.62,
            "cost": 0
        }
    }
    return weapons.get(weapon_id, weapons["pulse_gun"])
