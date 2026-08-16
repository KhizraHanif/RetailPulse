from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db

from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

from app.services.task_service import (
    create_task,
    delete_task,
    get_all_tasks,
    get_task_by_id,
    update_task,
)


router = APIRouter(
    prefix="/api/v1/tasks",
    tags=["Inventory Tasks"]
)


@router.get(
    "/",
    response_model=list[TaskResponse]
)
def get_tasks(
    status: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return get_all_tasks(
            db=db,
            current_user=current_user,
            status=status,
            category=category
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )


@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        task = get_task_by_id(
            db=db,
            task_id=task_id,
            current_user=current_user
        )

        if task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        return task

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )


@router.post(
    "/",
    response_model=TaskResponse
)
def add_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return create_task(
            db=db,
            task=task,
            current_user=current_user
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.put(
    "/{task_id}",
    response_model=TaskResponse
)
def edit_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        updated_task = update_task(
            db=db,
            task_id=task_id,
            task=task,
            current_user=current_user
        )

        if updated_task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        return updated_task

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.delete("/{task_id}")
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        deleted = delete_task(
            db=db,
            task_id=task_id,
            current_user=current_user
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        return {
            "message": "Task deleted successfully"
        }

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )