export function decrypt(data: string) {
    const string = data.toString();
    return JSON.parse(string);
}
