# Contribution Guidelines

Thank you for considering contributing to Aether Engine! Please follow these guidelines to ensure smooth collaboration.

## Code of Conduct
This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## Development Workflow

### Prerequisites
- Node.js v18+
- pnpm v8+

```bash
# Install dependencies
pnpm install

# Run in development mode (with file watching)
pnpm dev

# Build all packages
pnpm build
```

### Branch Strategy
- `main` - Primary development branch
- `release/*` - Versioned releases
- Feature branches: `feature/<package>/<description>` (e.g. `feature/core/resource-pool-optimization`)

## Commit Message Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Pull Request Process
1. Ensure all tests pass (`pnpm test`)
2. Update documentation if introducing new features
3. Link to relevant GitHub issues
4. Include screenshots/GIFs for UI changes
5. Allow maintainers to request changes

## Code Style Guidelines
- TypeScript strict mode enforced
- 2-space indentation
- ESLint rules (run `pnpm lint` before committing)
- Prettier formatting (automatically enforced)

## Testing Practices
- Unit tests colocated with source files (`*.test.ts`)
- Integration tests in `__tests__` directories
- Run `pnpm test` before pushing changes
- Test across affected packages when modifying shared code

## Documentation Updates
- Keep README.md current with major changes
- Maintain inline JSDoc comments for public APIs
- Update type definitions in `packages/aether-shared/src/types`

## Issue Reporting
1. Check existing issues before creating new ones
2. Use provided issue templates when available
3. Include:
   - Aether Engine version
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior

## Acknowledgements
We deeply appreciate all community contributions through code, documentation, or bug reports. Contributors will be recognized in release notes.
