// src/types.ts
export interface PlayerData {
    worldId: string;
    seaId: string;
    playerName: string;
}

export interface ServerToClientEvents {
    playerVerificationResult: (result: {
        isValid: boolean;
        player: PlayerData;
        message: string;
    }) => void;
}

export interface ClientToServerEvents {
    verifyPlayer: (data: PlayerData) => void;
}