/**
 * Code Template Library
 * Provides a curated collection of code patterns, algorithms, and utilities
 */

import type { SupportedLanguage } from './codePlayground'

export interface CodeTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategoryId
  language: SupportedLanguage
  code: string
  tags: string[]
}

export type TemplateCategoryId = 
  | 'algorithms'
  | 'data-structures'
  | 'utilities'
  | 'patterns'
  | 'web-apis'
  | 'examples'

export interface TemplateCategory {
  id: TemplateCategoryId
  name: string
  description: string
  icon: string
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): TemplateCategory[] {
  return [
    {
      id: 'algorithms',
      name: 'Algorithms',
      description: 'Common algorithms and problem-solving patterns',
      icon: '🧮',
    },
    {
      id: 'data-structures',
      name: 'Data Structures',
      description: 'Essential data structures and their implementations',
      icon: '📊',
    },
    {
      id: 'utilities',
      name: 'Utilities',
      description: 'Helpful utility functions for common tasks',
      icon: '🛠️',
    },
    {
      id: 'patterns',
      name: 'Design Patterns',
      description: 'Software design patterns and best practices',
      icon: '🎨',
    },
    {
      id: 'web-apis',
      name: 'Web APIs',
      description: 'Browser and Web API examples',
      icon: '🌐',
    },
    {
      id: 'examples',
      name: 'Examples',
      description: 'Practical examples and demonstrations',
      icon: '💡',
    },
  ]
}

/**
 * Get all available templates
 */
export function getAllTemplates(): CodeTemplate[] {
  return [
    // Algorithms
    {
      id: 'binary-search',
      name: 'Binary Search',
      description: 'Efficient search algorithm for sorted arrays',
      category: 'algorithms',
      language: 'javascript',
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Not found
}

// Example usage
const numbers = [1, 3, 5, 7, 9, 11, 13, 15];
console.log('Array:', numbers);
console.log('Search for 7:', binarySearch(numbers, 7)); // 3
console.log('Search for 10:', binarySearch(numbers, 10)); // -1`,
      tags: ['search', 'sorted', 'O(log n)'],
    },
    {
      id: 'quick-sort',
      name: 'Quick Sort',
      description: 'Efficient divide-and-conquer sorting algorithm',
      category: 'algorithms',
      language: 'javascript',
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Example usage
const unsorted = [64, 34, 25, 12, 22, 11, 90];
console.log('Unsorted:', unsorted);
console.log('Sorted:', quickSort(unsorted));`,
      tags: ['sorting', 'divide-conquer', 'recursive'],
    },
    {
      id: 'dijkstra',
      name: 'Dijkstra\'s Algorithm',
      description: 'Shortest path algorithm for weighted graphs',
      category: 'algorithms',
      language: 'javascript',
      code: `function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  const pq = [[0, start]]; // [distance, node]
  
  // Initialize distances
  for (const node in graph) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [currentDist, current] = pq.shift();
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    for (const [neighbor, weight] of graph[current]) {
      const distance = currentDist + weight;
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        pq.push([distance, neighbor]);
      }
    }
  }
  
  return distances;
}

// Example: Graph represented as adjacency list
const graph = {
  'A': [['B', 4], ['C', 2]],
  'B': [['A', 4], ['C', 1], ['D', 5]],
  'C': [['A', 2], ['B', 1], ['D', 8]],
  'D': [['B', 5], ['C', 8]]
};

console.log('Shortest paths from A:', dijkstra(graph, 'A'));`,
      tags: ['graph', 'shortest-path', 'weighted'],
    },
    
    // Data Structures
    {
      id: 'stack',
      name: 'Stack',
      description: 'LIFO (Last In First Out) data structure',
      category: 'data-structures',
      language: 'javascript',
      code: `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }
  
  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}

