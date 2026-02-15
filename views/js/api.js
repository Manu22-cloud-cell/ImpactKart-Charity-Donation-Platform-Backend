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

// Auto logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        }
        return Promise.reject(error);
    }
);


