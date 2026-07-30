<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Employee Leave Management</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body>
        <div id="app" class="app-shell">
            <section id="auth-view" class="auth-layout">
                <div class="auth-copy">
                    <div class="brand-mark">LD</div>
                    <h1>LeaveDesk</h1>
                    <p>Manage employee profiles, leave types, approvals, and leave history from one focused workspace.</p>
                    <div class="auth-stats">
                        <span><strong>API</strong> Laravel 12</span>
                        <span><strong>Auth</strong> Sanctum</span>
                        <span><strong>DB</strong> MySQL</span>
                    </div>
                </div>

                <div class="auth-panel">
                    <div class="tabs">
                        <button class="tab-button active" data-auth-tab="login">Login</button>
                        <button class="tab-button" data-auth-tab="register">Register</button>
                    </div>

                    <form id="login-form" class="stack">
                        <label>Email<input name="email" type="email" value="demo@example.com" required></label>
                        <label>Password<input name="password" type="password" value="password" required></label>
                        <button class="primary-button" type="submit">Login</button>
                    </form>

                    <form id="register-form" class="stack hidden">
                        <label>Name<input name="name" type="text" required></label>
                        <label>Email<input name="email" type="email" required></label>
                        <label>Password<input name="password" type="password" required></label>
                        <label>Confirm Password<input name="password_confirmation" type="password" required></label>
                        <label>Department<input name="department" type="text" required></label>
                        <label>Phone<input name="phone" type="text"></label>
                        <button class="primary-button" type="submit">Create Account</button>
                    </form>

                    <p id="auth-message" class="message"></p>
                </div>
            </section>

            <section id="dashboard-view" class="dashboard hidden">
                <aside class="sidebar">
                    <div>
                        <div class="brand-row">
                            <span class="brand-mark small">LD</span>
                            <strong>LeaveDesk</strong>
                        </div>
                        <nav class="nav-list">
                            <button class="nav-button active" data-section="overview">Overview</button>
                            <button class="nav-button" data-section="employees">Employees</button>
                            <button class="nav-button" data-section="leave-types">Leave Types</button>
                            <button class="nav-button" data-section="leave-requests">Leave Requests</button>
                        </nav>
                    </div>
                    <button id="logout-button" class="ghost-button">Logout</button>
                </aside>

                <main class="main-content">
                    <header class="topbar">
                        <div>
                            <span class="eyebrow">Employee Leave Management</span>
                            <h2 id="page-title">Overview</h2>
                        </div>
                        <div id="current-user" class="user-pill"></div>
                    </header>

                    <p id="app-message" class="message"></p>

                    <section id="overview-section" class="content-section">
                        <div class="metric-grid">
                            <div class="metric"><span>Employees</span><strong id="metric-employees">0</strong></div>
                            <div class="metric"><span>Leave Types</span><strong id="metric-types">0</strong></div>
                            <div class="metric"><span>Requests</span><strong id="metric-requests">0</strong></div>
                            <div class="metric"><span>Pending</span><strong id="metric-pending">0</strong></div>
                        </div>
                        <div class="panel">
                            <div class="panel-header">
                                <h3>Recent Leave Requests</h3>
                            </div>
                            <div class="table-wrap">
                                <table>
                                    <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                                    <tbody id="recent-requests"></tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section id="employees-section" class="content-section hidden">
                        <div class="split-layout">
                            <form id="employee-form" class="panel form-panel">
                                <div class="panel-header"><h3 id="employee-form-title">Create Employee</h3></div>
                                <input type="hidden" name="id">
                                <label>User ID<input name="user_id" type="number" min="1" required></label>
                                <label>Department<input name="department" type="text" required></label>
                                <label>Phone<input name="phone" type="text"></label>
                                <div class="button-row">
                                    <button class="primary-button" type="submit">Save</button>
                                    <button class="ghost-button" type="button" data-reset-form="employee-form">Clear</button>
                                </div>
                            </form>
                            <div class="panel">
                                <div class="panel-header">
                                    <h3>Employees</h3>
                                    <input id="employee-search" class="search-input" type="search" placeholder="Search name">
                                </div>
                                <div class="table-wrap">
                                    <table>
                                        <thead><tr><th>Name</th><th>Department</th><th>Phone</th><th></th></tr></thead>
                                        <tbody id="employees-table"></tbody>
                                    </table>
                                </div>
                                <div id="employees-pagination" class="pagination"></div>
                            </div>
                        </div>
                    </section>

                    <section id="leave-types-section" class="content-section hidden">
                        <div class="split-layout compact">
                            <form id="leave-type-form" class="panel form-panel">
                                <div class="panel-header"><h3 id="leave-type-form-title">Create Leave Type</h3></div>
                                <input type="hidden" name="id">
                                <label>Name<input name="name" type="text" required></label>
                                <div class="button-row">
                                    <button class="primary-button" type="submit">Save</button>
                                    <button class="ghost-button" type="button" data-reset-form="leave-type-form">Clear</button>
                                </div>
                            </form>
                            <div class="panel">
                                <div class="panel-header"><h3>Leave Types</h3></div>
                                <div class="table-wrap">
                                    <table>
                                        <thead><tr><th>Name</th><th></th></tr></thead>
                                        <tbody id="leave-types-table"></tbody>
                                    </table>
                                </div>
                                <div id="leave-types-pagination" class="pagination"></div>
                            </div>
                        </div>
                    </section>

                    <section id="leave-requests-section" class="content-section hidden">
                        <div class="split-layout">
                            <form id="leave-request-form" class="panel form-panel">
                                <div class="panel-header"><h3 id="leave-request-form-title">Apply Leave</h3></div>
                                <input type="hidden" name="id">
                                <label>Employee<select name="employee_id" required></select></label>
                                <label>Leave Type<select name="leave_type_id" required></select></label>
                                <label>Start Date<input name="start_date" type="date" required></label>
                                <label>End Date<input name="end_date" type="date" required></label>
                                <label>Reason<textarea name="reason" rows="4" required></textarea></label>
                                <div class="button-row">
                                    <button class="primary-button" type="submit">Save</button>
                                    <button class="ghost-button" type="button" data-reset-form="leave-request-form">Clear</button>
                                </div>
                            </form>
                            <div class="panel">
                                <div class="panel-header controls-header">
                                    <h3>Leave Requests</h3>
                                    <div class="filter-row">
                                        <input id="leave-search" class="search-input" type="search" placeholder="Employee name">
                                        <select id="status-filter">
                                            <option value="">All</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="table-wrap">
                                    <table>
                                        <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th><th></th></tr></thead>
                                        <tbody id="leave-requests-table"></tbody>
                                    </table>
                                </div>
                                <div id="leave-requests-pagination" class="pagination"></div>
                            </div>
                        </div>
                    </section>
                </main>
            </section>
        </div>
    </body>
</html>
