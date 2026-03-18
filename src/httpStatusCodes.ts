/**
 * HTTP Status Code Reference
 * A comprehensive database of HTTP status codes with descriptions and usage notes.
 */

export interface HttpStatusCode {
  code: number
  name: string
  category: HttpStatusCategory
  description: string
  usage: string
}

export type HttpStatusCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx Informational
  {
    code: 100,
    name: 'Continue',
    category: '1xx',
    description: 'The server has received the request headers and the client should proceed to send the request body.',
    usage: 'Used when the client wants to send a large body and checks first if the server will accept it.',
  },
  {
    code: 101,
    name: 'Switching Protocols',
    category: '1xx',
    description: 'The server agrees to switch protocols as requested by the client.',
    usage: 'Used when upgrading from HTTP/1.1 to WebSocket or HTTP/2.',
  },
  {
    code: 102,
    name: 'Processing',
    category: '1xx',
    description: 'The server has received and is processing the request, but no response is available yet.',
    usage: 'Used by WebDAV to prevent client timeout on long-running operations.',
  },
  {
    code: 103,
    name: 'Early Hints',
    category: '1xx',
    description: 'Used to return some response headers before final HTTP message.',
    usage: 'Allows browsers to preload resources while the server prepares the full response.',
  },

  // 2xx Success
  {
    code: 200,
    name: 'OK',
    category: '2xx',
    description: 'The request succeeded. The response body contains the requested resource.',
    usage: 'Standard success response for GET, POST, PUT, PATCH requests.',
  },
  {
    code: 201,
    name: 'Created',
    category: '2xx',
    description: 'The request succeeded and a new resource was created as a result.',
    usage: 'Returned after a successful POST that creates a new resource. Location header typically points to new resource.',
  },
  {
    code: 202,
    name: 'Accepted',
    category: '2xx',
    description: 'The request has been accepted for processing, but the processing has not been completed.',
    usage: 'Used for async operations where processing happens in the background.',
  },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    category: '2xx',
    description: 'The server successfully processed the request, but is returning information from a third-party source.',
    usage: 'Used by proxies or CDNs that return cached or transformed content.',
  },
  {
    code: 204,
    name: 'No Content',
    category: '2xx',
    description: 'The server successfully processed the request and is not returning any content.',
    usage: 'Used for DELETE requests or PUT/PATCH updates that do not return a body.',
  },
  {
    code: 205,
    name: 'Reset Content',
    category: '2xx',
    description: 'The server successfully processed the request, tells the client to reset the document view.',
    usage: 'After submitting a form, instructs the client to clear the input fields.',
  },
  {
    code: 206,
    name: 'Partial Content',
    category: '2xx',
    description: 'The server is delivering only part of the resource due to a range header in the request.',
    usage: 'Used for resumable downloads, video streaming, and paginated responses.',
  },
  {
    code: 207,
    name: 'Multi-Status',
    category: '2xx',
    description: 'Multiple statuses may apply — the response body is an XML message containing multiple response codes.',
    usage: 'Used by WebDAV for operations that may succeed or fail individually on multiple resources.',
  },
  {
    code: 208,
    name: 'Already Reported',
    category: '2xx',
    description: 'The members of a DAV binding have already been enumerated in a previous response.',
    usage: 'Used in WebDAV to avoid enumerating the same bindings multiple times.',
  },
  {
    code: 226,
    name: 'IM Used',
    category: '2xx',
    description: 'The server has fulfilled a GET request for the resource, and the response represents the result of applying delta encoding.',
    usage: 'Used with HTTP Delta encoding (RFC 3229) to send incremental updates.',
  },

  // 3xx Redirection
  {
    code: 300,
    name: 'Multiple Choices',
    category: '3xx',
    description: 'The request has more than one possible response. The client should choose one.',
    usage: 'Content negotiation — multiple representations are available for the resource.',
  },
  {
    code: 301,
    name: 'Moved Permanently',
    category: '3xx',
    description: 'The URL of the requested resource has been changed permanently.',
    usage: 'SEO-safe permanent redirect. Browsers cache this redirect indefinitely.',
  },
  {
    code: 302,
    name: 'Found',
    category: '3xx',
    description: 'The URI of requested resource has been changed temporarily.',
    usage: 'Temporary redirect, e.g. during maintenance or A/B testing.',
  },
  {
    code: 303,
    name: 'See Other',
    category: '3xx',
    description: 'The server sent this response to direct the client to get the requested resource at another URI with a GET request.',
    usage: 'Post/Redirect/Get pattern — after a POST, redirect to a GET URL to prevent form resubmission.',
  },
  {
    code: 304,
    name: 'Not Modified',
    category: '3xx',
    description: 'The response has not been modified since the last request.',
    usage: 'Caching — client can use the cached version. Response to conditional GET with If-None-Match or If-Modified-Since.',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    category: '3xx',
    description: 'The client should repeat the request using the same method and body at another URI.',
    usage: 'Like 302 but guarantees method is not changed to GET. Use for non-GET temporary redirects.',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    category: '3xx',
    description: 'The resource is now permanently located at another URI. The method and body should not change.',
    usage: 'Like 301 but guarantees method is not changed. Use for permanent non-GET redirects.',
  },

  // 4xx Client Errors
  {
    code: 400,
    name: 'Bad Request',
    category: '4xx',
    description: 'The server cannot process the request due to malformed syntax or invalid request message framing.',
    usage: 'Invalid JSON body, missing required fields, or constraint violations.',
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: '4xx',
    description: 'The request requires user authentication. The client must authenticate itself to get the requested response.',
    usage: 'Missing or invalid authentication credentials (token, API key, session).',
  },
  {
    code: 402,
    name: 'Payment Required',
    category: '4xx',
    description: 'Reserved for future use. Originally intended for digital payment systems.',
    usage: 'Used by some APIs to indicate a paid plan is required to access a feature.',
  },
  {
    code: 403,
    name: 'Forbidden',
    category: '4xx',
    description: 'The client does not have access rights to the content. The server knows who the client is but refuses access.',
    usage: 'Authenticated but not authorized. The user lacks the required permissions.',
  },
  {
    code: 404,
    name: 'Not Found',
    category: '4xx',
    description: 'The server cannot find the requested resource. The URL is not recognized.',
    usage: 'Resource does not exist, or deliberately hidden for security (instead of 403).',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    category: '4xx',
    description: 'The request method is known by the server but is not supported for the target resource.',
    usage: 'e.g. sending DELETE to a read-only endpoint. Response includes an Allow header.',
  },
  {
    code: 406,
    name: 'Not Acceptable',
    category: '4xx',
    description: 'The server cannot produce a response matching the Accept headers sent in the request.',
    usage: 'Content negotiation failure — server cannot return the requested format (XML, JSON, etc.).',
  },
  {
    code: 407,
    name: 'Proxy Authentication Required',
    category: '4xx',
    description: 'Authentication must be done by a proxy. Similar to 401 but authentication is done by a proxy.',
    usage: 'Corporate proxy requires credentials before allowing outbound requests.',
  },
  {
    code: 408,
    name: 'Request Timeout',
    category: '4xx',
    description: 'The server did not receive a complete request within the time it was prepared to wait.',
    usage: 'Slow client or network. The connection may be reused for further requests.',
  },
  {
    code: 409,
    name: 'Conflict',
    category: '4xx',
    description: 'The request conflicts with the current state of the server.',
    usage: 'Duplicate resource creation, version conflicts, or concurrent modification issues.',
  },
  {
    code: 410,
    name: 'Gone',
    category: '4xx',
    description: 'The requested resource is no longer available and will not be available again.',
    usage: 'Permanently deleted resources. More definitive than 404 for content removal.',
  },
  {
    code: 411,
    name: 'Length Required',
    category: '4xx',
    description: 'The server refused the request because the Content-Length header field is not defined.',
    usage: 'Server requires a Content-Length header in the request.',
  },
  {
    code: 412,
    name: 'Precondition Failed',
    category: '4xx',
    description: 'One or more conditions in the request header fields evaluated to false.',
    usage: 'Optimistic concurrency control — If-Match or If-Unmodified-Since conditions failed.',
  },
  {
    code: 413,
    name: 'Content Too Large',
    category: '4xx',
    description: 'The request body is larger than the server is willing or able to process.',
    usage: 'File upload exceeds server limit. May include Retry-After for temporary limits.',
  },
  {
    code: 414,
    name: 'URI Too Long',
    category: '4xx',
    description: 'The URI requested by the client is longer than the server is willing to interpret.',
    usage: 'Overly long query strings, often from GET-based form submissions.',
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    category: '4xx',
    description: 'The media format of the requested data is not supported by the server.',
    usage: 'Wrong Content-Type header, e.g. sending XML to an endpoint that only accepts JSON.',
  },
  {
    code: 416,
    name: 'Range Not Satisfiable',
    category: '4xx',
    description: 'The range specified in the Range header cannot be fulfilled.',
    usage: 'The requested byte range is outside the bounds of the file.',
  },
  {
    code: 417,
    name: 'Expectation Failed',
    category: '4xx',
    description: 'The expectation indicated by the Expect request header cannot be met by the server.',
    usage: 'Server cannot meet requirements specified in the Expect: 100-continue header.',
  },
  {
    code: 418,
    name: "I'm a teapot",
    category: '4xx',
    description: 'The server refuses to brew coffee because it is, permanently, a teapot.',
    usage: "An April Fools' joke from RFC 2324 (Hyper Text Coffee Pot Control Protocol). Used as an Easter egg.",
  },
  {
    code: 421,
    name: 'Misdirected Request',
    category: '4xx',
    description: 'The request was directed at a server that is not able to produce a response.',
    usage: 'HTTP/2 connection reuse — client sent request to a server that cannot handle that origin.',
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    category: '4xx',
    description: 'The request was well-formed but contained semantic errors that prevent processing.',
    usage: 'Validation errors (e.g., field constraints). Common in REST APIs.',
  },
  {
    code: 423,
    name: 'Locked',
    category: '4xx',
    description: 'The resource that is being accessed is locked.',
    usage: 'WebDAV — resource is locked and cannot be modified.',
  },
  {
    code: 424,
    name: 'Failed Dependency',
    category: '4xx',
    description: 'The request failed because it depended on another request and that request failed.',
    usage: 'WebDAV — a previous operation in a batch failed, causing this one to fail too.',
  },
  {
    code: 425,
    name: 'Too Early',
    category: '4xx',
    description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.',
    usage: 'TLS 1.3 early data (0-RTT) — server refuses to act on potentially replayed data.',
  },
  {
    code: 426,
    name: 'Upgrade Required',
    category: '4xx',
    description: 'The server refuses to perform the request using the current protocol.',
    usage: 'Server requires HTTPS or a newer protocol version.',
  },
  {
    code: 428,
    name: 'Precondition Required',
    category: '4xx',
    description: 'The origin server requires the request to be conditional.',
    usage: 'Prevents lost-update problems — client must send an If-Match header.',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: '4xx',
    description: 'The user has sent too many requests in a given amount of time (rate limiting).',
    usage: 'API rate limiting. Response often includes Retry-After header.',
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    category: '4xx',
    description: 'The server is unwilling to process the request because its header fields are too large.',
    usage: 'Overly large cookies or authorization headers.',
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    category: '4xx',
    description: 'The user requested a resource that cannot legally be provided.',
    usage: 'GDPR compliance, DMCA takedowns, government-ordered content blocking.',
  },

  // 5xx Server Errors
  {
    code: 500,
    name: 'Internal Server Error',
    category: '5xx',
    description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    usage: 'Unhandled exception or crash on the server. A generic catch-all error.',
  },
  {
    code: 501,
    name: 'Not Implemented',
    category: '5xx',
    description: 'The server does not support the functionality required to fulfill the request.',
    usage: 'The HTTP method is not recognized or not supported by the server.',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: '5xx',
    description: 'The server received an invalid response from an upstream server while acting as a gateway.',
    usage: 'Reverse proxy received a bad response from the origin/backend server.',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: '5xx',
    description: 'The server is not ready to handle the request, usually due to maintenance or overload.',
    usage: 'Server maintenance, capacity limits, or health checks failing.',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: '5xx',
    description: 'The gateway server did not receive a timely response from an upstream server.',
    usage: 'Backend server took too long to respond. Common with slow database queries.',
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    category: '5xx',
    description: 'The HTTP version used in the request is not supported by the server.',
    usage: 'Client uses HTTP/3 but server only supports HTTP/1.1.',
  },
  {
    code: 506,
    name: 'Variant Also Negotiates',
    category: '5xx',
    description: 'Transparent content negotiation for the request results in a circular reference.',
    usage: 'Server configuration error in content negotiation.',
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    category: '5xx',
    description: 'The server is unable to store the representation needed to complete the request.',
    usage: 'WebDAV — disk quota exceeded or storage full on the server.',
  },
  {
    code: 508,
    name: 'Loop Detected',
    category: '5xx',
    description: 'The server detected an infinite loop while processing the request.',
    usage: 'WebDAV — cycle found in the resource graph during PROPFIND.',
  },
  {
    code: 510,
    name: 'Not Extended',
    category: '5xx',
    description: 'Further extensions to the request are required for the server to fulfill it.',
    usage: 'Client must attach a supported extension to proceed.',
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    category: '5xx',
    description: 'The client needs to authenticate to gain network access.',
    usage: 'Captive portals (hotel/airport Wi-Fi) that require login before internet access.',
  },
]

