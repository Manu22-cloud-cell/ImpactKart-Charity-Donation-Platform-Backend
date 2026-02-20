// ================= GLOBAL STATE =================
let currentPage = 1;
const limit = 6;

let currentSearch = "";
let currentCategory = "";

let isLoading = false;
let totalPages = 1;

const campaignList = document.getElementById("campaignList");
const loadingIndicator = document.getElementById("loadingIndicator");
const noResults = document.getElementById("noResults");
const activeFilters = document.getElementById("activeFilters");

document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();   // Load navbar first
});



// ================= LOAD =================
async function loadCampaigns(reset = false) {

    if (isLoading) return;
    if (!reset && currentPage > totalPages) return;

    if (reset) {
        currentPage = 1;
        totalPages = 1;
        campaignList.innerHTML = "";
        noResults.style.display = "none";
    }

    isLoading = true;
    loadingIndicator.style.display = "block";

    const params = { page: currentPage, limit };
    if (currentSearch) params.search = currentSearch;
    if (currentCategory) params.category = currentCategory;

    try {
        const response = await api.get("/charities", { params });
        const { charities, totalPages: tp } = response.data;

        totalPages = tp;

        if (reset && charities.length === 0) {
            noResults.style.display = "block";
        }

        renderCampaigns(charities);
        currentPage++;

    } catch (error) {
        console.error("Failed to load campaigns", error);
    }

    loadingIndicator.style.display = "none";
    isLoading = false;
}


// ================= RENDER =================
function renderCampaigns(charities) {

    charities.forEach(charity => {

        const collected = Number(charity.collectedAmount) || 0;
        const goal = Number(charity.goalAmount) || 0;
        const percent = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0;

        const card = document.createElement("div");
        card.className = "campaign-card";

        card.innerHTML = `
            <h3>${charity.name}</h3>
            <p>${charity.description.substring(0, 90)}...</p>
            <p><strong>${charity.location || ""}</strong></p>

            <div class="progress-bar">
                <div class="progress" style="width:${percent}%"></div>
            </div>

            <p>₹${collected} raised of ₹${goal}</p>

            <button 
             class="donate-btn"
             data-id="${charity.id}"
             data-name="${charity.name}">
             Start Your Impact
            </button>
        `;

        // Navigate when clicking card
        card.addEventListener("click", () => {
            window.location.href = `/charity-details.html?id=${charity.id}`;
        });

        campaignList.appendChild(card);
    });
}

// ================= SEARCH =================
let searchDebounce;

document.getElementById("searchInput")
    .addEventListener("input", (e) => {

        clearTimeout(searchDebounce);

        searchDebounce = setTimeout(() => {
            currentSearch = e.target.value.trim();
            updateFilterChips();
            loadCampaigns(true);
        }, 400);
    });


// ================= CATEGORY =================
document.querySelectorAll(".cat-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".cat-btn")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            currentCategory = btn.dataset.cat;
            updateFilterChips();
            loadCampaigns(true);
        });
    });


// ================= FILTER CHIPS =================
function updateFilterChips() {

    activeFilters.innerHTML = "";

    if (currentSearch) {
        activeFilters.innerHTML += `
            <div class="filter-chip">
                ${currentSearch}
                <span onclick="clearSearch()">✕</span>
            </div>
        `;
    }

    if (currentCategory) {
        activeFilters.innerHTML += `
            <div class="filter-chip">
                ${currentCategory}
                <span onclick="clearCategory()">✕</span>
            </div>
        `;
    }
}

function clearSearch() {
    currentSearch = "";
    document.getElementById("searchInput").value = "";
    updateFilterChips();
    loadCampaigns(true);
}

function clearCategory() {
    currentCategory = "";
    document.querySelectorAll(".cat-btn")
        .forEach(b => b.classList.remove("active"));

    document.querySelector(".cat-btn[data-cat='']")
        .classList.add("active");

    updateFilterChips();
    loadCampaigns(true);
}


// ================= THROTTLED SCROLL =================
function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) return;
        lastCall = now;
        return fn(...args);
    };
}

window.addEventListener("scroll", throttle(() => {
    if (
        window.innerHeight + window.scrollY
        >= document.body.offsetHeight - 200
    ) {
        loadCampaigns();
    }
}, 300));

window.addEventListener("click", function (e) {
    const modal = document.getElementById("donationModal");
    if (e.target === modal) {
        closeDonationModal();
    }
});

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    loadCampaigns(true);

    const payBtn = document.getElementById("payBtn");
    if (payBtn) {
        payBtn.addEventListener("click", startDonation);
    }
});
