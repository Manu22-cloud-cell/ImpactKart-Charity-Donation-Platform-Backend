function requireAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login.html";
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
