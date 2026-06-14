# add_host_dialog.py - new host dialog

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


class AddHostDialog(Screen):
    """New host dialog."""

    def __init__(self):
        super().__init__()
        self.host_name = ""
        self.host_ip = ""
        self.host_user = ""
        self.host_port = "22"

    def compose(self) -> ComposeResult:
        yield Label("New Host", id="title")
        yield Label("Hostname:")
        self.name_input = Input(placeholder="Enter Hostname")
        yield self.name_input
        yield Label("IP adress:")
        self.ip_input = Input(placeholder="Enter IP address")
        yield self.ip_input
        yield Label("Login:")
        self.user_input = Input(placeholder="Enter Login")
        yield self.user_input
        yield Label("Port:")
        self.port_input = Input(placeholder="Port (default 22)", value="22")
        yield self.port_input
        with Horizontal(id="buttons"):
            self.ok_button = Button("OK", id="ok", variant="primary")
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
                # New host
                try:
                    port = int(self.port_input.value)
                    new_host = Host(
                        name=self.name_input.value,
                        ip=self.ip_input.value,
                        user=self.user_input.value,
                        port=port,
                    )
                    # Send message to main app
                    print(f"Sending HostAdded message for {new_host.name}")
                    self.post_message(HostAdded(new_host))
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


class HostAdded(Message):
    """Message sent when a new host is added."""

    def __init__(self, host: Host):
        super().__init__()
        self.host = host
