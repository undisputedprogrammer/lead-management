# Lead Management Module: Development Plan

Machine test: **Laravel 12 + Inertia.js + React (TSX) + MySQL**.
This document is the single source of truth for the coding agent. Follow it phase by phase, and do not deviate from the decisions in section 2 without asking.

---

## 0. Instructions to the coding agent

- Work in the phase order of section 12. Commit after each phase with a clear message.
- Priorities: **functionality and code quality** over pixel-perfect UI.
- All "What NOT to do" rules in section 11 are hard constraints.
- Where this plan says "verify", check the installed package version's docs before coding (Inertia and Breeze APIs move between versions).
- Do not invent features outside this plan. Stretch items (section 10) come only after everything else is done and tested.
- Keep TypeScript strict: no `any`; define types in `resources/js/types`.

---

## 1. Tech stack and versions

| Item | Choice |
| --- | --- |
| PHP | 8.2+ (record the exact version in README) |
| Node | 20 LTS+ (record the exact version in README) |
| Framework | Laravel 12 |
| Auth scaffolding | Laravel Breeze, **React + TypeScript (TSX)** stack |
| Frontend | Inertia.js + React functional components, TSX only |
| Styling | Tailwind CSS (ships with Breeze) |
| Database | MySQL 8 |
| Tests | PHPUnit or Pest (whichever Breeze is installed with), feature tests |

Bootstrap:

```bash
composer create-project laravel/laravel lead-management
cd lead-management
composer require laravel/breeze --dev
php artisan breeze:install react --typescript
# configure .env for MySQL, then:
php artisan migrate
npm install && npm run dev
```

---

## 2. Decisions log (final, do not re-litigate)

1. **Filters, search, sort and page number are sent in the POST body.** Nothing goes in the URL, and nothing is stored in the session. The server returns the result directly. Filter state lives in React state only.
2. Pagination uses **custom pagination buttons in React**, built from the paginator `meta`. Do not use the paginator's `links` URLs.
3. Status values follow the doc: **New, Contacted, Converted** (PHP backed enum). The design's sample statuses (Active, Inactive, etc.) are **not** used.
4. Each lead belongs to a user (`user_id`). The lead list shows **all users' leads**. **Only the owner** can edit, change the status of, or delete a lead (`LeadPolicy`). Non-owners see no action buttons for those rows.
5. **Admin is a separate module**: a separate `admins` table, a separate auth guard `admin`, a separate login (`/admin/login`) and a separate dashboard. The admin can only create and manage users. The admin has **no access** to lead pages, and users have no access to admin pages.
6. There is **no public registration**. Users are created only by the admin.
7. Soft delete is enabled on **leads** and **users**.
8. The **avatar is initials**, and the **handle** is `@` plus the email prefix. Both are computed on the backend (model accessors).
9. Create and Edit lead are separate **Inertia pages** sharing one `LeadForm` component. Delete uses a **confirmation modal**.
10. Design elements outside the doc (row checkboxes, Import, Export, extra header icons) **are rendered in the UI but are non-functional placeholders** until the stretch phase.

---

## 3. Data model

### 3.1 `leads`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint PK | |
| user_id | unsignedBigInteger + FK to `users` (restrict on delete) | owner |
| name | string(255) | |
| email | string(255) | **unique** (see note) |
| phone | string(20) | |
| status | string(20), default `new` | cast to `LeadStatus` enum |
| created_at / updated_at | timestamps | |
| deleted_at | softDeletes | |

Indexes (see the migration for the reasoning): `(deleted_at, status, created_at)` for status-filtered listing, `(deleted_at, created_at)` for the default listing, `(user_id, deleted_at)` for ownership and per-user counts, and the unique index on `email`. The listing query should also order by `id` in the same direction as a tie-breaker so pagination is deterministic.

Note: the DB unique index also counts soft-deleted rows. Validation uses a plain `unique` rule (it does not ignore trashed rows), so re-using the email of a soft-deleted lead gives a normal validation error and never a DB exception.

