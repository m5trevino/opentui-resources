# scenario_executor.py - scenario executor

import asyncio
import sys
import os

from src.core.session_manager import SessionManager
from src.models.scenario import Scenario


# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class ScenarioExecutor:
    def __init__(self, manager: SessionManager, step_callback=None):
        self.manager = manager
        self._stop_event = asyncio.Event()
        self.step_callback = step_callback

        self.manual_host: str | None = None  # focused host
        self._manual_event = asyncio.Event()

    def stop(self):
        self._stop_event.set()

    def enter_manual_mode(self, host: str):
        self.manual_host = host
        self._manual_event.clear()

    def exit_manual_mode(self):
        self.manual_host = None
        self._manual_event.set()

    async def run(self, scenario: Scenario):
        for idx, command in enumerate(scenario.steps, start=1):
            if self._stop_event.is_set():
                break

            # wait for manual_mode ends
            if self.manual_host:
                await self._manual_event.wait()

            if self.step_callback:
                await self.step_callback(idx, command)

            self.manager.broadcast(command)
            await asyncio.sleep(1.0)  # MVP wait
