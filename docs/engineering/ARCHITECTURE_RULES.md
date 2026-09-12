# Architecture Rules

## 1. Purpose

This document defines the architectural rules for HiRotoli.

These rules exist to keep the codebase:

- Understandable
- Maintainable
- Secure
- Testable
- Scalable
- Consistent

Architecture should solve real problems without introducing unnecessary complexity.

---

# 2. Core Principle

> Build the simplest architecture that correctly satisfies the current requirements.

Do not introduce complexity because the application may need it someday.

Future scalability should be considered, but speculative architecture should not drive current implementation.

---

# 3. Modular Monolith

HiRotoli uses a modular monolith architecture.

Backend functionality should be organized into clear modules while remaining within the same backend codebase.

Conceptually:

```text
Backend
├── Auth
├── Users
├── Profiles
├── Channels
├── Connections
├── DirectMessages
├── Toli
├── Reports
├── Blocks
├── Moderation
└── Admin