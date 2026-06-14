# delete_scenario_dialog.py - delete scenario dialog

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Label, Button
from textual.containers import Horizontal
from textual.message import Message
import sys
import os

from src.models.scenario import Scenario

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class DeleteScenarioDialog(Screen):
    """Delete scenario dialog."""

    def __init__(self, scenario: Scenario):
        super().__init__()
        self.scenario = scenario

    def compose(self) -> ComposeResult:
        yield Label(f"Delete Scenario '{self.scenario.name}'?", id="title")
        yield Label("Are you sure you want to delete this scenario?")
        with Horizontal(id="buttons"):
            self.ok_button = Button("Delete", id="ok", variant="error")
            self.cancel_button = Button("Cancel", id="cancel", variant="primary")
            yield self.ok_button
            yield self.cancel_button

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Button pressed event handler."""
        if event.button.id == "ok":
            # Dismiss dialog with scenario data
            self.dismiss(self.scenario)
        elif event.button.id == "cancel":
            self.dismiss(None)


class ScenarioDeleted(Message):
    """Message sent when a scenario is deleted."""

    def __init__(self, scenario: Scenario):
        super().__init__()
        self.scenario = scenario
