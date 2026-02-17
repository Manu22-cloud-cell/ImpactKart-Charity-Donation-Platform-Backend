document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("profileForm");
    const message = document.getElementById("message");
    const profilePreview = document.getElementById("profilePreview");
    const roleBadge = document.getElementById("roleBadge");
    const imageInput = document.getElementById("profileImage");

    let currentUser;

    // ===============================
    // LOAD PROFILE DATA
    // ===============================
    try {
        const response = await api.get("/users/profile");
        currentUser = response.data.user;

        document.getElementById("name").value = currentUser.name;
        document.getElementById("email").value = currentUser.email;
        document.getElementById("phone").value = currentUser.phone || "";

        // Profile Image
        if (currentUser.profileImage) {
            profilePreview.src = currentUser.profileImage;
        }

        // Role Badge
        roleBadge.textContent = currentUser.role;
        roleBadge.classList.add("role-" + currentUser.role);

        // Created Date
        document.getElementById("createdAt").textContent =
            new Date(currentUser.createdAt).toLocaleDateString();

    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        }
    }

    // ===============================
    // PROFILE IMAGE UPLOAD (S3)
    // ===============================
    imageInput.addEventListener("change", async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        try {

            // Get Signed URL from backend
            const { data } = await api.post("/users/profile/upload-url", {
                fileType: file.type
            });

            const { signedUrl, fileUrl } = data;

            // Upload directly to S3
            await axios.put(signedUrl, file, {
                headers: {
                    "Content-Type": file.type
                }
            });

            // Save image URL in DB
            await api.put("/users/profile", {
                profileImage: fileUrl
            });

            // Update preview instantly
            profilePreview.src = fileUrl;

            message.style.color = "green";
            message.textContent = "Profile image updated successfully";

        } catch (error) {
            console.error(error);
            message.style.color = "red";
            message.textContent = "Image upload failed";
        }
    });

    // ===============================
    // UPDATE PROFILE (NO FILE)
    // ===============================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {

            await api.put("/users/profile", {
                name: document.getElementById("name").value,
                phone: document.getElementById("phone").value,
                password: document.getElementById("password").value || undefined
            });

            message.style.color = "green";
            message.textContent = "Profile updated successfully";

            document.getElementById("password").value = "";

        } catch (error) {
            message.style.color = "red";
            message.textContent =
                error.response?.data?.message || "Update failed";
        }
    });

});