// Example usage
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log('Top:', stack.peek()); // 3
console.log('Pop:', stack.pop());  // 3
console.log('Size:', stack.size()); // 2`,
      tags: ['LIFO', 'stack', 'basic'],
    },
    {
      id: 'queue',
      name: 'Queue',
      description: 'FIFO (First In First Out) data structure',
      category: 'data-structures',
      language: 'javascript',
      code: `class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(element) {
    this.items.push(element);
  }
  
  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }
  
  front() {
    if (this.isEmpty()) return null;
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// Example usage
const queue = new Queue();
queue.enqueue('First');
queue.enqueue('Second');
queue.enqueue('Third');
console.log('Front:', queue.front()); // 'First'
console.log('Dequeue:', queue.dequeue()); // 'First'
console.log('Size:', queue.size()); // 2`,
      tags: ['FIFO', 'queue', 'basic'],
    },
    {
      id: 'linked-list',
      name: 'Linked List',
      description: 'Dynamic linear data structure with nodes',
      category: 'data-structures',
      language: 'javascript',
      code: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  add(data) {
    const node = new Node(data);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.size++;
  }
  
  remove(data) {
    if (!this.head) return null;
    
    if (this.head.data === data) {
      this.head = this.head.next;
      this.size--;
      return;
    }
    
    let current = this.head;
    while (current.next) {
      if (current.next.data === data) {
        current.next = current.next.next;
        this.size--;
        return;
      }
      current = current.next;
    }
  }
  
  print() {
    const values = [];
    let current = this.head;
    while (current) {
      values.push(current.data);
      current = current.next;
    }
    console.log(values.join(' -> '));
  }
}

// Example usage
const list = new LinkedList();
list.add(1);
list.add(2);
list.add(3);
list.print(); // 1 -> 2 -> 3
list.remove(2);
list.print(); // 1 -> 3`,
      tags: ['linked-list', 'dynamic', 'nodes'],
    },
    
    // Utilities
    {
      id: 'debounce',
      name: 'Debounce Function',
      description: 'Delay function execution until after wait time',
      category: 'utilities',
      language: 'javascript',
      code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Example usage
const logMessage = debounce((msg) => {
  console.log('Debounced:', msg);
}, 1000);

// This will only log once after 1 second
logMessage('First call');
logMessage('Second call');
logMessage('Third call'); // Only this will execute`,
      tags: ['debounce', 'performance', 'async'],
    },
    {
      id: 'throttle',
      name: 'Throttle Function',
      description: 'Limit function execution to once per time period',
      category: 'utilities',
      language: 'javascript',
      code: `function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Example usage
let counter = 0;
const throttledLog = throttle(() => {
  console.log('Throttled call:', ++counter);
}, 1000);

// Will execute immediately, then ignore calls for 1 second
throttledLog(); // Logs: 1
throttledLog(); // Ignored
throttledLog(); // Ignored`,
      tags: ['throttle', 'performance', 'rate-limit'],
    },
    {
      id: 'deep-clone',
      name: 'Deep Clone Object',
      description: 'Create a deep copy of an object',
      category: 'utilities',
      language: 'javascript',
      code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// Example usage
const original = {
  name: 'Chimera',
  nested: { version: '1.0', active: true },
  tags: ['AI', 'Evolution']
};

const clone = deepClone(original);
clone.nested.version = '2.0';

console.log('Original:', original.nested.version); // '1.0'
console.log('Clone:', clone.nested.version); // '2.0'`,
      tags: ['clone', 'copy', 'object'],
    },
    
    // Patterns
    {
      id: 'singleton',
      name: 'Singleton Pattern',
      description: 'Ensure a class has only one instance',
      category: 'patterns',
      language: 'javascript',
      code: `class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    
    this.data = [];
    Singleton.instance = this;
  }
  
  addData(item) {
    this.data.push(item);
  }
  
  getData() {
    return this.data;
  }
}

// Example usage
const instance1 = new Singleton();
instance1.addData('First');

const instance2 = new Singleton();
instance2.addData('Second');

console.log('Same instance?', instance1 === instance2); // true
console.log('Data:', instance1.getData()); // ['First', 'Second']`,
      tags: ['singleton', 'creational', 'design-pattern'],
    },
    {
      id: 'observer',
      name: 'Observer Pattern',
      description: 'Publish-subscribe pattern for event handling',
      category: 'patterns',
      language: 'javascript',
      code: `class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => {
        listener(...args);
      });
    }
  }
  
  off(event, listenerToRemove) {
    if (this.events[event]) {
      this.events[event] = this.events[event]
        .filter(listener => listener !== listenerToRemove);
    }
  }
}

// Example usage
const emitter = new EventEmitter();

emitter.on('message', (msg) => console.log('Received:', msg));
emitter.on('message', (msg) => console.log('Also got:', msg));

emitter.emit('message', 'Hello!');
// Logs: "Received: Hello!" and "Also got: Hello!"`,
      tags: ['observer', 'pub-sub', 'events'],
    },
    {
      id: 'factory',
      name: 'Factory Pattern',
      description: 'Create objects without specifying exact class',
      category: 'patterns',
      language: 'typescript',
      code: `interface Shape {
  draw(): void;
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  
  draw() {
    console.log(\`Drawing circle with radius \${this.radius}\`);
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  
  draw() {
    console.log(\`Drawing rectangle \${this.width}x\${this.height}\`);
  }
  
  area() {
    return this.width * this.height;
  }
}

class ShapeFactory {
  static createShape(type: string, ...args: number[]): Shape {
    switch (type) {
      case 'circle':
        return new Circle(args[0]);
      case 'rectangle':
        return new Rectangle(args[0], args[1]);
      default:
        throw new Error('Unknown shape type');
    }
  }
}

// Example usage
const circle = ShapeFactory.createShape('circle', 5);
const rect = ShapeFactory.createShape('rectangle', 4, 6);

circle.draw();
console.log('Circle area:', circle.area());
rect.draw();
console.log('Rectangle area:', rect.area());`,
      tags: ['factory', 'creational', 'typescript'],
    },
    
    // Web APIs
    {
      id: 'fetch-api',
      name: 'Fetch API Example',
      description: 'Modern way to make HTTP requests',
      category: 'web-apis',
      language: 'javascript',
      code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Example usage
fetchData('https://api.example.com/data')
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));

