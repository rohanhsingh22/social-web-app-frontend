# HiRotoli Frontend Design

## 1. Purpose

This document defines the visual and interaction design direction for the HiRotoli frontend.

HiRotoli is a social application centered around:

- People
- Conversations
- Discovery
- Connection
- Belonging
- Curiosity
- Openness
- Community

The interface should make people feel that they are entering a place where they can discover and talk to real people.

The product should feel like a modern social application, not:

- a gaming platform
- a corporate CRM
- a developer dashboard
- a dating application
- a forum
- a productivity application

The core product philosophy is:

> People first. Conversations first.

Primary brand tagline:

> Meet people. Find your people.

Toli tagline:

> Find your Toli. Find your people.

---

# 2. Overall Design Direction

HiRotoli should feel:

- Modern
- Friendly
- Social
- Clean
- Expressive
- Approachable
- Premium
- Lightweight
- Human
- Calm when necessary
- Energetic when appropriate

The UI should not feel overly playful or childish.

It should also not feel overly serious or corporate.

The desired feeling is:

> "This is a modern place where I can meet people."

---

# 3. Design Principles

## 3.1 People First

People should remain the most important visual element.

User avatars, names, conversations, profiles and communities should receive more visual attention than decorative UI.

Do not allow decorative effects to overpower people or conversations.

---

## 3.2 Conversation First

Chat is one of the core experiences of HiRotoli.

Chat interfaces should prioritize:

1. Messages
2. People
3. Context
4. Actions

Avoid unnecessary UI around messages.

The user should be able to enter a room and understand immediately:

- Where am I?
- Who is here?
- What are people talking about?
- How do I participate?

---

## 3.3 Simplicity

Every screen should have a clear primary purpose.

Avoid adding UI simply because space is available.

Do not create:

- unnecessary cards
- unnecessary badges
- excessive buttons
- decorative statistics
- excessive gradients
- unnecessary animations

---

## 3.4 Familiar Interaction Patterns

Use patterns users already understand.

Examples:

- Avatar → profile
- Back button → previous screen
- Send button → send message
- Settings → account/application settings
- Bell → notifications
- Search → discovery
- Tabs → related sections

Do not invent unusual interaction patterns without a strong product reason.

---

# 4. Visual Language

HiRotoli should use a modern application visual language based on:

- clean surfaces
- soft borders
- controlled shadows
- rounded corners
- strong typography hierarchy
- restrained gradients
- consistent spacing
- expressive avatars
- subtle motion

The interface should generally avoid heavy glassmorphism.

Glass effects may be used selectively for special visual elements, but must never become the default styling pattern.

---

# 5. Brand Identity

## 5.1 Logo

HiRotoli uses a custom abstract H logo representing two people/paths meeting.

The logo consists of two primary visual paths.

Person/path one:

- Orange `#FFB02E`
- Coral `#FF4F6D`

Person/path two:

- Blue `#2F9BFF`
- Violet `#5B3FF5`

Connection:

- Pink/Purple `#D94FE8`

The logo colors remain consistent across light and dark mode.

Only the surrounding/background treatment changes between themes.

Existing logo assets should be reused rather than recreated.

---

# 6. Color Philosophy

HiRotoli should not use random colors throughout the application.

Colors must have semantic meaning.

The application should primarily use:

- neutral surfaces
- neutral text
- semantic status colors
- brand accents
- Toli identity colors

Toli colors are an identity layer.

They should not turn the entire application into five different themes.

For example:

A Wave user may have blue/aqua identity accents.

That does NOT mean the entire page should become blue.

---

# 7. Light and Dark Mode

HiRotoli supports light and dark themes.

Both themes should feel like the same product.

Dark mode should not simply be a black version of light mode.

The hierarchy should remain consistent:

- page background
- surface
- elevated surface
- border
- primary text
- secondary text
- muted text
- interactive elements
- semantic states

Theme implementation should use design tokens rather than component-specific hardcoded colors.

---

# 8. Typography

Typography should prioritize readability.

Use a clear hierarchy:

### Page title

Used for the primary heading of a screen.

### Section title

Used to divide major sections.

### Body

Used for normal content and messages.

### Secondary text

Used for supporting information.

### Caption

Used for small metadata.

Avoid using many font sizes.

Typography should feel modern and clean rather than decorative.

Messages should prioritize readability over visual styling.

---

# 9. Cards

Cards should be used when they provide meaningful grouping.

Good examples:

