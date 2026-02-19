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
             Donate now
            </button>
        `;

    } catch (error) {
        console.error(error);
        alert("Charity not found");
    }
}

function handleDonate(charityId) {
    // You can redirect to donation page or open modal later
    window.location.href = `/donate.html?id=${charityId}`;
}

document.addEventListener("DOMContentLoaded", loadCharity);
