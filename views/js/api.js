const api = axios.create({
    baseURL:
        window.location.hostname === "localhost"
            ? "http://localhost:3000/api"
            : "/api"
});

// Attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

