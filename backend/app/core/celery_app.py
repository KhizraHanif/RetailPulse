import os

from celery import Celery
from dotenv import load_dotenv


load_dotenv()

rabbitmq_user = os.getenv("RABBITMQ_USER")
rabbitmq_password = os.getenv("RABBITMQ_PASSWORD")
rabbitmq_host = os.getenv("RABBITMQ_HOST", "rabbitmq")
rabbitmq_port = os.getenv("RABBITMQ_PORT", "5672")

broker_url = (
    f"amqp://{rabbitmq_user}:{rabbitmq_password}"
    f"@{rabbitmq_host}:{rabbitmq_port}//"
)

celery_app = Celery(
    "retailpulse",
    broker=broker_url,
    include=[
        "app.tasks.test_tasks",
        "app.tasks.inventory_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,

    control_queue_exclusive=True,
    event_queue_exclusive=True,

    worker_enable_remote_control=False,
    worker_send_task_events=False,
)