### 3.2 `users`

Breeze default, plus `softDeletes()` in a new migration (do not edit the default migration). The Eloquent user provider excludes soft-deleted users automatically, so a deleted user cannot log in. Their leads remain.

### 3.3 `admins`

`id`, `name`, `email` (unique), `password`, `remember_token`, `timestamps`.

Users also get an index `(deleted_at, created_at)` for the admin list.

### 3.4 Enums and constants (no hardcoded values anywhere)

- `App\Enums\LeadStatus` is a string-backed enum with cases `New = 'new'`, `Contacted = 'contacted'`, `Converted = 'converted'`. It has `label()` and a static `options()` returning `[['value' => ..., 'label' => ...], ...]`.
- `App\Enums\SortDirection` with `Asc = 'asc'` and `Desc = 'desc'`.
- `Lead::PER_PAGE = 10` (or `config('leads.per_page')`).

---

## 4. Authentication and guards

`config/auth.php`:

- Guards: `web` (users, provider `users`) and `admin` (provider `admins`).
- Providers: `users` (Eloquent `User`) and `admins` (Eloquent `Admin`).
- `Admin` model extends `Illuminate\Foundation\Auth\User as Authenticatable`.

Breeze changes:

- **Remove** registration (routes, controller, `Register` page, links).
- Replace the Breeze `dashboard` route with a redirect to `leads.index`. After user login redirect to `leads.index`.
- Remove the "delete account" section from the profile page. Keep profile update only if time allows (low priority).

Admin auth (new):

- `App\Http\Controllers\Admin\Auth\AuthenticatedSessionController` (create, store, destroy).
- `App\Http\Requests\Admin\AdminLoginRequest`, a copy of Breeze's `LoginRequest` but using `Auth::guard('admin')`, including rate limiting.
- Routes use `guest:admin` for login and `auth:admin` for everything else under `/admin`.
- Known behaviour: both guards share one session, so logging out invalidates the whole session. This is acceptable.

`bootstrap/app.php`:

- `redirectGuestsTo`: if the request is under `admin/*` go to `admin.login`, otherwise `login`.
- `redirectUsersTo`: if under `admin*` go to `admin.dashboard`, otherwise `leads.index`.
- Optional: render a simple Inertia `Error` page for 403 and 404.

`HandleInertiaRequests::share`:

- `auth.user` (id, name, email) for the web guard, `auth.admin` for the admin guard (only one is non-null per area).
- `flash.success` and `flash.error`.

---

## 5. Routes

### 5.1 User area (`auth:web`)

| Method | URI | Name | Action |
| --- | --- | --- | --- |
| GET | `/leads` | leads.index | initial page render (defaults) |
| POST | `/leads/search` | leads.search | filtered/paginated list (Inertia response, same page component) |
| GET | `/leads/search` | leads.search.get | `redirect()->route('leads.index')` (safety for browser refresh) |
| GET | `/leads/create` | leads.create | create form |
| POST | `/leads` | leads.store | store |
| GET | `/leads/{lead}/edit` | leads.edit | edit form |
| PUT | `/leads/{lead}` | leads.update | update |
| PATCH | `/leads/{lead}/status` | leads.status | inline status update |
| DELETE | `/leads/{lead}` | leads.destroy | soft delete |

Notes:

- `leads.search` is a **web route returning an Inertia response**, not an API route.
- On the frontend, call it with `router.post(route('leads.search'), payload, { preserveState: true, preserveScroll: true, preserveUrl: true, only: ['leads'] })`.
  **Verify** that the installed `@inertiajs/react` supports `preserveUrl`. If not, the URL will show `/leads/search`; the GET redirect route above keeps refresh safe.
- Both `index` and `search` call one shared private method that builds the response, so the logic exists once.

### 5.2 Admin area (prefix `/admin`, name prefix `admin.`)

