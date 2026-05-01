const X1 = "krd";
const X2 = "1978";

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function safeBtoa(input: string) {
    if (typeof btoa !== 'undefined') return btoa(input);
    let str = input;
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
        charCode = str.charCodeAt(i += 3/4);
        if (charCode > 0xFF) {
            throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
    }
    return output;
}

function safeAtob(input: string) {
    if (typeof atob !== 'undefined') return atob(input);
    let str = input.replace(/=+$/, '');
    let output = '';
    if (str.length % 4 == 1) {
        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function xorEncryptDecrypt(input: string): string {
    const key = unescape(encodeURIComponent(X2));
    const data = unescape(encodeURIComponent(input));
    let binary = "";
    for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return safeBtoa(binary);
}

function xorDecrypt(base64: string): string | null {
    try {
        const binary = safeAtob(base64);
        const key = unescape(encodeURIComponent(X2));
        let decodedBytes = "";
        for (let i = 0; i < binary.length; i++) {
            decodedBytes += String.fromCharCode(binary.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decodeURIComponent(escape(decodedBytes));
    } catch {
        return null;
    }
}

function toBase64Url(input: string) {
    return xorEncryptDecrypt(input)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
    const normalized = input
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const padLength = (4 - normalized.length % 4) % 4;
    const padded = normalized + "=".repeat(padLength);
    return xorDecrypt(padded);
}

export function encryptMessage(content: string) {
    return `${X1}${toBase64Url(content)}`;
}

export function decryptMessage(content: string) {
    let cleanContent = content;
    
    if (cleanContent.startsWith("||") && cleanContent.endsWith("||")) {
        cleanContent = cleanContent.slice(2, -2).trim();
    }
    
    if (!cleanContent.startsWith(X1)) return content;

    const body = cleanContent.slice(X1.length).trim();
    if (!body) return content;
    
    const decoded = fromBase64Url(body);
    return decoded !== null ? decoded : content;
}
