let selectedAction = null;
let selectedCharityId = null;

let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", async () => {

    const logoutBtn = document.getElementById("logoutBtn");
    const sidebarItems = document.querySelectorAll(".sidebar li[data-section]");
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    // Protect Route
    try {
        const profile = await api.get("/users/profile");
        if (profile.data.user.role !== "ADMIN") {
            window.location.href = "/dashboard.html";
            return;
        }
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
        return;
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

    // Modal Buttons
    document.getElementById("cancelBtn").addEventListener("click", closeModal);

    document.getElementById("confirmBtn").addEventListener("click", async () => {
        if (!selectedCharityId) return;

        try {
            if (selectedAction === "approve") {
                await approveCharity(selectedCharityId);
                showToast("Charity approved successfully", "success");
            } else {
                await rejectCharity(selectedCharityId);
                showToast("Charity rejected successfully", "success");
            }

            // Reload current page
            const itemsCount = await loadPendingCharities(currentPage);

            // Auto move if page becomes empty
            if (itemsCount === 0 && currentPage > 1) {
                await loadPendingCharities(currentPage - 1);
            }

            await loadDashboardStats();

        } catch (error) {
            showToast("Action failed", "error");
        }

        closeModal();
    });


    window.addEventListener("click", (e) => {
        const modal = document.getElementById("confirmModal");
        if (e.target === modal) closeModal();
    });

    // Pagination Buttons
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            loadPendingCharities(currentPage - 1);
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            loadPendingCharities(currentPage + 1);
        }
    });

    // Initial Load
    await loadDashboardStats();
    await loadPendingCharities();
    await loadUsers();
    await loadDonations();
});


// ================= DASHBOARD =================

async function loadDashboardStats() {
    const users = await api.get("/admin/users");
    const charities = await api.get("/admin/charities");
    const pending = await api.get(`/admin/charities/pending?page=1&limit=1`);
    const donations = await api.get("/admin/donations");

    document.getElementById("totalUsers").textContent = users.data.length;
    document.getElementById("totalCharities").textContent = charities.data.length;
    document.getElementById("pendingCharitiesCount").textContent = pending.data.totalItems;
    document.getElementById("totalDonations").textContent = donations.data.length;
}


// ================= PENDING CHARITIES =================

async function loadPendingCharities(page = 1) {
    try {
        const response = await api.get(
            `/admin/charities/pending?page=${page}&limit=${itemsPerPage}`
        );

        const { data, totalPages: tp, currentPage: cp } = response.data;

        totalPages = tp;
        currentPage = cp;

        renderPendingTable(data);
        updatePaginationInfo();

        return data.length; // return number of items

    } catch (error) {
        showToast("Failed to load charities", "error");
        return 0;
    }
}

function renderPendingTable(charities) {
    const table = document.getElementById("pendingTable");
    table.innerHTML = "";

    // Empty State
    if (!charities || charities.length === 0) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="4" class="empty-state">
                📭 No pending charities found
            </td>
        `;

        table.appendChild(row);
        return;
    }

    charities.forEach(charity => {
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

        row.addEventListener("click", () => showCharityDetails(charity));

        row.querySelector(".approve").addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("approve", charity.id);
        });

        row.querySelector(".reject").addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("reject", charity.id);
        });

        table.appendChild(row);
    });
}

function updatePaginationInfo() {
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if (totalPages === 0) {
        document.getElementById("pageInfo").textContent = "No pages available";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    document.getElementById("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// ================= ACTIONS =================

async function approveCharity(id) {
    await api.put(`/admin/charities/${id}/approve`);
}

async function rejectCharity(id) {
    await api.put(`/admin/charities/${id}/reject`);
}


// ================= USERS =================

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


// ================= DONATIONS =================

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


// ================= MODAL =================

function openModal(action, charityId) {
    selectedAction = action;
    selectedCharityId = charityId;

    const modal = document.getElementById("confirmModal");
    const message = document.getElementById("modalMessage");

    message.textContent =
        action === "approve"
            ? "Are you sure you want to APPROVE this charity?"
            : "Are you sure you want to REJECT this charity?";

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}


// ================= TOAST =================

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");

    toast.classList.add("toast", type);
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}


// ================= DETAILS =================

function showCharityDetails(charity) {
    const detailPanel = document.getElementById("charityDetailPanel");
    const details = document.getElementById("charityDetails");

    details.innerHTML = `
        <div><strong>Name:</strong> ${charity.name}</div>
        <div><strong>Description:</strong> ${charity.description}</div>
        <div><strong>Category:</strong> ${charity.category}</div>
        <div><strong>Location:</strong> ${charity.location}</div>
        <div><strong>Goal Amount:</strong> ₹${charity.goalAmount}</div>
        <div><strong>Collected:</strong> ₹${charity.collectedAmount}</div>
        <div><strong>Status:</strong> ${charity.status}</div>
        <hr/>
        <div><strong>Created By:</strong> ${charity.User.name}</div>
        <div><strong>Email:</strong> ${charity.User.email}</div>
        <div><strong>Phone:</strong> ${charity.User.phone || "N/A"}</div>
    `;

    detailPanel.style.display = "block";
}
