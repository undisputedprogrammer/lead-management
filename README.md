# Production-Grade Lead Management System

A production-grade Lead Management application built with **Laravel 12**, **Inertia.js v2**, **React 18 (TypeScript)**, **Tailwind CSS**, and **MySQL 8**.

---

## 1. System Requirements & Versions Used

| Technology | Version Used |
| :--- | :--- |
| **PHP** | `8.2.3` |
| **Node.js** | `v24.21.0` |
| **Laravel Framework** | `12.x` |
| **Database** | `MySQL 8.0.27` |
| **Frontend Stack** | Inertia.js React (TSX), Tailwind CSS, Lucide Icons |

---

## 2. Setup & Installation

### Step 1: Clone and install PHP dependencies
```bash
git clone <repository-url>
cd axel_machine_test_muhammed_ali
composer install
```

### Step 2: Install Frontend dependencies
```bash
npm install
```

### Step 3: Configure Environment
Copy `.env.example` to `.env` (or configure your existing `.env`):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lead_management
DB_USERNAME=root
DB_PASSWORD=
```

Generate the application encryption key:
```bash
php artisan key:generate
```

### Step 4: Run Migrations and Seeders
Run fresh migrations with comprehensive seeders (35+ test leads, admin, and test users):
```bash
php artisan migrate:fresh --seed
```

### Step 5: Build Frontend Assets
Build for production:
```bash
npm run build
```
Or start Vite in development mode:
```bash
npm run dev
```

### Step 6: Start Server
```bash
php artisan serve
```

---

## 3. Seeded Accounts & Credentials

### Standard Users (Lead Management Portal)
Login URL: `http://localhost:8000/login`

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Alice Johnson | `user1@example.com` | `password` | Standard User |
| Bob Smith | `user2@example.com` | `password` | Standard User |

### Administrator (User Management Portal)
Login URL: `http://localhost:8000/admin/login`

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Super Admin | `admin@example.com` | `password` | System Administrator |

---

## 4. Key Architecture & Design Decisions

### 1. Dual Authentication Guards
- **Web Guard (`web`)**: Powers standard users with access exclusively to the `/leads` ecosystem.
- **Admin Guard (`admin`)**: Powers dedicated administrators with access exclusively to `/admin` user management.
- Complete boundary isolation: Administrators cannot browse user leads, and users cannot access the admin module.
- Configured with strict conditional redirection in `bootstrap/app.php`.

### 2. Zero-URL-Pollution / POST-based Listing
- Search query, status filter, sort direction, and page numbers **travel strictly in the POST body** (`POST /leads/search` and `POST /admin/users/search`).
- URLs remain clean (`/leads`), and filters do not pollute query parameters, local storage, or session state.
- **Custom Pagination**: Page controls in React are computed purely from the paginator's `meta` object.
- **Deterministic Ordering**: Multi-column sorting (`created_at` with `id` tie-breaker) guarantees consistent pagination across pages.
- **Page Clamping**: The backend automatically clamps requests if a deleted record causes the page number to exceed total available pages.

### 3. Granular Authorization (`LeadPolicy`)
- All authenticated users can view the full team directory of leads.
- **Ownership Security**: Only the creator of the lead (`user_id === lead.user_id`) can update details, change status inline, or delete the lead.
- Non-owners see no edit/delete action controls and receive HTTP `403 Forbidden` if attempting direct API calls.

### 4. Robust Soft Deletes & Integrity
- Soft delete is enabled on both `leads` and `users`.
- Email unique constraints span active and soft-deleted leads to prevent duplicate conflicts and DB exceptions.
- Soft-deleted users are automatically blocked from authenticating while preserving historical ownership of their leads.

---

## 5. Stretch Items Implemented

1. **Row Checkboxes & Bulk Delete**:
   - Checkboxes with "Select All" on the current page for owned leads.
   - Bulk deletion via `POST /leads/bulk-delete` with server-side policy verification.
2. **Real-time CSV Export**:
   - `POST /leads/export` streams a downloadable CSV of leads filtered by the user's active search, status, and sort criteria.
3. **Interactive UI & Placeholders**:
   - Search input with clear button and 400ms debounce.
   - Inline status updates via `PATCH /leads/{lead}/status` with automatic rollback on error.
   - Modern avatars with backend-computed initials and `@handle`.
   - Delete confirmation modals with loading states.

---

## 6. Automated Test Suite

A comprehensive test suite of **47 automated feature tests (234 assertions)** covers all core workflows:
- Authentication & guard access control isolation
- Guest redirection & route protections
- POST search, status filtering, asc/desc sorting, page clamping
- Validation rules (regex phone, unique email including soft-deleted rows, status enum)
- Policy enforcement (owner permissions vs 403 forbidden)
- Soft delete and deactivation checks
- CSV export streaming & bulk delete operations

To run the tests:
```bash
php artisan test
```

Result:
```
Tests:    47 passed (234 assertions)
Duration: 8.87s
```

---

## 7. Development Time

- **Total Time Taken**: Approximately 1 hour 45 minutes
