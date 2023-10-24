export function stringToJSON(data: string) {
    try {
        const str = data.toString();
        return JSON.parse(str);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}
