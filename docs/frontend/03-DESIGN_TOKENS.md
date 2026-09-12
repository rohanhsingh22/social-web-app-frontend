# HiRotoli Design Tokens

## 1. Purpose

This document defines the visual design tokens used throughout the HiRotoli frontend.

Design tokens provide a single source of truth for:

- colors
- typography
- spacing
- border radius
- borders
- shadows
- breakpoints
- component sizing
- interaction states
- semantic states
- Toli identity colors

Components should consume these tokens instead of creating unrelated visual values.

---

# 2. Token Principles

The design system follows these rules:

1. Prefer semantic tokens over raw color values.
2. Avoid hardcoded colors inside components.
3. Keep light and dark themes consistent.
4. Use Toli colors only for Toli identity.
5. Never use decorative colors for semantic states.
6. Keep spacing consistent.
7. Keep typography predictable.
8. Avoid creating one-off values without a reason.
9. Tokens should be reusable across features.
10. Visual consistency is more important than individual component preference.

---

# 3. Color Architecture

HiRotoli colors are divided into four categories:

```text
Brand Colors
Semantic Colors
Neutral / Surface Colors
Toli Identity Colors