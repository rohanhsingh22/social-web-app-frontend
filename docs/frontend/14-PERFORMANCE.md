# Performance

## 1. Purpose

This document defines frontend performance rules for HiRotoli.

The goal is to keep the application:

- Fast
- Responsive
- Stable
- Efficient
- Scalable
- Smooth on lower-end devices
- Efficient on slower networks

Performance work should improve real user experience without sacrificing correctness or maintainability.

---

# 2. Core Principle

Do not optimize blindly.

Use:

```text
Measure
   ↓
Identify bottleneck
   ↓
Understand root cause
   ↓
Make smallest effective change
   ↓
Measure again