// Or with async/await in a function
async function loadData() {
  try {
    const data = await fetchData('https://api.example.com/data');
    console.log('Loaded:', data);
  } catch (error) {
    console.error('Failed to load:', error);
  }
}`,
      tags: ['fetch', 'async', 'http'],
    },
    {
      id: 'local-storage',
      name: 'LocalStorage Helper',
      description: 'Utility for browser local storage with JSON support',
      category: 'web-apis',
      language: 'javascript',
      code: `const storage = {
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// Example usage
storage.set('user', { name: 'Chimera', age: 25 });
const user = storage.get('user');
console.log('User:', user);

storage.set('count', 42);
console.log('Count:', storage.get('count'));

storage.remove('count');
console.log('After remove:', storage.get('count', 0));`,
      tags: ['localStorage', 'storage', 'browser'],
    },
    
    // Examples
    {
      id: 'promise-chain',
      name: 'Promise Chaining',
      description: 'Handling async operations with promises',
      category: 'examples',
      language: 'javascript',
      code: `// Simulate async operations
function delay(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

// Promise chaining example
delay(1000, 'First')
  .then(result => {
    console.log(result);
    return delay(1000, 'Second');
  })
  .then(result => {
    console.log(result);
    return delay(1000, 'Third');
  })
  .then(result => {
    console.log(result);
    console.log('All done!');
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Parallel execution with Promise.all
Promise.all([
  delay(1000, 'A'),
  delay(2000, 'B'),
  delay(1500, 'C')
]).then(results => {
  console.log('All results:', results);
});`,
      tags: ['promise', 'async', 'chaining'],
    },
    {
      id: 'regex-patterns',
      name: 'Common Regex Patterns',
      description: 'Useful regular expressions for validation',
      category: 'examples',
      language: 'javascript',
      code: `// Common regex patterns
const patterns = {
  email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
  url: /^https?:\\/\\/[^\\s]+$/,
  phone: /^\\+?[\\d\\s-()]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  username: /^[a-zA-Z0-9_-]{3,16}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  date: /^\\d{4}-\\d{2}-\\d{2}$/,
};

// Test examples
console.log('Email valid:', patterns.email.test('user@example.com'));
console.log('URL valid:', patterns.url.test('https://example.com'));
console.log('Hex color valid:', patterns.hexColor.test('#FF5733'));
console.log('Username valid:', patterns.username.test('user_123'));

// Extract and replace
const text = 'Contact: user@example.com or admin@test.com';
const emails = text.match(/\\S+@\\S+/g);
console.log('Found emails:', emails);`,
      tags: ['regex', 'validation', 'patterns'],
    },
  ]
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategoryId): CodeTemplate[] {
  return getAllTemplates().filter(t => t.category === category)
}

/**
 * Get templates by language
 */
export function getTemplatesByLanguage(language: SupportedLanguage): CodeTemplate[] {
  return getAllTemplates().filter(t => t.language === language)
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): CodeTemplate[] {
  const lowerQuery = query.toLowerCase()
  return getAllTemplates().filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): CodeTemplate | undefined {
  return getAllTemplates().find(t => t.id === id)
}
