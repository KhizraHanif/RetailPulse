from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import InventoryTask
from app.schemas.task import TaskCreate, TaskUpdate


def get_all_tasks(db: Session):
    """Return every inventory task."""
    statement = select(InventoryTask)
    result = db.execute(statement)

    return result.scalars().all()


def get_task_by_id(db: Session, task_id: int):
    """Return a single task or None if it doesn't exist."""
    statement = select(InventoryTask).where(
        InventoryTask.id == task_id
    )

    result = db.execute(statement)

    return result.scalar_one_or_none()


def create_task(db: Session, task: TaskCreate):
    """Create a new inventory task."""
    new_task = InventoryTask(**task.model_dump())

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


def update_task(
    db: Session,
    task_id: int,
    task: TaskUpdate
):
    """Update only the fields provided by the client."""
    existing_task = get_task_by_id(db, task_id)

    if existing_task is None:
        return None

    updates = task.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(existing_task, field, value)

    db.commit()
    db.refresh(existing_task)

    return existing_task


def delete_task(db: Session, task_id: int):
    """Delete a task if it exists."""
    existing_task = get_task_by_id(db, task_id)

    if existing_task is None:
        return False

    db.delete(existing_task)
    db.commit()

    return True