# Figma Make Prompt (AIDD + Performance)
> Date: 2026-02-20

Use this prompt in Figma Make:

"Design a production-ready FusionCommerce web experience focused on high performance checkout orchestration.

Requirements:
- Create 4 desktop frames (1440px):
  1) Checkout Context Entry
  2) Policy Preview Comparison (Direct SDK vs Service-Orchestrated)
  3) Shipping Lane Preview + SLA Table
  4) Order Confirmation Summary
- Create 2 mobile frames (390px):
  1) Mobile Checkout Context
  2) Mobile Policy + Lane Result
- Build with reusable components and variants: Button, Input, Numeric Input, Status Tag, Alert Banner, Data Table Row, Summary Card.
- Visual style: enterprise, clean, high contrast, blue/teal emphasis, minimal decorative overhead.
- Accessibility guardrails (AIDD): WCAG 2.1 AA contrast, keyboard-focus visibility, touch target min 44px on mobile, semantic heading hierarchy.
- Performance guardrails (AIDD):
  - Prioritize above-the-fold clarity and low cognitive load.
  - Keep primary action path to 1-2 clicks per step.
  - Avoid dense visual noise and unnecessary animation.
  - Include skeleton/loading states for policy and shipping calls.
  - Define empty/error/success states for every async panel.
- Motion: subtle only (150-200ms), no blocking transitions.
- Deliverables:
  - Design tokens: color, type scale, spacing scale, radius, elevation.
  - Component spec sheet with interaction states (default/hover/focus/loading/disabled/error).
  - Annotated handoff notes for frontend implementation and responsiveness.

Output format:
- Name file pages: `Checkout`, `Shipping`, `Order Summary`, `Mobile`, `Components`, `Tokens`, `Handoff`.
- Include an implementation checklist aligned to AIDD quality gates (testability, accessibility, performance, and observability)."
