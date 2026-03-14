export type HttpStatusCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

export interface HttpStatusCode {
  code: number
  name: string
  category: HttpStatusCategory
  description: string
  detail: string
}

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx Informational
  {
    code: 100,
    name: 'Continue',
    category: '1xx',
    description: 'The server has received the request headers and the client should proceed.',
    detail: 'Used with Expect: 100-continue header to confirm the server is willing to accept the request body before the client sends it.',
  },
  {
    code: 101,
    name: 'Switching Protocols',
    category: '1xx',
    description: 'The server is switching to the protocol specified in the Upgrade header.',
    detail: 'Commonly used when upgrading an HTTP connection to WebSocket (ws://).',
  },
  {
    code: 102,
    name: 'Processing',
    category: '1xx',
    description: 'The server has received and is processing the request, but no response is available yet.',
    detail: 'Defined in WebDAV (RFC 2518). Prevents the client from timing out on long-running operations.',
  },
  {
    code: 103,
    name: 'Early Hints',
    category: '1xx',
    description: 'Allows the server to send preliminary response headers before the final response.',
    detail: 'Used to preload resources (Link headers) while the server prepares the full response, improving performance.',
  },

  // 2xx Success
  {
    code: 200,
    name: 'OK',
    category: '2xx',
    description: 'The request was successful.',
    detail: 'The standard success response. The response body contains the requested resource for GET, or the result of an action for POST/PUT.',
  },
  {
    code: 201,
    name: 'Created',
    category: '2xx',
    description: 'The request succeeded and a new resource was created.',
    detail: 'Returned after a successful POST or PUT that creates a resource. The Location header typically points to the new resource.',
  },
  {
    code: 202,
    name: 'Accepted',
    category: '2xx',
    description: 'The request has been accepted but processing is not yet complete.',
    detail: 'Used for asynchronous operations — the request is queued and will be processed later. No guarantee of the final outcome.',
  },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    category: '2xx',
    description: 'The returned metadata is from a local or third-party copy, not the origin server.',
    detail: 'Allows a proxy to annotate or transform the response. Rarely used in modern APIs.',
  },
  {
    code: 204,
    name: 'No Content',
    category: '2xx',
    description: 'The request succeeded but there is no content to return.',
    detail: 'Common for DELETE requests or PUT updates where no response body is needed. The client should not navigate away from the current page.',
  },
  {
    code: 205,
    name: 'Reset Content',
    category: '2xx',
    description: 'The request succeeded; the client should reset the view.',
    detail: 'Instructs the client to reset the document that sent the request, e.g., clear a form after submission.',
  },
  {
    code: 206,
    name: 'Partial Content',
    category: '2xx',
    description: 'The server is delivering only part of the resource due to a Range header.',
    detail: 'Used for resumable downloads and streaming media. The Content-Range header indicates which portion is returned.',
  },
  {
    code: 207,
    name: 'Multi-Status',
    category: '2xx',
    description: 'Multiple status codes for multiple independent operations.',
    detail: 'Defined in WebDAV (RFC 4918). The response body contains an XML document describing each sub-operation result.',
  },
  {
    code: 208,
    name: 'Already Reported',
    category: '2xx',
    description: 'Members of a DAV binding have already been enumerated in a previous 207 response.',
    detail: 'Defined in WebDAV (RFC 5842). Avoids repeated enumeration of the same resource in a multi-status response.',
  },
  {
    code: 226,
    name: 'IM Used',
    category: '2xx',
    description: 'The server has fulfilled a GET request using delta encoding.',
    detail: 'Defined in RFC 3229 (HTTP Delta Encoding). The response is a representation of the result of one or more instance-manipulations applied to the current instance.',
  },

  // 3xx Redirection
  {
    code: 300,
    name: 'Multiple Choices',
    category: '3xx',
    description: 'Multiple options for the resource from which the client may choose.',
    detail: 'Used when a resource exists in multiple representations (e.g., different languages or formats). The server may suggest a preferred choice via Location.',
  },
  {
    code: 301,
    name: 'Moved Permanently',
    category: '3xx',
    description: 'The resource has permanently moved to a new URL.',
    detail: 'Browsers cache this redirect. Search engines transfer link equity to the new URL. The method may change to GET on subsequent redirects.',
  },
  {
    code: 302,
    name: 'Found',
    category: '3xx',
    description: 'The resource is temporarily located at a different URL.',
    detail: 'Historically called "Moved Temporarily." Clients should not cache this. The method may change to GET on redirect, which is why 307 and 308 were introduced.',
  },
  {
    code: 303,
    name: 'See Other',
    category: '3xx',
    description: 'The response to the request can be found at another URL using GET.',
    detail: 'Typically used after a POST to redirect to a confirmation page, implementing the Post/Redirect/Get (PRG) pattern.',
  },
  {
    code: 304,
    name: 'Not Modified',
    category: '3xx',
    description: 'The cached version of the resource is still valid.',
    detail: 'Returned when the client sends a conditional GET (If-Modified-Since or If-None-Match) and the resource has not changed. No body is returned.',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    category: '3xx',
    description: 'The resource is temporarily at a different URL; the method must not change.',
    detail: 'Similar to 302 but guarantees the request method (e.g., POST) is preserved on redirect. Clients should not cache this.',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    category: '3xx',
    description: 'The resource has permanently moved; the method must not change.',
    detail: 'Similar to 301 but guarantees the request method is preserved. Clients and search engines should update their links.',
  },

  // 4xx Client Errors
  {
    code: 400,
    name: 'Bad Request',
    category: '4xx',
    description: 'The server cannot process the request due to a client error.',
    detail: 'Generic error for malformed syntax, invalid parameters, deceptive routing, or otherwise bad input from the client.',
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: '4xx',
    description: 'Authentication is required and has failed or has not yet been provided.',
    detail: 'The response must include a WWW-Authenticate header. Note: the name is misleading — it actually means "unauthenticated."',
  },
  {
    code: 402,
    name: 'Payment Required',
    category: '4xx',
    description: 'Reserved for future use — intended for digital payment systems.',
    detail: 'Originally reserved for micropayment systems. Now used by some APIs to indicate a subscription or quota limit has been reached.',
  },
  {
    code: 403,
    name: 'Forbidden',
    category: '4xx',
    description: 'The client is authenticated but does not have permission to access the resource.',
    detail: 'Unlike 401, re-authenticating will not help. The server understood the request but refuses to authorize it.',
  },
  {
    code: 404,
    name: 'Not Found',
    category: '4xx',
    description: 'The server cannot find the requested resource.',
    detail: 'The most famous HTTP error code. The resource may have been removed, may never have existed, or is being hidden from unauthorized users.',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    category: '4xx',
    description: 'The HTTP method is not allowed for the requested resource.',
    detail: 'The server must include an Allow header listing the supported methods (e.g., Allow: GET, POST).',
  },
  {
    code: 406,
    name: 'Not Acceptable',
    category: '4xx',
    description: 'The resource cannot be returned in a format acceptable to the client.',
    detail: 'Returned when content negotiation via Accept headers fails. The server cannot produce a response matching the Accept criteria.',
  },
  {
    code: 407,
    name: 'Proxy Authentication Required',
    category: '4xx',
    description: 'Authentication is required with the proxy server.',
    detail: 'Similar to 401 but for proxies. The Proxy-Authenticate header must specify how to authenticate.',
  },
  {
    code: 408,
    name: 'Request Timeout',
    category: '4xx',
    description: 'The server timed out waiting for the request.',
    detail: 'The client did not send a complete request within the server\'s timeout period. The client may resubmit the request.',
  },
  {
    code: 409,
    name: 'Conflict',
    category: '4xx',
    description: 'The request conflicts with the current state of the resource.',
    detail: 'Common in scenarios like version conflicts during edits or duplicate resource creation. The response body should explain the conflict.',
  },
  {
    code: 410,
    name: 'Gone',
    category: '4xx',
    description: 'The resource is no longer available and will not return.',
    detail: 'Like 404, but signals that the removal was intentional and permanent. Search engines should deindex the URL.',
  },
  {
    code: 411,
    name: 'Length Required',
    category: '4xx',
    description: 'The server requires a Content-Length header for the request.',
    detail: 'The client must send the Content-Length header before the server will accept the request body.',
  },
  {
    code: 412,
    name: 'Precondition Failed',
    category: '4xx',
    description: 'A precondition in the request headers was not met.',
    detail: 'Returned when conditional request headers (If-Match, If-None-Match, If-Unmodified-Since) evaluate to false.',
  },
  {
    code: 413,
    name: 'Content Too Large',
    category: '4xx',
    description: 'The request body exceeds the limit the server is willing to process.',
    detail: 'Formerly called "Payload Too Large." The server may include a Retry-After header if the condition is temporary.',
  },
  {
    code: 414,
    name: 'URI Too Long',
    category: '4xx',
    description: 'The URI provided was too long for the server to process.',
    detail: 'Common when a GET request encodes too much data in the URL. Consider moving data to the request body using POST.',
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    category: '4xx',
    description: 'The media type of the request body is not supported.',
    detail: 'The server refuses to accept the request because the content format (indicated by Content-Type or Content-Encoding) is not supported.',
  },
  {
    code: 416,
    name: 'Range Not Satisfiable',
    category: '4xx',
    description: 'The range specified by the Range header cannot be fulfilled.',
    detail: 'The client asked for a byte range that is outside the bounds of the resource. The Content-Range header should indicate the actual size.',
  },
  {
    code: 417,
    name: 'Expectation Failed',
    category: '4xx',
    description: 'The expectation in the Expect header cannot be met by the server.',
    detail: 'The server cannot fulfill the requirements of the Expect request-header field.',
  },
  {
    code: 418,
    name: "I'm a Teapot",
    category: '4xx',
    description: 'The server refuses to brew coffee because it is a teapot.',
    detail: 'An April Fools\' joke from RFC 2324 (Hyper Text Coffee Pot Control Protocol, 1998). Some servers return this for clearly invalid requests.',
  },
  {
    code: 421,
    name: 'Misdirected Request',
    category: '4xx',
    description: 'The request was directed at a server unable to produce a response.',
    detail: 'May occur with HTTP/2 connection reuse when the server cannot handle the request for the target URI.',
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    category: '4xx',
    description: 'The request was well-formed but contains semantic errors.',
    detail: 'The request body is syntactically correct but fails validation (e.g., a JSON body with missing required fields). Common in REST APIs.',
  },
  {
    code: 423,
    name: 'Locked',
    category: '4xx',
    description: 'The resource is locked.',
    detail: 'Defined in WebDAV (RFC 4918). The source or destination resource has a lock that prevents the requested operation.',
  },
  {
    code: 424,
    name: 'Failed Dependency',
    category: '4xx',
    description: 'The request failed because it depended on another request that failed.',
    detail: 'Defined in WebDAV (RFC 4918). Used in batch operations where a subsequent action cannot be executed because a prior action in the batch failed.',
  },
  {
    code: 425,
    name: 'Too Early',
    category: '4xx',
    description: 'The server is unwilling to process a request that might be replayed.',
    detail: 'Defined in RFC 8470 to prevent replay attacks on early TLS data (0-RTT data).',
  },
  {
    code: 426,
    name: 'Upgrade Required',
    category: '4xx',
    description: 'The client should switch to a different protocol.',
    detail: 'The server refuses to perform the request using the current protocol but will do so after a protocol upgrade, indicated via the Upgrade header.',
  },
  {
    code: 428,
    name: 'Precondition Required',
    category: '4xx',
    description: 'The server requires the request to be conditional.',
    detail: 'Defined in RFC 6585. Prevents the "lost update" problem by requiring the client to use conditional headers like If-Match.',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: '4xx',
    description: 'The client has sent too many requests in a given amount of time.',
    detail: 'Used for rate limiting. The response should include a Retry-After header indicating when the client can try again.',
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    category: '4xx',
    description: 'The server is unwilling to process the request because its header fields are too large.',
    detail: 'Defined in RFC 6585. Can indicate a single header is too large or that the total size of all headers exceeds the limit.',
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    category: '4xx',
    description: 'The resource is unavailable due to a legal demand.',
    detail: 'Named after the Ray Bradbury novel Fahrenheit 451. Used when content is censored or restricted by government or legal order.',
  },

  // 5xx Server Errors
  {
    code: 500,
    name: 'Internal Server Error',
    category: '5xx',
    description: 'The server encountered an unexpected condition preventing it from fulfilling the request.',
    detail: 'The generic catch-all for server-side errors. The error is in the server, not the client. Check server logs for details.',
  },
  {
    code: 501,
    name: 'Not Implemented',
    category: '5xx',
    description: 'The server does not support the functionality required to fulfill the request.',
    detail: 'The request method is not recognized or the server lacks the ability to fulfill it. Unlike 405, the method may not be supported by any resource.',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: '5xx',
    description: 'The server received an invalid response from an upstream server.',
    detail: 'Occurs when a gateway or proxy receives a malformed response from the upstream server. Often a temporary infrastructure issue.',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: '5xx',
    description: 'The server is temporarily unable to handle the request.',
    detail: 'Typically due to maintenance or overloading. The Retry-After header can indicate when the service will be available again.',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: '5xx',
    description: 'The server, acting as a gateway, did not receive a timely response from an upstream server.',
    detail: 'Similar to 408 but for server-to-server communication. Indicates a timeout in the infrastructure chain.',
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    category: '5xx',
    description: 'The HTTP version used in the request is not supported.',
    detail: 'The server does not support, or refuses to support, the major HTTP version used in the request.',
  },
  {
    code: 506,
    name: 'Variant Also Negotiates',
    category: '5xx',
    description: 'Transparent content negotiation for the request results in a circular reference.',
    detail: 'Defined in RFC 2295. Indicates a misconfiguration in the server\'s transparent content negotiation configuration.',
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    category: '5xx',
    description: 'The server is unable to store the representation needed to complete the request.',
    detail: 'Defined in WebDAV (RFC 4918). The server has insufficient storage to complete the request.',
  },
  {
    code: 508,
    name: 'Loop Detected',
    category: '5xx',
    description: 'The server detected an infinite loop while processing the request.',
    detail: 'Defined in WebDAV (RFC 5842). Used when the server terminates an operation to avoid an infinite loop.',
  },
  {
    code: 510,
    name: 'Not Extended',
    category: '5xx',
    description: 'Further extensions to the request are required for the server to fulfil it.',
    detail: 'Defined in RFC 2774. The server requires additional request extensions that were not included.',
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    category: '5xx',
    description: 'The client needs to authenticate to gain network access.',
    detail: 'Defined in RFC 6585. Typically generated by captive portals (e.g., hotel Wi-Fi login pages). Not meant for use by origin servers.',
  },
]

export function searchStatusCodes(query: string): HttpStatusCode[] {
  const q = query.trim().toLowerCase()
  if (!q) return HTTP_STATUS_CODES
  return HTTP_STATUS_CODES.filter(
    (s) =>
      String(s.code).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.includes(q),
  )
}

export function filterByCategory(category: HttpStatusCategory | 'all'): HttpStatusCode[] {
  if (category === 'all') return HTTP_STATUS_CODES
  return HTTP_STATUS_CODES.filter((s) => s.category === category)
}

export function getStatusCode(code: number): HttpStatusCode | undefined {
  return HTTP_STATUS_CODES.find((s) => s.code === code)
}

export function getCategories(): HttpStatusCategory[] {
  return ['1xx', '2xx', '3xx', '4xx', '5xx']
}

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

export function getCategoryColor(category: HttpStatusCategory): string {
  const colors: Record<HttpStatusCategory, string> = {
    '1xx': '#6c757d',
    '2xx': '#28a745',
    '3xx': '#007bff',
    '4xx': '#fd7e14',
    '5xx': '#dc3545',
  }
  return colors[category]
}
