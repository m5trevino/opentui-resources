# events.py - SSH session events

from dataclasses import dataclass
from enum import Enum
from datetime import datetime


class SessionState(str, Enum):
    CONNECTING = "connecting"
    READY = "ready"
    RUNNING = "running"
    ERROR = "error"
    CLOSED = "closed"


@dataclass
class Event:
    timestamp: datetime
    host: str
    type: str  # stdout | stderr | state | system
    payload: str
