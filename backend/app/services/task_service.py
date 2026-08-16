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


def get_task_by_id(
    db: Session,
    task_id: int,
    current_user: User
):
    task = db.get(
        InventoryTask,
        task_id
    )

    if task is None:
        return None

    if current_user.role in {
        "owner",
        "manager",
    }:
        return task

    if (
        current_user.role ==
        "warehouse_staff"
        and
        task.assigned_to_id ==
        current_user.id
    ):
        return task

    raise PermissionError(
        "You do not have permission "
        "to view this task"
    )


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
    if assignee.role != "warehouse_staff":
        raise ValueError(
        "Tasks must be assigned "
        "to warehouse staff"
    )
    

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
    task: TaskUpdate,
    current_user: User
):
    existing_task = db.get(
        InventoryTask,
        task_id
    )

    if existing_task is None:
        return None

    updates = task.model_dump(
        exclude_unset=True
    )

    # Owner and manager may manage tasks.
    if current_user.role in {
        "owner",
        "manager",
    }:
        if "assigned_to_id" in updates:
            assignee = db.get(
                User,
                updates["assigned_to_id"]
            )

            if assignee is None:
                raise ValueError(
                    "Assigned user not found"
                )

            if (
                assignee.role !=
                "warehouse_staff"
            ):
                raise ValueError(
                    "Tasks must be assigned "
                    "to warehouse staff"
                )

        if "product_id" in updates:
            product = db.get(
                Product,
                updates["product_id"]
            )

            if product is None:
                raise ValueError(
                    "Product not found"
                )

    # Warehouse workers can only change
    # the status of their own task.
    elif (
        current_user.role ==
        "warehouse_staff"
    ):
        if (
            existing_task.assigned_to_id
            != current_user.id
        ):
            raise PermissionError(
                "This task is not assigned to you"
            )

        forbidden_fields = (
            set(updates.keys())
            - {"status"}
        )

        if forbidden_fields:
            raise PermissionError(
                "Warehouse staff can only "
                "update task status"
            )

    else:
        raise PermissionError(
            "You do not have permission "
            "to update inventory tasks"
        )

    for field, value in updates.items():
        setattr(
            existing_task,
            field,
            value
        )

    db.commit()
    db.refresh(existing_task)

    return existing_task


def delete_task(
    db: Session,
    task_id: int,
    current_user: User
):
    if current_user.role not in {
        "owner",
        "manager",
    }:
        raise PermissionError(
            "Only managers or owners "
            "can delete tasks"
        )

    existing_task = db.get(
        InventoryTask,
        task_id
    )

    if existing_task is None:
        return False

    db.delete(existing_task)
    db.commit()

    return True