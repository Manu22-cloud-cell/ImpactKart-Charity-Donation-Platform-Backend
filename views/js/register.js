const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await api.post(
            "/auth/register",
            { name, email, phone, password }
        );

        message.style.color = "green";
        message.textContent = response.data.message;

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 1500);

    } catch (error) {
        message.style.color = "red";

        if (error.response) {
            message.textContent = error.response.data.message;
        } else {
            message.textContent = "Server error. Please try again.";
        }
    }
});
