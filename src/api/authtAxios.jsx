import axios from "axios";

export function authAxiosInstance() {
    const api = axios.create({
        baseURL: 'https://localhost:7284/api',
        withCredentials: true
    });

    let isRefreshing = false;

    api.interceptors.response.use(
        response => response,
        async (error) => {
            const previousRequest = error.config;
            const url = '/auth/refresh';

            if (previousRequest.url.includes(url)) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return api(previousRequest);
            }

            if (error.response.status === 401 && !isRefreshing) {

                isRefreshing = true;

                try {
                    const response = await api.get(url);

                    if (response.status === 200)
                        return api(previousRequest);

                } catch (refreshError) {
                    console.log(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        });

    return api;
}