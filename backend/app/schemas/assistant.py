from pydantic import BaseModel, Field


class AssistantQuery(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
    )

    # Optional context from another page,
    # such as Analytics.
    #
    # This is NOT a restriction.
    context_days: int | None = Field(
        default=None,
        ge=1,
    )


class AssistantResponse(BaseModel):
    answer: str