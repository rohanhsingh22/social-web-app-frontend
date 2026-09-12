# Forms

## 1. Purpose

This document defines the standards for forms across the HiRotoli frontend.

Forms should be:

- Simple
- Clear
- Predictable
- Accessible
- Responsive
- Consistent
- Easy to validate
- Safe to submit
- Resistant to accidental data loss

Forms should help users complete tasks without unnecessary friction.

---

# 2. Form Principles

HiRotoli forms follow these principles:

1. Ask only for information that is actually required.
2. Use clear labels.
3. Keep related fields together.
4. Validate input consistently.
5. Show useful errors.
6. Never rely only on placeholder text.
7. Preserve user input when validation fails.
8. Prevent accidental duplicate submissions.
9. Provide clear submission states.
10. Keep forms responsive.
11. Support keyboard navigation.
12. Support screen readers.
13. Never expose sensitive data unnecessarily.
14. Do not introduce unnecessary form complexity.
15. Reuse existing form components and validation patterns.

---

# 3. Form Architecture

Forms should generally follow:

```text
Form
├── Field Group
│   ├── Label
│   ├── Input
│   ├── Description
│   └── Error
│
├── Field Group
│   ├── Label
│   ├── Input
│   ├── Description
│   └── Error
│
└── Actions
    ├── Cancel
    └── Submit