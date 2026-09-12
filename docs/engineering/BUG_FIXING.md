# Bug Fixing

## 1. Purpose

This document defines the standard process for investigating, fixing, and validating bugs in HiRotoli.

The primary rule is:

> Reproduce → Understand → Find the root cause → Fix the root cause → Test → Verify

A bug fix is not an opportunity for unrelated refactoring, feature development, or architectural changes.

---

# 2. Core Rules

Every bug fix should follow these principles:

- Understand before changing.
- Reproduce before editing whenever possible.
- Read the relevant code before making assumptions.
- Find the root cause.
- Fix the root cause, not only the symptom.
- Make the smallest correct change.
- Preserve existing behavior outside the bug.
- Add regression coverage when practical.
- Verify the fix.
- Do not introduce unrelated features.
- Do not silently change product decisions.
- Do not commit or push without explicit approval when working with an agent.

A structured reproduction and root-cause workflow reduces the risk of applying a plausible-looking patch without actually understanding the failure. :contentReference[oaicite:0]{index=0}

---

# 3. Bug Lifecycle

```text
Bug Report
    ↓
Triage
    ↓
Reproduce
    ↓
Investigate
    ↓
Root Cause
    ↓
Scope
    ↓
Fix
    ↓
Test
    ↓
Validate
    ↓
Report