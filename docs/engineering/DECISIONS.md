# Engineering Decisions

## 1. Purpose

This document records important architectural and product decisions made for HiRotoli.

The purpose is to prevent previously agreed decisions from being changed accidentally during development.

Before making a change that conflicts with a decision in this document, the decision must be explicitly reviewed.

---

# 2. Decision Principles

HiRotoli engineering decisions should prioritize:

- Simplicity
- Maintainability
- Correctness
- Security
- Scalability
- Clear ownership
- Product consistency

Avoid complexity unless there is a demonstrated need.

---

# 3. Architecture

## Decision

HiRotoli uses a **modular monolith architecture** rather than microservices.

The backend is organized into clear modules while remaining within a shared codebase.

## Reason

The application does not currently require the operational complexity of independent microservices.

This provides:

- Clear module boundaries
- Easier development
- Easier debugging
- Simpler deployment
- Lower operational overhead

---

# 4. Backend Processes

## Decision

The backend may be deployed as three independently running applications/processes:

```text
API App
Realtime App
Worker App