/**
 * Get all HTTP status codes
 */
export function getAllStatusCodes(): HttpStatusCode[] {
  return HTTP_STATUS_CODES
}

/**
 * Look up a status code by its numeric value
 */
export function getStatusByCode(code: number): HttpStatusCode | undefined {
  return HTTP_STATUS_CODES.find((s) => s.code === code)
}

/**
 * Search status codes by code number, name, description, or usage
 */
export function searchStatusCodes(query: string): HttpStatusCode[] {
  const q = query.trim().toLowerCase()
  if (!q) return HTTP_STATUS_CODES
  return HTTP_STATUS_CODES.filter(
    (s) =>
      s.code.toString().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.usage.toLowerCase().includes(q),
  )
}

/**
 * Filter status codes by category
 */
export function filterByCategory(category: HttpStatusCategory | 'all'): HttpStatusCode[] {
  if (category === 'all') return HTTP_STATUS_CODES
  return HTTP_STATUS_CODES.filter((s) => s.category === category)
}

/**
 * Get the human-readable category label
 */
export function getCategoryLabel(category: HttpStatusCategory): string {
  const labels: Record<HttpStatusCategory, string> = {
    '1xx': '1xx Informational',
    '2xx': '2xx Success',
    '3xx': '3xx Redirection',
    '4xx': '4xx Client Error',
    '5xx': '5xx Server Error',
  }
  return labels[category]
}

/**
 * Get the CSS class name for a category
 */
export function getCategoryClass(category: HttpStatusCategory): string {
  const classes: Record<HttpStatusCategory, string> = {
    '1xx': 'http-cat-1xx',
    '2xx': 'http-cat-2xx',
    '3xx': 'http-cat-3xx',
    '4xx': 'http-cat-4xx',
    '5xx': 'http-cat-5xx',
  }
  return classes[category]
}

/**
 * Determine the category of a numeric HTTP status code
 */
export function getCategoryFromCode(code: number): HttpStatusCategory | null {
  if (code >= 100 && code < 200) return '1xx'
  if (code >= 200 && code < 300) return '2xx'
  if (code >= 300 && code < 400) return '3xx'
  if (code >= 400 && code < 500) return '4xx'
  if (code >= 500 && code < 600) return '5xx'
  return null
}
