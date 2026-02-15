async function initDashboard() {

    const navUserName = document.getElementById("navUserName");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminPanelLink = document.getElementById("adminPanelLink");
    const startCampaignLink = document.getElementById("startCampaignLink");

    try {
        const response = await api.get("/users/profile");
        const user = response.data.user;

        navUserName.textContent = user.name;

        if (user.role === "ADMIN") {
            adminPanelLink.style.display = "block";
        }

        if (user.role === "CHARITY") {
            startCampaignLink.textContent = "Manage Campaign";
        }

    } catch (error) {
        console.error("Profile fetch failed:", error);

        // Only logout if truly 401
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        }
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
    });
}

initDashboard();
