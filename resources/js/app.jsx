import './bootstrap';
import '../sass/app.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const tokenKey = 'leaveDeskToken';
const apiBase = import.meta.env.VITE_API_BASE_URL || '';

const emptyEmployee = { id: '', user_id: '', department: '', phone: '' };
const emptyLeaveType = { id: '', name: '' };
const emptyLeaveRequest = {
    id: '',
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
};

function App() {
    const [token, setToken] = useState(localStorage.getItem(tokenKey));
    const [user, setUser] = useState(null);
    const [authTab, setAuthTab] = useState('login');
    const [activeSection, setActiveSection] = useState('overview');
    const [message, setMessage] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeeMeta, setEmployeeMeta] = useState(null);
    const [leaveTypeMeta, setLeaveTypeMeta] = useState(null);
    const [leaveRequestMeta, setLeaveRequestMeta] = useState(null);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [leaveSearch, setLeaveSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
    const [leaveTypeForm, setLeaveTypeForm] = useState(emptyLeaveType);
    const [leaveRequestForm, setLeaveRequestForm] = useState(emptyLeaveRequest);

    async function api(path, options = {}) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${apiBase}/api${path}`, {
            ...options,
            headers,
        });

        if (response.status === 204) {
            return null;
        }

        const payload = await response.json();

        if (!response.ok) {
            const error = payload.message || Object.values(payload.errors || {})[0]?.[0] || 'Request failed.';
            throw new Error(error);
        }

        return payload;
    }

    async function login(event) {
        event.preventDefault();
        setAuthMessage('');
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());

        try {
            const payload = await api('/login', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            localStorage.setItem(tokenKey, payload.token);
            setToken(payload.token);
        } catch (error) {
            setAuthMessage(error.message);
        }
    }

    async function register(event) {
        event.preventDefault();
        setAuthMessage('');
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());

        try {
            const payload = await api('/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            localStorage.setItem(tokenKey, payload.token);
            setToken(payload.token);
        } catch (error) {
            setAuthMessage(error.message);
        }
    }

    async function logout() {
        try {
            await api('/logout', { method: 'POST' });
        } finally {
            localStorage.removeItem(tokenKey);
            setToken(null);
            setUser(null);
        }
    }

    async function loadUser() {
        const payload = await api('/me');
        setUser(payload.user);
    }

    async function loadEmployees(page = 1, search = employeeSearch) {
        const payload = await api(`/employees?page=${page}&search=${encodeURIComponent(search)}`);
        setEmployees(payload.data);
        setEmployeeMeta(payload.meta);
    }

    async function loadLeaveTypes(page = 1) {
        const payload = await api(`/leave-types?page=${page}`);
        setLeaveTypes(payload.data);
        setLeaveTypeMeta(payload.meta);
    }

    async function loadLeaveRequests(page = 1, name = leaveSearch, status = statusFilter) {
        const payload = await api(`/leave-requests?page=${page}&employee_name=${encodeURIComponent(name)}&status=${encodeURIComponent(status)}`);
        setLeaveRequests(payload.data);
        setLeaveRequestMeta(payload.meta);
    }

    async function refreshDashboard() {
        await Promise.all([
            loadUser(),
            loadEmployees(),
            loadLeaveTypes(),
            loadLeaveRequests(),
        ]);
    }

    useEffect(() => {
        if (!token) return;

        refreshDashboard().catch(() => {
            localStorage.removeItem(tokenKey);
            setToken(null);
        });
    }, [token]);

    useEffect(() => {
        if (token) loadEmployees(1, employeeSearch).catch((error) => setMessage(error.message));
    }, [employeeSearch]);

    useEffect(() => {
        if (token) loadLeaveRequests(1, leaveSearch, statusFilter).catch((error) => setMessage(error.message));
    }, [leaveSearch, statusFilter]);

    const metrics = useMemo(() => ({
        employees: employeeMeta?.total ?? employees.length,
        types: leaveTypeMeta?.total ?? leaveTypes.length,
        requests: leaveRequestMeta?.total ?? leaveRequests.length,
        pending: leaveRequests.filter((request) => request.status === 'pending').length,
    }), [employees, employeeMeta, leaveRequests, leaveRequestMeta, leaveTypeMeta, leaveTypes]);

    async function saveEmployee(event) {
        event.preventDefault();
        await saveRecord(
            employeeForm.id ? `/employees/${employeeForm.id}` : '/employees',
            employeeForm.id ? 'PATCH' : 'POST',
            employeeForm,
            () => {
                setEmployeeForm(emptyEmployee);
                loadEmployees(employeeMeta?.current_page || 1);
            },
            'Employee saved.'
        );
    }

    async function saveLeaveType(event) {
        event.preventDefault();
        await saveRecord(
            leaveTypeForm.id ? `/leave-types/${leaveTypeForm.id}` : '/leave-types',
            leaveTypeForm.id ? 'PATCH' : 'POST',
            leaveTypeForm,
            () => {
                setLeaveTypeForm(emptyLeaveType);
                loadLeaveTypes(leaveTypeMeta?.current_page || 1);
            },
            'Leave type saved.'
        );
    }

    async function saveLeaveRequest(event) {
        event.preventDefault();
        await saveRecord(
            leaveRequestForm.id ? `/leave-requests/${leaveRequestForm.id}` : '/leave-requests',
            leaveRequestForm.id ? 'PATCH' : 'POST',
            leaveRequestForm,
            () => {
                setLeaveRequestForm(emptyLeaveRequest);
                loadLeaveRequests(leaveRequestMeta?.current_page || 1);
            },
            'Leave request saved.'
        );
    }

    async function saveRecord(path, method, data, afterSave, successMessage) {
        const payload = { ...data };
        delete payload.id;

        try {
            await api(path, {
                method,
                body: JSON.stringify(payload),
            });
            await afterSave();
            setMessage(successMessage);
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function deleteRecord(path, reload, successMessage) {
        try {
            await api(path, { method: 'DELETE' });
            await reload();
            setMessage(successMessage);
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function updateStatus(id, status) {
        try {
            await api(`/leave-requests/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            await loadLeaveRequests(leaveRequestMeta?.current_page || 1);
            setMessage(`Leave request ${status}.`);
        } catch (error) {
            setMessage(error.message);
        }
    }

    if (!token || !user) {
        return (
            <AuthView
                authTab={authTab}
                setAuthTab={setAuthTab}
                authMessage={authMessage}
                login={login}
                register={register}
            />
        );
    }

    return (
        <section className="dashboard">
            <aside className="sidebar">
                <div>
                    <div className="brand-row">
                        <span className="brand-mark small">LD</span>
                        <strong>LeaveDesk</strong>
                    </div>
                    <nav className="nav-list">
                        {['overview', 'employees', 'leave-types', 'leave-requests'].map((section) => (
                            <button
                                className={`nav-button ${activeSection === section ? 'active' : ''}`}
                                key={section}
                                onClick={() => setActiveSection(section)}
                                type="button"
                            >
                                {sectionLabel(section)}
                            </button>
                        ))}
                    </nav>
                </div>
                <button className="ghost-button" onClick={logout} type="button">Logout</button>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <span className="eyebrow">Employee Leave Management</span>
                        <h2>{sectionLabel(activeSection)}</h2>
                    </div>
                    <div className="user-pill">{user.name} | {user.email}</div>
                </header>

                {message && <p className="message visible">{message}</p>}

                {activeSection === 'overview' && (
                    <Overview metrics={metrics} leaveRequests={leaveRequests} />
                )}

                {activeSection === 'employees' && (
                    <EmployeesSection
                        employees={employees}
                        meta={employeeMeta}
                        search={employeeSearch}
                        setSearch={setEmployeeSearch}
                        form={employeeForm}
                        setForm={setEmployeeForm}
                        save={saveEmployee}
                        loadPage={loadEmployees}
                        deleteEmployee={(id) => deleteRecord(`/employees/${id}`, () => loadEmployees(employeeMeta?.current_page || 1), 'Employee deleted.')}
                    />
                )}

                {activeSection === 'leave-types' && (
                    <LeaveTypesSection
                        leaveTypes={leaveTypes}
                        meta={leaveTypeMeta}
                        form={leaveTypeForm}
                        setForm={setLeaveTypeForm}
                        save={saveLeaveType}
                        loadPage={loadLeaveTypes}
                        deleteType={(id) => deleteRecord(`/leave-types/${id}`, () => loadLeaveTypes(leaveTypeMeta?.current_page || 1), 'Leave type deleted.')}
                    />
                )}

                {activeSection === 'leave-requests' && (
                    <LeaveRequestsSection
                        employees={employees}
                        leaveTypes={leaveTypes}
                        leaveRequests={leaveRequests}
                        meta={leaveRequestMeta}
                        search={leaveSearch}
                        setSearch={setLeaveSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        form={leaveRequestForm}
                        setForm={setLeaveRequestForm}
                        save={saveLeaveRequest}
                        loadPage={loadLeaveRequests}
                        updateStatus={updateStatus}
                        deleteRequest={(id) => deleteRecord(`/leave-requests/${id}`, () => loadLeaveRequests(leaveRequestMeta?.current_page || 1), 'Leave request deleted.')}
                    />
                )}
            </main>
        </section>
    );
}

