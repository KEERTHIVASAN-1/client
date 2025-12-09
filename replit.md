# Hostel Management System

## Overview

A production-ready, premium SaaS-style hostel management system built with React, TypeScript, Node.js, Express, and MongoDB. The system manages four hostel blocks (A, B, C, D) with strict role-based access control for admins, wardens, and students. Features include student registration with auto-generated IDs, attendance tracking, fee management, leave requests, visitor logs, complaint management, and mess menu administration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Tailwind CSS for utility-first styling with custom design system
- shadcn/ui component library (Radix UI primitives)
- Framer Motion for animations
- React Query (TanStack Query) for server state management
- Wouter for lightweight client-side routing
- Zustand with persistence for local state management

**Design Philosophy:**
- Dark-first luxury theme with glassmorphism effects
- Premium SaaS-level UI inspired by Linear, Vercel, and Notion
- Information-dense management interface prioritizing data clarity
- Role-based visual hierarchy with shared design language
- Fully responsive and mobile-optimized layouts

**State Management:**
- Zustand stores for authentication and theme state with localStorage persistence
- React Query for API data fetching, caching, and synchronization
- Form state managed via react-hook-form with Zod validation

**Routing Strategy:**
- Role-based route protection with ProtectedRoute wrapper
- Separate route hierarchies for admin, warden, and student dashboards
- Automatic redirection based on authentication status and user role

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety across the stack
- MongoDB with Mongoose ODM for data persistence
- JWT (JSON Web Tokens) for authentication with access/refresh token pattern
- Bcrypt for password hashing

**Application Structure:**
- MVC-inspired architecture: Routes → Controllers → Models
- RESTful API design with consistent response formats
- Centralized error handling and response utilities
- Database connection management with connection pooling

**Authentication & Authorization:**
- JWT-based authentication with dual-token system (access + refresh)
- Access tokens expire quickly; refresh tokens for session persistence
- Role-based middleware (`requireAuth`, `requireAdmin`, `requireAdminOrWarden`)
- Block-level access control for wardens (can only access their assigned block)
- Student-level access control (students can only access their own data)

**Data Models:**
- User: Base authentication entity with role field (admin/warden/student)
- Warden: One-to-one with User, assigned to exactly one block
- Student: One-to-one with User, auto-generated student ID (e.g., HSTL2025A001)
- Room: Block-assigned with capacity and occupancy tracking
- Attendance: Daily records with student, block, and status
- Fee: Payment tracking with status (paid/pending/overdue)
- Leave: Request management with approval workflow
- Visitor: Check-in/check-out tracking per student
- Complaint: Ticket system with category and status tracking
- Notification: Broadcast and targeted messaging system
- MessMenu: Weekly meal planning by day and meal type
- Counter: Auto-incrementing ID generation for students and complaints

### Database Schema Design

**Core Principles:**
- MongoDB document-based storage with Mongoose schemas
- Embedded denormalization for frequently accessed data (e.g., student name/ID in attendance records)
- Reference-based relationships for entities with independent lifecycles
- Unique indexes on critical identifiers (student ID, email, block-room combinations)
- Compound indexes for common query patterns (day + mealType for mess menu)

**Key Relationships:**
- User → Warden (one-to-one via userId reference)
- User → Student (one-to-one via userId reference)
- Room → Students (one-to-many, tracked via roomId field in Student)
- Student → Attendance/Fees/Leaves/Visitors/Complaints (one-to-many)

**Auto-Generation Strategy:**
- Student IDs generated using Counter collection pattern
- Format: `HSTL{YEAR}{BLOCK}{SEQUENCE}` (e.g., HSTL2025A001)
- Complaint IDs: `CMPL{SEQUENCE}` (e.g., CMPL001)
- Counters scoped per year and block for students

### API Architecture

**Endpoint Organization:**
- `/api/auth`: Authentication (login, logout, token refresh, profile)
- `/api/students`: Student CRUD, room allocation, search by student ID
- `/api/wardens`: Warden CRUD, block assignment
- `/api/rooms`: Room management, availability queries, block filtering
- `/api/attendance`: Daily marking, student history, bulk operations
- `/api/fees`: Fee CRUD, payment recording, status updates
- `/api/leaves`: Request submission, approval workflow, block filtering
- `/api/visitors`: Check-in/check-out, student history, today's visitors
- `/api/complaints`: Ticket creation, status updates, admin notes
- `/api/notifications`: Broadcast messaging, targeted notifications, read tracking
- `/api/mess`: Weekly menu CRUD, today's menu, day-specific queries
- `/api/dashboard`: Role-specific statistics (admin/warden/student)

**Response Patterns:**
- Consistent JSON structure: `{ success: boolean, data?: T, message?: string }`
- Paginated responses include metadata: `{ data, total, page, pageSize, totalPages }`
- HTTP status codes follow REST conventions (200, 201, 400, 401, 404, 500)

