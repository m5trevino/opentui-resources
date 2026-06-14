# inventory_manager.py - управление инвентарем хостов

import yaml
from typing import List
import sys
import os


from src.models.models import Host

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


def load_hosts_from_yaml(file_path: str) -> List[Host]:
    """
    Load hosts from a YAML file.

    Args:
        file_path (str): Path to the YAML file

    Returns:
        List[Host]: List of hosts
    """
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = yaml.safe_load(file) or {}
            hosts_data = data.get("hosts", [])

            hosts = []
            for host_data in hosts_data:
                # Set default port 22 if not specified
                if "port" not in host_data:
                    host_data["port"] = 22
                hosts.append(Host(**host_data))

            return hosts
    except FileNotFoundError:
        # If file not found, return empty list
        return []
    except Exception as e:
        print(f"Error loading hosts from {file_path}: {e}")
        return []


def save_hosts_to_yaml(hosts: List[Host], file_path: str):
    """
    Save hosts to a YAML file.

    Args:
        hosts (List[Host]): List of hosts
        file_path (str): Path to the YAML file
    """
    try:
        # Convert hosts to dictionaries
        hosts_data = []
        for host in hosts:
            host_data = {
                "name": host.name,
                "ip": host.ip,
                "user": host.user,
                "port": host.port,
            }
            hosts_data.append(host_data)

        # Prepare data for saving
        data = {"hosts": hosts_data}

        # Save to file
        with open(file_path, "w", encoding="utf-8") as file:
            yaml.dump(data, file, default_flow_style=False, allow_unicode=True)

    except Exception as e:
        print(f"Error saving hosts to {file_path}: {e}")
