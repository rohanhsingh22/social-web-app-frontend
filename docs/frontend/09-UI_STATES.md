# UI States

## 1. Purpose

This document defines how HiRotoli frontend interfaces should behave across different application states.

Every important UI surface must account for more than the ideal successful state.

The frontend must explicitly handle:

- Loading
- Success
- Empty
- Error
- Disabled
- Offline
- Reconnecting
- Unauthorized
- Forbidden
- Not found
- Partial data
- Updating
- Optimistic state
- Destructive state

The goal is to prevent broken, confusing, or ambiguous interfaces.

---

# 2. Core Principle

Every feature should answer:

```text
What does the user see when...