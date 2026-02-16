document.addEventListener("DOMContentLoaded", async () => {

    const logoutBtn = document.getElementById("logoutBtn");
    const form = document.getElementById("campaignForm");
    const deleteBtn = document.getElementById("deleteBtn");
    const updateBtn=document.getElementById("updateBtn");

    let charity; 

    try {
        const response = await api.get("/charities/me");
        charity = response.data;

        // -----------------------------
        // Populate form fields
        // -----------------------------
        document.getElementById("name").value = charity.name;
        document.getElementById("description").value = charity.description;
        document.getElementById("category").value = charity.category;
        document.getElementById("location").value = charity.location;
        document.getElementById("goalAmount").value = charity.goalAmount;

        document.getElementById("goalDisplay").textContent = charity.goalAmount;
        document.getElementById("collectedDisplay").textContent = charity.collectedAmount;

        // -----------------------------
        // Status badge
        // -----------------------------
        const badge = document.getElementById("statusBadge");
        badge.textContent = charity.status;
        badge.classList.add("status-" + charity.status);

        // -----------------------------
        // STATUS BASED UI CONTROL
        // -----------------------------

        if (charity.status === "APPROVED") {
            disableForm();
            deleteBtn.style.display = "none";
            updateBtn.style.display="none";
        }

        if (charity.status === "REJECTED") {
            disableForm();
            deleteBtn.style.display = "none";
        }

        if (charity.status === "PENDING") {
            deleteBtn.style.display = "inline-block";
        }

    } catch (error) {
        console.error(error);

        if (error.response?.status === 404) {
            alert("You have not registered a charity yet.");
            window.location.href = "/start-campaign.html";
        }

        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        }
    }

    // -----------------------------
    // UPDATE CAMPAIGN
    // -----------------------------
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!charity || charity.status !== "PENDING") {
            alert("Only pending campaigns can be edited");
            return;
        }

        try {
            await api.put("/charities", {
                name: document.getElementById("name").value,
                description: document.getElementById("description").value,
                category: document.getElementById("category").value,
                location: document.getElementById("location").value,
                goalAmount: document.getElementById("goalAmount").value
            });

            alert("Campaign updated successfully");
            window.location.reload();

        } catch (error) {
            alert(error.response?.data?.message || "Update failed");
        }
    });

    // -----------------------------
    // DELETE CAMPAIGN
    // -----------------------------
    deleteBtn.addEventListener("click", async () => {

        if (!charity || charity.status !== "PENDING") {
            alert("Only pending campaigns can be deleted");
            return;
        }

        const confirmDelete = confirm("Are you sure you want to delete this campaign?");
        if (!confirmDelete) return;

        try {
            await api.delete("/charities/me");

            alert("Campaign deleted successfully");
            window.location.href = "/dashboard.html";

        } catch (error) {
            alert(error.response?.data?.message || "Delete failed");
        }
    });

    // -----------------------------
    // LOGOUT
    // -----------------------------
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
    });

    // -----------------------------
    // Helper Function
    // -----------------------------
    function disableForm() {
        document
            .querySelectorAll("#campaignForm input, #campaignForm textarea")
            .forEach(el => el.disabled = true);

        const updateBtn = document.querySelector("#campaignForm button");
        if (updateBtn) updateBtn.disabled = true;
    }

});
