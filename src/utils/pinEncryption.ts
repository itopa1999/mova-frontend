let publicKeyPromise: Promise<CryptoKey> | undefined

const getPublicKey = (): Promise<CryptoKey> => {
  const publicKeyPem = import.meta.env.VITE_PIN_ENCRYPTION_PUBLIC_KEY?.trim()
  if (!publicKeyPem) {
    throw new Error('PIN encryption is not configured. Set VITE_PIN_ENCRYPTION_PUBLIC_KEY in .env.')
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error('PIN encryption is not supported by this browser.')
  }

  const publicKeyBase64 = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '')
  const publicKeyBytes = Uint8Array.from(atob(publicKeyBase64), (character) =>
    character.charCodeAt(0)
  )

  if (!publicKeyPromise) {
    publicKeyPromise = globalThis.crypto.subtle
      .importKey(
        'spki',
        publicKeyBytes,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      )
      .catch((error: unknown) => {
        publicKeyPromise = undefined
        throw error
      })
  }

  return publicKeyPromise
}

export const encryptPin = async (pin: string): Promise<string> => {
  const publicKey = await getPublicKey()
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    new TextEncoder().encode(pin)
  )

  return btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
}
