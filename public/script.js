import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.game-btn');
    const overlay = document.getElementById('overlay');
    const newPageContent = document.getElementById('new-page-content');
    const avatarImg = document.getElementById('avatar');

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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // Извлекаем UID из текущего URL
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');

    if (!uid) {
        document.body.innerHTML = "<h1>UID not found in URL. Please start the game from Telegram.</h1>";
        return;
    }

    // Функция загрузки данных пользователя из Firebase
    async function loadUserData(uid) {
        const dbRef = ref(database);
        try {
            const snapshot = await get(child(dbRef, `users/${uid}`));
            if (snapshot.exists()) {
                const userData = snapshot.val();
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

    // Загрузка данных пользователя и установка URL аватара
    loadUserData(uid).then(userData => {
        if (userData) {
            const avatarUrl = userData.avatar_url;
            if (avatarUrl) {
                avatarImg.src = avatarUrl;
                avatarImg.onload = () => console.log("Avatar loaded successfully");
                avatarImg.onerror = () => {
                    console.error("Failed to load avatar image, using default.");
                    avatarImg.src = 'https://via.placeholder.com/50'; // Используем публичный URL для placeholder изображения
                };
            } else {
                avatarImg.src = 'https://via.placeholder.com/50'; // Используем публичный URL для placeholder изображения
            }
        }
    });

    // Добавляем обработчик клика для аватара
    avatarImg.addEventListener('click', () => {
        alert('Profile clicked!');
        // Здесь можно добавить действие при клике на аватар
    });

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const rect = button.getBoundingClientRect();
            const buttonStyle = getComputedStyle(button);
            const bgColor = buttonStyle.backgroundColor;

            button.style.setProperty('--btn-top', `${rect.top}px`);
            button.style.setProperty('--btn-left', `${rect.left}px`);
            button.style.setProperty('--btn-width', `${rect.width}px`);
            button.style.setProperty('--btn-height', `${rect.height}px`);
            button.style.setProperty('--btn-bg-color', bgColor);

            button.classList.add('active');
            overlay.classList.add('show');

            setTimeout(() => {
                newPageContent.classList.add('show');
                setTimeout(() => {
                    let url = button.getAttribute('data-url');
                    if (url.includes('?')) {
                        url += `&uid=${uid}`;
                    } else {
                        url += `?uid=${uid}`;
                    }
                    window.location.href = url;
                }, 1000); // Время для завершения анимации контента
            }, 1000); // Время для завершения анимации кнопки и overlay
        });
    });
});
