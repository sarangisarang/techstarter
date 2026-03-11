from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from data_base_sql.database import get_db
from data_base_sql.schemas import ExerciseCreate, ExerciseRead
from data_base_sql.crud import create_exercise,get_exercise,get_all_exercises,update_exercise,delete_exercise

from uuid import UUID
import os, uuid
from fastapi import UploadFile, File
from .security import get_current_user
from data_base_sql.crud import set_exercise_image


router = APIRouter(
    prefix="/exercises",
    tags=["Exercises"],
    responses={404: {"description": "Übung nicht gefunden"}}
)

@router.post("/{exercise_id}/image", response_model=ExerciseRead)
def upload_image(
    exercise_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ex = get_exercise(db, exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Übung nicht gefunden")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    static_dir = os.path.join(os.path.dirname(__file__), "..", "static", "exercises")
    os.makedirs(static_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(static_dir, filename)

    with open(path, "wb") as f:
        f.write(file.file.read())

    image_url = f"/static/exercises/{filename}"
    return set_exercise_image(db, exercise_id, image_url)


# ============================================================
# ÜBUNGEN ENDPOINTS (Exercises CRUD)
# ============================================================


@router.post("/", response_model=ExerciseRead)
def api_create_exercise(data: ExerciseCreate, db: Session = Depends(get_db)):
    """
    Erstellt eine neue Übung.

    Parameter:
    - name: Name der Übung
    - muscle_group: Zielmuskelgruppe
    - description: optionale Beschreibung

    Rückgabe:
    - Die neu erstellte Übung mit UUID
    """
    return create_exercise(db, data)



@router.get("/", response_model=list[ExerciseRead])
def api_get_all_exercises(db: Session = Depends(get_db)):
    """
    Gibt eine Liste aller verfügbaren Übungen zurück.
    """
    return get_all_exercises(db)



@router.get("/{exercise_id}", response_model=ExerciseRead)
def api_get_exercise(exercise_id: UUID, db: Session = Depends(get_db)):
    """
    Holt eine bestimmte Übung anhand ihrer UUID.

    Fehler:
        404 → Die Übung existiert nicht
    """
    ex = get_exercise(db, exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Übung nicht gefunden")
    return ex



@router.put("/{exercise_id}", response_model=ExerciseRead)
def api_update_exercise(exercise_id: UUID, data: ExerciseCreate, db: Session = Depends(get_db)):
    """
    Aktualisiert eine bestehende Übung.

    Aktualisierbare Felder:
    - Name
    - Muskelgruppe
    - Beschreibung

    Wichtig:
        - Die ID bleibt unverändert.
    """
    updated = update_exercise(db, exercise_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Übung nicht gefunden")
    return updated



@router.delete("/{exercise_id}")
def api_delete_exercise(exercise_id: UUID, db: Session = Depends(get_db)):
    """
    Löscht eine Übung aus der Datenbank.

    Rückgabe:
    - Erfolgsmeldung oder 404, wenn die Übung nicht existiert
    """
    success = delete_exercise(db, exercise_id)
    if not success:
        raise HTTPException(status_code=404, detail="Übung nicht gefunden")
    return {"message": "Übung erfolgreich gelöscht"}
