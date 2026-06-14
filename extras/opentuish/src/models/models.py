# models.py - contains the dataclasses for the Host class

from dataclasses import dataclass


@dataclass(frozen=True)
class Host:
    name: str
    ip: str
    user: str
    port: int = 22
    marked: bool = True
