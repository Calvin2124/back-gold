// src/server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PlayerData, ServerToClientEvents, ClientToServerEvents } from './types';

const app = express();
const httpServer = createServer(app);
app.use(express.json());

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configuration des données de jeu
const gameData = {
    worlds: ["world1", "world2", "world3"],
    seas: {
        world1: ["sea1", "sea2", "sea3"],
        world2: ["sea4", "sea5", "sea6"],
        world3: ["sea7", "sea8", "sea9"]
    },
    players: ["player1", "player2", "player3", "player4", "player5"] // Liste des joueurs autorisés
};

// Fonction de vérification
function verifyPlayerData(data: PlayerData) {
    const { worldId, seaId, playerName } = data;

    // Vérifier si le monde existe
    if (!gameData.worlds.includes(worldId)) {
        return {
            isValid: false,
            message: "Monde invalide"
        };
    }

    // Vérifier si la mer existe dans ce monde
    if (!gameData.seas[worldId as keyof typeof gameData.seas].includes(seaId)) {
        return {
            isValid: false,
            message: "Mer invalide pour ce monde"
        };
    }

    // Vérifier si le joueur existe dans la liste
    if (!gameData.players.includes(playerName)) {
        return {
            isValid: false,
            message: "Joueur non autorisé"
        };
    }

    return {
        isValid: true,
        message: "Joueur vérifié avec succès"
    };
}

// Route de test API
app.post('/test-verify', (req, res) => {
    const playerData: PlayerData = req.body;
    const verificationResult = verifyPlayerData(playerData);
    
    res.json({
        ...verificationResult,
        player: playerData
    });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);

    socket.on('verifyPlayer', (data: PlayerData) => {
        console.log('Données reçues de l\'ordinateur A:', data);

        const verificationResult = verifyPlayerData(data);

        // Envoyer le résultat à l'ordinateur B
        socket.broadcast.emit('playerVerificationResult', {
            ...verificationResult,
            player: data
        });

        // Envoyer également une confirmation à l'ordinateur A
        socket.emit('playerVerificationResult', {
            ...verificationResult,
            player: data
        });
    });

    socket.on('disconnect', () => {
        console.log('Client déconnecté:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});