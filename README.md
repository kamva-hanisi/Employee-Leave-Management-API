# Employee Leave Management API

A full-stack Employee Leave Management system with a Laravel 12 REST API, Sanctum token authentication, MySQL/PostgreSQL support, and a React + SASS frontend dashboard.

## CV / Portfolio Summary

**Employee Leave Management API**

Built a RESTful Employee Leave Management API using Laravel 12, MySQL, and Laravel Sanctum. Implemented secure authentication, CRUD operations, Eloquent relationships, request validation, pagination, and role-based leave approval workflows.

Portfolio version:

Built a full-stack Employee Leave Management system with Laravel 12, Laravel Sanctum, MySQL/PostgreSQL, React, and SASS. The project includes secure token authentication, employee management, leave type management, leave applications, approval/rejection workflows, validation, pagination, search, API resources, and a responsive dashboard frontend.

## Tech Stack

- Laravel 12
- MySQL
- PostgreSQL/Neon-ready configuration
- Laravel Sanctum
- React
- SASS
- Vite
- Postman

## Languages Used

- PHP: backend API, Laravel controllers, models, requests, resources, migrations, and seeders
- JavaScript/JSX: React frontend, API requests, authentication flow, search, pagination, and form actions
- SASS/SCSS: custom responsive dashboard styling
- Blade: Laravel host view for the integrated frontend
- SQL: MySQL database schema and seeded data
- JSON: API request and response payloads
- HTML: rendered frontend markup through Blade

## Setup From Scratch

1. Install dependencies:

```bash
composer install
```


```

5. Run migrations and seeders:

```bash
php artisan migrate:fresh --seed
```

6. Start the API:

```bash
php artisan serve
```

The local base URL is:

```text
http://127.0.0.1:8000/api
```

The frontend dashboard is available at:

```text
http://127.0.0.1:8000
```

If frontend assets are not installed yet, run:

```bash
npm install
npm run build
```

During development you can run Vite in a separate terminal:

```bash
npm run dev
```

For the standalone React frontend build used by GitHub Pages or Vercel:

```bash
npm run build:frontend
```

## Demo Login

The seeder creates this test user:

```text
email: demo@example.com
password: password
```

## Authentication

Use the token returned from login/register as a Bearer token in Postman:

```http
Authorization: Bearer YOUR_TOKEN_HERE
Accept: application/json
```

## Endpoints

### Auth

| Method | URL | Description |
| --- | --- | --- |
| POST | `/api/register` | Register user and employee profile |
| POST | `/api/login` | Login and receive Sanctum token |
| GET | `/api/me` | Get authenticated user |
| POST | `/api/logout` | Delete current token |

### Employees

| Method | URL | Description |
| --- | --- | --- |
| GET | `/api/employees` | Paginated employees |
| GET | `/api/employees?search=Demo` | Search by employee name |
| POST | `/api/employees` | Create employee profile |
| GET | `/api/employees/{employee}` | Show employee |
| PATCH | `/api/employees/{employee}` | Update employee |
| DELETE | `/api/employees/{employee}` | Delete employee |

### Leave Types

| Method | URL | Description |
| --- | --- | --- |
| GET | `/api/leave-types` | Paginated leave types |
| POST | `/api/leave-types` | Create leave type |
| GET | `/api/leave-types/{leaveType}` | Show leave type |
| PATCH | `/api/leave-types/{leaveType}` | Update leave type |
| DELETE | `/api/leave-types/{leaveType}` | Delete leave type |

### Leave Requests

| Method | URL | Description |
| --- | --- | --- |
| GET | `/api/leave-requests` | Paginated leave requests |
| GET | `/api/leave-requests?employee_name=Demo` | Search by employee name |
| GET | `/api/leave-requests?status=pending` | Filter by status |
| POST | `/api/leave-requests` | Create leave request |
| GET | `/api/leave-requests/{leaveRequest}` | Show leave request |
| PATCH | `/api/leave-requests/{leaveRequest}` | Update leave request |
| PATCH | `/api/leave-requests/{leaveRequest}/status` | Approve or reject leave |
| DELETE | `/api/leave-requests/{leaveRequest}` | Delete leave request |

## Example JSON Bodies

### Register

```json
{
  "name": "Jane Manager",
  "email": "jane@example.com",
  "password": "password",
  "password_confirmation": "password",
  "department": "Human Resources",
  "phone": "+27112223333"
}
```

### Create Leave Type

```json
{
  "name": "Study Leave"
}
```

### Create Leave Request

```json
{
  "employee_id": 1,
  "leave_type_id": 1,
  "start_date": "2026-08-17",
  "end_date": "2026-08-21",
  "reason": "Planned vacation."
}
```

### Approve Or Reject Leave

```json
{
  "status": "approved"
}
```

Allowed status values for approval are `approved` and `rejected`. New leave requests are created as `pending`.

## Concepts Covered

- Migrations
- Seeders
- Models
- Controllers
- Resource routes
- Form requests
- Eloquent relationships
- API resources
- Sanctum authentication
- Validation
- Pagination
- Search and filtering

## Frontend

The project includes a React and SASS frontend called LeaveDesk. It supports login/register, dashboard metrics, employee management, leave type management, leave request creation/editing/deleting, filtering, pagination, and approve/reject actions.

Frontend entry points:

- Integrated Laravel frontend: [resources/js/app.jsx](resources/js/app.jsx)
- SASS styles: [resources/sass/app.scss](resources/sass/app.scss)
- Laravel host view: [resources/views/welcome.blade.php](resources/views/welcome.blade.php)
- Standalone static frontend entry: [index.html](index.html)

## Deployment Plan

Recommended production split:

- Frontend: Vercel or GitHub Pages
- Database: Neon PostgreSQL
- Backend API: PHP/Laravel-friendly hosting such as Render, Railway, Fly.io, Laravel Forge, DigitalOcean, or a VPS

Vercel works very well for the React/Vite frontend. Vercel does not list PHP as an official runtime; PHP is available through a community runtime, so deploying the Laravel API to Vercel is possible but not the smoothest beginner path.

### Frontend on Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build:frontend
Output Directory: dist
```

4. Add this environment variable in Vercel:

```env
VITE_API_BASE_URL=https://your-laravel-api-domain.com
```

### Frontend on GitHub Pages

This repository includes a workflow at:

```text
.github/workflows/deploy-frontend.yml
```

To use it:

1. Push to GitHub.
2. Go to repository Settings > Pages.
3. Set Source to GitHub Actions.
4. Add a repository variable named `VITE_API_BASE_URL` with your deployed Laravel API URL.
5. Push to the `main` branch.

The workflow builds the standalone React frontend with:

```bash
npm run build:frontend
```

### Database on Neon

Neon is PostgreSQL, so update your Laravel `.env` for production:

```env
DB_CONNECTION=pgsql
DB_HOST=your-neon-host.neon.tech
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_SSLMODE=require
```

Then run migrations on your API host:

```bash
php artisan migrate --force
php artisan db:seed --force
```

### Backend API Deployment Notes

Set these environment variables on your Laravel API host:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-laravel-api-domain.com
DB_CONNECTION=pgsql
SANCTUM_STATEFUL_DOMAINS=
SESSION_DRIVER=database
```

Because the React frontend uses Bearer tokens from Sanctum, the frontend only needs the deployed API base URL:

```env
VITE_API_BASE_URL=https://your-laravel-api-domain.com
```
