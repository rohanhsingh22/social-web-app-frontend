# Navigation

## 1. Purpose

This document defines the navigation architecture and behavior for the HiRotoli frontend.

Navigation should help users move through HiRotoli without making them think about the application's internal structure.

The navigation system should be:

- Simple
- Predictable
- Consistent
- Responsive
- Accessible
- Fast
- Context-aware
- Easy to learn

HiRotoli is a consumer social application.

Navigation should feel like moving through a social space, not navigating an enterprise dashboard.

---

# 2. Navigation Principles

HiRotoli follows these principles:

1. Keep primary navigation simple.
2. Make important destinations always discoverable.
3. Do not hide core functionality unnecessarily.
4. Use clear labels.
5. Prefer recognizable icons alongside labels where appropriate.
6. Preserve navigation state when possible.
7. Do not use traditional breadcrumbs in the consumer application.
8. Use back navigation where it provides meaningful context.
9. Navigation must work with keyboard and screen readers.
10. Mobile and desktop navigation may differ visually but must preserve the same information architecture.
11. Navigation must not depend on color alone.
12. Avoid unnecessary nested navigation.
13. Do not introduce new navigation destinations without product approval.
14. Keep the navigation focused on people, conversations, discovery, and belonging.

---

# 3. Primary Information Architecture

The main HiRotoli application navigation is:

```text id="o7p8kd"
HiRotoli
│
├── Home / Discover
├── Public Rooms
├── My Toli
├── Connections
├── Messages
├── Profile
└── Settings