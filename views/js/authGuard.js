function requireAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login.html";
    } else {
        // Allow page render
        document.body.style.display = "block";
    }
}

function requireAdmin() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    // Optional: verify role from profile API
    api.get("/users/profile")
        .then(res => {
            if (res.data.user.role !== "ADMIN") {
                window.location.href = "/dashboard.html";
            }
        })
        .catch(() => {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        });
}
