# Source

- Use src/components/ui/link.tsx for links.
- Reuseable components are in src/components/ui.
- Types are in src/types.ts.

# Style

- Use path aliases in imports.
- Use function declarations for named functions.

# Libraries

- We use `react-hotkeys-hook` for hotkeys.

# MCP

- Refer to docs with Context7 MCP.
- Use Playwright MCP to debug in browser. Port 3000. Stop and advise if it's not running

# Typescript

- Use `type` over `interface` wherever possible.
- Use `npm run typecheck` when necessary.
- Don't use `any`.

# Testing

- Run playwright with --reporter=line.
- Use all-lowercase for test naming.
