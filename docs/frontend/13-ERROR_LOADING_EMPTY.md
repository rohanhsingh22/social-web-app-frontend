# Error, Loading, and Empty States

## 1. Purpose

This document defines how HiRotoli handles:

- Loading
- Errors
- Empty data
- Retry states
- Partial failures
- Network failures
- Authentication failures
- Realtime failures

These states should be consistent across the application.

---

# 2. Core Principle

Every important asynchronous UI should answer three questions:

1. What is happening?
2. What can I do?
3. What happens next?

Users should never be left staring at:

```text
Blank screen