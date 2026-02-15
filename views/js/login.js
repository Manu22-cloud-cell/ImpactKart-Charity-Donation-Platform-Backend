const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginIdInput = document.getElementById("loginId");
    const passwordInput = document.getElementById("password");

    const loginId = loginIdInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await api.post("/auth/login", {
            loginId,
            password
        });

        const { token, message: successMsg } = response.data;

        localStorage.setItem("token", token);

        message.style.color = "green";
        message.textContent = successMsg;

        form.reset();

        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 800);

    } catch (error) {
        message.style.color = "red";

        if (error.response) {
            message.textContent = error.response.data.message;
        } else {
            message.textContent = "Login failed. Try again.";
        }
    }
});

