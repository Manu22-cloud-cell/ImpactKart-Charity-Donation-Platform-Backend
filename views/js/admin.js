let selectedAction = null;
let selectedCharityId = null;

document.addEventListener("DOMContentLoaded", async () => {

    const logoutBtn = document.getElementById("logoutBtn");
    const sidebarItems = document.querySelectorAll(".sidebar li[data-section]");

    // Protect Route
    try {
        const profile = await api.get("/users/profile");
        if (profile.data.user.role !== "ADMIN") {
            window.location.href = "/dashboard.html";
        }
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
    }

    // Sidebar Navigation
    sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
            item.classList.add("active");

            document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
            document.getElementById(item.dataset.section + "Section").classList.add("active");
        });
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
    });

    document.getElementById("cancelBtn").addEventListener("click", closeModal);

    document.getElementById("confirmBtn").addEventListener("click", async () => {
        if (!selectedCharityId) return;

        if (selectedAction === "approve") {
            await approveCharity(selectedCharityId);
        } else {
            await rejectCharity(selectedCharityId);
        }

        closeModal();
    });

    window.addEventListener("click", (e) => {
        const modal = document.getElementById("confirmModal");
        if (e.target === modal) {
            closeModal();
        }
    });


    // Load Data
    loadDashboardStats();
    loadPendingCharities();
    loadUsers();
    loadDonations();
});

async function loadDashboardStats() {
    const users = await api.get("/admin/users");
    const charities = await api.get("/admin/charities");
    const pending = await api.get("/admin/charities/pending");
    const donations = await api.get("/admin/donations");

    document.getElementById("totalUsers").textContent = users.data.length;
    document.getElementById("totalCharities").textContent = charities.data.length;
    document.getElementById("pendingCharitiesCount").textContent = pending.data.length;
    document.getElementById("totalDonations").textContent = donations.data.length;
}

async function loadPendingCharities() {
    const response = await api.get("/admin/charities/pending");
    const table = document.getElementById("pendingTable");
    const detailPanel = document.getElementById("charityDetailPanel");

    table.innerHTML = "";
    detailPanel.style.display = "none";

    response.data.forEach(charity => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${charity.name}</td>
            <td>${charity.category}</td>
            <td>${charity.location}</td>
            <td>
                <button class="approve">Approve</button>
                <button class="reject">Reject</button>
            </td>
        `;

        // Row click shows full details
        row.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") return;

            // Remove selected class from all rows
            document.querySelectorAll("#pendingTable tr").forEach(tr => {
                tr.classList.remove("selected");
            });

            // Add selected class to clicked row
            row.classList.add("selected");

            showCharityDetails(charity);
        });


        // Approve
        row.querySelector(".approve").addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("approve", charity.id);
        });

        // Reject
        row.querySelector(".approve").addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("approve", charity.id);
        });

        table.appendChild(row);
    });
}

async function approveCharity(id) {
    await api.put(`/admin/charities/${id}/approve`);
    await loadPendingCharities();
    await loadDashboardStats();
}

async function rejectCharity(id) {
    await api.put(`/admin/charities/${id}/reject`);
    await loadPendingCharities();
    await loadDashboardStats();
}


async function loadUsers() {
    const response = await api.get("/admin/users");
    const table = document.getElementById("usersTable");
    table.innerHTML = "";

    response.data.forEach(user => {
        const row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <select onchange="changeRole(${user.id}, this.value)">
                        <option value="">Select</option>
                        <option value="USER">USER</option>
                        <option value="CHARITY">CHARITY</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

async function changeRole(userId, role) {
    if (!role) return;
    await api.put(`/admin/users/${userId}/role`, { role });
    loadUsers();
}

async function loadDonations() {
    const response = await api.get("/admin/donations");
    const table = document.getElementById("donationsTable");
    table.innerHTML = "";

    response.data.forEach(donation => {
        const row = `
            <tr>
                <td>${donation.User.name}</td>
                <td>${donation.Charity.name}</td>
                <td>${donation.amount}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

//Modal confirmation function
function openModal(action, charityId) {
    const modal = document.getElementById("confirmModal");
    const message = document.getElementById("modalMessage");
    const confirmBtn = document.getElementById("confirmBtn");

    selectedAction = action;
    selectedCharityId = charityId;

    if (action === "approve") {
        message.textContent = "Are you sure you want to APPROVE this charity?";
        confirmBtn.className = "approve";
    } else {
        message.textContent = "Are you sure you want to REJECT this charity?";
        confirmBtn.className = "reject";
    }

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}


//show charity details
function showCharityDetails(charity) {
    const detailPanel = document.getElementById("charityDetailPanel");
    const details = document.getElementById("charityDetails");

    details.innerHTML = `
        <div class="detail-item"><strong>Name:</strong> ${charity.name}</div>
        <div class="detail-item"><strong>Description:</strong> ${charity.description}</div>
        <div class="detail-item"><strong>Category:</strong> ${charity.category}</div>
        <div class="detail-item"><strong>Location:</strong> ${charity.location}</div>
        <div class="detail-item"><strong>Goal Amount:</strong> ₹${charity.goalAmount}</div>
        <div class="detail-item"><strong>Collected Amount:</strong> ₹${charity.collectedAmount}</div>
        <div class="detail-item"><strong>Status:</strong> ${charity.status}</div>
        <hr/>
        <div class="detail-item"><strong>Created By:</strong> ${charity.User.name}</div>
        <div class="detail-item"><strong>Email:</strong> ${charity.User.email}</div>
        <div class="detail-item"><strong>Phone:</strong> ${charity.User.phone || "N/A"}</div>
    `;

    detailPanel.style.display = "block";
}

