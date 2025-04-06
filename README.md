# Aether Engine 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A modular game engine framework for building high-performance 3D experiences with TypeScript.

## Features ✨
- **Core Framework**
  - 🧩 Entity-Component-System architecture
  - 🌐 Network synchronization
  - 🎮 Input management
  - 📦 Asset pipeline with resource pooling

- **Shared Utilities**
  - 🧮 Math libraries (Vectors, Quaternions, Matrices)
  - ⚡ Performance utilities (throttling/memoization)
  - 🛠 Error handling system

- **React Integration** (`@aether/react`)
  - 🖥 Canvas context management
  - ↔️ State synchronization
  - 🎨 React-three-fiber integration

## Getting Started 🛠️

### Prerequisites
- Node.js v18+
- pnpm v8+

```bash
# Clone repository
git clone https://github.com/your-org/aether-engine.git
cd aether-engine

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run example game
pnpm dev
```

## Project Structure 📂

```
aether-engine/
├── packages/          # Core modules
│   ├── aether-core/    # Engine core
│   ├── aether-shared/  # Shared utilities
│   ├── aether-react/   # React integration
│   └── aether-server/  # Server runtime
├── apps/              # Example implementations
│   └── game-example/   # Demo game
├── tsconfig.base.json # Shared TS config
└── package.json       # Workspace configuration
```

## Development Workflow 🔄

```bash
# Build all packages
pnpm build

# Start dev server for example game
pnpm dev

# Run tests
pnpm test

# Lint codebase
pnpm lint
```

## Contributing 🤝
Please see our [contribution guidelines](CONTRIBUTING.md) for details.

## License 📄
This project is licensed under the [MIT License](LICENSE).
