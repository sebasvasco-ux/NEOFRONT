export async function generatePKCE() {
    // 1. Generar code_verifier (string aleatorio)
    const codeVerifier = generateRandomString(128);
    
    // 2. Generar code_challenge (SHA256 de code_verifier)
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
    const codeChallenge = base64Digest
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256'
    };
}

export function generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
