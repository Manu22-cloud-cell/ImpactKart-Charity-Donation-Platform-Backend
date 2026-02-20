let cachedUser = null;

/* ================= USER PROFILE ================= */

async function getUserProfile() {
    if (cachedUser) return cachedUser;

    try {
        const response = await api.get("/users/profile");
        cachedUser = response.data.user;
        return cachedUser;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        }
        throw error;
    }
}


/* ================= LOAD NAVBAR ================= */

async function loadNavbar() {
    const container = document.getElementById("navbarContainer");
    if (!container) return;

    try {
        const response = await fetch("/components/navbar.html");
        const html = await response.text();

        container.innerHTML = html;

        // Initialize ONLY after HTML is inserted
        await initNavbar();

    } catch (error) {
        console.error("Failed to load navbar", error);
    }
}


/* ================= INIT NAVBAR ================= */

async function initNavbar() {

    const navUserName = document.getElementById("navUserName");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminPanelLink = document.getElementById("adminPanelLink");
    const startCampaignLink = document.getElementById("startCampaignLink");

    try {
        const user = await getUserProfile();

        // Set user name
        if (navUserName) {
            navUserName.textContent = user.name;
        }

        // Admin visibility
        if (adminPanelLink) {
            if (user.role === "ADMIN") {
                adminPanelLink.style.display = "block";
                adminPanelLink.href = "/admin.html";
            } else {
                adminPanelLink.style.display = "none";
            }
        }

        // Charity visibility
        if (startCampaignLink && user.role === "CHARITY") {
            startCampaignLink.textContent = "Manage Campaign";
            startCampaignLink.href = "/manage-campaign.html";
        }

    } catch (error) {
        console.error("Failed to initialize navbar", error);
    }

    setupLogout();
    highlightActiveLink();
    setupDropdown();
}


/* ================= LOGOUT ================= */

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        });
    }
}

function setupDropdown() {
    const dropdown = document.querySelector(".dropdown");
    const dropdownContent = document.querySelector(".dropdown-content");

    if (!dropdown) return;

    // Toggle on click
    dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    // Close when clicking outside
    document.addEventListener("click", () => {
        dropdown.classList.remove("show");
    });
}

/* ================= ACTIVE PAGE HIGHLIGHT ================= */

function highlightActiveLink() {

    const currentPath = window.location.pathname;

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        if (linkPath === currentPath) {
            link.classList.add("active-nav");
        }
    });
}
