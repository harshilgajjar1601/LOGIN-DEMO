
        // Check if already logged in and validate token
        const BASE_URL = "";
        function togglePassword(fieldId, element) {
            const input = document.getElementById(fieldId);
            const icon = element.querySelector("i");

            if (input.type === "password") {
                input.type = "text";
                icon.classList.add("fa-eye");
                icon.classList.remove("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.add("fa-eye-slash");
                icon.classList.remove("fa-eye");
            }
        }
        
        async function checkExistingLogin() {
            const token = localStorage.getItem('token');
            if (token) {
                console.log('Found existing token, validating...');
                try {
                    const response = await fetch(`${BASE_URL}/dashboard`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        console.log('Token valid, showing dashboard option');
                        showAlreadyLoggedIn();
                        return;
                    } else {
                        console.log('Token invalid, clearing and staying on login');
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error('Token validation error:', error);
                    localStorage.removeItem('token');
                }
            }
        }

        // Show logout message if user just logged out
        function showLogoutMessageIfAny() {
            const logoutMsg = localStorage.getItem('logoutMessage');
            if (logoutMsg) {
                showMessage(logoutMsg, 'success');
                localStorage.removeItem('logoutMessage');
            }
        }


        function showAlreadyLoggedIn() {
            const loginForm = document.querySelector('.login-form');
            loginForm.innerHTML = `
                <h2>Already Logged In</h2>
                <p>You are already logged in as a user.</p>
                <button onclick="goToDashboard()" style="width: 100%; padding: 12px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-bottom: 10px;">Go to Dashboard</button>
                <button onclick="clearToken()" style="width: 100%; padding: 12px; background-color: #f44336; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Logout & Login Again</button>
            `;
        }

        function goToDashboard() {
            window.location.href = 'dashboard.html';
        }

        // Check existing login on page load
        checkExistingLogin();

        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('loginForm');
            const submitBtn = document.getElementById('submitBtn');
            messageDiv = document.getElementById('message');

            // If a logout message was set, show it now
            showLogoutMessageIfAny();

            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                if (!username || !password) {
                    showMessage('Please enter both username and password', 'error');
                    return;
                }

                // Disable button and show loading
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';

                try {
                    const response = await fetch(`${BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                    });

                    let data;
                    try {
                        data = await response.json();
                    } catch (parseError) {
                        console.error('JSON parse error:', parseError);
                        showMessage('Server returned invalid response', 'error');
                        return;
                    }

                    if (response.ok) {
                        // Store token and redirect
                        localStorage.setItem('token', data.token);
                        showMessage(data.message, 'success');

                        setTimeout(() => {
                            window.location.href = data.redirect || 'dashboard.html';
                        }, 1000);
                    } else {
                        showMessage(data.message || 'Login failed', 'error');
                    }
                } catch (error) {
                    console.error('Network error:', error);
                    showMessage('Network error. Please check your connection and try again.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            });

            // If a logout message was set, show it now
            showLogoutMessageIfAny();
        });

        function showMessage(message, type) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
        }

        function showRegister() {
            // For now, just show an alert. You can implement registration form later
            window.location.href = 'register.html';
        }

        function clearToken() {
            localStorage.removeItem('token');
            alert('Login session cleared! You can now login again.');
            location.reload();
        }