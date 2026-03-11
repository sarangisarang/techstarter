from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from data_base_sql.database import get_db
from data_base_sql.schemas import UserCreate, UserRead
from data_base_sql.crud import create_user, get_user, get_all_users, update_user, delete_user
from uuid import UUID

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Benutzer nicht gefunden"}}
)


# ============================================================
# BENUTZER ENDPOINTS
# ============================================================


@router.post("/", response_model=UserRead)
def api_create_user(data: UserCreate, db: Session = Depends(get_db)):
    """
    Erstellt einen neuen Benutzer.

    Parameter:
    - email: E-Mail-Adresse des Benutzers
    - password_hash: bereits gehashter Passwortwert

    Rückgabe:
    - Der neu erstellte Benutzer (mit UUID)
    """
    return create_user(db, data)



@router.get("/", response_model=list[UserRead])
def api_get_all_users(db: Session = Depends(get_db)):
    """
    Gibt alle registrierten Benutzer zurück.
    """
    return get_all_users(db)



@router.get("/{user_id}", response_model=UserRead)
def api_get_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Holt einen Benutzer anhand der UUID.

    Fehler:
        404, wenn der Benutzer nicht existiert.
    """
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return user



@router.put("/{user_id}", response_model=UserRead)
def api_update_user(user_id: UUID, data: UserCreate, db: Session = Depends(get_db)):
    """
    Aktualisiert einen bestehenden Benutzer.

    Wichtig:
    - Die UUID bleibt unverändert.
    - Passwort wird neu überschrieben.
    """
    updated = update_user(db, user_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return updated



@router.delete("/{user_id}")
def api_delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Löscht einen Benutzer aus der Datenbank.

    Rückgabe:
    - Erfolgs- oder Fehlermeldung
    """
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return {"message": "Benutzer erfolgreich gelöscht"}