**Query Features:**
- Pagination support on list endpoints (page, pageSize parameters)
- Filtering by block, status, date ranges
- Search functionality using regex patterns (case-insensitive)
- Role-based automatic filtering (wardens see only their block)

### Authentication Flow

**Login Process:**
1. Client sends credentials (email, password, role)
2. Server validates user and role match
3. For wardens: fetch block assignment; for students: verify active status
4. Generate access token (short-lived) and refresh token (long-lived)
5. Return tokens and user data (including block/studentId where applicable)
6. Client stores tokens in localStorage via API client wrapper

**Token Refresh:**
- Access tokens verified on protected routes via `requireAuth` middleware
- On 401 responses, client automatically attempts token refresh
- Refresh endpoint validates refresh token and issues new access token
- Refresh failures trigger logout and redirect to login

**Authorization Layers:**
- `requireAuth`: Validates access token, attaches user to request
- `requireAdmin`: Ensures user role is "admin"
- `requireAdminOrWarden`: Allows both admin and warden roles
- Block-scoped data filtering applied in controllers based on user role and assigned block

### Domain-Specific Business Rules

**Block Management:**
- Exactly 4 blocks: A, B, C, D
- Each block has exactly one dedicated warden
- Students belong to one block and cannot be reassigned without admin intervention
- Rooms are block-specific and cannot be shared across blocks

**Student Registration:**
- Admin-only operation
- Auto-generates unique student ID on creation
- Student ID becomes primary identifier throughout the system
- Student status must be "active" to access the system
- Room allocation is optional during registration, can be assigned later

**Attendance Rules:**
- Only wardens can mark attendance for their assigned block
- Admins can view all attendance but typically wardens handle marking
- Attendance marked daily per student with present/absent status
- Historical attendance queries support month-based filtering

**Leave Approval Workflow:**
- Students submit leave requests with date range and reason
- Requests are block-specific (visible to block warden)
- Only wardens and admins can approve/reject leaves
- Approval records who approved the request (approvedBy field)

**Fee Management:**
- Fees assigned per student with total amount and due date
- Payment recording updates paidAmount (supports partial payments)
- Status automatically calculated: paid (paidAmount >= totalAmount), overdue (past due date), pending
- Admin-only modification rights

**Visitor Tracking:**
- Check-in captures visitor name, purpose, student, and timestamp
- Check-out records exit timestamp
- Visitors are block-scoped for warden access
- Students can view their own visitor history

**Complaint System:**
- Students create complaints with category, title, and description
- Auto-generated complaint ID for tracking
- Status progression: new → in_progress → resolved
- Admins can add notes and update status
- Categories: mess, room, cleanliness, safety, other

## External Dependencies

### Third-Party Libraries

**UI Components:**
- Radix UI: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- Tailwind CSS: Utility-first CSS framework with custom color system
- class-variance-authority: Type-safe component variants
- clsx + tailwind-merge: Conditional class name utilities

**Data Fetching & State:**
- @tanstack/react-query: Server state management, caching, background updates
- Zustand: Lightweight local state management with persistence middleware

**Forms & Validation:**
- react-hook-form: Performant form state management
- @hookform/resolvers: Integration with validation libraries
- Zod: TypeScript-first schema validation for forms and API responses
- drizzle-zod: Zod schema generation from Drizzle ORM schemas

**Authentication:**
- jsonwebtoken: JWT creation and verification
- bcryptjs: Password hashing (10 salt rounds)

**Database:**
- MongoDB: NoSQL document database (connection via MONGODB_URI environment variable)
- Mongoose: ODM for schema validation and query building
- drizzle-orm: Type-safe ORM (configuration present but not actively used; Mongoose is primary)

**Build & Development:**
- Vite: Fast development server with HMR
- esbuild: Server-side bundling for production
- tsx: TypeScript execution for development
- @replit/vite-plugin-runtime-error-modal: Error overlay for development

**Routing & Navigation:**
- wouter: Minimal client-side routing (location hook pattern)

**Utilities:**
- date-fns: Date manipulation and formatting
- nanoid: Unique ID generation for HMR cache busting

### Environment Variables

**Required:**
- `DATABASE_URL` or `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing/verification (defaults to "super_secure_secret" in development)
- `NODE_ENV`: Environment mode (development/production)

### External Services

**Database:**
- MongoDB instance (local or hosted, e.g., MongoDB Atlas)
- Connection pooling handled by Mongoose
- Database seeding on startup (admin user creation)

**Session Management:**
- JWT tokens stored client-side (localStorage)
- No server-side session storage (stateless authentication)
- Refresh token rotation on token refresh

**Build Process:**
- Client build outputs to `dist/public`
- Server build bundles to `dist/index.cjs` with selective externalization
- Static file serving from `dist/public` in production