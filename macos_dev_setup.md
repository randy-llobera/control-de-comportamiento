# macOS Development Environment Setup for **Control Incidencias**

A complete record of all configuration, installation, and setup steps performed to prepare the macOS development environment for the **Control Incidencias** project.

---

## **Phase 0 — macOS Base Setup**

### Overview

Prepare macOS for software development by installing Apple's core development tools.

### Steps

- **Install Xcode Command Line Tools:** `xcode-select --install`
  - Provides compilers, Git, and build tools used by most development frameworks.
  - Required by Homebrew, Node, and other packages.
- **Verify installation:**
  ```bash
  xcode-select -p
  git --version
  clang --version
  ```

### Key Concepts

- **CLT** gives you the minimal subset of Xcode for compiling and linking code.
- **No need for sudo:** macOS installs CLT system-wide under `/Library/Developer/CommandLineTools`.

### Notes

- Once installed, these tools work across all projects.

---

## **Phase 1 — Core Development Infrastructure**

### Overview

Set up essential tools for managing system packages and Node.js environments.

### Steps

1. **Install Homebrew** (package manager)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   - Simplifies installing and updating developer tools.
   - Installs packages to `/opt/homebrew` (Apple Silicon path).
2. **Verify Brew:** `brew doctor`, `brew --version`
3. **Install NVM (Node Version Manager):**
   ```bash
   brew install nvm
   mkdir ~/.nvm
   echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
   echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
   source ~/.zshrc
   ```

   - Allows switching Node versions per project.
4. **Install Node LTS:**
   ```bash
   nvm install --lts
   nvm use --lts
   ```

   - Provides latest long-term stable version for production-ready apps.

### Tools Installed

- **Homebrew:** universal package manager for macOS.
- **NVM:** handles multiple Node.js versions.
- **Node.js + npm:** runtime and package manager for JavaScript apps.

### Notes

- Node installed via NVM stays isolated under `~/.nvm`.
- You never need `sudo` for npm installs with NVM.

---

## **Phase 2 — Project Runtime & Package Management**

### Overview

Set up package management, clone the repository, and install dependencies.

### Steps

1. **Enable Corepack:** `corepack enable`
   - Allows Node to auto-manage package managers (npm, yarn, pnpm).
2. **Set up GitHub SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "email@example.com"
   pbcopy < ~/.ssh/id_ed25519.pub
   ```

   - Secure passwordless Git operations.
3. **Add key to GitHub:** Settings → SSH → _Authentication Key_.
4. **Clone the repo:**
   ```bash
   mkdir -p ~/Projects
   cd ~/Projects
   git clone git@github.com:randy-llobera/control-de-comportamiento.git
   cd control-de-comportamiento
   ```
5. **Install dependencies:**
   ```bash
   npm install
   ```

### Key Concepts

- **Corepack** ensures consistency if other PMs are used.
- **SSH over HTTPS:** secure and credential-free.

### Notes

- `npm install` restored the full dependency graph from `package-lock.json`.

---

## **Phase 2.5 — Editor & Terminal Setup**

### Overview

Configure VS Code and iTerm2 for efficient, modern development.

### Steps

1. **Install VS Code via Homebrew:**
   ```bash
   brew install --cask visual-studio-code
   ```
2. **Register \*\***code\***\* CLI** (from VS Code Command Palette).
3. **Install core extensions:**
   - ESLint, Prettier, TailwindCSS IntelliSense, GitLens, DotENV, Prisma, ErrorLens, Path IntelliSense.
4. **Add workspace settings** in `.vscode/settings.json` for formatting and linting.
5. **Install iTerm2:** `brew install --cask iterm2`
6. **Install Zsh plugins:**
   ```bash
   brew install zsh-autosuggestions zsh-syntax-highlighting
   ```
   Add them to `~/.zshrc`.
7. **Install Oh My Zsh:** improves prompt customization and plugin handling.

### Important Concepts

- **Zsh:** macOS default shell; Oh My Zsh adds theme and plugin support.
- **Prettier + ESLint:** maintain consistent formatting and code quality.

### Notes

- Use iTerm2 for global/system commands and VS Code for project-local tasks.

---

## **Phase 3 — Supabase & Environment**

### Overview

Configure backend connectivity and environment variables.

### Steps

1. **Install Supabase CLI:** `brew install supabase/tap/supabase`
2. **Link project with Vercel:**
   ```bash
   brew install vercel-cli
   vercel login
   vercel link
   vercel env pull .env.local
   ```

   - Pulls all environment variables used in production.
3. **Test connection:**
   ```bash
   npm run dev
   ```

   - App booted successfully and connected to Supabase.

### Key Files

- `.env.local` → local environment variables (ignored by Git).

### Notes

- `.env.local` is intentionally excluded from version control.
- Supabase and Auth tested and functional locally.

---

## **Phase 4 — Build & Verification**

### Overview

Ensure project builds cleanly and matches Vercel’s CI pipeline.

### Steps

1. **Run build:** `npm run build`
2. **Serve production build locally:** `npm start`

### Purpose

- Detect issues before deployment (missing envs, type errors, etc.).
- Guarantees Vercel builds will succeed.

### Notes

- Both build and start passed without errors.

---

## **Phase 5 — Repository Hygiene**

### Overview

Standardize project configuration, versioning, and developer experience.

### Steps

1. **Pin Node version:**
   ```bash
   echo "v22.21.0" > .nvmrc
   ```
2. **Pin npm version:**
   ```bash
   npm pkg set packageManager="npm@10.9.4"
   ```
3. **Normalize line endings:**
   ```bash
   git config --global core.autocrlf input
   git config --global core.eol lf
   ```
4. **Add scripts:**
   ```bash
   npm pkg set scripts.format="prettier --write ."
   npm pkg set scripts.lint="eslint ."
   ```

### Key Concepts

- **.nvmrc** ensures consistent Node versions across machines.
- **Pinned package manager** prevents drift.
- **Prettier/ESLint scripts** allow manual formatting and linting.

### Notes

- Husky Git hooks skipped for now to reduce complexity.

---

## **Phase 8 — Supabase Type Generation**

### Overview

Automate generation of strongly typed database definitions.

### Steps

1. **Login to Supabase CLI:** `supabase login`
2. **Generate types:**
   ```bash
   supabase gen types typescript \
     --project-id $SUPABASE_PROJECT_REF \
     --schema public > src/types/supabase.ts
   ```
3. **Automate generation before builds:**
   ```bash
   npm pkg set scripts.types="supabase gen types typescript --project-id $SUPABASE_PROJECT_REF --schema public > src/types/supabase.ts"
   npm pkg set scripts.prebuild="npm run types"
   ```
4. **Format:** `npm run format`

### Key Concepts

- **Supabase CLI** provides local commands for type generation and schema export.
- **Automatic prebuild hook** ensures up-to-date type definitions.

### Notes

- Changes in `supabase.ts` reflect new schema or generator updates.
- Nullable and optional type flags are expected.

---

## ✅ **Final State**

All phases completed successfully.

- macOS, tools, and project environment are stable.
- Build, lint, format, and Supabase integration verified.
- Vercel deploys automatically and matches local behavior.

This environment is now fully production-ready and aligned with industry standards for TypeScript, Next.js, and Supabase development on macOS.
