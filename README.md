# Employee Leave Management API

A Laravel 12 REST API for managing employees, leave types, and employee leave requests with Sanctum token authentication.

## Tech Stack

- Laravel 12
- MySQL
- Laravel Sanctum
- Postman

## Setup From Scratch

1. Install dependencies:

```bash
composer install
```

2. Create your environment file:

```bash
cp .env.example .env
php artisan key:generate
```

3. Configure MySQL in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=employee_leave_management
DB_USERNAME=root
DB_PASSWORD=
```

4. Create the database in MySQL:

```sql
CREATE DATABASE employee_leave_management;
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
