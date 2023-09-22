function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i !== bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const utf8ToHex = (str: string): string => bytesToHex(new TextEncoder().encode(str));

export const hexToUtf8 = (str: string): string => new TextDecoder().decode(hexToBytes(str));
