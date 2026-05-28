import uuid


def generate_trace_id():

    return f"whoai_{uuid.uuid4().hex[:10]}"