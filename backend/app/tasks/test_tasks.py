from app.core.celery_app import celery_app


@celery_app.task
def say_hello(name: str):
    print(f"Hello {name} from Celery")
    return f"Hello {name}"