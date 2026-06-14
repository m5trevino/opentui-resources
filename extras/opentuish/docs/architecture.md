# OpenTuiSH Architecture

## Overview

OpenTuiSH is an interactive asynchronous SSH tool designed for managing small to medium-sized server fleets (10-30 hosts). The application provides a text-based user interface (TUI) that allows system administrators to manage multiple SSH connections simultaneously, execute commands, and run predefined scenarios across their infrastructure.

The application is built using Python with asynchronous programming principles, utilizing the asyncssh library for SSH connections and the Textual framework for the TUI interface.

## System Architecture

The SSH Orchestrator follows a modular architecture with clearly defined components:

```
┌───────────────────────────────────────────────────────────────────┐
│                        Main Application                           │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌────────────────────────────────────────────┐  │
│  │   TUI App   │  │           Core Components                  │  │
│  │             │  │  ┌──────────────────────────────────────┐  │  │
│  │             │  │  │        Session Manager               │  │  │
│  │             │  │  │                                      │  │  │
│  │             │  │  │  Manages multiple SSH sessions       │  │  │
│  │             │  │  │  Handles host connections            │  │  │
│  │             │  │  │  Broadcasts commands                 │  │  │
│  │             │  │  └──────────────────────────────────────┘  │  │
│  │             │  │  ┌──────────────────────────────────────┐  │  │
│  │             │  │  │         SSH Session                  │  │  │
│  │             │  │  │                                      │  │  │
│  │             │  │  │  Individual SSH connection           │  │  │
│  │             │  │  │  Handles I/O streams                 │  │  │
│  │             │  │  │  Manages session state               │  │  │
│  │             │  │  └──────────────────────────────────────┘  │  │
│  │             │  │  ┌──────────────────────────────────────┐  │  │
│  │             │  │  │     Scenario Executor                │  │  │
│  │             │  │  │                                      │  │  │
│  │             │  │  │  Executes predefined scenarios       │  │  │
│  │             │  │  │  Manages execution flow              │  │  │
│  │             │  │  └──────────────────────────────────────┘  │  │
│  └─────────────┘  └────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                    Data Models                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐ │    │
│  │  │    Host     │  │  Scenario   │  │      Event         │ │    │
│  │  │             │  │             │  │                    │ │    │
│  │  │ Host data   │  │ Command     │  │ Event handling     │ │    │
│  │  │ structure   │  │ sequences   │  │ and state changes  │ │    │
│  │  └─────────────┘  └─────────────┘  └────────────────────┘ │    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                   Utility Components                      │    │
│  │  ┌─────────────────────┐  ┌───────────────────────────┐   │    │
│  │  │ Inventory Manager   │  │    Scenario Loader        │   │    │
│  │  │                     │  │                           │   │    │
│  │  │ Loads/saves hosts   │  │ Loads scenarios from YAML │   │    │
│  │  │ to/from YAML        │  │ files                     │   │    │
│  │  └─────────────────────┘  └───────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Main Application (`main.py`)

The entry point of the application that initializes the system:

1. Loads host inventory from `inventory.yaml`
2. Creates a SessionManager instance
3. Launches the TUI application (OpenTuiSH)

### 2. Textual TUI Application (`src/ui/orchestrator_app.py`)

The user interface built with the Textual framework:

- **Host Panel**: Displays all configured hosts with their connection status
- **Log Panel**: Shows command output from hosts in real-time
- **Command Input**: Allows entering commands to execute on marked hosts
- **Dialog System**: Provides interfaces for host and scenario management

Key features:
- Real-time event handling through event queues
- Host marking system for selective command execution
- Color-coded status indicators
- Hotkey support for common operations

### 3. Session Manager (`src/core/session_manager.py`)

Central component responsible for managing all SSH sessions:

- Maintains a collection of SSHSession instances
- Manages the event queue for communication between components
- Handles host lifecycle operations (add, remove, update)
- Provides broadcast functionality for sending commands to multiple hosts
- Manages inventory persistence through YAML files

### 4. SSH Session (`src/core/ssh_session.py`)

Represents an individual SSH connection to a host:

- Establishes and maintains SSH connections using asyncssh
- Manages stdin/stdout/stderr streams
- Tracks session state (CONNECTING, READY, RUNNING, ERROR, CLOSED)
- Emits events for state changes and command output
- Handles connection lifecycle (connect, close)

### 5. Scenario Executor (`src/core/scenario_executor.py`)

Responsible for executing predefined command sequences:

- Runs scenarios step by step with configurable delays
- Supports manual mode for interactive execution
- Provides callback mechanisms for step notifications
- Handles execution control (start, stop, pause)

## Data Models

### Host Model (`src/models/models.py`)

Represents a server in the infrastructure:
- `name`: Unique identifier for the host
- `ip`: IP address for SSH connection
- `user`: SSH username
- `port`: SSH port (default: 22)
- `marked`: Boolean flag for command execution selection

### Scenario Model (`src/models/scenario.py`)

Represents a sequence of commands to execute:
- `name`: Unique identifier for the scenario
- `steps`: List of commands to execute in order

### Event Model (`src/models/events.py`)

Represents events in the system:
- `timestamp`: When the event occurred
- `host`: Host associated with the event
- `type`: Type of event (stdout, stderr, state, system)
- `payload`: Event data

## Utility Components

### Inventory Manager (`src/utils/inventory_manager.py`)

Handles persistence of host configurations:
- Loads hosts from `inventory.yaml`
- Saves hosts to `inventory.yaml`
- Provides error handling for file operations

### Scenario Loader (`src/utils/scenario_loader.py`)

Handles persistence of scenario definitions:
- Loads scenarios from `scenarios.yaml`
- Supports both single and multiple scenario formats
- Provides backward compatibility

## Data Flow

### 1. Application Startup

```
main.py → Load inventory.yaml → Create SessionManager → Launch TUI
```

### 2. Session Establishment

```
TUI.on_mount() → SessionManager.start() → For each host:
  SSHSession.connect() → asyncssh.connect() → Emit state events
```

### 3. Command Execution

```
User input → TUI.on_input_submitted() → 
ScenarioExecutor.run() → SessionManager.broadcast() → 
For each target session: SSHSession.send()
```

### 4. Event Handling

```
SSHSession stream readers → Emit events → 
SessionManager.event_queue → TUI.poll_events() → 
TUI.handle_event() → Update UI and log panel
```

## Configuration Files

### Inventory File (`inventory.yaml`)

Defines the hosts that the application will manage:
```yaml
hosts:
- name: host-1
  ip: 192.168.100.4
  user: user
  port: 22
- name: host-2
  ip: 192.168.100.5
  user: user
  port: 22
```

### Scenarios File (`scenarios.yaml`)

Defines predefined command sequences:
```yaml
- name: basic-info
  steps:
  - whoami
  - uname -a
  - uptime
- name: network-info
  steps:
  - ip addr show
  - netstat -tuln
```

## Asynchronous Architecture

The application is built on Python's asyncio framework:

- All network operations are non-blocking
- Event-driven architecture using asyncio queues
- Concurrent execution of multiple SSH sessions
- Efficient resource utilization through async/await patterns

## Error Handling

The application implements comprehensive error handling:

- Connection errors are caught and reported through the event system
- File I/O operations include exception handling
- Graceful degradation when individual hosts are unreachable
- Automatic reconnection mechanisms for failed sessions

## Extensibility

The modular architecture allows for easy extension:

- New UI components can be added to the Textual application
- Additional session management features can be implemented in SessionManager
- Custom event types can be added to the event system
- New data models can be integrated with existing components