- profile summary
- Toli summary
- settings section
- discovery item
- report details
- administrative information

Avoid wrapping every piece of content inside a card.

A chat message should generally not be placed inside a large card.

---

# 10. Border Radius

HiRotoli should use a consistent radius system.

Rounded corners should communicate:

- grouping
- hierarchy
- friendliness

Do not make every element extremely rounded.

Buttons, inputs, cards and dialogs should use consistent radius tokens defined in `03-DESIGN_TOKENS.md`.

---

# 11. Shadows

Shadows should be subtle.

Use shadows primarily for:

- dialogs
- dropdowns
- popovers
- elevated surfaces
- important floating UI

Do not use heavy shadows on every card.

Borders and surface contrast should usually provide most of the hierarchy.

---

# 12. Icons

Use Lucide icons consistently.

Icons should:

- communicate familiar actions
- have consistent stroke weight
- align visually with surrounding text
- avoid unnecessary decoration

Do not mix multiple icon libraries for equivalent actions.

Avoid using icons when a simple text label is clearer.

---

# 13. Avatars

Avatars are an important part of HiRotoli's identity.

They should be visually recognizable and consistent.

HiRotoli supports:

### Provider avatar

Avatar supplied by the OAuth provider.

### Built-in avatar

HiRotoli-created avatar selected by the user.

Built-in avatars belong to a Toli.

There are:

- 5 Tolies
- 5 avatars per Toli
- 25 built-in avatars total

Users should only select built-in avatars belonging to their current Toli.

---

# 14. Toli Visual Identity

The five Tolies have distinct identities.

## Wave

Motto:

> Your presence travels.

Visual direction:

- Ocean blue
- Aqua
- Soft cyan
- Optional coral/pink
- Flowing shapes
- Movement
- Expression

Wave should feel:

- social
- expressive
- welcoming
- energetic
- emotionally open

---

## Vector

Motto:

> Move with purpose.

Visual direction:

- Electric blue
- Deep blue
- Violet
- Directional lines
- Geometric movement

Vector should feel:

- driven
- focused
- ambitious
- exploratory
- purposeful

---

## Quantum

Motto:

> Every individual matters.

Visual direction:

- Deep violet
- Indigo
- Electric purple
- Soft blue
- Particles
- Connected points
- Subtle individuality

Quantum should feel:

- thoughtful
- curious
- individualistic
- observant
- imaginative

Do not use literal outer-space imagery.

---

## Orbit

Motto:

> Find your people.

Visual direction:

- Indigo
- Blue
- Soft purple
- Lavender
- Circular relationships
- Connected points
- Community

Orbit should feel:

- welcoming
- loyal
- connected
- community-oriented
- warm

---

## Flux

Motto:

> Keep moving.

Visual direction:

- Coral
- Pink
- Violet
- Blue
- Cyan
- Transformation
- Motion

Flux should feel:

- creative
- adaptable
- experimental
- optimistic
- constantly evolving

---

# 15. Toli Usage Rules

Toli colors should be used primarily for:

- Toli badges
- avatar identity
- subtle accents
- Toli page identity
- selected states
- community indicators

Do not:

- recolor the entire application based on Toli
- make Toli colors dominate chat
- use Toli colors for unrelated semantic states
- use Toli colors for success/error/warning states

Semantic meaning always takes priority over decorative Toli colors.

---

# 16. Chat Design

Chat is a primary product experience.

A public chat screen should clearly communicate:

- room name
- room description/context
- online count where available
- messages
- current user state
- message composer for authenticated users

Guest users may read messages but cannot send messages.

The UI should make this restriction obvious without making the guest experience feel blocked.

Example:

> Sign in to join the conversation.

The message area should remain the visual focus.

---

# 17. Message Design

Messages should be easy to scan.

A message may contain:

- avatar
- username
- timestamp
- message content
- contextual actions where permitted

Avoid excessive message metadata.

The sender's identity should be clear.

Messages from the current user should be visually distinguishable without relying exclusively on color.

---

# 18. Profile Design

Profiles should feel social rather than administrative.

A profile should prioritize:

1. Avatar
2. Name
3. Username
4. Toli identity
5. Bio
6. Relevant profile information
7. Connection actions

Do not turn the profile into a statistics dashboard.

HiRotoli should not publicly emphasize:

- hours online
- message counts
- activity scores
- streaks
- popularity scores
- follower-style vanity metrics

The product is about people, not performance.

---

# 19. Connections

Connections should feel like relationships rather than a contact-management system.

