# scenario_loader.py - scenario loader

import yaml
from typing import List
import sys
import os


from src.models.scenario import Scenario

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


def load_scenario(file_path: str) -> Scenario:
    with open(file_path, "r") as f:
        data = yaml.safe_load(f)
    return Scenario(name=data["name"], steps=data["steps"])


def load_scenarios(file_path: str) -> List[Scenario]:
    """Load multiple scenarios from a YAML file."""
    scenarios = []
    with open(file_path, "r") as f:
        data = yaml.safe_load(f)

    # Handle both single scenario and multiple scenarios format
    if isinstance(data, list):
        # Multiple scenarios format
        for item in data:
            scenarios.append(Scenario(name=item["name"], steps=item["steps"]))
    else:
        # Single scenario format (backward compatibility)
        scenarios.append(Scenario(name=data["name"], steps=data["steps"]))

    return scenarios
