// ================= GLOBAL STATE =================
let currentPage = 1;
const limit = 6;

let currentSearch = "";
let currentCategory = "";

let isLoading = false;
let totalPages = 1;

// Razorpay public key
const RAZORPAY_KEY = "rzp_test_SBCOdQy5WWyIor";

const campaignList = document.getElementById("campaignList");
const loadingIndicator = document.getElementById("loadingIndicator");
const noResults = document.getElementById("noResults");
const activeFilters = document.getElementById("activeFilters");


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

            <button class="donate-btn">Donate</button>
        `;

        // Navigate when clicking card
        card.addEventListener("click", () => {
            window.location.href = `/charity-details.html?id=${charity.id}`;
        });

        // Donate button
        const donateBtn = card.querySelector(".donate-btn");

        donateBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent card navigation
            openDonationModal(charity.id, charity.name);
        });

        campaignList.appendChild(card);
    });
}


// ================= DONATION FLOW =================
let selectedCharityId = null;
let selectedCharityName = null;
let selectedAmount = 0;

function openDonationModal(charityId, charityName) {
    selectedCharityId = charityId;
    selectedCharityName = charityName;

    document.getElementById("donationCharityName").innerText =
        `Donate to ${charityName}`;

    document.getElementById("donationModal").classList.remove("hidden");
}

function closeDonationModal() {
    document.getElementById("donationModal").classList.add("hidden");
}

function selectAmount(amount) {
    selectedAmount = amount;
    document.getElementById("customAmount").value = amount;

    document.querySelectorAll(".quick-amounts button")
        .forEach(btn => btn.classList.remove("active"));

    event.target.classList.add("active");
}

async function startDonation() {

    const token = localStorage.getItem("token");
    const customAmount = document.getElementById("customAmount").value;
    const amount = parseInt(customAmount || selectedAmount);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        const response = await fetch("/api/donations/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount,
                charityId: selectedCharityId,
            }),
        });

        const data = await response.json();

        if (!data.success) {
            alert("Failed to initiate donation");
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: data.order.amount,
            currency: "INR",
            name: "ImpactKart",
            description: `Donation to ${selectedCharityName}`,
            order_id: data.order.id,
            handler: async function (response) {
                await verifyPayment(response, data.donationId);
            },
            theme: { color: "#6c63ff" },
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error(error);
        alert("Donation failed to start");
    }
}

async function verifyPayment(response, donationId) {

    const token = localStorage.getItem("token");

    const verifyRes = await fetch("/api/donations/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            donationId,
        }),
    });

    const result = await verifyRes.json();

    if (result.success) {
        closeDonationModal();
        setTimeout(() => {
            window.location.href = `/transactions.html?success=true&donationId=${donationId}`;
        }, 1500)
    }
    else {
        alert("Payment verification failed");
    }
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
