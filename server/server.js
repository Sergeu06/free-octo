const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());


// Middleware для разрешения CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешаем запросы с любых источников
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});


let servers = []; // Массив для хранения информации о серверах

// Обработка запросов на создание серверов
app.post('/api/createServer', (req, res) => {
    const { name, password, maxPlayers, gameMode } = req.body;
    const serverId = `server_${Math.random().toString(36).substring(2, 15)}`;
    const newServer = {
        id: serverId,
        name,
        password,
        maxPlayers,
        gameMode,
        players: []
    };
    servers.push(newServer);
    res.json({ success: true, id: serverId });
    
    // Отправка обновленного списка серверов всем подключенным клиентам
    broadcastServerList();
});

// Обработка запросов на получение списка серверов
app.get('/api/servers', (req, res) => {
    res.json(servers);
});

// Обработка WebSocket соединений
wss.on('connection', ws => {
    ws.on('message', message => {
        const msg = JSON.parse(message);
        if (msg.type === 'join') {
            // Логика для присоединения к серверу
        } else if (msg.type === 'refreshServers') {
            // Отправка списка серверов клиенту по запросу
            sendServerList(ws);
        }
    });

    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to the game server!' }));
    sendServerList(ws); // Отправляем список серверов при подключении клиента
});

function sendServerList(ws) {
    ws.send(JSON.stringify({ type: 'serverListUpdate', servers }));
}

function broadcastServerList() {
    const message = JSON.stringify({ type: 'serverListUpdate', servers });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
