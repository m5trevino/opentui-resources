# session_manager.py - SSH session manager

import asyncio
import sys
import os

from src.core.ssh_session import SSHSession
from src.models.events import SessionState
from src.models.models import Host
from src.utils.inventory_manager import save_hosts_to_yaml


# Temporary path manipulation
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class SessionManager:
    """
    Class for SSH session manager.

    Attributes:
        hosts: list of Host objects
        sessions: dict of SSHSession objects
        event_queue: asyncio.Queue object
        inventory_file: path to inventory.yaml file
    Methods:
        start: start all sessions
        connect_all: connect all sessions
        close_all: close all sessions
        broadcast: broadcast command to sessions
        add_host: add new host and update inventory
        remove_host: remove host and update inventory
        update_host: update host and update inventory
    """

    def __init__(self, hosts: list[Host], inventory_file: str = "inventory.yaml"):
        self.hosts = hosts
        self.sessions = {}
        self.event_queue = asyncio.Queue()
        self.inventory_file = inventory_file

    async def start(self):
        for host in self.hosts:
            session = SSHSession(host, self.event_queue)
            self.sessions[host] = session
            await session.connect()

    def get_ready_hosts(self) -> list[Host]:
        """Get list of hosts that are in READY state"""
        ready_hosts = []
        for host in self.hosts:
            if host.marked:
                ready_hosts.append(host)
        return ready_hosts

    async def connect_all(self):
        await self.start()

    async def close_all(self):
        for session in self.sessions.values():
            await session.close()

    def broadcast(self, command: str, targets: list[Host] = None):
        for host, session in self.sessions.items():
            if targets is None or host in targets:
                session.send(command)

    async def reconnect_hosts(self, hosts: list[Host]):
        """Reconnect to specified hosts"""
        for host in hosts:
            if host in self.sessions:
                # Close existing session if it exists
                await self.sessions[host].close()
            # Create new session and connect
            session = SSHSession(host, self.event_queue)
            self.sessions[host] = session
            await session.connect()

    def get_disconnected_hosts(self) -> list[Host]:
        """Get list of hosts that are not connected (ERROR or CLOSED state)"""
        disconnected_hosts = []
        for host, session in self.sessions.items():
            if session.state in [SessionState.ERROR, SessionState.CLOSED]:
                disconnected_hosts.append(host)
        return disconnected_hosts

    def add_host(self, host: Host):
        """Add new host and update inventory file"""
        if host not in self.hosts:
            self.hosts.append(host)
            save_hosts_to_yaml(self.hosts, self.inventory_file)

    def remove_host(self, host: Host):
        """Remove host and update inventory file"""
        if host in self.hosts:
            self.hosts.remove(host)
            # Also remove session if exists
            if host in self.sessions:
                del self.sessions[host]
            save_hosts_to_yaml(self.hosts, self.inventory_file)

    def update_host(self, old_host: Host, new_host: Host):
        """Update host and update inventory file"""
        if old_host in self.hosts:
            index = self.hosts.index(old_host)
            self.hosts[index] = new_host
            # Also update session if exists
            if old_host in self.sessions:
                # Close old session
                self.sessions.pop(old_host)
                # Create new session
                new_session = SSHSession(new_host, self.event_queue)
                self.sessions[new_host] = new_session
            save_hosts_to_yaml(self.hosts, self.inventory_file)