| Method | URI | Name | Guard |
| --- | --- | --- | --- |
| GET | `/admin/login` | admin.login | guest:admin |
| POST | `/admin/login` | admin.login.store | guest:admin |
| POST | `/admin/logout` | admin.logout | auth:admin |
| GET | `/admin` | admin.dashboard | auth:admin (renders the users list) |
| POST | `/admin/users/search` | admin.users.search | auth:admin (same POST-filter pattern as leads) |
| GET | `/admin/users/create` | admin.users.create | auth:admin |
| POST | `/admin/users` | admin.users.store | auth:admin |
| GET | `/admin/users/{user}/edit` | admin.users.edit | auth:admin |
| PUT | `/admin/users/{user}` | admin.users.update | auth:admin |
| DELETE | `/admin/users/{user}` | admin.users.destroy | auth:admin (soft delete) |

The admin dashboard is the users table, in the same visual style as the lead list: search by name/email, paginated, with a leads count per user (`withCount('leads')`).

---

## 6. Backend structure

```
app/
  Enums/            LeadStatus.php, SortDirection.php
  Models/           Lead.php, User.php, Admin.php
  Policies/         LeadPolicy.php
  Http/
    Controllers/
      LeadController.php
      Admin/
        Auth/AuthenticatedSessionController.php
        UserController.php
    Requests/
      LeadIndexRequest.php
      StoreLeadRequest.php
      UpdateLeadRequest.php
      UpdateLeadStatusRequest.php
      Admin/AdminLoginRequest.php
      Admin/StoreUserRequest.php
      Admin/UpdateUserRequest.php
    Resources/      LeadResource.php, UserResource.php
database/
  migrations/       leads, admins, users soft deletes
  factories/        LeadFactory.php, AdminFactory.php
  seeders/          AdminSeeder, UserSeeder, LeadSeeder
```

### 6.1 `Lead` model

- `use SoftDeletes, HasFactory`; `$fillable = ['name','email','phone','status']`; `user_id` is set from `$request->user()->leads()->create(...)`, not mass-assigned from input.
- `casts: status => LeadStatus::class`.
- `belongsTo(User::class)`.
- Scopes: `search(?string)` (name or email `LIKE`, grouped in one `where(function...)`; escape `%` and `_`), `status(?LeadStatus)`, `sortByCreated(SortDirection)`.
- Accessors: `initials` (first letters of up to two words of the name, uppercase) and `handle` (`'@' . Str::before($email, '@')`).

### 6.2 `LeadIndexRequest` (POST body)

| Field | Rules |
| --- | --- |
| search | nullable, string, max:100 |
| status | nullable, `Rule::enum(LeadStatus::class)` |
| sort_direction | nullable, `Rule::enum(SortDirection::class)` (default `desc`) |
| page | nullable, integer, min:1 |

The controller resolves the page: if `page` is greater than the last page (for example after deleting the last row of the last page), clamp to the last page.

### 6.3 Listing response shape

```php
Inertia::render('Leads/Index', [
    'leads'    => LeadResource::collection($paginator), // yields data + meta
    'statuses' => LeadStatus::options(),
]);
```

`LeadResource` fields: `id`, `name`, `email`, `phone`, `initials`, `handle`, `status` (`{value, label}`), `created_at` (formatted), `can` (`{update: bool, delete: bool}` from the policy). React uses `leads.meta` (`current_page`, `last_page`, `per_page`, `total`, `from`, `to`) for pagination and ignores `links`.

Query: `Lead::query()->with('user')->search(...)->status(...)->sortByCreated(...)->paginate(Lead::PER_PAGE)`.

### 6.4 Validation (Form Requests only; no inline `validate()`)

Leads (`Store`/`Update`):

| Field | Rules |
| --- | --- |
| name | required, string, max:255 |
| email | required, email, max:255, `unique:leads,email` (Update: `Rule::unique('leads','email')->ignore($lead)`) |
| phone | required, string, max:20, regex `/^[0-9+\-\s()]{7,20}$/` |
| status | required, `Rule::enum(LeadStatus::class)` (form defaults to New) |

`UpdateLeadStatusRequest`: `status` required, `Rule::enum(LeadStatus::class)`.

