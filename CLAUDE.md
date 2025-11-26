# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It allows users to describe React components in natural language and generates them using Claude AI with real-time preview capabilities.

## Development Commands

### Setup
```bash
npm run setup
```
Installs dependencies, generates Prisma client, and runs database migrations.

### Development
```bash
npm run dev                    # Start development server with Turbopack
npm run dev:daemon            # Start dev server in background, logs to logs.txt
```

### Build & Deploy
```bash
npm run build                 # Build production version
npm run start                 # Start production server
```

### Testing & Quality
```bash
npm test                      # Run Vitest tests
npm run lint                  # Run ESLint
```

### Database
```bash
npm run db:reset             # Reset database and run migrations
npx prisma generate          # Regenerate Prisma client
npx prisma migrate dev       # Run database migrations
```

### Running Single Tests
```bash
npx vitest run src/path/to/test.test.tsx    # Run specific test file
npx vitest run --reporter=verbose           # Run with detailed output
```

## Architecture Overview

### Core Architecture Pattern
UIGen follows a **Virtual File System + AI Tools** architecture where:

1. **Virtual File System**: Components are generated and stored in memory via `VirtualFileSystem` class (`src/lib/file-system.ts`)
2. **AI Integration**: Claude AI uses custom tools (`str_replace_editor`, `file_manager`) to manipulate the virtual file system
3. **Real-time Preview**: Generated components are rendered live using dynamic imports and Babel transpilation
4. **Context-based State**: React Context providers manage file system and chat state globally

### Key Components & Flow

#### Main Application Structure
- **Entry Points**:
  - `/` (anonymous users) → `src/app/page.tsx` → `MainContent`
  - `/[projectId]` (authenticated users) → `src/app/[projectId]/page.tsx` → `MainContent`
- **Core Layout**: `src/app/main-content.tsx` - Split-pane interface with chat on left, preview/code on right

#### State Management (Context Architecture)
- **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`): Manages virtual file system state, file operations, and AI tool interactions
- **ChatProvider** (`src/lib/contexts/chat-context.tsx`): Handles chat messages, AI streaming, and project persistence

#### AI Integration Flow
1. User sends message via `ChatInterface` → `ChatProvider`
2. Request sent to `/api/chat` → `src/app/api/chat/route.ts`
3. Claude AI receives system prompt from `src/lib/prompts/generation.tsx`
4. AI uses tools defined in `src/lib/tools/` to manipulate `VirtualFileSystem`
5. File changes trigger re-renders in preview via `PreviewFrame`

#### Virtual File System
- **VirtualFileSystem** (`src/lib/file-system.ts`): In-memory file system supporting create/read/update/delete operations
- Files are serialized to database as JSON in `Project.data` field
- No files written to disk - everything exists in memory and database

#### Preview System
- **PreviewFrame** (`src/components/preview/PreviewFrame.tsx`): Renders generated components in isolated iframe
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Transpiles JSX to executable JavaScript using Babel
- Components auto-refresh when virtual file system changes

### Database Schema (Prisma + SQLite)
```sql
User {
  id: String (CUID)
  email: String (unique)
  password: String (bcrypt)
  projects: Project[]
}

Project {
  id: String (CUID)
  name: String
  userId: String? (optional - supports anonymous users)
  messages: String (JSON array of chat history)
  data: String (JSON serialized virtual file system)
}
```

### Authentication & User Flow
- **Anonymous Users**: Can use the app without registration, no project persistence
- **Registered Users**: Projects auto-saved to database, redirect to most recent project
- **Session Management**: JWT-based auth via `src/lib/auth.ts`

## Key Technical Decisions

### Virtual File System Choice
- **Why**: Allows AI to manipulate files without disk I/O, enables easy serialization/persistence
- **Implementation**: Custom `VirtualFileSystem` class with tool integration for AI manipulation

### AI Tool Architecture
- **str_replace_editor**: Handles file creation, string replacement, and content insertion
- **file_manager**: Handles file/directory operations (rename, delete)
- Tools operate directly on `VirtualFileSystem` instance, changes reflected in UI immediately

### Preview Isolation
- **Why iframe**: Isolates generated component code from main application, prevents conflicts
- **Babel transpilation**: Converts JSX to executable JS in browser for dynamic component loading

### Context over State Libraries
- Uses React Context instead of Redux/Zustand for simpler state management
- Two main contexts (FileSystem, Chat) handle all application state

## Tech Stack

- **Framework**: Next.js 15 with App Router, React 19
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **Database**: Prisma ORM with SQLite
- **AI**: Anthropic Claude via Vercel AI SDK
- **Testing**: Vitest with jsdom environment
- **Code Editor**: Monaco Editor (VS Code editor component)
- **UI Components**: Radix UI primitives with custom styling

## Important File Locations

- **Main Layout**: `src/app/main-content.tsx`
- **AI API**: `src/app/api/chat/route.ts`
- **Virtual FS**: `src/lib/file-system.ts`
- **AI Tools**: `src/lib/tools/str-replace.ts`, `src/lib/tools/file-manager.ts`
- **Contexts**: `src/lib/contexts/file-system-context.tsx`, `src/lib/contexts/chat-context.tsx`
- **Preview**: `src/components/preview/PreviewFrame.tsx`
- **Editor**: `src/components/editor/CodeEditor.tsx`, `src/components/editor/FileTree.tsx`

## Development Notes

### Mock AI Provider
- When no `ANTHROPIC_API_KEY` is set, app uses mock provider returning static code
- Reduces `maxSteps` to 4 for mock provider to prevent repetition

### File System Auto-Selection
- App automatically selects `/App.jsx` if it exists, otherwise first root-level file
- New files trigger UI refresh via `refreshTrigger` state

### Database Migrations
- Uses Prisma migrations in `prisma/migrations/`
- SQLite database stored at `prisma/dev.db`
- Projects support both authenticated and anonymous users (optional `userId`)

### Component Generation Pattern
- AI receives generation prompt that guides component creation
- Generated components follow React functional component patterns
- Tailwind CSS used for styling by default
- Use comments sparingly. Only comment complex code.
- The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.