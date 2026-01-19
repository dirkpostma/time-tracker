# Interactive Mode Spec

## Command

`tt` (no arguments)

## Behavior

### When timer IS running

Display current timer info, then show action menu:

1. **Stop timer** - Stop the running timer, show summary
2. **Switch** - Stop current timer, start new one (go to selection flow)
3. **Cancel** - Exit without changes

### When NO timer running

Walk user through selection:

1. **Select client** - Arrow-key list of existing clients + "[+ New client]"
2. **Select project** - Arrow-key list + "[Skip]" + "[+ New project]"
3. **Select task** - Arrow-key list + "[Skip]" + "[+ New task]"
4. **Enter description** - Optional text input
5. **Start timer**

### Smart defaults

- Last-used client is pre-selected
- Last-used project is pre-selected (within that client)
- Stored in `~/.tt-config.json`

## UI Examples

Timer running:
```
Timer running: 2h 15m on "Acme Corp > Website Redesign"

? What would you like to do?
  > Stop timer
    Switch to different client/project
    Cancel
```

No timer:
```
? Select client:
  > Acme Corp
    Other Client
    [+ New client]

? Select project:
  > Website Redesign
    [Skip]
    [+ New project]

? Select task:
    [Skip]
  > [+ New task]

? Task name: Homepage layout

? Description (optional): Working on header

Started timer: Acme Corp > Website Redesign > Homepage layout
```

## Scenarios

### Timer Running

| ID | Scenario | Expected |
|----|----------|----------|
| interactive.running.show-info | tt with timer running | Show "Timer running: Xh Ym on Client > Project" |
| interactive.running.stop | User selects "Stop timer" | Stop timer, show summary |
| interactive.running.switch | User selects "Switch" | Stop current, go to selection flow |
| interactive.running.cancel | User selects "Cancel" | Exit without changes |

### No Timer Running

| ID | Scenario | Expected |
|----|----------|----------|
| interactive.select.client | Client selection | Show arrow-key list + "[+ New client]" |
| interactive.select.project | Project selection | Show list + "[Skip]" + "[+ New project]" |
| interactive.select.task | Task selection | Show list + "[Skip]" + "[+ New task]" |
| interactive.select.description | Description prompt | Optional text input |
| interactive.select.start | All selections made | Start timer |

### Smart Defaults

| ID | Scenario | Expected |
|----|----------|----------|
| interactive.defaults.client | Interactive mode starts | Pre-select last-used client |
| interactive.defaults.project | Client selected | Pre-select last-used project within that client |
