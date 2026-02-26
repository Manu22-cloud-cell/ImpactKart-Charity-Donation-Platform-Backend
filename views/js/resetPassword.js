const params = new URLSearchParams(window.location.search);
const uuid = params.get("id"); 

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await api.post("/password/resetpassword", {
            uuid,
            newPassword
        });

        alert(response.data.message);
        window.location.href = "/login.html";

    } catch (error) {
        alert(error.response?.data?.message || "Something went wrong");
        console.error(error);
    }
});