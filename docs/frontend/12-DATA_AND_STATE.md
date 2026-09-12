# Data and State

## 1. Purpose

This document defines how data and state are managed across the HiRotoli frontend.

The goal is to keep application state:

- Predictable
- Minimal
- Consistent
- Performant
- Testable
- Easy to reason about
- Clearly separated by responsibility

HiRotoli uses different state mechanisms for different types of data.

---

# 2. Core Principle

Do not put everything into global state.

Every piece of data should have an intentional owner.

```text
Server Data
    ↓
RTK Query

Global Client State
    ↓
Redux Toolkit

Local UI State
    ↓
React state

URL State
    ↓
Next.js router / search params

Form State
    ↓
Form state / existing form library

Realtime State
    ↓
Socket layer + appropriate client state