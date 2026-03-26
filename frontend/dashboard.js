       const BASE_URL = "";
        // Logout function
        async function logout() {
            console.log('=== LOGOUT STARTED ===');
            console.log('Logout function called');

            // Store a logout message to show on the login page
            localStorage.setItem('logoutMessage', 'Thanks for visiting!');

            try {
                const response = await fetch(`${BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Logout response:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Logout successful:', data.message);
                }
            } catch (error) {
                console.error('Logout error:', error);
            }

            // Always clear token and redirect, even if server call fails
            console.log('Clearing token from localStorage...');
            localStorage.removeItem('token');

            console.log('Redirecting to login page...');
            window.location.href = 'index.html';
            console.log('=== LOGOUT COMPLETED ===');
        }

        // Run after DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('token');
            console.log('Token check:', token ? 'Token exists' : 'No token found');

            if (!token) {
                console.log('No token found, redirecting to login');
                window.location.href = 'index.html';
                return;
            }

            // Display token for debugging
            // const tokenValueEl = document.getElementById('token-value');
            // if (tokenValueEl) {
            //     tokenValueEl.textContent = token;
            // }

            validateToken(token).then(isValid => {
                if (isValid) {
                    loadDashboard(token);
                }
            });
        });

        // Validate token with server
        async function validateToken(token) {
            try {
                console.log('Validating token with server...');
                const response = await fetch(`${BASE_URL}/dashboard`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.log('Token invalid, redirecting to login');
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Token validation error:', error);
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return false;
            }
        }


        // Load dashboard data
        async function loadDashboard(token) {
            try {
                const response = await fetch(`${BASE_URL}/dashboard`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('welcome-message').textContent = data.message;
                    document.getElementById('username').textContent = data.user.username;
                    document.getElementById('user-id').textContent = data.user.id; 
                    document.getElementById('login-time').textContent = new Date().toLocaleString('en-IN', { 
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true});
                } else {
                    // Token invalid, redirect to login
                    console.log('Dashboard load failed, token invalid');
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            }
        }
