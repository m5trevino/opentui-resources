# scenario_selector_dialog.py - scenario selector dialog

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import ListView, ListItem, Label, Button, Markdown
from textual.containers import Vertical, Horizontal
from textual.message import Message
import sys
import os


from src.models.scenario import Scenario
from src.utils.scenario_loader import load_scenarios
from src.ui.scenario_editor_dialog import ScenarioEditorDialog
from src.ui.delete_scenario_dialog import DeleteScenarioDialog, ScenarioDeleted
import yaml

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class ScenarioSelectorDialog(Screen):
    """Scenario selector dialog."""

    def __init__(self):
        super().__init__()
        self.scenarios = []
        self.load_scenarios()

    def load_scenarios(self):
        """Load scenarios from scenarios.yaml file."""
        if os.path.exists("scenarios.yaml"):
            self.scenarios = load_scenarios("scenarios.yaml")

    def compose(self) -> ComposeResult:
        yield Label("Select Scenario", id="title")

        # Create main content area with list and details
        with Horizontal(id="content"):
            # Create list of scenarios
            self.scenario_list = ListView(id="scenario_list")
            yield self.scenario_list

            # Create details area for scenario commands
            with Vertical(id="details"):
                self.commands_label = Label("Commands:", id="commands_label")
                yield self.commands_label
                self.commands_display = Markdown("", id="commands_display")
                yield self.commands_display

        # Buttons
        with Horizontal(id="buttons"):
            self.new_button = Button("New", id="new", variant="success")
            self.run_button = Button("Run", id="run", variant="primary")
            self.edit_button = Button("Edit", id="edit")
            self.delete_button = Button("Delete", id="delete", variant="error")
            self.cancel_button = Button("Cancel", id="cancel", variant="default")
            yield self.new_button
            yield self.run_button
            yield self.edit_button
            yield self.delete_button
            yield self.cancel_button

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Button pressed event handler."""
        if event.button.id == "new":
            self.app.push_screen(ScenarioEditorDialog())
        elif event.button.id == "run":
            selected = self.scenario_list.highlighted_child
            if selected and hasattr(selected, "scenario"):
                self.post_message(ScenarioSelected(selected.scenario))
                self.app.pop_screen()
            else:
                self.app.bell()
        elif event.button.id == "edit":
            selected = self.scenario_list.highlighted_child
            if selected and hasattr(selected, "scenario"):
                self.app.push_screen(ScenarioEditorDialog(selected.scenario))
            else:
                self.app.bell()
        elif event.button.id == "delete":
            selected = self.scenario_list.highlighted_child
            if selected and hasattr(selected, "scenario"):
                self.app.push_screen(
                    DeleteScenarioDialog(selected.scenario),
                    self.on_delete_scenario_dialog_dismissed,
                )
            else:
                self.app.bell()
        elif event.button.id == "cancel":
            self.app.pop_screen()

    def on_delete_scenario_dialog_dismissed(self, result) -> None:
        """Handle result from DeleteScenarioDialog."""
        if result is not None:
            # User confirmed deletion
            self.post_message(ScenarioDeleted(result))

    def on_list_view_highlighted(self, event: ListView.Highlighted) -> None:
        """Event handler for when a scenario is highlighted in the list."""
        if event.item and hasattr(event.item, "scenario"):
            scenario = event.item.scenario
            # Format commands as a markdown list
            commands_text = "\n".join([f"- `{command}`" for command in scenario.steps])
            self.commands_display.update(commands_text)

    def on_scenario_saved(self, message: "ScenarioEditorDialog.ScenarioSaved") -> None:
        """Handle scenario saved message."""
        # Reload scenarios from file
        self.load_scenarios()

        # Clear current list
        self.scenario_list.clear()

        # Repopulate list
        for scenario in self.scenarios:
            item = ListItem(Label(scenario.name))
            item.scenario = scenario
            self.scenario_list.append(item)

        # Set focus back on the scenario list
        self.scenario_list.focus()

    def on_scenario_deleted(self, message: ScenarioDeleted) -> None:
        """Handle scenario deleted message."""

        # Load all scenarios except the deleted one
        all_scenarios = []
        try:
            with open("scenarios.yaml", "r") as f:
                data = yaml.safe_load(f)
                if data:
                    for item in data:
                        # Skip the scenario to be deleted
                        if item["name"] != message.scenario.name:
                            all_scenarios.append(
                                Scenario(name=item["name"], steps=item["steps"])
                            )
        except FileNotFoundError:
            pass

        # Save all scenarios back to file
        yaml_data = [{"name": s.name, "steps": s.steps} for s in all_scenarios]
        with open("scenarios.yaml", "w") as f:
            yaml.dump(yaml_data, f, default_flow_style=False, sort_keys=False)

        # Reload scenarios
        self.load_scenarios()

        # Clear current list
        self.scenario_list.clear()

        # Repopulate list
        for scenario in self.scenarios:
            item = ListItem(Label(scenario.name))
            item.scenario = scenario
            self.scenario_list.append(item)

        # Set focus back on the scenario list
        self.scenario_list.focus()

        # Clear details display
        self.commands_display.update("")

    def on_mount(self) -> None:
        """Set focus on the scenario list and populate items."""
        # Populate list items after mounting
        for scenario in self.scenarios:
            item = ListItem(Label(scenario.name))
            item.scenario = scenario
            self.scenario_list.append(item)

        # Set focus on the scenario list
        self.scenario_list.focus()

        # Display commands for the first scenario if available
        if self.scenarios:
            first_scenario = self.scenarios[0]
            commands_text = "\n".join(
                [f"- `{command}`" for command in first_scenario.steps]
            )
            self.commands_display.update(commands_text)


class ScenarioSelected(Message):
    """Message sent when a scenario is selected."""

    def __init__(self, scenario: Scenario):
        super().__init__()
        self.scenario = scenario
