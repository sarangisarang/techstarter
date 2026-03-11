from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .security import get_current_user
from data_base_sql.database import get_db
from data_base_sql.schemas import WorkoutCreate, WorkoutRead, WorkoutAnalysisRead
from data_base_sql.crud import (
    create_workout,
    get_workout,
    get_all_workouts,
    update_workout,
    delete_workout,
)
from data_base_sql.calculations import calculate_workout_analysis

router = APIRouter(
    prefix="/workouts",
    tags=["Workouts"],
)


# ---------------------------------------------------------
# Workout erstellen (inkl. Exercises)
# ---------------------------------------------------------
@router.post("/", response_model=WorkoutRead)
def api_create_workout(
    data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    workout = create_workout(db, current_user.id, data)
    return workout


# ---------------------------------------------------------
# Alle Workouts abrufen
# ---------------------------------------------------------
@router.get("/", response_model=list[WorkoutRead])
def api_get_all_workouts(db: Session = Depends(get_db)):
    return get_all_workouts(db)


# ---------------------------------------------------------
# Einzelnes Workout abrufen
# ---------------------------------------------------------
@router.get("/{workout_id}", response_model=WorkoutRead)
def api_get_workout(workout_id: UUID, db: Session = Depends(get_db)):
    workout = get_workout(db, workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout nicht gefunden")
    return workout


# ---------------------------------------------------------
# Workout-Analyse berechnen
# ---------------------------------------------------------
@router.get("/{workout_id}/analysis", response_model=WorkoutAnalysisRead)
def api_get_workout_analysis(
    workout_id: UUID,
    body_weight_kg: Decimal | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    workout = get_workout(db, workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout nicht gefunden")
    if str(workout.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Kein Zugriff auf dieses Workout")
    return calculate_workout_analysis(workout, body_weight_kg=body_weight_kg)


# ---------------------------------------------------------
# Workout aktualisieren (ohne Exercises!)
# ---------------------------------------------------------
@router.put("/{workout_id}", response_model=WorkoutRead)
def api_update_workout(workout_id: UUID, data: WorkoutCreate, db: Session = Depends(get_db)):
    updated = update_workout(db, workout_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Workout nicht gefunden")
    return updated


# ---------------------------------------------------------
# Workout löschen (inkl. aller Exercises dank Cascade)
# ---------------------------------------------------------
@router.delete("/{workout_id}")
def api_delete_workout(workout_id: UUID, db: Session = Depends(get_db)):
    success = delete_workout(db, workout_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workout nicht gefunden")
    return {"message": "Workout erfolgreich gelöscht"}
