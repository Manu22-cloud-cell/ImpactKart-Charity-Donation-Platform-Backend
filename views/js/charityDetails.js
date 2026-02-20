document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();   // Load navbar first
});

async function loadCharity() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Invalid charity ID");
        return;
    }

    try {
        const response = await api.get(`/charities/${id}`);
        const charity = response.data;

        const progressPercentage = Math.min(
            (charity.collectedAmount / charity.goalAmount) * 100,
            100
        );

        document.getElementById("charityDetails").innerHTML = `
            <div class="charity-header">
                <h1>${charity.name}</h1>
                <span class="category">${charity.category}</span>
            </div>

            <p class="description">${charity.description}</p>

            <div class="info">
                <p><strong>Location:</strong> ${charity.location}</p>
                <p><strong>Goal:</strong> ₹${charity.goalAmount}</p>
                <p><strong>Raised:</strong> ₹${charity.collectedAmount}</p>
            </div>

            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercentage}%"></div>
            </div>

            <button 
                class="donate-btn"
                data-id="${charity.id}"
                data-name="${charity.name}">
                Donate
            </button>
        `;

        loadImpactReports(charity.id);

    } catch (error) {
        console.error(error);
        alert("Charity not found");
    }
}

async function loadImpactReports(charityId) {
    try {
        const response = await api.get(`/impact-reports/${charityId}`);
        const reports = response.data;

        const container = document.getElementById("impactReportsContainer");

        if (!reports || reports.length === 0) {
            container.innerHTML = "<p>No impact updates yet.</p>";
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="impact-card">
                <h3>${report.title}</h3>
                <p>${report.description}</p>

                <div class="impact-images">
                    ${(report.images || []).map(img => 
                        `<img src="${img}" alt="Impact image" />`
                    ).join("")}
                </div>

                <small class="impact-date">
                    Posted on ${new Date(report.createdAt).toLocaleDateString()}
                </small>
            </div>
        `).join("");

    } catch (error) {
        console.error("Failed to load impact reports:", error);
        document.getElementById("impactReportsContainer").innerHTML =
            "<p>Failed to load impact updates.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadCharity);
