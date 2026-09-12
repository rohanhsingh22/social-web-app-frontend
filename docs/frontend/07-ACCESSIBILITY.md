# Accessibility

## 1. Purpose

This document defines accessibility requirements for the HiRotoli frontend.

Accessibility must be treated as a core product requirement.

HiRotoli should be usable by people with different:

- Visual abilities
- Motor abilities
- Hearing abilities
- Cognitive abilities
- Interaction preferences
- Assistive technologies

The goal is not to create a separate accessibility experience.

The goal is to make the primary HiRotoli experience accessible by default.

---

## 2. Accessibility Principles

HiRotoli follows these principles:

1. Use semantic HTML first.
2. Prefer native browser behavior over custom implementations.
3. Every interactive element must be accessible.
4. Keyboard users must be able to navigate the application.
5. Focus must always remain visible.
6. Content must remain understandable without color.
7. Text must remain readable at increased zoom.
8. Screen readers must receive meaningful information.
9. Dynamic content must communicate important changes.
10. Touch targets must be sufficiently large.
11. Forms must provide clear labels and errors.
12. Images must have appropriate alternative text.
13. Motion must respect reduced-motion preferences.
14. Accessibility must be considered during component development, not after implementation.
15. Accessibility fixes must not be isolated to one page when the underlying component is shared.

---

# 3. Accessibility Target

HiRotoli should aim for strong WCAG 2.2 AA alignment.

This means the application should provide:

- Perceivable content
- Operable interfaces
- Understandable interactions
- Robust implementation

WCAG compliance should be treated as an engineering target rather than a claim unless the application has been formally audited.

---

# 4. Semantic HTML

Use HTML elements according to their meaning.

Prefer:

```html
<header>
<nav>
<main>
<section>
<article>
<footer>
<button>
<a>
<form>
<label>
<input>
<textarea>
<select>