Admin user create/update: `name` required, `email` required unique in `users` (ignore self on update), `password` required on create (`Rules\Password::defaults()`, confirmed) and optional on update.

### 6.5 `LeadPolicy`

- `create`: any authenticated user.
- `update`, `delete`: `$user->id === $lead->user_id`. The status change reuses `update`.
- Controller methods call `Gate::authorize(...)` (403 on failure). Leads are not shown through the admin guard.

### 6.6 Seeders

- `AdminSeeder`: `admin@example.com` / `password`.
- `UserSeeder`: two users, `user1@example.com` and `user2@example.com`, password `password`.
- `LeadSeeder`: about 35 leads spread across the users, with mixed statuses and varied `created_at`, so that pagination (4 pages) and sorting are visible.
- List these credentials in the README.

---

## 7. Frontend (React TSX) structure

```
resources/js/
  types/            lead.ts, user.ts, pagination.ts, inertia.d.ts
  Layouts/          AppLayout.tsx, AdminLayout.tsx
  Components/
    ui/             Button, Modal, ConfirmModal, TextInput, InputError, Select, Badge
    leads/          LeadTable, LeadRow, LeadForm, StatusBadge, StatusSelect, Avatar
    shared/         SearchInput, FilterDropdown, SortToggle, Pagination, Toolbar
  hooks/            useDebouncedValue.ts, useListQuery.ts
  Pages/
    Auth/           Login.tsx (restyle Breeze)
    Leads/          Index.tsx, Create.tsx, Edit.tsx
    Admin/
      Auth/         Login.tsx
      Users/        Index.tsx, Create.tsx, Edit.tsx
```

### 7.1 Leads index page (matches the provided design)

- Header: title "Lead List" on the left; on the right the icon row (search, WhatsApp, settings, "+" = add lead, notifications) and a user avatar with initials. Only the "+" (goes to `leads.create`) and the avatar (logout menu) are functional; the other icons are placeholders.
- Toolbar: search input, Filter dropdown (status options plus "All"), Sort button (toggles created date asc/desc), Import and Export buttons (placeholders).
- Table columns: checkbox (placeholder), Name (Avatar initials + name + handle), Email address, Phone Number, Status (`StatusBadge`: dot plus pill; or `StatusSelect` for inline update when `can.update`), Actions (delete icon, edit icon, visible only when `can.delete` / `can.update`).
- Footer: Previous / numbered pages with an ellipsis (for example `1 2 3 … 8 9 10`) / Next. The page window logic is a small pure helper in `Pagination`.
- Status colours: New = blue, Contacted = amber, Converted = green. Map them in one place (`StatusBadge`) keyed by the enum value.

### 7.2 List state and requests

React state: `{ search, status, sortDirection, page }`.

