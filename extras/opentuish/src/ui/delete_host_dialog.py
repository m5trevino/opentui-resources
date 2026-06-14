# delete_host_dialog.py - delete host dialog

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Label, Button
from textual.containers import Horizontal
from textual.message import Message
import sys
import os

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from src.models.models import Host


class DeleteHostDialog(Screen):
    """Delete host dialog."""

    def __init__(self, host: Host):
        super().__init__()
        self.host = host

    def compose(self) -> ComposeResult:
        yield Label(f"Delete Host '{self.host.name}'?", id="title")
        yield Label("Are you sure you want to delete this host?")
        with Horizontal(id="buttons"):
            self.ok_button = Button("Delete", id="ok", variant="error")
            self.cancel_button = Button("Cancel", id="cancel", variant="primary")
            yield self.ok_button
            yield self.cancel_button

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Button pressed event handler."""
        if event.button.id == "ok":
            # Send message to main app
            self.post_message(HostDeleted(self.host))
            self.app.pop_screen()
        elif event.button.id == "cancel":
            self.app.pop_screen()


class HostDeleted(Message):
    """Message sent when a host is deleted."""

    def __init__(self, host: Host):
        super().__init__()
        self.host = host
