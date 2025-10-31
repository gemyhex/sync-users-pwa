import { ref } from 'vue';

const isOnline = ref(navigator.onLine);

const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);


export function useNetworkStatus() {
    return {
        isOnline,
    };
}
