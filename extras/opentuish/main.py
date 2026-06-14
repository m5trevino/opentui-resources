# main.py - main entry point

import asyncio
from src.core.session_manager import SessionManager
from src.ui.orchestrator_app import SSHOrchestratorApp
from src.utils.inventory_manager import load_hosts_from_yaml


# Load hosts from inventory file
HOSTS = load_hosts_from_yaml("inventory.yaml")


async def main():
    manager = SessionManager(HOSTS)
    app = SSHOrchestratorApp(manager)
    await app.run_async()


if __name__ == "__main__":
    asyncio.run(main())
