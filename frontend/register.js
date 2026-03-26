
    const form = document.querySelector("form");
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
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.querySelector("input[type='text']").value;
        const password = document.querySelectorAll("input[type='password']")[0].value;
        const confirmPassword = document.querySelectorAll("input[type='password']")[1].value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully!");
                window.location.href = "/index.html";
            } else {
                alert(data.message); // 👈 shows "USERNAME ALREADY EXISTS"
            }

        } catch (error) {
            alert("Something went wrong!");
        }
    });
