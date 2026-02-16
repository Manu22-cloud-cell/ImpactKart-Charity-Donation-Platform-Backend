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
            adminPanelLink.href = "/admin.html";
        }


        if (user.role === "CHARITY") {
            startCampaignLink.textContent = "Manage Campaign";
            startCampaignLink.href = "/manage-campaign.html";
        }


    } catch (error) {
        console.error("Profile fetch failed:", error);

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
