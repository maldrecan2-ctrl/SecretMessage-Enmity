import { get, getBoolean } from 'enmity/api/settings';

const Y = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const PLUGIN_NAME = "SecretMessage";

export function xor(e: string, t: string) {
    let n = "";
    for (let r = 0; r < e.length; r++) {
        n += String.fromCharCode(e.charCodeAt(r) ^ t.charCodeAt(r % t.length));
    }
    return n;
}

export function getKeySignature(e: string) {
    return `${xor("secret", e).slice(0, 3).padStart(3, "?")}`;
}

export function getEditMarker(e: string) {
    return `\`<${e.slice(0, 2)}${"*".repeat(Math.max(e.length - 2, 0))}>\``;
}

function insertAt(e: string, t: number, n: string) {
    return `${e.slice(0, t)}${n}${e.slice(t)}`;
}

function removeAt(e: string, t: number) {
    return `${e.slice(0, t)}${e.slice(t + 1)}`;
}

function randomChar() {
    return Y[Math.floor(Math.random() * Y.length)];
}

export function unshorten(e: string) {
    return e.replaceAll("\u2004", "\r").replaceAll("\u2001", "\n").replaceAll("\u2002", "\v").replaceAll("\u2003", "\f");
}

export function shorten(e: string) {
    return getBoolean(PLUGIN_NAME, "shorten_text", true)
        ? e.replaceAll("\v", "\u2002").replaceAll("\f", "\u2003").replaceAll("\r", "\u2004").replaceAll("\n", "\u2001")
        : e;
}

export function encryptMessage(e: string) {
    let key = get(PLUGIN_NAME, "key", "default") as string;
    let n = shorten(xor(e, key));
    let r = Math.floor(n.length / 3);
    let s = getKeySignature(key);
    
    if (r === 0) {
        n = `${s}${n}`;
    } else {
        [3, 2, 1].forEach(a => {
            n = insertAt(n, r * a - 1, s[a - 1]);
        });
    }
    return `${randomChar()}${randomChar()}${n}${randomChar()}${randomChar()}`;
}

export function extractPayload(e: string, signature: string) {
    let n = 2;
    if (e.length <= 9) {
        if (e.slice(2, 5) === signature) return e.slice(5, -2);
    } else {
        let r = Math.floor((e.length - n * 2 - 3) / 3);
        let s = `${e[r - 1 + (1 - 1) + n]}${e[r * 2 - 1 + (2 - 1) + n]}${e[r * 3 - 1 + (3 - 1) + n]}`;
        e = e.slice(2, -2);
        if (signature === s) {
            [3, 2, 1].forEach(a => {
                e = removeAt(e, r * a - 1 + (a - 1));
            });
            return e;
        }
    }
    return false;
}

export function decryptMessage(e: string) {
    let key = get(PLUGIN_NAME, "key", "default") as string;
    let signature = getKeySignature(key);
    let editMarker = getEditMarker(key);
    let payload = extractPayload(e, signature);
    
    return payload ? `${xor(unshorten(payload), key)} ${editMarker}` : e;
}

export function cleanEditMarker(e: string) {
    let key = get(PLUGIN_NAME, "key", "default") as string;
    let editMarker = getEditMarker(key);
    return e.replace(editMarker, "");
}
