let socket;

if (typeof io !== "undefined") {
    socket = io("http://40.192.99.62");
} else {
    console.error("Socket.io not loaded");
}

socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

// ================= GLOBAL STATE =================
let currentPage = 1;
const limit = 9;

let currentSearch = "";
let currentCategory = "";

let isLoading = false;
let totalPages = 1;

const campaignList = document.getElementById("campaignList");
const loadingIndicator = document.getElementById("loadingIndicator");
const noResults = document.getElementById("noResults");
const activeFilters = document.getElementById("activeFilters");


// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {

    await loadNavbar();
    loadCampaigns(true);

    const payBtn = document.getElementById("payBtn");
    if (payBtn) {
        payBtn.addEventListener("click", startDonation);
    }
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

    const fragment = document.createDocumentFragment();

    charities.forEach(charity => {

        const collected = Number(charity.collectedAmount) || 0;
        const goal = Number(charity.goalAmount) || 0;

        if (collected >= goal) return;

        const percent = goal > 0
            ? Math.min((collected / goal) * 100, 100)
            : 0;

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

        card.addEventListener("click", () => {
            window.location.href = `/charity-details.html?id=${charity.id}`;
        });

        fragment.appendChild(card);

    });

    campaignList.appendChild(fragment);

    charities.forEach(charity => {
        socket.emit("joinCampaign", charity.id);
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

    if (isLoading) return;

    const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

    if (nearBottom) loadCampaigns();

}, 300));

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


