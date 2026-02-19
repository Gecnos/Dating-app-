import axios from './api/axios';
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Laravel Echo configuration is now handled in WebSocketProvider.jsx
// to ensure proper authentication with the Sanctum token.
