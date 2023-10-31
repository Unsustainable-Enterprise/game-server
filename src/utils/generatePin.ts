import { LobbyManager } from '../managers/lobbyManager';

export function generatePin() {
    const pin = (Math.floor(Math.random() * 90000) + 10000).toString();
    if (!checkForDuplicate(pin)) {
        return generatePin();
    }
    return pin;
}

function checkForDuplicate(pin: string): boolean {
    const lobby = LobbyManager.findlobbyByPin(pin);

    if (lobby) {
        return true;
    }

    return false;
}

generatePin();
