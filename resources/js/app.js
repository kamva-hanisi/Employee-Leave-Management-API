import './bootstrap';

const tokenKey = 'leaveDeskToken';
const state = {
    token: localStorage.getItem(tokenKey),
    user: null,
    employees: [],
    leaveTypes: [],
    leaveRequests: [],
    pages: {
        employees: 1,
        leaveTypes: 1,
        leaveRequests: 1,
    },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

async function api(path, options = {}) {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(`/api${path}`, {
        ...options,
        headers,
    });

    if (response.status === 204) {
        return null;
    }

    const payload = await response.json();

    if (!response.ok) {
        const message = payload.message || Object.values(payload.errors || {})[0]?.[0] || 'Request failed.';
        throw new Error(message);
    }

    return payload;
}

function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function showMessage(message, target = '#app-message') {
    const element = $(target);
    element.textContent = message;
    element.classList.toggle('visible', Boolean(message));
}

function statusBadge(status) {
    return `<span class="status ${status}">${status}</span>`;
}

function actionButton(label, action, id, variant = '') {
    return `<button class="table-action ${variant}" data-action="${action}" data-id="${id}" type="button">${label}</button>`;
}

function setAuthenticated(isAuthenticated) {
    $('#auth-view').classList.toggle('hidden', isAuthenticated);
    $('#dashboard-view').classList.toggle('hidden', !isAuthenticated);
}

async function login(data) {
    const payload = await api('/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    state.token = payload.token;
    localStorage.setItem(tokenKey, state.token);
    await bootDashboard();
}

async function register(data) {
    const payload = await api('/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    state.token = payload.token;
    localStorage.setItem(tokenKey, state.token);
    await bootDashboard();
}

async function logout() {
    try {
        await api('/logout', { method: 'POST' });
    } finally {
        state.token = null;
        state.user = null;
        localStorage.removeItem(tokenKey);
        setAuthenticated(false);
    }
}

async function bootDashboard() {
    const me = await api('/me');
    state.user = me.user;
    $('#current-user').textContent = `${state.user.name} | ${state.user.email}`;
    setAuthenticated(true);
    await refreshAll();
}

async function refreshAll() {
    await Promise.all([
        loadEmployees(),
        loadLeaveTypes(),
        loadLeaveRequests(),
    ]);
    renderOverview();
    fillSelects();
}

async function loadEmployees(page = state.pages.employees) {
    state.pages.employees = page;
    const search = encodeURIComponent($('#employee-search')?.value || '');
    const payload = await api(`/employees?page=${page}&search=${search}`);
    state.employees = payload.data;
    renderEmployees(payload);
}

async function loadLeaveTypes(page = state.pages.leaveTypes) {
    state.pages.leaveTypes = page;
    const payload = await api(`/leave-types?page=${page}`);
    state.leaveTypes = payload.data;
    renderLeaveTypes(payload);
}

async function loadLeaveRequests(page = state.pages.leaveRequests) {
    state.pages.leaveRequests = page;
    const name = encodeURIComponent($('#leave-search')?.value || '');
    const status = encodeURIComponent($('#status-filter')?.value || '');
    const payload = await api(`/leave-requests?page=${page}&employee_name=${name}&status=${status}`);
    state.leaveRequests = payload.data;
    renderLeaveRequests(payload);
}

function renderEmployees(payload) {
    $('#employees-table').innerHTML = payload.data.map((employee) => `
        <tr>
            <td><strong>${employee.user.name}</strong><small>${employee.user.email}</small></td>
            <td>${employee.department}</td>
            <td>${employee.phone || '-'}</td>
            <td class="actions">
                ${actionButton('Edit', 'edit-employee', employee.id)}
                ${actionButton('Delete', 'delete-employee', employee.id, 'danger')}
            </td>
        </tr>
    `).join('');
    renderPagination('#employees-pagination', payload.meta, 'employees');
}

function renderLeaveTypes(payload) {
    $('#leave-types-table').innerHTML = payload.data.map((type) => `
        <tr>
            <td><strong>${type.name}</strong></td>
            <td class="actions">
                ${actionButton('Edit', 'edit-type', type.id)}
                ${actionButton('Delete', 'delete-type', type.id, 'danger')}
            </td>
        </tr>
    `).join('');
    renderPagination('#leave-types-pagination', payload.meta, 'leaveTypes');
}

function renderLeaveRequests(payload) {
    $('#leave-requests-table').innerHTML = payload.data.map((request) => `
        <tr>
            <td><strong>${request.employee.user.name}</strong><small>${request.employee.department}</small></td>
            <td>${request.leave_type.name}</td>
            <td>${request.start_date} to ${request.end_date}</td>
            <td>${statusBadge(request.status)}</td>
            <td class="actions wide">
                ${actionButton('Edit', 'edit-request', request.id)}
                ${request.status === 'pending' ? actionButton('Approve', 'approve-request', request.id, 'success') : ''}
                ${request.status === 'pending' ? actionButton('Reject', 'reject-request', request.id, 'warning') : ''}
                ${actionButton('Delete', 'delete-request', request.id, 'danger')}
            </td>
        </tr>
    `).join('');
    renderPagination('#leave-requests-pagination', payload.meta, 'leaveRequests');
}

function renderPagination(selector, meta, type) {
    if (!meta || meta.last_page <= 1) {
        $(selector).innerHTML = '';
        return;
    }

    $(selector).innerHTML = `
        <button data-page-type="${type}" data-page="${meta.current_page - 1}" ${meta.current_page === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${meta.current_page} of ${meta.last_page}</span>
        <button data-page-type="${type}" data-page="${meta.current_page + 1}" ${meta.current_page === meta.last_page ? 'disabled' : ''}>Next</button>
    `;
}

function renderOverview() {
    $('#metric-employees').textContent = state.employees.length;
    $('#metric-types').textContent = state.leaveTypes.length;
    $('#metric-requests').textContent = state.leaveRequests.length;
    $('#metric-pending').textContent = state.leaveRequests.filter((item) => item.status === 'pending').length;
    $('#recent-requests').innerHTML = state.leaveRequests.slice(0, 5).map((request) => `
        <tr>
            <td>${request.employee.user.name}</td>
            <td>${request.leave_type.name}</td>
            <td>${request.start_date} to ${request.end_date}</td>
            <td>${statusBadge(request.status)}</td>
        </tr>
    `).join('');
}

function fillSelects() {
    const employeeSelect = $('#leave-request-form select[name="employee_id"]');
    const typeSelect = $('#leave-request-form select[name="leave_type_id"]');

    employeeSelect.innerHTML = state.employees.map((employee) => (
        `<option value="${employee.id}">${employee.user.name}</option>`
    )).join('');

    typeSelect.innerHTML = state.leaveTypes.map((type) => (
        `<option value="${type.id}">${type.name}</option>`
    )).join('');
}

function resetForm(id) {
    const form = $(`#${id}`);
    form.reset();
    form.elements.id.value = '';
    $(`#${id.replace('form', 'form-title')}`).textContent = {
        'employee-form': 'Create Employee',
        'leave-type-form': 'Create Leave Type',
        'leave-request-form': 'Apply Leave',
    }[id];
}

function editEmployee(id) {
    const employee = state.employees.find((item) => item.id === Number(id));
    const form = $('#employee-form');
    form.elements.id.value = employee.id;
    form.elements.user_id.value = employee.user.id;
    form.elements.department.value = employee.department;
    form.elements.phone.value = employee.phone || '';
    $('#employee-form-title').textContent = 'Update Employee';
}

function editType(id) {
    const type = state.leaveTypes.find((item) => item.id === Number(id));
    const form = $('#leave-type-form');
    form.elements.id.value = type.id;
    form.elements.name.value = type.name;
    $('#leave-type-form-title').textContent = 'Update Leave Type';
}

function editRequest(id) {
    const request = state.leaveRequests.find((item) => item.id === Number(id));
    const form = $('#leave-request-form');
    form.elements.id.value = request.id;
    form.elements.employee_id.value = request.employee.id;
    form.elements.leave_type_id.value = request.leave_type.id;
    form.elements.start_date.value = request.start_date;
    form.elements.end_date.value = request.end_date;
    form.elements.reason.value = request.reason;
    $('#leave-request-form-title').textContent = 'Update Leave';
}

async function deleteRecord(path, refresh) {
    await api(path, { method: 'DELETE' });
    showMessage('Deleted successfully.');
    await refresh();
    renderOverview();
    fillSelects();
}

function bindEvents() {
    $$('.tab-button').forEach((button) => {
        button.addEventListener('click', () => {
            $$('.tab-button').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            $('#login-form').classList.toggle('hidden', button.dataset.authTab !== 'login');
            $('#register-form').classList.toggle('hidden', button.dataset.authTab !== 'register');
            showMessage('', '#auth-message');
        });
    });

    $('#login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await login(formData(event.currentTarget));
        } catch (error) {
            showMessage(error.message, '#auth-message');
        }
    });

    $('#register-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await register(formData(event.currentTarget));
        } catch (error) {
            showMessage(error.message, '#auth-message');
        }
    });

    $('#logout-button').addEventListener('click', logout);

    $$('.nav-button').forEach((button) => {
        button.addEventListener('click', () => {
            $$('.nav-button').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            $$('.content-section').forEach((section) => section.classList.add('hidden'));
            $(`#${button.dataset.section}-section`).classList.remove('hidden');
            $('#page-title').textContent = button.textContent;
        });
    });

    $('#employee-search').addEventListener('input', () => loadEmployees(1));
    $('#leave-search').addEventListener('input', () => loadLeaveRequests(1));
    $('#status-filter').addEventListener('change', () => loadLeaveRequests(1));

    $$('[data-reset-form]').forEach((button) => {
        button.addEventListener('click', () => resetForm(button.dataset.resetForm));
    });

    document.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-action], [data-page-type]');
        if (!button) return;

        const { action, id, pageType, page } = button.dataset;

        try {
            if (pageType === 'employees') await loadEmployees(Number(page));
            if (pageType === 'leaveTypes') await loadLeaveTypes(Number(page));
            if (pageType === 'leaveRequests') await loadLeaveRequests(Number(page));
            if (action === 'edit-employee') editEmployee(id);
            if (action === 'edit-type') editType(id);
            if (action === 'edit-request') editRequest(id);
            if (action === 'delete-employee') await deleteRecord(`/employees/${id}`, loadEmployees);
            if (action === 'delete-type') await deleteRecord(`/leave-types/${id}`, loadLeaveTypes);
            if (action === 'delete-request') await deleteRecord(`/leave-requests/${id}`, loadLeaveRequests);
            if (action === 'approve-request' || action === 'reject-request') {
                await api(`/leave-requests/${id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: action === 'approve-request' ? 'approved' : 'rejected' }),
                });
                showMessage('Leave request updated.');
                await loadLeaveRequests();
                renderOverview();
            }
        } catch (error) {
            showMessage(error.message);
        }
    });

    $('#employee-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = formData(event.currentTarget);
            const id = data.id;
            delete data.id;
            await api(id ? `/employees/${id}` : '/employees', {
                method: id ? 'PATCH' : 'POST',
                body: JSON.stringify(data),
            });
            resetForm('employee-form');
            await loadEmployees();
            renderOverview();
            fillSelects();
            showMessage('Employee saved.');
        } catch (error) {
            showMessage(error.message);
        }
    });

    $('#leave-type-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = formData(event.currentTarget);
            const id = data.id;
            delete data.id;
            await api(id ? `/leave-types/${id}` : '/leave-types', {
                method: id ? 'PATCH' : 'POST',
                body: JSON.stringify(data),
            });
            resetForm('leave-type-form');
            await loadLeaveTypes();
            renderOverview();
            fillSelects();
            showMessage('Leave type saved.');
        } catch (error) {
            showMessage(error.message);
        }
    });

    $('#leave-request-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = formData(event.currentTarget);
            const id = data.id;
            delete data.id;
            await api(id ? `/leave-requests/${id}` : '/leave-requests', {
                method: id ? 'PATCH' : 'POST',
                body: JSON.stringify(data),
            });
            resetForm('leave-request-form');
            await loadLeaveRequests();
            renderOverview();
            showMessage('Leave request saved.');
        } catch (error) {
            showMessage(error.message);
        }
    });
}

bindEvents();

if (state.token) {
    bootDashboard().catch(() => logout());
}
