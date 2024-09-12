import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Управление кнопкой «Назад»
function showBackButton() {
    if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            hideBackButton();
            // Переход на index.html при нажатии на кнопку «Назад»
            window.location.href = 'index.html';
        });
        console.log('BackButton отображен и настроен');
    } else {
        console.error('BackButton не найден');
    }
}

function hideBackButton() {
    if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.hide();
        console.log('BackButton скрыт');
    } else {
        console.error('BackButton не найден');
    }
}

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0SXNWUjftNziCo-TImzA1ksA8w8n-Rfc",
    authDomain: "snake-6da20.firebaseapp.com",
    databaseURL: "https://snake-6da20-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "snake-6da20",
    storageBucket: "snake-6da20.appspot.com",
    messagingSenderId: "792222318675",
    appId: "1:792222318675:web:5ecacccf554824a7ef46a6",
    measurementId: "G-P9R1G79S57"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

console.log('Firebase initialized.');

window.onload = function() {
    console.log('Document loaded and script executed');

    const avatarImg = document.getElementById('playerAvatarImg');
    let ws; // Объявляем WebSocket вне функций

    // Функция для извлечения параметра `uid` из URL
    function getUidFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('uid');
    }

    // Извлекаем `uid` из URL
    const uid = getUidFromUrl();
    console.log("Extracted UID:", uid);

    // Функция загрузки данных пользователя из Firebase
    async function loadUserData(uid) {
        console.log("Attempting to load user data for UID:", uid);
        const dbRef = ref(database);
        try {
            const snapshot = await get(child(dbRef, `users/${uid}`));
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log("User data loaded:", userData);
                return userData;
            } else {
                console.error("User data not found");
                return null;
            }
        } catch (error) {
            console.error("Error loading user data: ", error);
            return null;
        }
    }

    // Функция для установки аватара пользователя
    async function setPlayerAvatar() {
        if (!uid) {
            console.error("No UID found in URL.");
            return;
        }

        const userData = await loadUserData(uid);
        if (userData) {
            const avatarUrl = userData.avatar_url;
            if (avatarUrl) {
                if (avatarImg) {
                    avatarImg.src = avatarUrl;
                    avatarImg.onload = () => console.log("Avatar loaded successfully");
                    avatarImg.onerror = () => {
                        console.error("Failed to load avatar image, using default.");
                        avatarImg.src = 'https://via.placeholder.com/50';
                    };
                } else {
                    console.error("Avatar image element not found");
                }
            } else {
                if (avatarImg) {
                    avatarImg.src = 'https://via.placeholder.com/50';
                }
            }
        } else {
            console.error("No user data found or failed to load");
        }
    }

    // Функция для настройки WebSocket соединения
    function setupWebSocket() {
        console.log('Setting up WebSocket connection...');
        ws = new WebSocket('wss://snakeserver.fun');

        ws.addEventListener('open', function() {
            console.log('WebSocket connection established.');
            refreshServerList(); // Обновляем список серверов при подключении WebSocket
        });

        ws.addEventListener('message', function(event) {
            console.log('WebSocket message received:', event.data);
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'serverListUpdate':
                    console.log('Server list update received');
                    updateServerList(message.servers);
                    break;
                case 'serverAdded':
                    console.log('New server added:', message.server);
                    addServerToList(message.server);
                    break;
                case 'serverRemoved':
                    console.log('Server removed:', message.serverId);
                    removeServerFromList(message.serverId);
                    break;
                case 'serverUpdated':
                    console.log('Server updated:', message.server);
                    updateServerInList(message.server);
                    break;
                case 'playerListUpdate':
                    console.log('Player list update received');
                    updatePlayerList(message.players);
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        });

        ws.addEventListener('error', function(error) {
            console.error('WebSocket error:', error);
        });

        ws.addEventListener('close', function() {
            console.log('WebSocket connection closed.');
        });
    }

    // Инициализация WebSocket при загрузке страницы
    setupWebSocket();

    // Загрузка аватара пользователя
    if (avatarImg) {
        setPlayerAvatar();
    }

    // Обработчики кликов на кнопки
    const createServerBtn = document.getElementById('openCreateServerModalBtn');
    const serverCreationModal = document.getElementById('serverCreationModal');
    const createServerConfirmBtn = document.getElementById('createServerConfirmBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const refreshServersBtn = document.getElementById('refreshServersBtn');
    const singlePlayerBtn = document.getElementById('singlePlayerBtn');
    const multiPlayerBtn = document.getElementById('multiPlayerBtn');
    const readyButton = document.getElementById("readyButton");

    if (createServerBtn) {
        createServerBtn.addEventListener('click', () => {
            serverCreationModal.style.display = 'block';
        });
    } else {
        console.error('Create Server button not found');
    }

    if (createServerConfirmBtn) {
        createServerConfirmBtn.addEventListener('click', () => {
            const serverName = document.getElementById('serverName').value;
            const passwordToggle = document.getElementById('passwordToggle').checked;
            const serverPassword = document.getElementById('serverPassword').value;
            const maxPlayers = document.getElementById('maxPlayers').value;
            const gameMode = document.getElementById('gameMode').value;

            if (!serverName) {
                console.error('Server name is required');
                return;
            }

            fetch('https://snakeserver.fun/api/createServer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: serverName,
                    password: passwordToggle ? serverPassword : null,
                    maxPlayers: maxPlayers,
                    gameMode: gameMode
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Server created successfully!');
                    serverCreationModal.style.display = 'none';
                    joinServer(data.serverId);
                } else {
                    alert('Error creating server');
                }
            })
            .catch(error => {
                console.error('Error creating server:', error);
            });
        });
    } else {
        console.error('Create Server Confirm button not found');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            serverCreationModal.style.display = 'none';
        });
    } else {
        console.error('Close modal button not found');
    }

    if (refreshServersBtn) {
        refreshServersBtn.addEventListener('click', refreshServerList);
    } else {
        console.error('Refresh Servers button not found');
    }

    if (singlePlayerBtn) {
        singlePlayerBtn.addEventListener('click', startGame);
    } else {
        console.error('Single Player button not found');
    }

    if (multiPlayerBtn) {
        multiPlayerBtn.addEventListener('click', startMultiplayer);
    } else {
        console.error('Multiplayer button not found');
    }

    if (readyButton) {
        readyButton.addEventListener("click", function () {
            if (readyButton.textContent === "ГОТОВ") {
                readyButton.textContent = "Отменить готовность";
                readyButton.classList.remove('ready');
                readyButton.classList.add('not-ready');
                // Дополнительные действия при готовности, например отправка состояния на сервер
                console.log("Player is now ready.");
            } else {
                readyButton.textContent = "ГОТОВ";
                readyButton.classList.remove('not-ready');
                readyButton.classList.add('ready');
                // Дополнительные действия при отмене готовности
                console.log("Player is no longer ready.");
            }
        });
    } else {
        console.error('Ready button not found');
    }

    // Функция для обновления списка серверов
    function refreshServerList() {
        console.log('Refreshing server list...');
        fetch('https://snakeserver.fun/api/servers')
            .then(response => response.json())
            .then(servers => updateServerList(servers))
            .catch(error => {
                console.error('Error fetching server list:', error);
            });
    }

    // Функции для обновления/удаления/добавления серверов в список
    function updateServerList(servers) {
        // Логика обновления списка серверов
        console.log('Updating server list:', servers);
    }

    function addServerToList(server) {
        // Логика добавления нового сервера в список
        console.log('Adding server to list:', server);
    }

    function removeServerFromList(serverId) {
        // Логика удаления сервера из списка
        console.log('Removing server from list:', serverId);
    }

    function updateServerInList(server) {
        // Логика обновления сервера в списке
        console.log('Updating server in list:', server);
    }

    // Пример функции начала игры
    function startGame() {
        console.log('Starting single player game...');
    }

    function startMultiplayer() {
        console.log('Starting multiplayer game...');
    }

    function joinServer(serverId) {
        console.log('Joining server with ID:', serverId);
        // Логика подключения к серверу
    }
};
