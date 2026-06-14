# edit_host_dialog.py - edit host dialog

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Input, Button, Label
from textual.containers import Horizontal
from textual.message import Message
import sys
import os

from src.models.models import Host

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class EditHostDialog(Screen):
    """Edit host dialog."""

    def __init__(self, host: Host):
        super().__init__()
        self.host = host
        self.host_name = host.name
        self.host_ip = host.ip
        self.host_user = host.user
        self.host_port = str(host.port)

    def compose(self) -> ComposeResult:
        yield Label("Edit Host", id="title")
        yield Label("Hostname:")
        self.name_input = Input(placeholder="Enter Hostname", value=self.host_name)
        yield self.name_input
        yield Label("IP adress:")
        self.ip_input = Input(placeholder="Enter IP address", value=self.host_ip)
        yield self.ip_input
        yield Label("Login:")
        self.user_input = Input(placeholder="Enter Login", value=self.host_user)
        yield self.user_input
        yield Label("Port:")
        self.port_input = Input(placeholder="Port (default 22)", value=self.host_port)
        yield self.port_input
        with Horizontal(id="buttons"):
            self.ok_button = Button("Apply", id="ok", variant="primary")
            self.cancel_button = Button("Cancel", id="cancel", variant="error")
            yield self.ok_button
            yield self.cancel_button

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Button pressed event handler."""
        if event.button.id == "ok":
            # All fields must be filled
            if (
                self.name_input.value
                and self.ip_input.value
                and self.port_input.value
                and self.user_input.value
            ):
                # Edit host
                try:
                    port = int(self.port_input.value)
                    edited_host = Host(
                        name=self.name_input.value,
                        ip=self.ip_input.value,
                        user=self.user_input.value,
                        port=port,
                        marked=self.host.marked,  # Preserve the marked status
                    )
                    # Check if critical parameters have changed
                    # (requiring reconnection)
                    needs_reconnect = (
                        self.host.ip != edited_host.ip
                        or self.host.user != edited_host.user
                        or self.host.port != edited_host.port
                    )
                    # Send message to main app
                    print(f"Sending HostEdited message for {edited_host.name}")
                    self.post_message(
                        HostEdited(self.host, edited_host, needs_reconnect)
                    )  # Pass both old and new
                    self.app.pop_screen()
                except ValueError:
                    # Wrong port
                    self.app.bell()
            else:
                # Wrong input
                self.app.bell()
        elif event.button.id == "cancel":
            self.app.pop_screen()

    def on_mount(self) -> None:
        """Set focus on the first input field."""
        self.name_input.focus()


class HostEdited(Message):
    """Message sent when a host is edited."""

    def __init__(self, old_host: Host, new_host: Host, needs_reconnect: bool = False):
        super().__init__()
        self.old_host = old_host
        self.new_host = new_host
        self.needs_reconnect = needs_reconnect
