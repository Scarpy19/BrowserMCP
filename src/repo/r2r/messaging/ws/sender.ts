export function createSocketMessageSender<T = any>(ws: any) {
    async function sendSocketMessage(type: string, payload: any, options?: any): Promise<any> {
        // Minimal stub: send over ws if available, otherwise return a placeholder
        if (ws && typeof ws.send === "function") {
            try {
                ws.send(JSON.stringify({ type, payload }));
            } catch (e) {
                // ignore
            }
        }
        // Provide a generic empty response; real implementation communicates with browser extension.
        return {} as any;
    }
    return { sendSocketMessage };
}
