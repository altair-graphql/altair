---
applyTo: '**'
---

Coding standards, domain knowledge, and preferences that AI should follow.

# Contributing to Altair GraphQL Client (for AI Assistants and Developers)

This document provides a guide for AI assistants and developers to effectively contribute to the Altair GraphQL Client repository. Its goal is to offer a clear understanding of the project structure, development process, and key areas of the codebase.

## Repository Overview

Altair GraphQL Client is a feature-rich GraphQL Client IDE available on multiple platforms. This repository is a **monorepo** managed using **pnpm** and **Nx** (implied by `turbo.json` and common monorepo practices).

**Key Technologies:**

- **Node.js** and **TypeScript** are used extensively across the packages.
- **pnpm** for package management in the monorepo.
- **Angular** for the main web application (`packages/altair-app`).
- **NestJS** for the backend API (`packages/altair-api`).
- **Electron** for the desktop application (`packages/altair-electron`).
- **VitePress** for the documentation site (`packages/altair-docs`).
- **Prisma** for database interactions (`packages/altair-db`).
- Various testing frameworks (Jest is common).

**Core Package Structure (`packages/`):**

The `packages/` directory houses the different parts of Altair. Here are some of the most important ones:

- `altair-app`: The main Angular-based frontend application.
- `altair-api`: The NestJS-based backend API.
- `altair-core`: Contains core logic, type definitions, and utilities shared across different parts of the application.
- `altair-crx`: The browser extension (e.g., for Chrome, Firefox).
- `altair-electron`: The Electron wrapper for the desktop application.
- `altair-db`: Handles database schema (Prisma) and related utilities.
- `altair-docs`: The source for the official documentation website.
- `altair-express-middleware`, `altair-fastify-plugin`, `altair-koa-middleware`: Middlewares for integrating Altair with various Node.js backend frameworks.
- `altair-plugin`: Infrastructure for Altair's plugin system.
- `altair-static`: Serves/manages static assets for the Altair client.

There are other specialized packages as well. Understanding the purpose of each package is key when working on a specific feature or bug.

## Getting Started / Development Setup

The primary development instructions can be found in [.github/development.md](../development.md). However, here are the most common commands you'll use:

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
2.  **Bootstrap Monorepo & Build Local Projects:** This step is crucial to compile TypeScript to JavaScript and ensure local packages can import each other correctly.
    ```bash
    pnpm bootstrap
    ```
3.  **Start the Web App (Development Server):**

    ```bash
    pnpm start:app
    ```

    This usually starts the app on `http://localhost:4200/`.

4.  **Build the Project:**
    ```bash
    pnpm build # For development build
    # pnpm build --prod # For production build (check exact command if needed)
    ```
5.  **Run Tests:**
    ```bash
    pnpm test
    ```

Refer to the specific `package.json` files within each package for package-specific scripts.

## Workflow for Making Changes

1.  **Understand the Task:** Clearly define the requirements of the feature or bug fix.
2.  **Identify Relevant Packages:** Determine which package(s) in the monorepo are affected by the changes. The package descriptions above should help.
3.  **Branching:** Create a new branch for your changes, following common Git practices.
4.  **Implement Changes:**
    - Follow existing coding styles and patterns within the package you are working on.
    - Write clear, maintainable, and well-documented code where necessary.
5.  **Write/Update Tests:** Ensure that your changes are covered by unit tests, integration tests, or end-to-end tests as appropriate. The project uses Jest for most testing.
6.  **Test Locally:** Run the relevant application (web, desktop, extension) or tests to ensure your changes work as expected.
7.  **Commit and Push:** Use clear and descriptive commit messages.
8.  **Create a Pull Request:** Provide a detailed description of the changes in your PR.

## Key Areas and How to Work on Them (High-Level)

- **Frontend (`packages/altair-app`):**
  - Built with Angular. Familiarize yourself with Angular components, services, and modules.
  - UI changes, new features within the client, or modifications to existing client behavior will likely involve this package.
- **Backend API (`packages/altair-api`):**
  - Built with NestJS. Understand NestJS modules, controllers, services, and providers.
  - Changes to user authentication, data persistence (via `altair-db`), or any server-side logic supporting the client will be here.
- **Core Logic (`packages/altair-core`):**
  - Contains shared business logic, type definitions, and utility functions.
  - Changes here can impact multiple parts of the application. Ensure thorough testing.
- **Browser Extension (`packages/altair-crx`):**
  - Contains manifest files, background scripts, content scripts, and UI elements specific to the browser extension.
- **Desktop Application (`packages/altair-electron`):**
  - Manages the Electron main and renderer processes, window management, and integration with native OS features.
  - Uses `altair-app` for the actual UI.

## Important Scripts (Recap via pnpm)

- `pnpm install`: Install all dependencies.
- `pnpm bootstrap`: Build all local packages and link them.
- `pnpm start:app`: Run the main Altair web application in development mode.
- `pnpm build`: Build all relevant packages.
- `pnpm test`: Run tests across the monorepo.
- `pnpm build-ext`: Build the browser extension(s).
- `pnpm build-electron`: Build the Electron desktop application(s).

Always check the root `package.json` and individual `packages/<name>/package.json` files for the most up-to-date and comprehensive list of scripts.

## Where to Find More Information

- **Official Altair Documentation:** [https://altairgraphql.dev/docs/](https://altairgraphql.dev/docs/) - For user-facing features and general information.
- **General Contributing Guide:** [.github/CONTRIBUTING.md](../CONTRIBUTING.md) - Guidelines for human contributors (PR process, community, etc.).
- **Development Setup Details:** [.github/development.md](../development.md) - Detailed instructions on setting up the development environment.
- **Code of Conduct:** [.github/CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) - Community standards.

This document should provide a solid foundation for working on Altair. As you work on specific tasks, you will dive deeper into the relevant packages.
