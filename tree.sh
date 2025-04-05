.
├── apps
│   └── game-example
│       ├── index.html
│       ├── package.json
│       ├── src
│       │   ├── App.css
│       │   ├── App.tsx
│       │   ├── components
│       │   │   ├── UI.css
│       │   │   └── UI.tsx
│       │   ├── index.css
│       │   ├── main.tsx
│       │   └── scenes
│       │       └── GameScene.tsx
│       └── vite.config.ts
├── package.json
├── packages
│   ├── aether-core
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── AetherApp.ts
│   │   │   ├── assets
│   │   │   │   └── AssetLoader.ts
│   │   │   ├── entity
│   │   │   │   └── EntityManager.ts
│   │   │   ├── index.ts
│   │   │   ├── network
│   │   │   │   └── NetworkManager.ts
│   │   │   ├── physics
│   │   │   │   └── PhysicsWorld.ts
│   │   │   └── rendering
│   │   │       ├── CameraManager.ts
│   │   │       └── SceneManager.ts
│   │   └── tsconfig.json
│   ├── aether-react
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── components
│   │   │   │   └── AetherCanvas.tsx
│   │   │   ├── context
│   │   │   │   └── AetherContext.tsx
│   │   │   ├── hooks
│   │   │   │   ├── useAether.ts
│   │   │   │   ├── useEntity.ts
│   │   │   │   └── usePhysics.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── aether-server
│   │   ├── dist
│   │   │   ├── aether-server
│   │   │   │   └── src
│   │   │   │       ├── EntityManager.d.ts
│   │   │   │       ├── EntityManager.js
│   │   │   │       ├── GameServer.d.ts
│   │   │   │       ├── GameServer.js
│   │   │   │       ├── RoomManager.d.ts
│   │   │   │       ├── RoomManager.js
│   │   │   │       ├── index.d.ts
│   │   │   │       └── index.js
│   │   │   └── aether-shared
│   │   │       └── src
│   │   │           ├── index.d.ts
│   │   │           ├── index.js
│   │   │           └── types
│   │   │               ├── entity.d.ts
│   │   │               ├── entity.js
│   │   │               ├── network.d.ts
│   │   │               └── network.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── EntityManager.ts
│   │   │   ├── GameServer.ts
│   │   │   ├── RoomManager.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   └── aether-shared
│       ├── dist
│       │   ├── errors.d.ts
│       │   ├── errors.js
│       │   ├── index.d.ts
│       │   ├── index.js
│       │   └── types
│       │       ├── entity.d.ts
│       │       ├── entity.js
│       │       ├── network.d.ts
│       │       └── network.js
│       ├── package.json
│       ├── src
│       │   ├── errors.ts
│       │   ├── index.ts
│       │   └── types
│       │       ├── entity.ts
│       │       └── network.ts
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tree.sh
└── tsconfig.base.json

32 directories, 67 files
