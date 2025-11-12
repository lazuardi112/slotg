$(document).ready(function() {
    const dashboard = $('#dashboard');
    const login = $('#login');
    let users = [];

    // Check if logged in
    if (sessionStorage.getItem('admin_logged_in')) {
        login.hide();
        dashboard.show();
        loadDashboardData();
    }

    // Login
    $('#login-btn').on('click', function() {
        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: '/api/admin/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(data) {
                if (data.success) {
                    sessionStorage.setItem('admin_logged_in', 'true');
                    login.hide();
                    dashboard.show();
                    loadDashboardData();
                } else {
                    alert('Login failed: ' + data.message);
                }
            },
            error: function() {
                alert('Login request failed.');
            }
        });
    });

    // Logout
    $('#logout-btn').on('click', function() {
        sessionStorage.removeItem('admin_logged_in');
        login.show();
        dashboard.hide();
    });

    function loadDashboardData() {
        // Load global RTP
        $.get('/api/admin/rtp', function(data) {
            $('#global-rtp').val(data.rtp);
        });

        // Load users
        $.get('/api/admin/users', function(data) {
            users = data;
            renderUserTable();
        });
    }

    function renderUserTable() {
        const tableBody = $('#user-table tbody');
        tableBody.empty();
        users.forEach(user => {
            const rtpValue = user.rtp !== null ? user.rtp : 'Global';
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${formatRupiah(user.credits)}</td>
                    <td>${rtpValue}</td>
                    <td>
                        <input type="number" class="user-credits-input" placeholder="New Credits" data-user-id="${user.id}" />
                        <button class="save-credits-btn" data-user-id="${user.id}">Save</button>
                    </td>
                    <td>
                        <input type="number" class="user-rtp-input" placeholder="New RTP" data-user-id="${user.id}" />
                         <button class="save-rtp-btn" data-user-id="${user.id}">Save</button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    // Save Global RTP
    $('#save-global-rtp').on('click', function() {
        const rtp = $('#global-rtp').val();
        $.ajax({
            url: '/api/admin/rtp',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ rtp }),
            success: () => alert('Global RTP saved!'),
            error: () => alert('Failed to save Global RTP.')
        });
    });

    // Save User Credits (delegated event)
    $('#user-table').on('click', '.save-credits-btn', function() {
        const userId = $(this).data('user-id');
        const credits = $(`.user-credits-input[data-user-id="${userId}"]`).val();

        if (credits === '') return;

        $.ajax({
            url: '/api/admin/user/credits',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userId, credits: parseInt(credits) }),
            success: () => {
                alert('Credits updated!');
                loadDashboardData();
            },
            error: () => alert('Failed to update credits.')
        });
    });

    // Save User RTP (delegated event)
    $('#user-table').on('click', '.save-rtp-btn', function() {
        const userId = $(this).data('user-id');
        const rtp = $(`.user-rtp-input[data-user-id="${userId}"]`).val();

        $.ajax({
            url: '/api/admin/user/rtp',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userId, rtp: rtp === '' ? null : parseInt(rtp) }),
            success: () => {
                alert('User RTP updated!');
                loadDashboardData();
            },
            error: () => alert('Failed to update User RTP.')
        });
    });

    function formatRupiah(number) {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(number);
    }
});
