# Hierarchical Specs Structure (Hybrid Approach)

**Date**: 2026-01-16
**Status**: Proposed

## Overview

Restructure documentation using a **hybrid approach**:

- **System-level specs** in `/specs/` — architecture, data model, cross-cutting features
- **Package-level specs** in `packages/*/spec.md` — colocated with code and tests

```
High-level idea → Architecture specs → Package specs → Tests → Implementation
                  (in /specs/)         (in spec.md)
```

## Key Decisions

### spec.md vs README.md

| File | Purpose |
|------|---------|
| `README.md` | Setup instructions, usage examples, getting started |
| `spec.md` | Formal requirements (req-*), business rules, contracts |

### Casing Convention

- **Lowercase** for all custom files: `spec.md`, `req-core-001`
- **Exception**: `README.md` (universal convention)

## Goals

1. **Colocation** — Package specs live near code, change together
2. **Clear purpose** — spec.md is unambiguous, it's the specification
3. **System overview** — Architecture and features documented centrally
4. **Traceability** — Clear links between specs and tests
5. **Consistency** — Lowercase prevents cross-OS casing issues

## Documents

| File | Purpose |
|------|---------|
| [structure.md](./structure.md) | Hybrid folder structure with spec.md |
| [workflow.md](./workflow.md) | Updated development workflow |
| [migration.md](./migration.md) | Migration steps from current structure |
| [traceability.md](./traceability.md) | Spec ↔ test mapping |

## Structure Summary

```
specs/                          # System-level (stable, cross-cutting)
├── README.md                   # Entry point
├── architecture/               # Design decisions
└── features/                   # End-to-end flows

packages/
├── core/
│   ├── README.md               # Setup, usage
│   └── spec.md                 # Requirements (req-core-*)
├── repositories/
│   ├── README.md
│   └── spec.md                 # Requirements (req-repo-*)
└── cli/
    ├── README.md
    └── spec.md                 # Requirements (req-cli-*)
```

## Decision Checklist

- [ ] Approve hybrid structure with spec.md
- [ ] Approve workflow changes
- [ ] Approve migration approach
- [ ] Review spec.md templates
