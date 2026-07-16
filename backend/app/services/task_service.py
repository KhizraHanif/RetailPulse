from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import InventoryTask
from app.schemas.task import TaskCreate, TaskUpdate

from app.models.user import User
from app.models.product import Product

def get_all_tasks(
    db: Session,
    current_user: User,
    status: str | None = None,
    category: str | None = None
):
    statement = select(InventoryTask)

    # Owners and managers can review all warehouse tasks.
    if current_user.role not in {"owner", "manager"}:
        # Warehouse staff only see work assigned to them.
        if current_user.role == "warehouse_staff":
            statement = statement.where(
                InventoryTask.assigned_to_id == current_user.id
            )
        else:
            # Cashiers do not have access to inventory tasks.
            raise PermissionError(
                "You do not have permission to view inventory tasks"
            )

    if status:
        statement = statement.where(
            InventoryTask.status == status
        )

    if category:
        statement = statement.where(
            InventoryTask.category == category
        )

    result = db.execute(statement)

    return result.scalars().all()


def get_task_by_id(db: Session, task_id: int):
    """Return a single task or None if it doesn't exist."""
    statement = select(InventoryTask).where(
        InventoryTask.id == task_id
    )

    result = db.execute(statement)

    return result.scalar_one_or_none()


def create_task(
    db: Session,
    task: TaskCreate,
    current_user: User
):
    # Only managers and owners can assign inventory work.
    if current_user.role not in {"manager", "owner"}:
        raise PermissionError(
            "Only managers or owners can create inventory tasks"
        )

    assignee = db.get(User, task.assigned_to_id)

    if assignee is None:
        raise ValueError("Assigned user not found")

    product = db.get(Product, task.product_id)

    if product is None:
        raise ValueError("Product not found")

    new_task = InventoryTask(
        title=task.title,
        description=task.description,
        category=task.category,
        assigned_to_id=task.assigned_to_id,
        product_id=task.product_id,

        # The creator comes from the verified JWT identity.
        created_by_id=current_user.id
    )

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