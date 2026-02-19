/**
 * Interactive Code Snippet Library System
 * Provides a searchable, categorized collection of code snippets across multiple languages
 */

export interface CodeSnippet {
  id: string
  title: string
  description: string
  language: string
  category: string
  tags: string[]
  code: string
  author?: string
  dateAdded: string
  usageCount: number
}

export interface SnippetFilters {
  language?: string
  category?: string
  tag?: string
  searchTerm?: string
}

export interface SnippetStats {
  totalSnippets: number
  languageBreakdown: Record<string, number>
  categoryBreakdown: Record<string, number>
  topTags: Array<{ tag: string; count: number }>
}

const SNIPPET_STORAGE_KEY = 'chimera-snippet-library'

// Pre-loaded snippet collection covering common use cases
const defaultSnippets: CodeSnippet[] = [
  {
    id: 'js-fetch-api',
    title: 'Fetch API with Error Handling',
    description: 'Modern async/await pattern for making HTTP requests with comprehensive error handling',
    language: 'JavaScript',
    category: 'API & HTTP',
    tags: ['fetch', 'async', 'error-handling', 'http'],
    code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: error.message };
  }
}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'ts-debounce',
    title: 'TypeScript Debounce Function',
    description: 'Generic debounce utility with proper typing for delaying function execution',
    language: 'TypeScript',
    category: 'Utilities',
    tags: ['debounce', 'performance', 'optimization', 'timing'],
    code: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'py-decorator',
    title: 'Python Timing Decorator',
    description: 'Decorator to measure and log function execution time',
    language: 'Python',
    category: 'Decorators',
    tags: ['decorator', 'timing', 'performance', 'logging'],
    code: `import time
from functools import wraps

def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time:.4f} seconds")
        return result
    return wrapper

@timing_decorator
def slow_function():
    time.sleep(1)
    return "Done"`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'js-local-storage',
    title: 'localStorage Helper with JSON',
    description: 'Type-safe localStorage wrapper with automatic JSON serialization',
    language: 'JavaScript',
    category: 'Storage',
    tags: ['localStorage', 'storage', 'json', 'helper'],
    code: `const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Retrieval error:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'ts-deep-clone',
    title: 'Deep Clone Object',
    description: 'Recursively clone objects including nested structures',
    language: 'TypeScript',
    category: 'Data Manipulation',
    tags: ['clone', 'deep-copy', 'objects', 'recursion'],
    code: `function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'py-context-manager',
    title: 'Custom Context Manager',
    description: 'Python context manager for resource management with cleanup',
    language: 'Python',
    category: 'Context Managers',
    tags: ['context-manager', 'resource-management', 'cleanup', 'with'],
    code: `class DatabaseConnection:
    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = None
    
    def __enter__(self):
        print(f"Opening connection to {self.db_name}")
        self.connection = f"Connected to {self.db_name}"
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing connection to {self.db_name}")
        self.connection = None
        return False

# Usage
with DatabaseConnection('mydb') as conn:
    print(f"Using: {conn}")`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'js-array-unique',
    title: 'Remove Duplicates from Array',
    description: 'Multiple methods to remove duplicate values from arrays',
    language: 'JavaScript',
    category: 'Arrays',
    tags: ['array', 'unique', 'duplicates', 'set'],
    code: `// Method 1: Using Set (primitive values)
const uniqueArray1 = [...new Set([1, 2, 2, 3, 4, 4, 5])];

// Method 2: Using filter with indexOf
const uniqueArray2 = arr.filter((value, index, self) => 
  self.indexOf(value) === index
);

// Method 3: For objects (by property)
const uniqueObjects = arr.filter((obj, index, self) =>
  index === self.findIndex(o => o.id === obj.id)
);`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'ts-type-guards',
    title: 'TypeScript Type Guards',
    description: 'Custom type guards for runtime type checking',
    language: 'TypeScript',
    category: 'Type System',
    tags: ['type-guards', 'types', 'runtime', 'validation'],
    code: `interface User {
  id: number;
  name: string;
}

interface Admin {
  id: number;
  name: string;
  permissions: string[];
}

function isAdmin(user: User | Admin): user is Admin {
  return 'permissions' in user;
}

function handleUser(user: User | Admin) {
  if (isAdmin(user)) {
    // TypeScript knows user is Admin here
    console.log(user.permissions);
  } else {
    // TypeScript knows user is User here
    console.log(user.name);
  }
}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'py-list-comprehension',
    title: 'Python List Comprehension Patterns',
    description: 'Common list comprehension patterns for data transformation',
    language: 'Python',
    category: 'Data Manipulation',
    tags: ['list-comprehension', 'filter', 'map', 'transform'],
    code: `# Basic transformation
squares = [x**2 for x in range(10)]

# With condition (filter)
evens = [x for x in range(20) if x % 2 == 0]

# Nested comprehension (flatten)
matrix = [[1, 2], [3, 4], [5, 6]]
flat = [num for row in matrix for num in row]

# Dictionary comprehension
squared_dict = {x: x**2 for x in range(5)}

# Set comprehension
unique_lengths = {len(word) for word in ['apple', 'banana', 'cherry']}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'js-promise-all',
    title: 'Promise.all with Error Handling',
    description: 'Run multiple async operations concurrently with proper error handling',
    language: 'JavaScript',
    category: 'Async/Promises',
    tags: ['promise', 'async', 'concurrent', 'error-handling'],
    code: `async function fetchMultiple(urls) {
  try {
    const promises = urls.map(url => 
      fetch(url).then(res => res.json())
    );
    
    const results = await Promise.all(promises);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// With Promise.allSettled for partial failures
async function fetchMultipleSettled(urls) {
  const promises = urls.map(url => 
    fetch(url).then(res => res.json())
  );
  
  const results = await Promise.allSettled(promises);
  
  const successes = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
    
  const failures = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
    
  return { successes, failures };
}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'ts-enum-patterns',
    title: 'TypeScript Enum Patterns',
    description: 'Best practices for using enums in TypeScript',
    language: 'TypeScript',
    category: 'Type System',
    tags: ['enum', 'constants', 'types', 'patterns'],
    code: `// Numeric enum
enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3
}

// String enum (recommended)
enum Status {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Failed = 'FAILED'
}

// Const enum (zero runtime cost)
const enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

// Using enums
function logMessage(level: LogLevel, message: string) {
  console.log(\`[\${LogLevel[level]}] \${message}\`);
}`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
  {
    id: 'py-generator',
    title: 'Python Generator Function',
    description: 'Memory-efficient iteration using generators',
    language: 'Python',
    category: 'Generators',
    tags: ['generator', 'yield', 'memory', 'iteration'],
    code: `def fibonacci_generator(n):
    """Generate Fibonacci numbers up to n terms"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Usage
for num in fibonacci_generator(10):
    print(num)

# Generator expression
squares_gen = (x**2 for x in range(1000000))  # Memory efficient

# Infinite generator
def count_up(start=0):
    num = start
    while True:
        yield num
        num += 1`,
    author: 'Chimera',
    dateAdded: '2026-02-19',
    usageCount: 0,
  },
]

/**
 * Load all snippets from localStorage or defaults
 */
export function loadSnippets(): CodeSnippet[] {
  try {
    const stored = localStorage.getItem(SNIPPET_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load snippets:', error)
  }
  
  // Initialize with defaults
  saveSnippets(defaultSnippets)
  return defaultSnippets
}

/**
 * Save snippets to localStorage
 */
export function saveSnippets(snippets: CodeSnippet[]): void {
  try {
    localStorage.setItem(SNIPPET_STORAGE_KEY, JSON.stringify(snippets))
  } catch (error) {
    console.error('Failed to save snippets:', error)
  }
}

/**
 * Get all unique languages
 */
export function getLanguages(snippets: CodeSnippet[]): string[] {
  const languages = new Set(snippets.map(s => s.language))
  return Array.from(languages).sort()
}

/**
 * Get all unique categories
 */
export function getCategories(snippets: CodeSnippet[]): string[] {
  const categories = new Set(snippets.map(s => s.category))
  return Array.from(categories).sort()
}

/**
 * Get all unique tags with counts
 */
export function getAllTags(snippets: CodeSnippet[]): Array<{ tag: string; count: number }> {
  const tagCounts: Record<string, number> = {}
  
  snippets.forEach(snippet => {
    snippet.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Filter snippets based on criteria
 */
export function filterSnippets(snippets: CodeSnippet[], filters: SnippetFilters): CodeSnippet[] {
  return snippets.filter(snippet => {
    // Language filter
    if (filters.language && snippet.language !== filters.language) {
      return false
    }
    
    // Category filter
    if (filters.category && snippet.category !== filters.category) {
      return false
    }
    
    // Tag filter
    if (filters.tag && !snippet.tags.includes(filters.tag)) {
      return false
    }
    
    // Search term filter (searches title, description, and code)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      const searchableText = [
        snippet.title,
        snippet.description,
        snippet.code,
        ...snippet.tags,
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(term)) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Get snippet by ID
 */
export function getSnippetById(snippets: CodeSnippet[], id: string): CodeSnippet | null {
  return snippets.find(s => s.id === id) || null
}

/**
 * Increment usage count for a snippet
 */
export function incrementUsageCount(snippetId: string): void {
  const snippets = loadSnippets()
  const snippet = snippets.find(s => s.id === snippetId)
  
  if (snippet) {
    snippet.usageCount++
    saveSnippets(snippets)
  }
}

/**
 * Get most used snippets
 */
export function getMostUsedSnippets(snippets: CodeSnippet[], limit: number = 5): CodeSnippet[] {
  return [...snippets]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
}

/**
 * Calculate snippet statistics
 */
export function getSnippetStats(snippets: CodeSnippet[]): SnippetStats {
  const languageBreakdown: Record<string, number> = {}
  const categoryBreakdown: Record<string, number> = {}
  
  snippets.forEach(snippet => {
    languageBreakdown[snippet.language] = (languageBreakdown[snippet.language] || 0) + 1
    categoryBreakdown[snippet.category] = (categoryBreakdown[snippet.category] || 0) + 1
  })
  
  return {
    totalSnippets: snippets.length,
    languageBreakdown,
    categoryBreakdown,
    topTags: getAllTags(snippets).slice(0, 10),
  }
}

/**
 * Add a new snippet
 */
export function addSnippet(snippet: Omit<CodeSnippet, 'id' | 'dateAdded' | 'usageCount'>): CodeSnippet {
  const snippets = loadSnippets()
  
  const newSnippet: CodeSnippet = {
    ...snippet,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateAdded: new Date().toISOString().split('T')[0],
    usageCount: 0,
  }
  
  snippets.push(newSnippet)
  saveSnippets(snippets)
  
  return newSnippet
}

/**
 * Delete a snippet
 */
export function deleteSnippet(snippetId: string): boolean {
  const snippets = loadSnippets()
  const index = snippets.findIndex(s => s.id === snippetId)
  
  if (index !== -1) {
    snippets.splice(index, 1)
    saveSnippets(snippets)
    return true
  }
  
  return false
}

/**
 * Search snippets by text
 */
export function searchSnippets(snippets: CodeSnippet[], query: string): CodeSnippet[] {
  return filterSnippets(snippets, { searchTerm: query })
}
