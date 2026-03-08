import { describe, it, expect } from 'vitest'
import { decodeBase64Url, decodeJwt, formatClaimValue, getClaimDescription } from './jwtDecoder'

// The canonical example JWT from jwt.io:
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// Helper: produce a minimal JWT from plain objects
function makeJwt(header: object, payload: object, sig = 'sig'): string {
  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `${enc(header)}.${enc(payload)}.${sig}`
}

// ─── decodeBase64Url ──────────────────────────────────────────────────────────

describe('decodeBase64Url', () => {
  it('decodes ASCII text without padding', () => {
    // base64url of "Hello World" (no padding)
    expect(decodeBase64Url('SGVsbG8gV29ybGQ')).toBe('Hello World')
  })

  it('handles URL-safe characters (- and _)', () => {
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 -> {"alg":"HS256","typ":"JWT"}
    const result = decodeBase64Url('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    expect(JSON.parse(result)).toEqual({ alg: 'HS256', typ: 'JWT' })
  })

  it('restores standard padding before decoding', () => {
    // btoa("foo") === "Zm9v" (no padding needed here)
    expect(decodeBase64Url('Zm9v')).toBe('foo')
  })

  it('round-trips a JSON object correctly', () => {
    const obj = { hello: 'world', num: 42 }
    const b64 = btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    expect(JSON.parse(decodeBase64Url(b64))).toEqual(obj)
  })

  it('handles inputs that need 1 padding character', () => {
    // "ab" in base64 is "YWI=" — strip the = to get "YWI"
    expect(decodeBase64Url('YWI')).toBe('ab')
  })

  it('handles inputs that need 2 padding characters', () => {
    // "a" in base64 is "YQ==" — strip to get "YQ"
    expect(decodeBase64Url('YQ')).toBe('a')
  })
})

// ─── decodeJwt ────────────────────────────────────────────────────────────────

describe('decodeJwt', () => {
  it('decodes the example JWT header correctly', () => {
    const { header } = decodeJwt(EXAMPLE_JWT)
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' })
  })

  it('decodes the example JWT payload correctly', () => {
    const { payload } = decodeJwt(EXAMPLE_JWT)
    expect(payload.sub).toBe('1234567890')
    expect(payload.name).toBe('John Doe')
    expect(payload.iat).toBe(1516239022)
  })

  it('preserves the raw signature string', () => {
    const { signature } = decodeJwt(EXAMPLE_JWT)
    expect(signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  })

  it('marks iat as an issuedAt Date in 2018', () => {
    const { issuedAt } = decodeJwt(EXAMPLE_JWT)
    expect(issuedAt).toBeInstanceOf(Date)
    expect(issuedAt?.getFullYear()).toBe(2018)
  })

  it('returns null notBefore when nbf is absent', () => {
    expect(decodeJwt(EXAMPLE_JWT).notBefore).toBeNull()
  })

  it('returns null expiresAt and isExpired=false when exp is absent', () => {
    const jwt = makeJwt({ alg: 'HS256' }, { sub: 'test' })
    const decoded = decodeJwt(jwt)
    expect(decoded.expiresAt).toBeNull()
    expect(decoded.isExpired).toBe(false)
  })

  it('detects an expired token (exp in the past)', () => {
    const jwt = makeJwt({ alg: 'HS256' }, { sub: 'test', exp: 1 })
    const decoded = decodeJwt(jwt)
    expect(decoded.isExpired).toBe(true)
    expect(decoded.expiresAt).toBeInstanceOf(Date)
  })

  it('detects a non-expired token (exp in the future)', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const jwt = makeJwt({ alg: 'HS256' }, { sub: 'test', exp: futureExp })
    const decoded = decodeJwt(jwt)
    expect(decoded.isExpired).toBe(false)
    expect(decoded.expiresAt).toBeInstanceOf(Date)
  })

  it('parses the notBefore date when nbf is present', () => {
    const nbf = 1516239022
    const jwt = makeJwt({ alg: 'HS256' }, { sub: 'test', nbf })
    const decoded = decodeJwt(jwt)
    expect(decoded.notBefore).toBeInstanceOf(Date)
    expect(decoded.notBefore?.getTime()).toBe(nbf * 1000)
  })

  it('trims surrounding whitespace before parsing', () => {
    const { header } = decodeJwt('  ' + EXAMPLE_JWT + '\n')
    expect(header.alg).toBe('HS256')
  })

  it('throws for a token with only two parts', () => {
    expect(() => decodeJwt('abc.def')).toThrow('Invalid JWT format')
  })

  it('throws for a token with four parts', () => {
    expect(() => decodeJwt('a.b.c.d')).toThrow('Invalid JWT format')
  })

  it('throws for a completely empty string', () => {
    expect(() => decodeJwt('')).toThrow()
  })

  it('throws when the header is not valid JSON', () => {
    const badHeader = btoa('not json').replace(/=/g, '')
    expect(() => decodeJwt(`${badHeader}.eyJzdWIiOiJ0ZXN0In0.sig`)).toThrow(
      'Invalid JWT header',
    )
  })

  it('throws when the payload is not valid JSON', () => {
    const goodHeader = btoa(JSON.stringify({ alg: 'HS256' })).replace(/=/g, '')
    const badPayload = btoa('not json').replace(/=/g, '')
    expect(() => decodeJwt(`${goodHeader}.${badPayload}.sig`)).toThrow('Invalid JWT payload')
  })

  it('handles a token with audience as an array', () => {
    const jwt = makeJwt({ alg: 'HS256' }, { aud: ['service-a', 'service-b'] })
    const decoded = decodeJwt(jwt)
    expect(decoded.payload.aud).toEqual(['service-a', 'service-b'])
  })

  it('handles a token with nested payload claims', () => {
    const jwt = makeJwt({ alg: 'RS256', kid: 'key1' }, { sub: 'u1', meta: { role: 'admin' } })
    const decoded = decodeJwt(jwt)
    expect(decoded.header.kid).toBe('key1')
    expect((decoded.payload.meta as { role: string }).role).toBe('admin')
  })
})

// ─── formatClaimValue ─────────────────────────────────────────────────────────

describe('formatClaimValue', () => {
  it('formats exp as timestamp plus ISO date', () => {
    const result = formatClaimValue('exp', 1516239022)
    expect(result).toContain('1516239022')
    expect(result).toContain('2018')
  })

  it('formats iat as timestamp plus ISO date', () => {
    const result = formatClaimValue('iat', 1516239022)
    expect(result).toContain('1516239022')
  })

  it('formats nbf as timestamp plus ISO date', () => {
    const result = formatClaimValue('nbf', 1516239022)
    expect(result).toContain('1516239022')
  })

  it('does not add date annotation to non-timestamp numeric claims', () => {
    const result = formatClaimValue('version', 42)
    expect(result).toBe('42')
    expect(result).not.toContain('(')
  })

  it('formats null as the string "null"', () => {
    expect(formatClaimValue('key', null)).toBe('null')
  })

  it('formats a plain string as-is', () => {
    expect(formatClaimValue('sub', 'test-user')).toBe('test-user')
  })

  it('formats a boolean as a string', () => {
    expect(formatClaimValue('admin', true)).toBe('true')
  })

  it('formats an array as JSON', () => {
    const result = formatClaimValue('roles', ['admin', 'user'])
    expect(result).toContain('admin')
    expect(result).toContain('user')
  })

  it('formats a nested object as pretty JSON', () => {
    const result = formatClaimValue('meta', { env: 'prod' })
    expect(result).toContain('"env"')
    expect(result).toContain('"prod"')
  })
})

// ─── getClaimDescription ──────────────────────────────────────────────────────

describe('getClaimDescription', () => {
  it('returns "Issuer" for iss', () => {
    expect(getClaimDescription('iss')).toBe('Issuer')
  })

  it('returns "Subject" for sub', () => {
    expect(getClaimDescription('sub')).toBe('Subject')
  })

  it('returns "Expiration Time" for exp', () => {
    expect(getClaimDescription('exp')).toBe('Expiration Time')
  })

  it('returns "Issued At" for iat', () => {
    expect(getClaimDescription('iat')).toBe('Issued At')
  })

  it('returns "Not Before" for nbf', () => {
    expect(getClaimDescription('nbf')).toBe('Not Before')
  })

  it('returns "Algorithm" for alg', () => {
    expect(getClaimDescription('alg')).toBe('Algorithm')
  })

  it('returns "Key ID" for kid', () => {
    expect(getClaimDescription('kid')).toBe('Key ID')
  })

  it('returns empty string for an unrecognised claim', () => {
    expect(getClaimDescription('custom_claim')).toBe('')
  })

  it('returns empty string for an empty key', () => {
    expect(getClaimDescription('')).toBe('')
  })
})
