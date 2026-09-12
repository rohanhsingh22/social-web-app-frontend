# Responsive Design

## 1. Purpose

This document defines how the HiRotoli frontend adapts across:

- Mobile phones
- Tablets
- Laptops
- Desktop monitors
- Large desktop screens

Responsive design must be treated as a core part of the UI system, not as a final adjustment after desktop development.

The goal is to provide the same product experience across screen sizes while adapting layout, navigation, spacing, controls, and content presentation to the available space.

---

## 2. Responsive Principles

HiRotoli responsive design follows these principles:

1. Mobile is a first-class experience.
2. Desktop should not simply be scaled down to mobile.
3. Content hierarchy must remain consistent.
4. Primary actions must remain accessible.
5. Navigation must adapt to available space.
6. Avoid horizontal scrolling whenever possible.
7. Avoid fixed dimensions when fluid dimensions are more appropriate.
8. Use the existing design tokens and breakpoints.
9. Do not create unnecessary device-specific implementations.
10. Prefer CSS responsiveness over JavaScript viewport detection.
11. Preserve functionality across all supported screen sizes.
12. Layout changes should be intentional and predictable.
13. Touch interactions must be considered on smaller screens.
14. Dynamic content must not break responsive layouts.
15. Responsive behavior must not compromise accessibility.

---

# 3. Supported Screen Categories

HiRotoli should support four primary responsive categories:

```text
Mobile
    ↓
Tablet
    ↓
Desktop
    ↓
Large Desktop