import axios from "axios";

let isRefreshing = false;
let failedRequestQueue = [];

const api = axios.create({
    baseURL: 'https://localhost:7284/api',
    withCredentials: true
});

const previousRequestQueue = (error) => {
    failedRequestQueue.forEach(promise => {
        if (error) promise.reject(error);
        else promise.resolve();
    });
    failedRequestQueue = [];
}

api.interceptors.response.use(
    response => response,
    async (error) => {
        const previousRequest = error.config;

        if (previousRequest.url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !previousRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({ resolve, reject });
                }).then(() => api(previousRequest))
                    .catch((error) => Promise.reject(error));
            }
        }

        previousRequest._retry = true;
        isRefreshing = true;

        try {
            await api.get('/auth/refresh');
            previousRequestQueue(null);
            return api(previousRequest);
        } catch (refreshError) {
            console.log(refreshError);
        } finally {
            isRefreshing = false;
        }

        return Promise.reject(error);
    });

export default api;