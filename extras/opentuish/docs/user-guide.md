# OpenTuiSH User Guide

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [User Interface](#user-interface)
5. [Host Management](#host-management)
6. [Scenario Management](#scenario-management)
7. [Command Execution](#command-execution)
8. [Hotkeys](#hotkeys)
9. [Troubleshooting](#troubleshooting)

## Overview

OpenTuiSH is an interactive asynchronous SSH tool designed for small fleets (10–30 hosts), focused on real-time visibility and manual control during execution. It provides a text-based user interface (TUI) that allows system administrators to manage multiple SSH connections simultaneously, execute commands, and run predefined scenarios across their infrastructure.

### Key Features

- **Async SSH sessions**: Utilizes asyncssh for efficient connection handling
- **Interactive TUI interface**: Textual-based interface for real-time interaction
- **Real-time output**: View stdout/stderr with color highlighting
- **Host management**: Add, edit, and delete hosts with a simple interface
- **Scenario execution**: Run predefined command sequences from YAML files
- **Selective execution**: Mark hosts to control where commands are executed
- **Automatic reconnection**: Automatically reconnects to failed hosts
- **Scrollback support**: Review previous command outputs

## Installation

### Requirements

- Python 3.11+
- SSH keys for authentication
- Sudo access with NOPASSWD for automated operations

### Setup Process

1. Clone or download the SSH Orchestrator repository
2. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### SSH Key Setup

For passwordless authentication, ensure you have SSH keys set up:
1. Generate SSH keys if you don't have them:
   ```bash
   ssh-keygen -t rsa -b 4096
   ```
2. Copy your public key to each target host:
   ```bash
   ssh-copy-id user@host-ip
   ```

## Getting Started

### Initial Configuration

1. Edit the `inventory.yaml` file to add your hosts:
   ```yaml
   hosts:
   - name: host-1
     ip: 192.168.1.10
     user: user
     port: 22
   - name: host-2
     ip: 192.168.1.11
     user: user
     port: 22
   ```

2. Define scenarios in `scenarios.yaml`:
   ```yaml
   - name: system-info
     steps:
     - whoami
     - uname -a
     - uptime
   - name: network-status
     steps:
     - ip addr show
     - netstat -tuln
   ```

### Running the Application

Execute the application with:
```bash
python main.py
```

The application will connect to all configured hosts and display their status in the left panel.

## User Interface

The SSH Orchestrator interface consists of three main areas:

1. **Header**: Displays the application name, version, and current time
2. **Host Panel** (Left): Shows all configured hosts with their connection status
3. **Log Panel** (Center): Displays command output from hosts
4. **Command Input** (Bottom): For entering commands to execute

### Host Status Indicators

- **CONNECTING**: Establishing connection to the host
- **READY**: Host is connected and ready for commands
- **RUNNING**: Host is currently executing a command
- **ERROR**: Connection error occurred
- **CLOSED**: Connection has been closed

### Host Marking

Hosts are marked by default (indicated by `[*]`). Marked hosts receive commands when you execute them. Toggle marks using the `m` key.

## Host Management

### Adding Hosts

1. Press `a` to open the Add Host dialog
2. Fill in the required information:
   - Hostname: A unique name for the host
   - IP Address: The IP address of the host
   - Login: SSH username for the connection
   - Port: SSH port (default is 22)
3. Click "OK" to add the host

The new host will automatically attempt to connect.

### Editing Hosts

1. Select the host you want to edit
2. Press `e` to open the Edit Host dialog
3. Modify the required fields
4. Click "Apply" to save changes

If critical connection parameters are changed (IP, user, or port), the host will automatically reconnect with the new settings.

### Deleting Hosts

1. Select the host you want to delete
2. Press `d` to open the Delete Host confirmation dialog
3. Confirm deletion by clicking "Delete"

The host will be removed from the inventory and disconnected.

## Scenario Management

Scenarios are predefined sets of commands that can be executed across multiple hosts simultaneously.

### Creating Scenarios

1. Press `s` to open the Scenario Selector
2. Click "New" to open the Scenario Editor
3. Enter a name for your scenario
4. Enter commands, one per line, in the commands area
5. Click "Save" to create the scenario

### Editing Scenarios

1. Press `s` to open the Scenario Selector
2. Select the scenario you want to edit
3. Click "Edit" to open the Scenario Editor
4. Make your changes
5. Click "Save" to update the scenario

### Running Scenarios

1. Press `s` to open the Scenario Selector
2. Select the scenario you want to run
3. Click "Run" to execute the scenario

The scenario will run on all currently marked hosts.

### Deleting Scenarios

1. Press `s` to open the Scenario Selector
2. Select the scenario you want to delete
3. Click "Delete" to remove the scenario
4. Confirm deletion in the confirmation dialog

## Command Execution

### Executing Single Commands

1. Type your command in the input field at the bottom
2. Press Enter to execute

The command will run on all currently marked hosts.

### Broadcast Commands

All commands entered in the input field are broadcast to marked hosts simultaneously. Use the marking system to control which hosts receive commands.

### Command Output

Command output appears in the central log panel. Output is prefixed with the host name for identification:
```
host-1> command output
host-2> command output
```

## Hotkeys

| Key | Action |
|-----|--------|
| `a` | Add new host |
| `e` | Edit selected host |
| `d` | Delete selected host |
| `m` | Toggle host mark |
| `s` | Select and run scenario |
| `f5` | Reconnect failed hosts |
| `f12` | Show about dialog |
| `Enter` | Execute command in input field |

## Troubleshooting

### Connection Issues

If hosts show ERROR status:
1. Verify SSH connectivity manually:
   ```bash
   ssh user@host-ip
   ```
2. Check SSH key authentication is properly configured
3. Ensure the target host is accessible on the specified port
4. Press F5 to attempt reconnection

### Performance Issues

If the application is slow to start:
- Check that all configured hosts are accessible
- Remove unreachable hosts from `inventory.yaml`
- Consider reducing the number of configured hosts

### Known Limitations

1. RUNNING status may be lost before the running process stops
2. If hosts are offline, the program starts slower
3. Some visual bugs may appear in the log panel

### Log Output

For debugging purposes, the application outputs connection status information to the log panel. Check this panel for error messages that can help diagnose connection issues.