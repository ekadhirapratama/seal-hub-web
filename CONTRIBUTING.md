# Contributing

Welcome, and thank you for contributing to Seal Hub Web!

## Prerequisites

- **Node.js**: Version 22.17.0 or higher.
- **npm**: Included with Node.js.

## Getting Started

1. Clone the repository and switch to your feature branch (`feat/...` or `fix/...`).
2. Navigate to the application directory and install dependencies:
   ```bash
   cd app
   npm install
   ```

## Available Scripts

Run all scripts from within the `app/` directory:

- `npm run dev`: Start the local development server.
- `npm run build`: Build the static application for production.
- `npm run preview`: Locally preview the production build.
- `npm run check`: Run type checking and template validation.
- `npm run lint`: Run Prettier and ESLint.
- `npm run test`: Run unit tests via Vitest.

## Branch and Commit Conventions

- **Branches**: Use descriptive prefixes such as `feat/` for new features or `fix/` for bug fixes.
- **Commits**: Write short, imperative commit messages (e.g., `Add changelog schema`, `Fix mobile navigation drawer`).
- **Pull Requests**: Open one pull request per task.

## PR Checklist

Before submitting a pull request, ensure all checks pass cleanly in this exact order:

1. `npm run check`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

## Language Policy

- **UI Strings**: Indonesian only, stored exclusively in `messages/id.json`.
- **Code and Documentation**: English.

## Important Note on Game Data

Data contributions (such as items, quests, and pets) are **not accepted** until the project reaches the data phase. Please focus on features, tooling, and documentation.
