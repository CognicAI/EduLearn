# MCP Server — User Management

## 1. Overview
This MCP server is responsible for managing users within the EduLearn system. It handles the lifecycle of students, teachers, and administrators, ensuring secure access and data integrity.

**Key Responsibilities:**
*   **CRUD Operations:** Create, Read, Update, Delete users.
*   **Data Validation:** Enforce strict rules for user data (email, roles, etc.).
*   **Bulk Operations:** Support CSV import and export.
*   **Security:** Enforce Role-Based Access Control (RBAC).
*   **Auditability:** Maintain logs for all user actions.

## 2. Step-by-Step Implementation Plan

1.  **Database Setup:** Verify `users` and `user_profiles` tables exist (see Schema).
2.  **API Layer:** Implement REST endpoints in `backend/src/routes/userRoutes.ts`.
3.  **Service Layer:** Create business logic in `backend/src/services/userService.ts`.
4.  **MCP Tooling:** Define MCP tools in `backend/src/mcp/user-tools.ts`.
5.  **Validation:** Implement Zod schemas for input validation.
6.  **Testing:** Write unit and integration tests.

## 3. Schema & Migration

Based on `backend/src/migrations/edulearn_migrations_script.sql`:

### Users Table (`users`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `role` | ENUM | NOT NULL | `student`, `teacher`, `admin` |
| `is_active` | BOOLEAN | Default: `true` | Account status |
| `is_deleted` | BOOLEAN | Default: `false` | Soft delete flag |
| `deleted_at` | TIMESTAMP | Nullable | Timestamp of deletion |
| `created_at` | TIMESTAMP | Default: `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMP | Default: `NOW()` | Last update timestamp |

### User Profiles Table (`user_profiles`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Profile ID |
| `user_id` | UUID | FK -> `users(id)` | Associated user |
| `bio` | TEXT | Nullable | User biography |
| `skills` | JSON | Nullable | List of skills |
| `experience_level` | ENUM | Default: `beginner` | `beginner`, `intermediate`, `advanced` |

## 4. API Design

### Base URL: `/api/v1/users`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a new user | Admin |
| `GET` | `/` | List all users (with pagination & filters) | Admin |
| `GET` | `/:id` | Get user details | Admin, Self |
| `PUT` | `/:id` | Update user details | Admin, Self |
| `DELETE` | `/:id` | Soft delete user | Admin |
| `POST` | `/import` | Bulk import users from CSV | Admin |
| `GET` | `/export` | Export users to CSV | Admin |

## 5. MCP Tool Functions

These tools will be exposed to the MCP client (e.g., the AI agent).

### `create_user`
*   **Description:** Creates a new user in the system.
*   **Arguments:**
    *   `email` (string): Valid email address.
    *   `firstName` (string): User's first name.
    *   `lastName` (string): User's last name.
    *   `role` (string): 'student', 'teacher', or 'admin'.
    *   `password` (string, optional): Initial password (auto-generated if missing).

### `get_user`
*   **Description:** Retrieves a user by ID or Email.
*   **Arguments:**
    *   `identifier` (string): UUID or Email address.

### `update_user`
*   **Description:** Updates an existing user's information.
*   **Arguments:**
    *   `id` (string): User UUID.
    *   `updates` (object): Fields to update (e.g., `{ firstName: 'John' }`).

### `delete_user`
*   **Description:** Soft deletes a user.
*   **Arguments:**
    *   `id` (string): User UUID.

### `search_users`
*   **Description:** Searches for users based on criteria.
*   **Arguments:**
    *   `query` (string): Search term (name or email).
    *   `role` (string, optional): Filter by role.
    *   `isActive` (boolean, optional): Filter by status.

## 6. Validation Rules (Zod)

```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['student', 'teacher', 'admin']),
  password: z.string().min(8).optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  isActive: z.boolean().optional(),
});
```

## 7. CSV Import Logic

1.  **Upload:** Admin uploads a CSV file to `POST /users/import`.
2.  **Parsing:** Server parses CSV using a library like `papaparse` or `csv-parser`.
3.  **Validation:** Each row is validated against `CreateUserSchema`.
4.  **Dry Run:** If `dryRun=true`, return a summary of valid/invalid rows without saving.
5.  **Execution:** If valid, insert users in a transaction.
6.  **Result:** Return a report: `{ total: 100, success: 98, failed: 2, errors: [...] }`.

## 8. RBAC Rules

| Action | Admin | Teacher | Student |
| :--- | :---: | :---: | :---: |
| Create User | ✅ | ❌ | ❌ |
| Read Any User | ✅ | ❌ | ❌ |
| Read Self | ✅ | ✅ | ✅ |
| Update Any User | ✅ | ❌ | ❌ |
| Update Self | ✅ | ✅ | ✅ |
| Delete User | ✅ | ❌ | ❌ |
| Import/Export | ✅ | ❌ | ❌ |

## 9. Test Plan

*   **Unit Tests:**
    *   Test validation logic (valid/invalid emails, roles).
    *   Test service methods (create, update, delete).
*   **Integration Tests:**
    *   Test API endpoints with a test database.
    *   Verify RBAC enforcement (e.g., student trying to delete a user).
    *   Test CSV import with various file formats (valid, invalid, mixed).
*   **MCP Tool Tests:**
    *   Verify MCP tools correctly map to service methods.
