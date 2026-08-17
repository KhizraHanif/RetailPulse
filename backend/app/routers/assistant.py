from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.security import (
    get_current_user,
)

from app.database.session import (
    get_db,
)

from app.schemas.assistant import (
    AssistantQuery,
    AssistantResponse,
)

from app.services.assistant_service import (
    ask_retailpulse,
)


router = APIRouter(
    prefix="/api/v1/assistant",
    tags=["RetailPulse Assistant"],
)


@router.post(
    "/query",
    response_model=AssistantResponse,
)
def query_assistant(
    request: AssistantQuery,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    ),
):

    if current_user.role not in {
        "owner",
        "manager",
    }:
        raise HTTPException(
            status_code=403,
            detail=(
                "Only owners and managers "
                "can use the business assistant"
            ),
        )

    try:

        answer = ask_retailpulse(
            db=db,
            current_user=current_user,
            question=request.question,
            context_days=request.context_days,
        )

        return {
            "answer": answer,
        }

    except Exception as error:

        print(
            "Assistant error:",
            repr(error),
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "RetailPulse assistant "
                "is currently unavailable"
            ),
        )