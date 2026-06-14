# OpenTuiSH

An interactive asynchronous SSH tool designed for small fleets (10–30 hosts), focused on real-time visibility and manual control during execution.

## Features

- Async SSH sessions (asyncssh)
- Interactive Textual TUI interface
- Real-time stdout/stderr with color highlighting
- Scrollback support
- Host management (add/edit/delete hosts)
- Scenario execution from YAML files
- Broadcast commands to all/marked hosts
- Host marking system for selective command execution
- Automatic reconnection to failed hosts

## Requirements

- Python 3.11+
- pip install -r requirements.txt

## Project structure
```
├── main.py
├── inventory.yaml
├── scenarios.yaml
├── requirements.txt
└── src/
    ├── core/
    │   ├── session_manager.py
    │   ├── ssh_session.py
    │   └── scenario_executor.py
    ├── models/
    │   ├── models.py
    │   ├── events.py
    │   └── scenario.py
    ├── ui/
    │   ├── orchestrator_app.py
    │   ├── add_host_dialog.py
    │   ├── edit_host_dialog.py
    │   ├── delete_host_dialog.py
    │   ├── scenario_selector_dialog.py
    │   ├── delete_scenario_dialog.py
    │   ├── about_dialog.py
    │   └── scenario_editor_dialog.py
    └── utils/
        ├── inventory_manager.py
        └── scenario_loader.py
```

## Usage
1. Add hosts in `inventory.yaml`:

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

2. Add scenarios in `scenarios.yaml`:
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
  - ss -tuln
```

3. Run:
```bash
python main.py
```

## Hotkeys

- `a` → Add new host
- `e` → Edit selected host
- `d` → Delete selected host
- `m` → Toggle host mark
- `s` → Select and run scenario
- `f5` → Reconnect failed hosts
- `f12` → Show about dialog
- `Enter` → Execute command in input field (sends to marked hosts)

## Notes

- SSH keys needed for authentication
- sudo with NOPASSWD for automation
- Hosts are marked by default for command execution
- YAML files are automatically updated when hosts are added/edited/deleted

## Known issues

- RUNNING status may be lost before the running process stops
- If host is offline, the program starts slower
- Some visual bugs in log panel
