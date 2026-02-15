let currentPage = 1;
let allCharities = [];
let filteredCharities = [];
const pageSize = 6;

const campaignList = document.getElementById("campaignList");
const loadMoreBtn = document.getElementById("loadMoreBtn");

async function fetchCharities(category = "", location = "") {
    const response = await api.get("/charities", {
        params: { category, location }
    });

    allCharities = response.data;
    filteredCharities = allCharities;
    currentPage = 1;
    renderCampaigns();
}

function renderCampaigns() {
    campaignList.innerHTML = "";

    const start = 0;
    const end = currentPage * pageSize;

    filteredCharities.slice(start, end).forEach(charity => {

        const percent = 
            (charity.collectedAmount / charity.goalAmount) * 100;

        const card = document.createElement("div");
        card.className = "campaign-card";

        card.innerHTML = `
            <h3>${charity.name}</h3>
            <p>${charity.description.substring(0,100)}...</p>
            <p><strong>Category:</strong> ${charity.category}</p>
            <p><strong>Location:</strong> ${charity.location}</p>
            <p><strong>Raised:</strong> ₹${charity.collectedAmount} / ₹${charity.goalAmount}</p>
            <p>${percent.toFixed(1)}% funded</p>
        `;

        campaignList.appendChild(card);
    });

    if (end >= filteredCharities.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderCampaigns();
});

document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        fetchCharities(btn.dataset.cat);
    });
});

document.getElementById("categoryFilter")
    .addEventListener("change", (e) => {
        fetchCharities(e.target.value);
    });

document.getElementById("locationFilter")
    .addEventListener("change", (e) => {
        fetchCharities("", e.target.value);
    });

fetchCharities();
