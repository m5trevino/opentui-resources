# orchestrator_app.py - main TUI application

import asyncio
import sys
import os


from collections import defaultdict
from textual.app import App, ComposeResult
from textual.widgets import (
    Header,
    Footer,
    ListView,
    ListItem,
    Static,
    Input,
    RichLog,
)
from textual.containers import Horizontal
from rich.text import Text
from src.ui.add_host_dialog import AddHostDialog, HostAdded
from src.ui.about_dialog import AboutDialog
from src.core.session_manager import SessionManager
from src.models.models import Host
from src.ui.edit_host_dialog import EditHostDialog, HostEdited
from src.ui.delete_host_dialog import DeleteHostDialog, HostDeleted
from src.ui.scenario_selector_dialog import ScenarioSelectorDialog, ScenarioSelected
from src.ui.delete_scenario_dialog import ScenarioDeleted
from src.models.events import Event
from src.core.scenario_executor import ScenarioExecutor

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


# =======================
# Host Item
# =======================
class HostItem(ListItem):
    def __init__(self, host: str, state: str, marked: bool = True):
        self.host = host
        self.state = state
        self.marked = marked
        self.label = Static(self.render())
        super().__init__(self.label)

    def render(self) -> Text:
        color = {
            "CONNECTING": "yellow",
            "READY": "white",
            "RUNNING": "blue",
            "ERROR": "red",
            "CLOSED": "grey50",
        }.get(self.state, "white")

        marker = "[*]" if self.marked else "[ ]"
        return Text(f"{self.host:<8} [{self.state:<10}] {marker}", style=color)

    def update_view(self):
        self.label.update(self.render())


# =======================
# Rich Log Panel
# =======================
class LogPanel(RichLog):
    def __init__(self):
        super().__init__()

    def append(self, line: str):
        text_line = Text.from_markup(line)  # or Text(line) if no markup
        self.write(text_line)


