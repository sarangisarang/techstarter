from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from data_base_sql.database import get_db
from data_base_sql.schemas import WorkoutExerciseCreate, WorkoutExerciseRead
from data_base_sql.crud import (
    add_exercise_to_workout,
    update_workout_exercise,
    delete_workout_exercise,
    get_workout_exercise,
    get_workout_exercises_by_workout,
)

from data_base_sql.models import WorkoutExercise

router = APIRouter(
    prefix="/workout-exercises",
    tags=["Workout Exercises"],
)

# ---------------------------------------------------------
# Alle WorkoutExercises abrufen
# ---------------------------------------------------------
@router.get("/", response_model=list[WorkoutExerciseRead])
def api_get_all_workout_exercises(db: Session = Depends(get_db)):
    items = db.query(WorkoutExercise).all()
    return items


# ---------------------------------------------------------
# WorkoutExercises eines bestimmten Workouts abrufen
# ---------------------------------------------------------
@router.get("/by-workout/{workout_id}", response_model=list[WorkoutExerciseRead])
def api_get_exercises_by_workout(workout_id: UUID, db: Session = Depends(get_db)):
    items = get_workout_exercises_by_workout(db, workout_id)
    return items


# ---------------------------------------------------------
# Einzelnes WorkoutExercise holen
# ---------------------------------------------------------
@router.get("/{we_id}", response_model=WorkoutExerciseRead)
def api_get_workout_exercise(we_id: UUID, db: Session = Depends(get_db)):
    we = get_workout_exercise(db, we_id)
    if not we:
        raise HTTPException(status_code=404, detail="Workout-Übung nicht gefunden")
    return we


# ---------------------------------------------------------
# WorkoutExercise hinzufügen
# ---------------------------------------------------------
@router.post("/", response_model=WorkoutExerciseRead)
def api_add_exercise(data: WorkoutExerciseCreate, db: Session = Depends(get_db)):
    we = add_exercise_to_workout(db, data)
    return we


# ---------------------------------------------------------
# WorkoutExercise aktualisieren
# ---------------------------------------------------------
@router.put("/{we_id}", response_model=WorkoutExerciseRead)
def api_update_exercise(we_id: UUID, data: WorkoutExerciseCreate, db: Session = Depends(get_db)):
    updated = update_workout_exercise(db, we_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Workout-Übung nicht gefunden")
    return updated


# ---------------------------------------------------------
# WorkoutExercise löschen
# ---------------------------------------------------------
@router.delete("/{we_id}")
def api_delete_exercise(we_id: UUID, db: Session = Depends(get_db)):
    success = delete_workout_exercise(db, we_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workout-Übung nicht gefunden")
    return {"message": "Workout-Übung erfolgreich gelöscht"}