document.addEventListener("DOMContentLoaded", () => {

    checkSuccessRedirect();
    loadTransactions();

});

async function loadTransactions() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch("/api/donations/my", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        const list = document.getElementById("transactionsList");
        const noTransactions = document.getElementById("noTransactions");

        list.innerHTML = "";

        if (!data.formattedDonations || data.formattedDonations.length === 0) {
            noTransactions.classList.remove("hidden");
            return;
        }

        data.formattedDonations.forEach(donation => {

            const card = document.createElement("div");
            card.className = "transaction-card";

            card.innerHTML = `
                <h3>${donation.charity.name}</h3>

                <div class="transaction-meta">
                    <p><strong>Amount:</strong> ₹${donation.amount}</p>
                    <p><strong>Date:</strong> ${new Date(donation.donatedAt).toLocaleDateString()}</p>
                    <p><strong>Payment ID:</strong> ${donation.paymentId || "N/A"}</p>
                    <p><strong>Status:</strong> 
                        <span class="${donation.status === "SUCCESS" ? "status-success" : "status-pending"}">
                            ${donation.status}
                        </span>
                    </p>
                </div>
            `;

            // Create button properly
            if (donation.status === "SUCCESS") {
                const btn = document.createElement("button");
                btn.className = "download-btn";
                btn.textContent = "Download Receipt";

                btn.addEventListener("click", () => {
                    downloadReceipt(donation.id);
                });

                card.appendChild(btn);
            }

            list.appendChild(card);
        });

    } catch (error) {
        console.error("Failed to load transactions:", error);
    }
}

function downloadReceipt(donationId) {

    const token = localStorage.getItem("token");

    fetch(`/api/donations/${donationId}/receipt`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(response => response.blob())
    .then(blob => {

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `donation-receipt-${donationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

    })
    .catch(error => {
        console.error("Receipt download failed:", error);
    });
}


/* SUCCESS REDIRECT CHECK */
function checkSuccessRedirect() {

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");

    if (success === "true") {

        const banner = document.getElementById("successBanner");
        banner.classList.remove("hidden");

        // Remove query params after showing message
        window.history.replaceState({}, document.title, "/transactions.html");
    }
}