# =======================
# Main App
# =======================
class SSHOrchestratorApp(App):
    CSS = """
    Screen {
        layout: vertical;
    }
    #body {
        height: 1fr;
    }
    #hosts {
        width: 40;
    }
    """

    # Hotkeys
    BINDINGS = [
        ("a", "add_host", "Add Host"),
        ("e", "edit_host", "Edit Host"),
        ("d", "delete_host", "Delete Host"),
        ("m", "toggle_mark", "Toggle Mark"),
        ("s", "run_scenario", "Scenarios"),
        ("f5", "reconnect_failed_hosts", "Reconnect Failed Hosts"),
        ("f12", "about", "About"),
    ]

    def __init__(self, manager: SessionManager):
        super().__init__()
        self.manager = manager
        self.executor = ScenarioExecutor(manager)
        self.host_states: dict[str, str] = {}
        self.buffers = defaultdict(list)
        self.log_host: str | None = None
        # Dictionary to store host marks
        self.host_marks: dict[str, bool] = {}

    async def on_mount(self):
        self.title = "OpenTuiSH"
        self.sub_title = "v0.1.0"
        for h in self.manager.hosts:
            self.host_states[h.name] = "CONNECTING"
            # Initialize marks for hosts (default True)
            self.host_marks[h.name] = True
        await self.manager.start()
        self.set_interval(0.1, self.poll_events)
        self.refresh_hosts()

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal(id="body"):
            self.host_list = ListView(id="hosts")
            yield self.host_list
            self.log_panel = LogPanel()
            yield self.log_panel
        self.input = Input(placeholder="command")
        yield self.input
        yield Footer()

    async def poll_events(self):
        while not self.manager.event_queue.empty():
            event: Event = await self.manager.event_queue.get()
            self.handle_event(event)

    def handle_event(self, event: Event):
        if event.type == "state":
            self.host_states[event.host] = event.payload
            self.log_panel.append(f"{event.host}: {event.payload}")
            self.refresh_hosts()
        else:
            self.buffers[event.host].append(event.payload)
            if self.log_host in (None, event.host):
                self.log_panel.append(f"{event.host}> {event.payload}")

    def refresh_hosts(self):
        print(f"Refreshing hosts, count: {len(self.manager.hosts)}")
        self.host_list.clear()
        for h in self.manager.hosts:
            host_name = h.name if isinstance(h, Host) else h
            host_marked = self.host_marks.get(host_name, True)
            print(f"Adding host to list: {host_name}")
            self.host_list.append(
                HostItem(
                    host_name,
                    self.host_states.get(host_name, "CONNECTING"),
                    host_marked,
                )
            )

    async def on_input_submitted(self, event: Input.Submitted):
        cmd = event.value.strip()
        if not cmd:
            return
        # Send command only to marked hosts
        target_hosts = [
            h
            for h in self.manager.hosts
            if self.host_marks.get(h.name if isinstance(h, Host) else h, True)
        ]

        # Check if there are any marked hosts
        if not target_hosts:
            self.log_panel.append("No hosts selected. Please mark at least one host.")
            return

        # Create a temporary scenario for the single command
        from src.models.scenario import Scenario

        temp_scenario = Scenario(name="command", steps=[cmd])
        await self.executor.run(temp_scenario)
        event.input.clear()

    async def action_add_host(self) -> None:
        """New dialog for adding a new host."""
        self.push_screen(AddHostDialog())

    async def action_edit_host(self) -> None:
        """Edit selected host."""
        selected = self.host_list.highlighted_child
        if selected:
            host_name = selected.host
            # Find the host object
            host_to_edit = None
            for host in self.manager.hosts:
                if isinstance(host, Host) and host.name == host_name:
                    host_to_edit = host
                    break
            if host_to_edit:
                self.push_screen(EditHostDialog(host_to_edit))

    async def action_delete_host(self) -> None:
        """Delete selected host."""
        selected = self.host_list.highlighted_child
        if selected:
            host_name = selected.host
            # Find the host object
            host_to_delete = None
            for host in self.manager.hosts:
                if isinstance(host, Host) and host.name == host_name:
                    host_to_delete = host
                    break
            if host_to_delete:
                self.push_screen(DeleteHostDialog(host_to_delete))

    async def action_reconnect_failed_hosts(self) -> None:
        """Reconnect to hosts that are in ERROR or CLOSED state"""
        disconnected_hosts = self.manager.get_disconnected_hosts()
        if disconnected_hosts:
            await self.manager.reconnect_hosts(disconnected_hosts)
            self.log_panel.append(f"Reconnecting to {len(disconnected_hosts)} hosts...")
        else:
            self.log_panel.append("No disconnected hosts found.")

    async def action_about(self) -> None:
        """Show about dialog"""
        self.push_screen(AboutDialog())

    def action_toggle_mark(self) -> None:
        """Toggle mark for selected host"""
        selected = self.host_list.highlighted_child
        if selected:
            host_name = selected.host
            # Toggle mark
            self.host_marks[host_name] = not self.host_marks.get(host_name, True)
            # Update host object if it's a Host instance
            for i, host in enumerate(self.manager.hosts):
                if isinstance(host, Host) and host.name == host_name:
                    # Create a new Host object with updated mark
                    import dataclasses

                    new_host = dataclasses.replace(
                        host, marked=self.host_marks[host_name]
                    )
                    # Replace the old host object with the new one
                    self.manager.hosts[i] = new_host
                    break
            # Refresh the host list to show updated mark
            self.refresh_hosts()

    async def action_run_scenario(self) -> None:
        """Run scenario dialog."""
        self.push_screen(ScenarioSelectorDialog())

    def on_host_added(self, event: HostAdded) -> None:
        """Handle HostAdded message."""
        # Add the new host to the manager and update inventory
        self.manager.add_host(event.host)
        # Add to host states and marks
        self.host_states[event.host.name] = "CONNECTING"
        self.host_marks[event.host.name] = True
        # Refresh the host list
        self.refresh_hosts()
        # Connect to the new host
        asyncio.create_task(self.manager.reconnect_hosts([event.host]))

    def on_host_edited(self, event: HostEdited) -> None:
        """Handle HostEdited message."""
        # Update the host in the manager and update inventory
        self.manager.update_host(event.old_host, event.new_host)
        # Update host states and marks
        self.host_states[event.new_host.name] = self.host_states.get(
            event.old_host.name, "CONNECTING"
        )
        self.host_marks[event.new_host.name] = event.new_host.marked

        # If critical parameters changed, reconnect the host
        if event.needs_reconnect:
            asyncio.create_task(self.manager.reconnect_hosts([event.new_host]))
            self.log_panel.append(
                f"Reconnecting to {event.new_host.name} due to parameter changes..."
            )
        # Refresh the host list
        self.refresh_hosts()

    def on_host_deleted(self, event: HostDeleted) -> None:
        """Handle HostDeleted message."""
        # Remove the host from the manager and update inventory
        self.manager.remove_host(event.host)

        # Close the session if it exists
        if event.host in self.manager.sessions:
            asyncio.create_task(self.manager.sessions[event.host].close())

        # Remove from host states and marks
        if event.host.name in self.host_states:
            del self.host_states[event.host.name]
        if event.host.name in self.host_marks:
            del self.host_marks[event.host.name]

        # Refresh the host list
        self.refresh_hosts()
        self.log_panel.append(f"Host '{event.host.name}' deleted.")

    def on_scenario_selected(self, event: ScenarioSelected) -> None:
        """Handle ScenarioSelected message."""
        # Run the selected scenario on marked hosts
        target_hosts = [
            h
            for h in self.manager.hosts
            if self.host_marks.get(h.name if isinstance(h, Host) else h, True)
        ]

        # Check if there are any marked hosts
        if not target_hosts:
            self.log_panel.append("No hosts selected. Please mark at least one host.")
            return

        # Run the scenario
        asyncio.create_task(self.executor.run(event.scenario, target_hosts))
        self.log_panel.append(f"Running scenario '{event.scenario.name}'...")

    def on_scenario_deleted(self, event: ScenarioDeleted) -> None:
        """Handle ScenarioDeleted message."""
        self.log_panel.append(f"Scenario '{event.scenario.name}' deleted.")
