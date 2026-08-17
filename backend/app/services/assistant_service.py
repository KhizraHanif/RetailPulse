from datetime import datetime

from sqlalchemy.orm import Session

from app.assistant.agent import (
    retailpulse_agent,
)

from app.assistant.tools import (
    AssistantContext,
)

from app.models.user import User


def ask_retailpulse(
    db: Session,
    current_user: User,
    question: str,
    context_days: int | None = None,
) -> str:

    current_date = (
        datetime.now()
        .strftime("%Y-%m-%d")
    )


    if context_days is not None:

        context_instruction = (
            f"The user opened the assistant "
            f"from a view currently showing "
            f"the last {context_days} days. "
            f"Use that period only when the "
            f"user does not specify another "
            f"time period."
        )

    else:

        context_instruction = (
            "No default analysis period was "
            "provided. Determine the appropriate "
            "period from the user's question."
        )


    user_message = f"""
Current date: {current_date}

{context_instruction}

Business question:
{question}

IMPORTANT:

If the user explicitly specifies a period,
their requested period always overrides the
default page context.

Examples:

"last 14 days"
→ use 14 days

"last 6 months"
→ use an appropriate period covering roughly
  the last 6 months

"this year"
→ analyze from the beginning of the current year

"entire history"
→ use the full-history tool

If the user gives no timeframe for a sales
performance question, use a reasonable recent
period and clearly state which period you used.

Inventory levels and warehouse workload represent
current operational state unless the user asks
for historical information.
"""


    result = retailpulse_agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content":
                        user_message,
                }
            ]
        },

        context=AssistantContext(
            db=db,
            current_user=current_user,
        ),
    )


    final_message = (
        result["messages"][-1]
    )


    if isinstance(
        final_message.content,
        str,
    ):
        return final_message.content


    return str(
        final_message.content
    )