export function stringToJSON(data: string) {
    const str = data.toString();
    return JSON.parse(str);
}
