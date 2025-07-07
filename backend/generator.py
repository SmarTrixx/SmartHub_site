import random
from datetime import datetime, timedelta

class TimetableGenerator:
    def __init__(self, courses, instructors, rooms, constraints):
        self.courses = courses
        self.instructors = instructors
        self.rooms = rooms
        self.constraints = constraints

        self.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        self.time_frame = constraints.get("time_frame", {"start": "08:00", "end": "18:00"})
        self.break_time = constraints.get("break")  # e.g. "12:00" or None

        # Generate time slots based on time frame and course durations
        self.time_slots = self.generate_time_slots()

    def generate_time_slots(self):
        # Assume all courses are 2 hours unless specified
        start = datetime.strptime(self.time_frame["start"], "%H:%M")
        end = datetime.strptime(self.time_frame["end"], "%H:%M")
        slots = []
        current = start
        while current + timedelta(hours=1) <= end:
            slot_str = current.strftime("%H:%M")
            if not self.break_time or slot_str != self.break_time:
                slots.append(slot_str)
            current += timedelta(hours=1)
        return slots

    def get_course_instructor(self, course_code):
        for instructor in self.instructors:
            if instructor["department"] == course_code.split(" ")[0]:
                return instructor
        return random.choice(self.instructors)

    def get_instructor(self, course):
        # Find instructor for course (by name or code, or assign randomly)
        for inst in self.instructors:
            if course["code"] in inst.get("courses", []):
                return inst
        return random.choice(self.instructors)

    def get_available_days(self, instructor):
        return instructor.get("available_days", self.days)

    def get_available_room(self, course):
        # Find a room with enough capacity
        suitable = [room for room in self.rooms if room["capacity"] >= course["num_students"]]
        return random.choice(suitable) if suitable else None

    def validate_inputs(self):
        errors = []
        if not self.courses:
            errors.append("No courses provided.")
        if not self.instructors:
            errors.append("No instructors provided.")
        if not self.rooms:
            errors.append("No rooms provided.")
        if not self.time_frame.get("start") or not self.time_frame.get("end"):
            errors.append("Time frame (start and end) must be specified.")
        # Check that every course has a duration, num_students, and code
        for course in self.courses:
            if "code" not in course or not course["code"]:
                errors.append("A course is missing its code.")
            if "num_students" not in course or not isinstance(course["num_students"], int):
                errors.append(f"Course {course.get('code', '')} missing or invalid num_students.")
            if "duration" not in course or not isinstance(course["duration"], int):
                errors.append(f"Course {course.get('code', '')} missing or invalid duration.")
        # Check that at least one instructor is available for each course
        for course in self.courses:
            found = False
            for inst in self.instructors:
                if course["code"] in inst.get("courses", []):
                    found = True
                    break
            if not found:
                errors.append(f"No instructor assigned for course {course['code']}.")
        # Check that at least one room can fit each course
        for course in self.courses:
            if not any(room["capacity"] >= course["num_students"] for room in self.rooms):
                errors.append(f"No room can fit course {course['code']} with {course['num_students']} students.")
        return errors

    def create_random_schedule(self):
        schedule = []
        for course in self.courses:
            instructor = self.get_instructor(course)
            available_days = self.get_available_days(instructor)
            room = self.get_available_room(course)
            duration = course.get("duration", 2)  # in hours

            # Try to assign without conflict
            assigned = False
            attempts = 0
            while not assigned and attempts < 100:
                day = random.choice(available_days)
                time = random.choice(self.time_slots)
                # Skip break time
                if self.break_time and time == self.break_time:
                    attempts += 1
                    continue
                if not self.has_conflict(schedule, day, time, room, instructor):
                    schedule.append({
                        "course_code": course["code"],
                        "course_name": course["name"],
                        "level": course["level"],
                        "department": course["department"],
                        "instructor": instructor["name"],
                        "day": day,
                        "time": time,
                        "room": room["name"],
                        "duration": duration,
                        "num_students": course["num_students"]
                    })
                    assigned = True
                attempts += 1
            if not assigned:
                # Could not assign this course after many attempts
                raise Exception(f"Could not schedule course {course['code']} (no available slot/room/instructor).")
        return schedule

    def initialize_population(self, size):
        return [self.create_random_schedule() for _ in range(size)]

    def evolve_population(self, population):
        # For simplicity, just shuffle and keep best
        population = sorted(population, key=lambda x: self.fitness(x)[0], reverse=True)
        return population[:len(population)//2] * 2

    def generate(self):
        # Validate inputs first
        errors = self.validate_inputs()
        if errors:
            return {
                "schedule": {},
                "score": 0,
                "conflicts": errors,
                "error": "Validation failed"
            }
        try:
            population = self.initialize_population(50)
            best = None
            score = 0
            conflicts = []
            for _ in range(100):
                population = self.evolve_population(population)
                candidate = max(population, key=lambda x: self.fitness(x)[0])
                score, conflicts = self.fitness(candidate)
                if score >= 100:
                    best = candidate
                    break
                best = candidate
            # Group by level for output
            levels = {}
            for entry in best:
                level = str(entry["level"])
                if level not in levels:
                    levels[level] = []
                levels[level].append(entry)
            return {
                "schedule": levels,
                "score": score,
                "conflicts": conflicts
            }
        except Exception as e:
            return {
                "schedule": {},
                "score": 0,
                "conflicts": [str(e)],
                "error": "Generation failed"
            }

    def has_conflict(self, schedule, day, time, room, instructor):
        for entry in schedule:
            if entry["day"] == day and entry["time"] == time:
                if entry["room"] == room["name"]:
                    return True
                if entry["instructor"] == instructor["name"]:
                    return True
        return False

    def fitness(self, schedule):
        score = 100
        conflicts = []
        seen = set()
        for entry in schedule:
            key = (entry["day"], entry["time"])
            # Room double-booking
            if (key, entry["room"]) in seen:
                score -= 10
                conflicts.append(f"Room {entry['room']} double-booked at {entry['day']} {entry['time']}")
            seen.add((key, entry["room"]))
            # Instructor double-booking
            if (key, entry["instructor"]) in seen:
                score -= 10
                conflicts.append(f"Instructor {entry['instructor']} double-booked at {entry['day']} {entry['time']}")
            seen.add((key, entry["instructor"]))
        return score, conflicts
