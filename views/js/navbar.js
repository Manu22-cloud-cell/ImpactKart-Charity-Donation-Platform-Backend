const loginRegisterHTML = `
    <a href="/login.html" class="nav-link">Login</a>
    <a href="/register.html" class="nav-link">Join Us</a>
`;


let cachedUser = null;

/* ================= USER PROFILE ================= */

async function getUserProfile() {
    if (cachedUser) return cachedUser;

    const token = localStorage.getItem("token");

    // If no token → user not logged in
    if (!token) return null;

    try {
        const response = await api.get("/users/profile");
        cachedUser = response.data.user;
        return cachedUser;
    } catch (error) {
        localStorage.removeItem("token");
        return null;  // Don't redirect anymore
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
    const exploreCampaignLink = document.getElementById("exploreCampaignLink");
    const transactionsLink = document.getElementById("transactionsLink");

    try {
        const user = await getUserProfile();

        if (!user) {
            // Guest Mode
            document.querySelector(".nav-right").innerHTML = loginRegisterHTML;

            if (startCampaignLink) {
                startCampaignLink.style.display = "none";
            }

            return;
        }

        // Set user name
        if (navUserName) {
            navUserName.textContent = user.name;
        }

        /* ================= ROLE BASED NAV ================= */

        if (user.role === "ADMIN") {

            // Hide Start Campaign, explore / Manage Campaign
            if (startCampaignLink) {
                startCampaignLink.style.display = "none";
            }

            if (exploreCampaignLink) {
                exploreCampaignLink.style.display = "none";
            }

            // Hide Transactions
            if (transactionsLink) {
                transactionsLink.style.display = "none";
            }

            // Show Admin Panel
            if (adminPanelLink) {
                adminPanelLink.style.display = "block";
                adminPanelLink.href = "/admin.html";
            }

        } else if (user.role === "CHARITY") {

            // Convert Start Campaign to Manage Campaign
            if (startCampaignLink) {
                startCampaignLink.textContent = "Manage Campaign";
                startCampaignLink.href = "/manage-campaign.html";
            }

            // Hide Admin Panel
            if (adminPanelLink) {
                adminPanelLink.style.display = "none";
            }

        } else {
            // Normal USER

            if (adminPanelLink) {
                adminPanelLink.style.display = "none";
            }
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