Connection UI should clearly communicate states such as:

- not connected
- request sent
- request received
- connected

Actions should remain simple.

Avoid gamified relationship indicators.

---

# 20. Navigation

The consumer application should use a clear application shell.

Primary areas:

- Home / Discover
- Public Rooms
- My Toli
- Connections
- Messages
- Profile
- Settings

Admin navigation is separate.

### Breadcrumbs

Do not use traditional breadcrumbs in the consumer application.

They feel unnecessary for HiRotoli's social navigation model.

Use instead:

- page titles
- tabs
- back navigation
- application navigation

Admin pages may use breadcrumbs when they genuinely improve navigation.

---

# 21. Forms

Forms should be:

- simple
- clearly labeled
- easy to scan
- keyboard accessible
- explicit about validation
- forgiving about errors

Do not hide important information inside tooltips.

Validation messages should explain:

- what is wrong
- how to fix it

Avoid technical backend error messages in the user interface.

---

# 22. Empty States

Empty states should be useful rather than decorative.

A good empty state should communicate:

1. What is empty?
2. Why might it be empty?
3. What can the user do next?

Example:

> No connections yet.
>
> Start a conversation and see where it goes.

Avoid excessive illustrations or animations.

---

# 23. Loading States

Loading states should preserve layout where possible.

Use:

- skeletons
- spinners for short operations
- disabled states for submitting actions

Avoid full-screen loading whenever only a small section is loading.

The application should feel responsive even when data is being fetched.

---

# 24. Error States

Errors should be:

- understandable
- actionable
- calm
- non-technical

Do not expose:

- stack traces
- database errors
- raw API responses
- internal service names

Example:

> Something went wrong while loading this conversation.
>
> Try again.

Where possible, provide a retry action.

---

# 25. Notifications and Feedback

Use feedback for meaningful events:

- successful profile update
- connection request
- connection acceptance
- message failure
- settings update
- account action

Do not show unnecessary notifications for every interaction.

Feedback should be noticeable without becoming distracting.

---

# 26. Motion

Motion should support understanding.

Good uses:

- page transitions
- opening dialogs
- expanding panels
- message appearance
- navigation transitions
- subtle hover/focus feedback

Avoid:

- constant movement
- excessive bouncing
- distracting particles
- unnecessary animation on every component

Motion must respect reduced-motion preferences.

Detailed rules are defined in:

`08-MOTION.md`

---

# 27. Responsive Design

HiRotoli is a responsive application.

The experience must work across:

- desktop
- laptop
- tablet
- mobile

Responsive behavior should adapt the layout rather than simply shrinking desktop UI.

Chat is especially important on mobile.

Navigation should become appropriate for smaller screens.

Detailed responsive rules are defined in:

`06-RESPONSIVE.md`

---

# 28. Accessibility

Accessibility is part of the design system, not an optional enhancement.

The UI should support:

- keyboard navigation
- visible focus
- semantic HTML
- screen readers
- sufficient contrast
- reduced motion
- accessible forms
- accessible dialogs
- accessible buttons
- accessible interactive states

Detailed requirements are defined in:

`07-ACCESSIBILITY.md`

---

# 29. Gamification Restrictions

HiRotoli is not a game.

Do not introduce:

- XP
- levels
- streaks
- leaderboards
- Toli wars
- public activity scores
- popularity rankings
- message-count competitions
- "most active" rankings

Toli is a social identity/community system.

It is not a gaming clan.

---

# 30. Design Anti-Patterns

Avoid:

- random colors
- excessive gradients
- excessive glassmorphism
- giant shadows
- overly rounded interfaces
- excessive badges
- unnecessary cards
- dense dashboards
- gaming-style UI
- corporate CRM-style UI
- excessive animations
- decorative UI that competes with people
- inconsistent icon libraries
- inconsistent spacing
- hardcoded theme colors
- component-specific design decisions that contradict the design system

---

# 31. Design System Source of Truth

Design decisions must be centralized.

Use:

`03-DESIGN_TOKENS.md`

for:

- colors
- typography
- spacing
- radius
- shadows
- breakpoints
- semantic colors
- component dimensions

Do not create one-off values inside components unless there is a documented reason.

---

# 32. Product Feeling

Every major design decision should pass this question:

> Does this make HiRotoli feel more like a place where people meet and find their people?

If the answer is no, question whether the UI is necessary.

The application should ultimately communicate:

> Meet people. Find your people.

and:

> People first. Conversations first.