- Search is debounced (about 400 ms). Changing search, status or sort **resets `page` to 1**.
- Any state change posts the whole state: `router.post(route('leads.search'), state, { preserveState: true, preserveScroll: true, preserveUrl: true, only: ['leads'] })`. Skip the request on first mount (the initial data comes from the GET).
- A new visit supersedes an in-flight one (Inertia's default interruption), so stale responses are not applied.
- After a mutation from the list (delete or inline status), re-post the **current** state in `onSuccess` so the table stays in sync with the filters. The server clamps the page if it no longer exists.
- Do not put any of this state in the URL, `localStorage` or the session.

### 7.3 Forms

- Use **`useForm` from `@inertiajs/react`** for create and edit.
- Controlled inputs; errors from `form.errors` displayed under each field with `InputError`; disable the submit button with `form.processing`.
- Inline status update: `router.patch(route('leads.status', lead.id), { status }, { preserveScroll: true, preserveState: true, onSuccess: refreshList })`. On a validation error, show it and revert the select.
- Delete: open `ConfirmModal` ("Delete this lead?"), and on confirm `router.delete(route('leads.destroy', lead.id), { preserveScroll: true, onSuccess: refreshList })`.
- Flash messages (success) shown as a dismissible toast/banner from `flash` shared props.

### 7.4 Rules

- Functional components only. No business logic in React (no authorization checks, no derived handle or initials; use what the backend sends). Reusable components for anything used twice.
- Use Ziggy's `route()` helper (Breeze includes it) rather than hardcoded URLs.

---

## 8. Admin module (UI)

- `AdminLayout` mirrors `AppLayout` (same theme) with the title "User Management" and a logout control.
- `Admin/Users/Index`: toolbar (search + "Add user"), a table of name, email, leads count, created date, and edit/delete icons, with the same custom pagination and POST-filter hook as leads (generalise `useListQuery` with the route name as a parameter).
- `Admin/Users/Create` and `Edit`: `useForm`, with a `UserForm` component (name, email, password + confirmation; password optional on edit).
- Delete user uses `ConfirmModal` as well (soft delete).

---

## 9. Testing (feature tests)

Minimum set:

- Guests are redirected to login from every lead route; admin routes redirect to `admin.login`.
- Users cannot access admin routes; admins cannot access lead routes.
- `POST /leads/search`: search by name, search by email, status filter, sort asc/desc, page 2 returns the next set, and a page past the end clamps.
- Create validation: required fields, invalid email, duplicate email (including a soft-deleted lead), invalid status.
- Update: owner succeeds; a non-owner gets 403. Same for inline status update.
- Delete: owner soft-deletes (row still in DB with `deleted_at`); a non-owner gets 403.
- Admin can create, update and delete a user; a soft-deleted user cannot log in.

---

## 10. Stretch items (only after sections 12.1 to 12.6 are complete and tested)

1. **Row checkboxes**: select-all for the current page, selection kept in React state, and a bulk delete via `POST /leads/bulk-delete` with `ids[]` (each id authorised through the policy).
2. **Export**: `POST /leads/export` with the current filters in the body, streaming a CSV download.
3. **Import**: `POST /leads/import` with a CSV upload, validated row by row (same rules as 6.4), with a result summary.
4. **Header icons**: wire up whichever make sense (for example search focus) or leave as visual placeholders.

---

## 11. What NOT to do (from the test doc)

- No API routes for basic Inertia pages. The list is a web route returning an Inertia response.
- Do not skip validation. Every write goes through a Form Request, and errors show in the UI.
- No business logic in React or in views.
- No hardcoded values: use enums and constants for statuses, sort directions and page size.
- **No filter parameters in the URL.** Search, status, sort and page all travel in the POST body.
- Axios only if truly needed (it should not be).

---

## 12. Build phases and acceptance criteria

1. **Setup**: project, MySQL connection, Breeze React TSX, Tailwind working, `npm run dev` builds.
2. **Database**: enums, migrations (leads, admins, users soft deletes), models, factories, seeders. `php artisan migrate:fresh --seed` works.
3. **Auth**: guards, admin login/logout, registration removed, redirects and shared props. A user logs in at `/login`, and the admin logs in at `/admin/login`, each landing on the right page.
4. **Leads backend**: routes, `LeadController`, requests, resource, policy. Verify with tests.
5. **Leads frontend**: the index page matching the design (search, filter, sort, custom pagination via POST), the create/edit pages with `useForm`, the delete confirmation modal, and inline status update.
6. **Admin module**: user management backend and UI.
7. **Tests and polish**: the feature tests in section 9; flash messages; empty state ("No leads found"); loading state during requests; basic responsive behaviour.
8. **Stretch** (section 10), only if time allows.
9. **README**.

---

## 13. README requirements

- Project summary, setup steps (clone, `composer install`, `npm install`, `.env`, `php artisan key:generate`, `php artisan migrate --seed`, `npm run dev`, `php artisan serve`).
- **PHP and Node versions** used.
- Seeded credentials (admin and users).
- A short architecture note: the separate admin guard, POST-based listing, the policy rules.
- **Time taken to complete the test.**
- Note which stretch items were or were not implemented.
- Migrations are included in the repo.
