const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await api.post(
            "/auth/login",
            { loginId, password }
        );

        const { token, message: successMsg } = response.data;

        localStorage.setItem("token", token);

        message.style.color = "green";
        message.textContent = successMsg;

        // redirect later
        // window.location.href = "/dashboard.html";

    } catch (error) {
        message.style.color = "red";

        if (error.response) {
            message.textContent = error.response.data.message;
        } else {
            message.textContent = "Login failed. Try again.";
        }
    }
});
