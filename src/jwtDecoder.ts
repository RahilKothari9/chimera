/**
 * JWT Decoder
 *
 * Decodes JSON Web Tokens (JWTs) without verifying the signature.
 * Supports standard JWTs with base64url-encoded header and payload.
 */

export interface JwtHeader {
  alg?: string
  typ?: string
  kid?: string
  cty?: string
  [key: string]: unknown
}

export interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}

export interface DecodedJwt {
  header: JwtHeader
  payload: JwtPayload
  signature: string
  isExpired: boolean
  expiresAt: Date | null
  issuedAt: Date | null
  notBefore: Date | null
}

/**
 * Decode a base64url-encoded string to a UTF-8 string.
 * Handles URL-safe characters and optional padding.
 */
export function decodeBase64Url(input: string): string {
  // Replace URL-safe chars and restore padding
  const base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Decode a JWT token into its header, payload, and signature.
 * Does NOT verify the signature.
 *
 * @throws Error if the token format is invalid.
 */
export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim()
  const parts = trimmed.split('.')

  if (parts.length !== 3) {
    throw new Error(
      `Invalid JWT format: expected 3 parts separated by '.', got ${parts.length}`,
    )
  }

  const [headerB64, payloadB64, signatureB64] = parts

  let header: JwtHeader
  let payload: JwtPayload

  try {
    header = JSON.parse(decodeBase64Url(headerB64)) as JwtHeader
  } catch {
    throw new Error('Invalid JWT header: could not decode or parse JSON')
  }

  try {
    payload = JSON.parse(decodeBase64Url(payloadB64)) as JwtPayload
  } catch {
    throw new Error('Invalid JWT payload: could not decode or parse JSON')
  }

  const now = Math.floor(Date.now() / 1000)
  const isExpired = typeof payload.exp === 'number' ? now > payload.exp : false
  const expiresAt = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null
  const issuedAt = typeof payload.iat === 'number' ? new Date(payload.iat * 1000) : null
  const notBefore = typeof payload.nbf === 'number' ? new Date(payload.nbf * 1000) : null

  return {
    header,
    payload,
    signature: signatureB64,
    isExpired,
    expiresAt,
    issuedAt,
    notBefore,
  }
}

/**
 * Format a JWT claim value for display.
 * Numeric timestamp claims (exp, iat, nbf) include an ISO date string.
 */
export function formatClaimValue(key: string, value: unknown): string {
  const timeKeys = ['exp', 'iat', 'nbf']
  if (timeKeys.includes(key) && typeof value === 'number') {
    const date = new Date(value * 1000)
    return `${value} (${date.toISOString()})`
  }
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

/**
 * Return a human-readable description for common JWT claim keys.
 * Returns an empty string for unknown claims.
 */
export function getClaimDescription(key: string): string {
  const descriptions: Record<string, string> = {
    iss: 'Issuer',
    sub: 'Subject',
    aud: 'Audience',
    exp: 'Expiration Time',
    nbf: 'Not Before',
    iat: 'Issued At',
    jti: 'JWT ID',
    alg: 'Algorithm',
    typ: 'Token Type',
    kid: 'Key ID',
    cty: 'Content Type',
    x5t: 'X.509 Certificate Thumbprint',
    name: 'Full Name',
    email: 'Email',
    role: 'Role',
    roles: 'Roles',
    scope: 'OAuth Scope',
    azp: 'Authorized Party',
    nonce: 'Nonce',
    at_hash: 'Access Token Hash',
    c_hash: 'Code Hash',
    acr: 'Authentication Context',
    amr: 'Authentication Methods',
    sid: 'Session ID',
  }
  return descriptions[key] ?? ''
}
