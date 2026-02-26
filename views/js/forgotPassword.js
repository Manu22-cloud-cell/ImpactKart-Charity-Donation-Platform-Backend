const forgotLink = document.getElementById("forgotPasswordLink");
const modal = document.getElementById("forgotModal");
const forgotForm = document.getElementById("forgotForm");
const forgotMessage = document.getElementById("forgotMessage");
const closeBtn = document.getElementById("closeModal");

// Open modal
forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
});

// Close modal when clicking X
closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    forgotMessage.textContent = "";
    forgotForm.reset();
});

// Close modal when clicking outside
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
        forgotMessage.textContent = "";
        forgotForm.reset();
    }
});
// Submit forgot form
forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();

    try {
        const response = await api.post("/password/forgotpassword", { email });

        forgotMessage.style.color = "green";
        forgotMessage.textContent = response.data.message;

        forgotForm.reset();

    } catch (error) {
        forgotMessage.style.color = "red";

        if (error.response) {
            forgotMessage.textContent = error.response.data.message;
        } else {
            forgotMessage.textContent = "Something went wrong";
        }
    }
});