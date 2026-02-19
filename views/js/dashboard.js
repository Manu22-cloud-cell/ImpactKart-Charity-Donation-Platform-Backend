// ================= GLOBAL STATE =================
let currentPage = 1;
const limit = 6;
let currentSearch = "";
let currentCategory = "";

let isLoading = false;
let hasMoreData = true;

// Razorpay Public Key (FRONTEND SAFE)
const RAZORPAY_KEY = "rzp_test_SBCOdQy5WWyIor";

// DOM references
let container;
let loadingIndicator;
let emptyState;


// ================= INIT =================
async function initDashboard() {

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

        if (navUserName) navUserName.textContent = user.name;

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

    campaigns.forEach(campaign => {

        const collected = Number(campaign.collectedAmount) || 0;
        const goal = Number(campaign.goalAmount) || 0;

        const progressPercent = goal > 0
            ? Math.min((collected / goal) * 100, 100)
            : 0;

        const card = document.createElement("div");
        card.classList.add("campaign-card");

        card.innerHTML = `
            <h3>${campaign.name}</h3>
            <p>${campaign.location || ""}</p>
            <p>${campaign.description.substring(0, 80)}...</p>

            <div class="progress-bar">
                <div class="progress" style="width:${progressPercent}%"></div>
            </div>

            <p>₹${collected} raised of ₹${goal}</p>

            <button class="donate-btn">Donate</button>
        `;

        // Navigate only when clicking card (NOT donate button)
        card.addEventListener("click", () => {
            window.location.href = `/charity-details.html?id=${campaign.id}`;
        });

        // Attach donate button separately
        const donateBtn = card.querySelector(".donate-btn");

        donateBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent card click redirect
            openDonationModal(campaign.id, campaign.name);
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

    try {

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

        if (!verifyRes.ok || !result.success) {
            alert("Payment verification failed");
            return;
        }

        // Close modal
        closeDonationModal();

        // Redirect to transactions page with success flag
        setTimeout(() => {
            window.location.href = `/transactions.html?success=true&donationId=${donationId}`;
        }, 1500)


    } catch (error) {
        console.error("Verification failed:", error);
        alert("Something went wrong during verification.");
    }
}

// ================= INFINITE SCROLL (Debounced) =================
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

    }, 120);
});

window.addEventListener("click", function (e) {
    const modal = document.getElementById("donationModal");
    if (e.target === modal) {
        closeDonationModal();
    }
});


// ================= START =================
document.addEventListener("DOMContentLoaded", initDashboard);
