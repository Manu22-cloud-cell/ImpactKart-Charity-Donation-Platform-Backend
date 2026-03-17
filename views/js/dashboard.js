const socket = io("http://40.192.99.62");

// ================= GLOBAL STATE =================
let currentPage = 1;
const limit = 9;
let currentSearch = "";
let currentCategory = "";

let isLoading = false;
let hasMoreData = true;

// DOM references
let container;
let loadingIndicator;
let emptyState;


document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();   // Load navbar first
    initDashboard();      // Then load dashboard
});

// ================= INIT =================
async function initDashboard() {

    container = document.getElementById("campaignContainer");
    loadingIndicator = document.getElementById("loadingIndicator");
    emptyState = document.getElementById("emptyState");

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

    const params = { page: currentPage, limit };
    if (currentSearch) params.search = currentSearch;
    if (currentCategory) params.category = currentCategory;

    try {
        const response = await api.get("/charities", { params });
        const { charities, totalPages } = response.data;

        if (charities.length === 0 && currentPage === 1) {
            if (emptyState) emptyState.style.display = "block";
        }

        if (currentPage >= totalPages) {
            hasMoreData = false;
        }

        renderCampaigns(charities);
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

    const fragment = document.createDocumentFragment();

    campaigns.forEach(campaign => {

        const collected = Number(campaign.collectedAmount) || 0;
        const goal = Number(campaign.goalAmount) || 0;

        if (collected >= goal) return;

        const progressPercent = goal > 0
            ? Math.min((collected / goal) * 100, 100)
            : 0;

        const card = document.createElement("div");
        card.classList.add("campaign-card");

        card.setAttribute("data-id", campaign.id);

        card.innerHTML = `
    <h3>${campaign.name}</h3>
    <p>${campaign.location || ""}</p>
    <p>${campaign.description.substring(0, 80)}...</p>

    <div class="progress-bar">
        <div class="progress" data-progress style="width:${progressPercent}%"></div>
    </div>

    <p data-amount>₹${collected} raised of ₹${goal}</p>

    <button 
     class="donate-btn"
     data-id="${campaign.id}"
     data-name="${campaign.name}">
     Make an Impact
    </button>
`;

        card.addEventListener("click", (e) => {

            if (e.target.classList.contains("donate-btn")) return;

            window.location.href = `/charity-details.html?id=${campaign.id}`;
        });

        fragment.appendChild(card);
    });

    container.appendChild(fragment);

    campaigns.forEach(campaign => {
        socket.emit("joinCampaign", campaign.id);
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
const categoryButtons = document.querySelectorAll(".category-btn");

categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        categoryButtons.forEach(b => b.classList.remove("active-category"));
        btn.classList.add("active-category");

        const selectedCategory = btn.textContent.trim();

        if (selectedCategory === "All") {
            currentCategory = "";
            currentSearch = "";
        } else {
            currentCategory = selectedCategory;
            currentSearch = "";
        }

        if (searchInput) searchInput.value = "";
        if (searchWrapper) searchWrapper.classList.remove("active");

        loadCampaigns(true);
    });
});

// ================= INFINITE SCROLL (Debounced) =================
let scrollTimeout;

window.addEventListener("scroll", () => {

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

        const nearBottom =
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

        if (nearBottom) {
            loadCampaigns();
        }

    }, 120);
});

window.addEventListener("click", function (e) {
    const modal = document.getElementById("donationModal");
    if (e.target === modal) {
        closeDonationModal();
    }
});

socket.on("donationUpdate", (data) => {

    console.log("Live update:", data);

    const { charityId, amount } = data;

    const card = document.querySelector(`[data-id="${charityId}"]`);

    if (!card) return;

    const amountEl = card.querySelector("[data-amount]");
    const progressEl = card.querySelector("[data-progress]");

    if (!amountEl || !progressEl) return;

    // Extract current values
    const text = amountEl.innerText;
    const match = text.match(/₹(\d+)\sraised\s+of\s+₹(\d+)/);

    if (!match) return;

    let current = parseInt(match[1]);
    const goal = parseInt(match[2]);

    // Update amount
    current += amount;

    const percent = Math.min((current / goal) * 100, 100);

    // Update UI
    amountEl.innerText = `₹${current} raised of ₹${goal}`;
    progressEl.style.width = `${percent}%`;
});

