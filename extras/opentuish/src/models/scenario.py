from dataclasses import dataclass
from typing import List


@dataclass
class Scenario:
    name: str
    steps: List[str]


"""
--- EXAMPLE ---

Scenario(
    name="demo",
    steps=[
        "whoami",
        "uname -a",
        "uptime",
    ],
)

"""
