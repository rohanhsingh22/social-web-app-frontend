# Layout

## 1. Purpose

This document defines the layout system for the HiRotoli frontend.

The layout system must provide:

- A consistent application shell
- Predictable page structure
- Clear content hierarchy
- Responsive behavior
- Consistent spacing
- Stable navigation
- Comfortable chat layouts
- Proper mobile and desktop behavior
- Reusable layout primitives

The layout system should make the application feel like one product rather than a collection of unrelated pages.

---

## 2. Layout Principles

HiRotoli layouts must follow these principles:

1. Content comes before decoration.
2. Navigation should always be predictable.
3. Important content should remain visually dominant.
4. Layout should work from mobile to large desktop screens.
5. Avoid unnecessary nesting.
6. Avoid excessive containers.
7. Avoid horizontal scrolling unless the feature specifically requires it.
8. Avoid arbitrary margins and positioning.
9. Prefer CSS layout systems over manual positioning.
10. Layout decisions should be reusable.
11. Pages should not independently reinvent the application shell.
12. Chat interfaces should prioritize message readability and input accessibility.
13. Layout should adapt to content instead of assuming fixed content sizes.
14. Avoid traditional breadcrumbs in the consumer application.
15. Admin layouts may use breadcrumbs when they genuinely improve navigation.

---

## 3. Global Application Structure

The authenticated application should follow a consistent structure:

```text
App
│
├── App Shell
│   │
│   ├── Navigation
│   │
│   ├── Main Content
│   │
│   └── Global UI
│       ├── Toasts
│       ├── Dialogs
│       └── Notifications
│
└── Page