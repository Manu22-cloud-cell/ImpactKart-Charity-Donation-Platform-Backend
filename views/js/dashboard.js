// ================= GLOBAL STATE =================
let currentPage = 1;
const limit = 6;
let currentSearch = "";
let currentCategory = "";

let isLoading = false;
let hasMoreData = true;

// DOM references (initialized after DOM loads)
let container;
let loadingIndicator;
let emptyState;


// ================= INIT =================
async function initDashboard() {

    // Initialize DOM elements AFTER page loads
    container = document.getElementById("campaignContainer");
    loadingIndicator = document.getElementById("loadingIndicator");
    emptyState = document.getElementById("emptyState");

    const navUserName = document.getElementById("navUserName");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminPanelLink = document.getElementById("adminPanelLink");
    const startCampaignLink = document.getElementById("startCampaignLink");

    try {
        const response = await api.get("/users/profile");
        const user = response.data.user;

        if (navUserName) {
            navUserName.textContent = user.name;
        }

        if (user.role === "ADMIN" && adminPanelLink) {
            adminPanelLink.style.display = "block";
            adminPanelLink.href = "/admin.html";
        }

        if (user.role === "CHARITY" && startCampaignLink) {
            startCampaignLink.textContent = "Manage Campaign";
            startCampaignLink.href = "/manage-campaign.html";
        }

    } catch (error) {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        });
    }

    loadCampaigns(true);
}


// ================= LOAD CAMPAIGNS =================
async function loadCampaigns(reset = false) {

    if (isLoading) return;
    if (!hasMoreData && !reset) return;

    if (reset) {
        currentPage = 1;
        hasMoreData = true;
        if (container) container.innerHTML = "";
        if (emptyState) emptyState.style.display = "none";
    }

    isLoading = true;
    if (loadingIndicator) loadingIndicator.style.display = "block";

    const params = {
        page: currentPage,
        limit: limit
    };

    if (currentSearch) params.search = currentSearch;
    if (currentCategory) params.category = currentCategory;

    try {
        const response = await api.get("/charities", { params });
        const campaigns = response.data;

        if (campaigns.length === 0 && currentPage === 1) {
            if (emptyState) emptyState.style.display = "block";
        }

        if (campaigns.length < limit) {
            hasMoreData = false;
        }

        renderCampaigns(campaigns);
        currentPage++;

    } catch (error) {
        console.error("Failed to load campaigns", error);
    }

    if (loadingIndicator) loadingIndicator.style.display = "none";
    isLoading = false;
}


// ================= RENDER CAMPAIGNS =================
function renderCampaigns(campaigns) {

    if (!container) return;

    campaigns.forEach(campaign => {

        const collected = Number(campaign.collectedAmount);
        const goal = Number(campaign.goalAmount);

        const progressPercent = goal > 0
            ? Math.min((collected / goal) * 100, 100)
            : 0;

        const card = document.createElement("div");
        card.classList.add("campaign-card");

        card.innerHTML = `
            <h3>${campaign.name}</h3>
            <p>${campaign.location}</p>
            <p>${campaign.description.substring(0, 80)}...</p>
            <div class="progress-bar">
                <div class="progress" style="width:${progressPercent}%"></div>
            </div>
            <p>₹${collected} raised of ₹${goal}</p>
            <button class="donate-btn">Donate</button>
        `;

        card.addEventListener("click", () => {
            window.location.href = `/charity-details.html?id=${campaign.id}`;
        });

        container.appendChild(card);
    });
}


// ================= SEARCH =================
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchWrapper = document.querySelector(".search-wrapper");

let debounceTimer;

if (searchInput) {
    searchInput.addEventListener("input", () => {

        const value = searchInput.value.trim();

        if (value.length > 0 && searchWrapper) {
            searchWrapper.classList.add("active");
        } else if (searchWrapper) {
            searchWrapper.classList.remove("active");
        }

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            currentSearch = value;
            currentCategory = "";
            loadCampaigns(true);
        }, 400);
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        currentSearch = "";
        if (searchWrapper) searchWrapper.classList.remove("active");
        loadCampaigns(true);
    });
}


// ================= CATEGORY FILTER =================
// ================= CATEGORY FILTER =================
const categoryButtons = document.querySelectorAll(".category-btn");

categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        // Remove active class from all
        categoryButtons.forEach(b => b.classList.remove("active-category"));

        // Add active class to clicked
        btn.classList.add("active-category");

        const selectedCategory = btn.textContent.trim();

        // If "All" clicked → reset filters
        if (selectedCategory === "All") {
            currentCategory = "";
            currentSearch = "";

            if (searchInput) searchInput.value = "";
            if (searchWrapper) searchWrapper.classList.remove("active");

            loadCampaigns(true);
            return;
        }

        // Otherwise filter by category
        currentCategory = selectedCategory;
        currentSearch = "";

        if (searchInput) searchInput.value = "";
        if (searchWrapper) searchWrapper.classList.remove("active");

        loadCampaigns(true);
    });
});



// ================= INFINITE SCROLL =================
let scrollTimeout;

window.addEventListener("scroll", () => {

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const fullHeight = document.body.offsetHeight;

        if (scrollTop + windowHeight >= fullHeight - 150) {
            loadCampaigns();
        }

    }, 100);
});


// ================= START =================
initDashboard();
