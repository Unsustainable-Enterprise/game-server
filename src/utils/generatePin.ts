import { sessions } from '../storage/sessionStorage';

export function generatePin() {
    const pin = (Math.floor(Math.random() * 90000) + 10000).toString();
    if (!checkForDuplicate(pin)) {
        return generatePin();
    }
    return pin;
}

function checkForDuplicate(pin: string): boolean {
    sessions.forEach((session) => {
        if (session.pin === pin) {
            return false;
        }
    });
    return true;
}
