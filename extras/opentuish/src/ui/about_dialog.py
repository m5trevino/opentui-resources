# about_dialog.py - about dialog

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Label, Link, Button
import sys
import os

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


ABOUT = """\
OpenTuiSH

Version: 0.1.0

Author: ampycraft

License: GNU GPL v3
"""


class AboutDialog(Screen):
    """About dialog."""

    CSS = """
    AboutDialog {
        align: center middle;
    }
    Label {
        content-align: center middle;
        width: auto;
        height: auto;
        text-align: center;
        margin-bottom: 2;
    }
    Link, Button {
        width: 15;
        margin-bottom: 2;
    }
    """

    def compose(self) -> ComposeResult:
        yield Label(ABOUT)
        yield Link(
            "GitHub",
            url="https://github.com/ampycraft/opentuish",
            tooltip="Go to GitHub",
        )
        yield Button("Back", id="back", variant="primary")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "back":
            self.app.pop_screen()
