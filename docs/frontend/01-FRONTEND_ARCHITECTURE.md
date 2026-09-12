# HiRotoli Frontend Architecture

## 1. Purpose

This document defines the architecture of the HiRotoli frontend.

It establishes:

- application structure
- technology choices
- routing architecture
- state management
- API communication
- realtime communication
- authentication boundaries
- component organization
- data flow
- frontend/backend responsibilities
- architectural rules

The goal is to keep the frontend maintainable as HiRotoli grows from a small social application into a production social platform.

This document describes the frontend architecture.

It does not define backend implementation details.

Backend architecture is documented separately.

---

# 2. Product Context

HiRotoli is a social application focused on:

- discovering people
- joining conversations
- meeting strangers
- building connections
- finding communities
- developing social identity through Toli

Primary product philosophy:

> People first. Conversations first.

Primary brand tagline:

> Meet people. Find your people.

The frontend must support this philosophy by keeping the user and conversation at the center of the experience.

---

# 3. Current Frontend Technology

The current frontend uses:

- Next.js
- React
- TypeScript
- Redux Toolkit
- React Redux
- RTK Query
- Socket.IO Client
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- Three.js
- React Three Fiber
- React Three Drei

Current versions documented in the frontend audit include:

```text
next              ^16.2.6
react              ^19.2.3
@reduxjs/toolkit   ^2.11.1
react-redux        ^9.3.0
socket.io-client   ^4.8.1
three              ^0.185.1
@react-three/fiber ^9.7.0
@react-three/drei  ^10.7.8
tailwindcss        ^4.1.18
lucide-react       ^0.555.0