function AuthView({ authTab, setAuthTab, authMessage, login, register }) {
    return (
        <section className="auth-layout">
            <div className="auth-copy">
                <div className="brand-mark">LD</div>
                <h1>LeaveDesk</h1>
                <p>Manage employee profiles, leave types, approvals, and leave history from one focused workspace.</p>
                <div className="auth-stats">
                    <span><strong>API</strong> Laravel 12</span>
                    <span><strong>UI</strong> React</span>
                    <span><strong>Style</strong> SASS</span>
                </div>
            </div>

            <div className="auth-panel">
                <div className="tabs">
                    <button className={`tab-button ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')} type="button">Login</button>
                    <button className={`tab-button ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')} type="button">Register</button>
                </div>

                {authTab === 'login' ? (
                    <form className="stack" onSubmit={login}>
                        <label>Email<input name="email" type="email" defaultValue="demo@example.com" required /></label>
                        <label>Password<input name="password" type="password" defaultValue="password" required /></label>
                        <button className="primary-button" type="submit">Login</button>
                    </form>
                ) : (
                    <form className="stack" onSubmit={register}>
                        <label>Name<input name="name" type="text" required /></label>
                        <label>Email<input name="email" type="email" required /></label>
                        <label>Password<input name="password" type="password" required /></label>
                        <label>Confirm Password<input name="password_confirmation" type="password" required /></label>
                        <label>Department<input name="department" type="text" required /></label>
                        <label>Phone<input name="phone" type="text" /></label>
                        <button className="primary-button" type="submit">Create Account</button>
                    </form>
                )}

                {authMessage && <p className="message visible">{authMessage}</p>}
            </div>
        </section>
    );
}

function Overview({ metrics, leaveRequests }) {
    return (
        <section className="content-section">
            <div className="metric-grid">
                <Metric label="Employees" value={metrics.employees} />
                <Metric label="Leave Types" value={metrics.types} />
                <Metric label="Requests" value={metrics.requests} />
                <Metric label="Pending" value={metrics.pending} />
            </div>
            <div className="panel">
                <div className="panel-header"><h3>Recent Leave Requests</h3></div>
                <Table headers={['Employee', 'Type', 'Dates', 'Status']}>
                    {leaveRequests.slice(0, 5).map((request) => (
                        <tr key={request.id}>
                            <td>{request.employee.user.name}</td>
                            <td>{request.leave_type.name}</td>
                            <td>{request.start_date} to {request.end_date}</td>
                            <td><StatusBadge status={request.status} /></td>
                        </tr>
                    ))}
                </Table>
            </div>
        </section>
    );
}

function EmployeesSection({ employees, meta, search, setSearch, form, setForm, save, loadPage, deleteEmployee }) {
    return (
        <section className="content-section">
            <div className="split-layout">
                <form className="panel form-panel" onSubmit={save}>
                    <div className="panel-header"><h3>{form.id ? 'Update Employee' : 'Create Employee'}</h3></div>
                    <label>User ID<input min="1" type="number" value={form.user_id} onChange={(event) => setForm({ ...form, user_id: event.target.value })} required /></label>
                    <label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required /></label>
                    <label>Phone<input value={form.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
                    <div className="button-row">
                        <button className="primary-button" type="submit">Save</button>
                        <button className="ghost-button" onClick={() => setForm(emptyEmployee)} type="button">Clear</button>
                    </div>
                </form>
                <div className="panel">
                    <div className="panel-header">
                        <h3>Employees</h3>
                        <input className="search-input" placeholder="Search name" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    <Table headers={['Name', 'Department', 'Phone', '']}>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td><strong>{employee.user.name}</strong><small>{employee.user.email}</small></td>
                                <td>{employee.department}</td>
                                <td>{employee.phone || '-'}</td>
                                <td className="actions">
                                    <button className="table-action" onClick={() => setForm({ id: employee.id, user_id: employee.user.id, department: employee.department, phone: employee.phone || '' })} type="button">Edit</button>
                                    <button className="table-action danger" onClick={() => deleteEmployee(employee.id)} type="button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination meta={meta} onPage={loadPage} />
                </div>
            </div>
        </section>
    );
}

function LeaveTypesSection({ leaveTypes, meta, form, setForm, save, loadPage, deleteType }) {
    return (
        <section className="content-section">
            <div className="split-layout compact">
                <form className="panel form-panel" onSubmit={save}>
                    <div className="panel-header"><h3>{form.id ? 'Update Leave Type' : 'Create Leave Type'}</h3></div>
                    <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
                    <div className="button-row">
                        <button className="primary-button" type="submit">Save</button>
                        <button className="ghost-button" onClick={() => setForm(emptyLeaveType)} type="button">Clear</button>
                    </div>
                </form>
                <div className="panel">
                    <div className="panel-header"><h3>Leave Types</h3></div>
                    <Table headers={['Name', '']}>
                        {leaveTypes.map((type) => (
                            <tr key={type.id}>
                                <td><strong>{type.name}</strong></td>
                                <td className="actions">
                                    <button className="table-action" onClick={() => setForm({ id: type.id, name: type.name })} type="button">Edit</button>
                                    <button className="table-action danger" onClick={() => deleteType(type.id)} type="button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination meta={meta} onPage={loadPage} />
                </div>
            </div>
        </section>
    );
}

function LeaveRequestsSection(props) {
    const {
        employees, leaveTypes, leaveRequests, meta, search, setSearch, statusFilter, setStatusFilter,
        form, setForm, save, loadPage, updateStatus, deleteRequest,
    } = props;

    return (
        <section className="content-section">
            <div className="split-layout">
                <form className="panel form-panel" onSubmit={save}>
                    <div className="panel-header"><h3>{form.id ? 'Update Leave' : 'Apply Leave'}</h3></div>
                    <label>Employee<select value={form.employee_id} onChange={(event) => setForm({ ...form, employee_id: event.target.value })} required>
                        <option value="">Select employee</option>
                        {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user.name}</option>)}
                    </select></label>
                    <label>Leave Type<select value={form.leave_type_id} onChange={(event) => setForm({ ...form, leave_type_id: event.target.value })} required>
                        <option value="">Select leave type</option>
                        {leaveTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select></label>
                    <label>Start Date<input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required /></label>
                    <label>End Date<input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required /></label>
                    <label>Reason<textarea rows="4" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required /></label>
                    <div className="button-row">
                        <button className="primary-button" type="submit">Save</button>
                        <button className="ghost-button" onClick={() => setForm(emptyLeaveRequest)} type="button">Clear</button>
                    </div>
                </form>
                <div className="panel">
                    <div className="panel-header controls-header">
                        <h3>Leave Requests</h3>
                        <div className="filter-row">
                            <input className="search-input" placeholder="Employee name" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
                            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <Table headers={['Employee', 'Type', 'Dates', 'Status', '']}>
                        {leaveRequests.map((request) => (
                            <tr key={request.id}>
                                <td><strong>{request.employee.user.name}</strong><small>{request.employee.department}</small></td>
                                <td>{request.leave_type.name}</td>
                                <td>{request.start_date} to {request.end_date}</td>
                                <td><StatusBadge status={request.status} /></td>
                                <td className="actions wide">
                                    <button className="table-action" onClick={() => setForm({
                                        id: request.id,
                                        employee_id: request.employee.id,
                                        leave_type_id: request.leave_type.id,
                                        start_date: request.start_date,
                                        end_date: request.end_date,
                                        reason: request.reason,
                                    })} type="button">Edit</button>
                                    {request.status === 'pending' && <button className="table-action success" onClick={() => updateStatus(request.id, 'approved')} type="button">Approve</button>}
                                    {request.status === 'pending' && <button className="table-action warning" onClick={() => updateStatus(request.id, 'rejected')} type="button">Reject</button>}
                                    <button className="table-action danger" onClick={() => deleteRequest(request.id)} type="button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination meta={meta} onPage={loadPage} />
                </div>
            </div>
        </section>
    );
}

function Metric({ label, value }) {
    return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Table({ headers, children }) {
    return (
        <div className="table-wrap">
            <table>
                <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function Pagination({ meta, onPage }) {
    if (!meta || meta.last_page <= 1) return null;

    return (
        <div className="pagination">
            <button disabled={meta.current_page === 1} onClick={() => onPage(meta.current_page - 1)} type="button">Previous</button>
            <span>Page {meta.current_page} of {meta.last_page}</span>
            <button disabled={meta.current_page === meta.last_page} onClick={() => onPage(meta.current_page + 1)} type="button">Next</button>
        </div>
    );
}

function StatusBadge({ status }) {
    return <span className={`status ${status}`}>{status}</span>;
}

function sectionLabel(section) {
    return {
        overview: 'Overview',
        employees: 'Employees',
        'leave-types': 'Leave Types',
        'leave-requests': 'Leave Requests',
    }[section];
}

createRoot(document.getElementById('app')).render(<App />);
