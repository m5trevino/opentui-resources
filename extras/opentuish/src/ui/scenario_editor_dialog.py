# scenario_editor_dialog.py - scenario editor dialog

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Input, TextArea, Button, Label
from textual.containers import Vertical, Horizontal
from textual.message import Message
import sys
import os

from src.models.scenario import Scenario
import yaml

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class ScenarioEditorDialog(Screen):
    """Scenario editor dialog."""

    def __init__(self, scenario: Scenario = None):
        super().__init__()
        self.scenario = scenario
        self.original_name = scenario.name if scenario else None

    def compose(self) -> ComposeResult:
        yield Label("Edit Scenario" if self.scenario else "Create Scenario", id="title")

        with Vertical(id="content"):
            yield Label("Name:")
            self.name_input = Input(placeholder="Scenario name", id="name_input")
            yield self.name_input

            yield Label("Commands (one per line):")
            self.commands_input = TextArea(id="commands_input")
            yield self.commands_input

        with Horizontal(id="buttons"):
            self.save_button = Button("Save", id="save", variant="primary")
            self.cancel_button = Button("Cancel", id="cancel", variant="error")
            yield self.save_button
            yield self.cancel_button

    def on_mount(self) -> None:
        """Set initial values if editing existing scenario."""
        if self.scenario:
            self.name_input.value = self.scenario.name
            self.commands_input.text = "\n".join(self.scenario.steps)

        # Set focus on name input
        self.name_input.focus()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Button pressed event handler."""
        if event.button.id == "save":
            self.save_scenario()
        elif event.button.id == "cancel":
            self.app.pop_screen()

    def save_scenario(self) -> None:
        """Save scenario to scenarios.yaml file."""
        name = self.name_input.value.strip()
        commands_text = self.commands_input.text.strip()

        if not name:
            self.app.bell()
            return

        steps = [cmd.strip() for cmd in commands_text.split("\n") if cmd.strip()]

        if not steps:
            self.app.bell()
            return

        # Create new scenario
        scenario = Scenario(name=name, steps=steps)

        # Load all scenarios
        all_scenarios = []
        try:
            with open("scenarios.yaml", "r") as f:
                data = yaml.safe_load(f)
                if data:
                    for item in data:
                        all_scenarios.append(
                            Scenario(name=item["name"], steps=item["steps"])
                        )
        except FileNotFoundError:
            pass

        # If editing existing scenario, remove the old one
        if self.original_name:
            all_scenarios = [s for s in all_scenarios if s.name != self.original_name]

        # Add the updated scenario
        all_scenarios.append(scenario)

        # Save all scenarios back to file
        yaml_data = [{"name": s.name, "steps": s.steps} for s in all_scenarios]
        with open("scenarios.yaml", "w") as f:
            yaml.dump(yaml_data, f, default_flow_style=False, sort_keys=False)

        # Notify parent screen
        self.post_message(ScenarioSaved(scenario))
        self.app.pop_screen()


class ScenarioSaved(Message):
    """Message sent when a scenario is saved."""

    def __init__(self, scenario: Scenario):
        super().__init__()
        self.scenario = scenario
