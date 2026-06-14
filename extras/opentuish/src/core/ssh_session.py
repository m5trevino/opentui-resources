# ssh_session.py - SSH session

import asyncio
import asyncssh
from typing import Optional
from datetime import datetime
import sys
import os

from src.models.models import Host
from src.models.events import Event, SessionState

# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class SSHSession:
    """Class for SSH session"""

    def __init__(self, host: Host, event_queue: asyncio.Queue[Event] = None):
        self.host = host
        self.event_queue = event_queue

        self.conn: Optional[asyncssh.SSHClientConnection] = None
        self.process: Optional[asyncssh.SSHClientProcess] = None

        self.state: SessionState = SessionState.CONNECTING

        self._stdout_task: Optional[asyncio.Task] = None
        self._stderr_task: Optional[asyncio.Task] = None

        # For backward compatibility with test files
        self.stdout_queue = asyncio.Queue()
        self.stderr_queue = asyncio.Queue()

    async def connect(self):
        """Connect to host"""
        await self._emit_state(SessionState.CONNECTING)

        try:
            self.conn = await asyncssh.connect(
                self.host.ip,
                username=self.host.user,
                port=self.host.port,
                known_hosts=None,
            )

            self.process = await self.conn.create_process(term_type="xterm")

            self._stdout_task = asyncio.create_task(
                self._read_stream(self.process.stdout, "stdout")
            )
            self._stderr_task = asyncio.create_task(
                self._read_stream(self.process.stderr, "stderr")
            )

            await self._emit_state(SessionState.READY)

        except Exception as e:
            await self._emit_event("system", f"Connection error: {e}")
            await self._emit_state(SessionState.ERROR)

    async def _read_stream(self, stream, stream_type: str):
        """Read stream into queue"""
        async for line in stream:
            line = line.rstrip("\n")
            # For backward compatibility with test files
            if stream_type == "stdout":
                await self.stdout_queue.put(line)
            elif stream_type == "stderr":
                await self.stderr_queue.put(line)
            # For event-based system
            await self._emit_event(stream_type, line)

    def send(self, command: str):
        """Send command to host"""
        if not self.process:
            return

        if not command.endswith("\n"):
            command += "\n"

        self.process.stdin.write(command)
        asyncio.create_task(self._run_command(command))

    async def _run_command(self, command: str):
        """Run command and return to READY state when finished"""
        await self._emit_state(SessionState.RUNNING)
        # Simulate command execution time
        await asyncio.sleep(0.5)
        # Return to READY state after command execution
        await self._emit_state(SessionState.READY)

    async def close(self):
        """Close SSH session"""
        await self._emit_state(SessionState.CLOSED)

        if self.process:
            self.process.stdin.write("exit\n")
            await self.process.wait()

        if self.conn:
            self.conn.close()
            await self.conn.wait_closed()

    async def _emit_event(self, type_: str, payload: str):
        """Emit event to queue"""
        await self.event_queue.put(
            Event(
                timestamp=datetime.utcnow(),
                host=self.host.name,
                type=type_,
                payload=payload,
            )
        )

    async def _emit_state(self, state: SessionState):
        """Emit state to queue"""
        self.state = state
        await self._emit_event("state", state.value.upper())
