// ================= DONATION COMPONENT =================

const RAZORPAY_KEY = "rzp_test_SBCOdQy5WWyIor";

let selectedCharityId = null;
let selectedCharityName = null;
let selectedAmount = 0;

// Attach event delegation for all donate buttons
document.addEventListener("click", function (e) {

    // Donate Button Click
    if (e.target.classList.contains("donate-btn")) {
        e.stopPropagation();

        const charityId = e.target.dataset.id;
        const charityName = e.target.dataset.name;

        openDonationModal(charityId, charityName);
    }

    // Modal Background Click
    const modal = document.getElementById("donationModal");
    if (e.target === modal) {
        closeDonationModal();
    }
});


// ================= MODAL =================

function openDonationModal(charityId, charityName) {
    selectedCharityId = charityId;
    selectedCharityName = charityName;

    document.getElementById("donationCharityName").innerText =
        `Donate to ${charityName}`;

    document.getElementById("donationModal").classList.remove("hidden");
}

function closeDonationModal() {
    document.getElementById("donationModal").classList.add("hidden");
    selectedAmount = 0;
}


// ================= AMOUNT =================

function selectAmount(amount) {
    selectedAmount = amount;
    document.getElementById("customAmount").value = amount;

    document.querySelectorAll(".preset-amounts button")
        .forEach(btn => btn.classList.remove("active"));

    event.target.classList.add("active");
}


// ================= START DONATION =================

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
            theme: { color: "#00b09b" }, // dashboard theme
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error(error);
        alert("Donation failed to start");
    }
}


// ================= VERIFY =================

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

        closeDonationModal();

        setTimeout(() => {
            window.location.href =
                `/transactions.html?success=true&donationId=${donationId}`;
        }, 1200);

    } catch (error) {
        console.error("Verification failed:", error);
        alert("Something went wrong.");
    }
}
