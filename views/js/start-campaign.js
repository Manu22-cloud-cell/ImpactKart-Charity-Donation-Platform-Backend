document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {

            const response = await api.post("/charities", {
                name: document.getElementById("name").value,
                description: document.getElementById("description").value,
                category: document.getElementById("category").value,
                location: document.getElementById("location").value,
                goalAmount: document.getElementById("goalAmount").value
            });

            message.style.color = "green";
            message.textContent = response.data.message;

            // Force re-login so new role token is generated
            setTimeout(() => {
                alert("Please login again to continue.");
                localStorage.removeItem("token");
                window.location.href = "/login.html";
            }, 5000);

        } catch (error) {

            if (error.response?.status === 409) {
                message.style.color = "red";
                message.textContent = "You have already registered a charity.";
            } else if (error.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login.html";
            } else {
                message.style.color = "red";
                message.textContent = error.response?.data?.message || "Registration failed";
            }

        }
    });

});
