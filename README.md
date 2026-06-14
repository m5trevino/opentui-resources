# tui-ref

A curated, local reference base for building terminal user interfaces (TUIs) with **OpenTUI** and related tools.

This repository collects skills, libraries, components, demos, real-world applications, scaffolding tools, testing helpers, and extras in one place so you (and your agent) can find the right resource quickly.

> **No symlinks are used inside this repository.** Everything is a real file or directory.

---

## What's inside

| Category | Directory | Purpose |
|---|---|---|
| **Skills** | [`skills/`](./skills/) | Claude Code / agent skills for OpenTUI, Ink, debugging, scaffolding, and more. See [`skills/SKILLS_INDEX.md`](./skills/SKILLS_INDEX.md). |
| **Libraries & Components** | [`open_tui_libraries_components_/`](./open_tui_libraries_components_/) | Reusable OpenTUI packages and component libraries. |
| **Demos, Examples & Learning Projects** | [`demos_examples_learning_projects/`](./demos_examples_learning_projects_/) | Runnable demos, starters, and example apps. |
| **Real-World Apps** | [`real_world_apps/`](./real_world_apps_/) | Production-style and full TUI applications. |
| **Scaffolding & Tooling** | [`scaffolding_tooling_/`](./scaffolding_tooling_/) | CLIs and scripts for bootstrapping OpenTUI projects. |
| **Testing & Development Helpers** | [`testing_development_helpers/`](./testing_development_helpers_/) | Testing libraries and reference documentation. |
| **Extras** | [`extras/`](./extras_/) | Additional resources that don't fit the categories above. |

> For a complete item-by-item index, see [`INDEX.md`](./INDEX.md).

---

## Quick start

1. Clone or copy this repo to `~/tui-ref`:

   ```bash
   git clone <repo-url> ~/tui-ref
   ```

2. Install the skills into your agent's skill directory:

   ```bash
   ./install-skills.sh
   ```

   This copies everything in `skills/` to `~/.agents/skills/`.

3. Open the main index:

   ```bash
   cat ~/tui-ref/INDEX.md
   cat ~/tui-ref/skills/SKILLS_INDEX.md
   ```

---

## Installing individual skills

If you only want a single skill, copy it manually:

```bash
cp -r ~/tui-ref/skills/opentui-guide ~/.agents/skills/
```

---

## Updating the repo

After pulling changes, re-run the install script to keep `~/.agents/skills/` in sync:

```bash
./install-skills.sh
```

---

## Directory naming

Some directory names use trailing underscores (e.g. `open_tui_libraries_components_`) because the original request used those exact names. They are preserved for compatibility.

---

## License

Each subdirectory retains its own license. See the individual `LICENSE` or `README` files inside each project.
