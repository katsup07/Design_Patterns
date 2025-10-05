const highlightPatterns = [
  { regex: /(\/\*[\s\S]*?\*\/|\/\/.*)/gm, type: 'comment' },
  { regex: /(["'`])(?:\\.|(?!\1)[^\\])*\1/gm, type: 'string' },
  { regex: /\b\d+(?:\.\d+)?\b/g, type: 'number' },
  {
    regex:
      /\b(async|await|break|case|catch|class|const|continue|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|of|private|protected|public|return|static|switch|throw|try|type|typeof|var|while|with|yield)\b/g,
    type: 'keyword',
  },
  {
    regex: /\b(string|number|boolean|void|any|unknown|never|Record|Partial|Pick|Omit|Map|Set|Promise|Array)\b/g,
    type: 'type',
  },
  { regex: /\b(true|false|null|undefined|this|super)\b/g, type: 'literal' },
  { regex: /@[a-zA-Z_][\w]*/g, type: 'decorator' },
  { regex: /\b[A-Z][A-Za-z0-9_]*\b/g, type: 'class' },
];

function highlightTypeScript(code) {
  const segments = [{ text: code, type: 'plain' }];

  const applyPattern = (pattern) => {
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (segment.type !== 'plain') continue;

      const matches = [];
      let match;
      pattern.regex.lastIndex = 0;
      while ((match = pattern.regex.exec(segment.text))) {
        matches.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
      }

      if (!matches.length) continue;

      const replacement = [];
      let cursor = 0;

      matches.forEach(({ start, end, text }) => {
        if (start > cursor) {
          replacement.push({ text: segment.text.slice(cursor, start), type: 'plain' });
        }
        replacement.push({ text, type: pattern.type });
        cursor = end;
      });

      if (cursor < segment.text.length) {
        replacement.push({ text: segment.text.slice(cursor), type: 'plain' });
      }

      segments.splice(i, 1, ...replacement);
      i += replacement.length - 1;
    }
  };

  highlightPatterns.forEach((pattern) => applyPattern(pattern));

  const escapeHtml = (value) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return segments
    .map(({ text, type }) => {
      const escaped = escapeHtml(text);
      if (type === 'plain') {
        return escaped;
      }
      return `<span class="token token-${type}">${escaped}</span>`;
    })
    .join('');
}

function highlightSnippets(root) {
  root.querySelectorAll('code').forEach((block) => {
    if (block.dataset.highlighted === 'true') {
      return;
    }

    const source = block.textContent ?? '';
    block.innerHTML = highlightTypeScript(source);
    block.dataset.highlighted = 'true';
  });
}

const icons = {
  overview:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 4a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm1 11h-2v-6h2v6z"/></svg>',
  usage:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 6h14v2H5zM5 11h14v2H5zM5 16h10v2H5z"/></svg>',
  balance:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.4 6H20l-4 7H8l-4-7h5.6L12 3zm0 3.7L10.9 9h2.2L12 6.7zM6.4 15.7L5 12h3l1.4 3.7H6.4zm11.2 0H15L16.4 12h3l-1.8 3.7zM11 18h2v3h-2z"/></svg>',
  pros:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 110 20 10 10 0 010-20zm-1.8 12.3l-2.5-2.5 1.4-1.4 1.1 1.1 3.7-3.7 1.4 1.4-5.1 5.1z"/></svg>',
  cons:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 14H4l8-14zm0 4.5L11.3 13h1.4L12 8.5zm0 8.5a1.1 1.1 0 110-2.2 1.1 1.1 0 010 2.2z"/></svg>',
  code:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 7.2L5 12l4.4 4.8 1.5-1.2L7.6 12l3.3-3.6-1.5-1.2zm5.2 0l-1.5 1.2 3.3 3.6-3.3 3.6 1.5 1.2L19 12l-4.4-4.8z"/></svg>',
};

const icon = (name, variant = 'accent') =>
  `<span class="card__icon card__icon--${variant}" aria-hidden="true">${icons[name]}</span>`;

const patterns = [
  {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    description:
      'Provide an interface for creating families of related objects without specifying their concrete classes. Useful when products should work well together and you need to swap entire families easily.',
    whenToUse: [
      'You have related product variants that must stay compatible.',
      'You want to enforce consistency across product families.',
    ],
    benefits: [
      'Separates client code from concrete implementations.',
      'Supports swapping product families without code changes.',
    ],
    downsides: [
      'Adds extra abstraction layers and more classes to maintain.',
      'Changing the product family structure requires updating every factory.',
    ],
    examples: [
      {
        title: 'UI Theme Factory',
        code: `// Abstract Product
interface Button {
  render(): string;
}

// Abstract Product
interface Dialog {
  open(): string;
}

// Abstract Factory
interface WidgetFactory {
  createButton(): Button;
  createDialog(): Dialog;
}

// Product
class DarkButton implements Button {
  render() {
    return 'Rendering dark button';
  }
}

// Product
class DarkDialog implements Dialog {
  open() {
    return 'Opening dark dialog';
  }
}

// Factory
class DarkFactory implements WidgetFactory {
  createButton() {
    return new DarkButton();
  }
  createDialog() {
    return new DarkDialog();
  }
}

function renderUI(factory: WidgetFactory) {
  // Client
  console.log(factory.createButton().render());
  console.log(factory.createDialog().open());
}

renderUI(new DarkFactory());`,
      },
      {
        title: 'Cloud Provider Factory',
        code: `interface StorageBucket {
  upload(file: string): void;
}

interface MessageQueue {
  publish(message: string): void;
}

// Abstract Factory
interface CloudToolkit {
  createBucket(): StorageBucket;
  createQueue(): MessageQueue;
}

// Product
class AwsBucket implements StorageBucket {
  upload(file: string) {
    console.log('Uploading to S3', file);
  }
}

// Product
class AwsQueue implements MessageQueue {
  publish(message: string) {
    console.log('Publishing to SNS', message);
  }
}

// Factory
class AwsToolkit implements CloudToolkit {
  createBucket() {
    return new AwsBucket();
  }
  createQueue() {
    return new AwsQueue();
  }
}

function deploy(toolkit: CloudToolkit) {
  // Client
  toolkit.createBucket().upload('report.pdf');
  toolkit.createQueue().publish('Job finished');
}

deploy(new AwsToolkit());`,
      },
    ],
  },
  {
    id: 'builder',
    name: 'Builder',
    category: 'Creational',
    description:
      'Construct complex objects step by step, letting the same construction process create different representations.',
    whenToUse: [
      'An object needs many optional pieces or configuration steps.',
      'You want to isolate construction code from the final product.',
    ],
    benefits: [
      'Keeps construction logic separate and reusable.',
      'Helps create immutable, well-validated objects.',
    ],
    downsides: [
      'More verbose than calling constructors directly.',
      'Requires duplicating builder classes for each product variant.',
    ],
    examples: [
      {
        title: 'HTTP Request Builder',
        code: `// Product
type HttpRequest = {
  method: 'GET' | 'POST';
  url: string;
  headers: Record<string, string>;
  body?: string;
};

// Builder
class RequestBuilder {
  private request: HttpRequest = {
    method: 'GET',
    url: '',
    headers: {},
  };

  setMethod(method: 'GET' | 'POST') {
    this.request.method = method;
    return this;
  }

  setUrl(url: string) {
    this.request.url = url;
    return this;
  }

  addHeader(key: string, value: string) {
    this.request.headers[key] = value;
    return this;
  }

  setBody(body: string) {
    this.request.body = body;
    return this;
  }

  build() {
    return Object.freeze({ ...this.request });
  }
}

const request = new RequestBuilder()
  // Client
  .setMethod('POST')
  .setUrl('/login')
  .addHeader('Content-Type', 'application/json')
  .setBody(JSON.stringify({ email: 'hi@example.com' }))
  .build();`,
      },
      {
        title: 'Game Character Builder',
        code: `type Character = {
  name: string;
  weapon?: string;
  skills: string[];
};

// Builder
class CharacterBuilder {
  private character: Character = { name: 'Hero', skills: [] };

  named(name: string) {
    this.character.name = name;
    return this;
  }

  withWeapon(weapon: string) {
    this.character.weapon = weapon;
    return this;
  }

  addSkill(skill: string) {
    this.character.skills.push(skill);
    return this;
  }

  build(): Character {
    return { ...this.character, skills: [...this.character.skills] };
  }
}

const rogue = new CharacterBuilder()
  // Client
  .named('Shade')
  .withWeapon('Daggers')
  .addSkill('Stealth')
  .addSkill('Poison Craft')
  .build();`,
      },
    ],
  },
  {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'Creational',
    description:
      'Define an interface for creating an object, but let subclasses decide which class to instantiate.',
    whenToUse: [
      'A class cannot anticipate the type of objects it must create.',
      'You want to encapsulate object creation for easier extension.',
    ],
    benefits: [
      'Promotes loose coupling between creator and products.',
      'Simplifies adding new product types by overriding the factory method.',
    ],
    downsides: [
      'Adds subclassing just for object creation.',
      'May produce many small classes for each product variant.',
    ],
    examples: [
      {
        title: 'Logger Factory',
        code: `abstract class Logger {
  abstract log(message: string): void;
}

// Concrete Product
class ConsoleLogger extends Logger {
  log(message: string) {
    console.log('[console]', message);
  }
}

// Concrete Product
class FileLogger extends Logger {
  log(message: string) {
    console.log('[file]', message);
  }
}

// Creator
abstract class LoggerCreator {
  abstract createLogger(): Logger;

  report(message: string) {
    const logger = this.createLogger();
    logger.log(message);
  }
}

// Concrete Creator
class ConsoleLoggerCreator extends LoggerCreator {
  createLogger() {
    return new ConsoleLogger();
  }
}

new ConsoleLoggerCreator().report('Server started');`,
      },
      {
        title: 'Notification Factory',
        code: `abstract class Notifier {
  abstract send(message: string): void;
}

// Concrete Product
class SmsNotifier extends Notifier {
  send(message: string) {
    console.log('SMS:', message);
  }
}

// Concrete Product
class EmailNotifier extends Notifier {
  send(message: string) {
    console.log('Email:', message);
  }
}

// Creator
abstract class NotifierCreator {
  abstract createNotifier(): Notifier;

  notifyUser(message: string) {
    this.createNotifier().send(message);
  }
}

// Concrete Creator
class SmsNotifierCreator extends NotifierCreator {
  createNotifier() {
    return new SmsNotifier();
  }
}

new SmsNotifierCreator().notifyUser('2FA code sent');`,
      },
    ],
  },
  {
    id: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    description:
      'Clone existing objects without making code dependent on their concrete classes. Good for heavy initialization or when creating objects is expensive.',
    whenToUse: [
      'Creating objects is costly and they share common setup.',
      'You need to avoid subclass explosion for minor variations.',
    ],
    benefits: [
      'Reduces duplication by reusing preconfigured instances.',
      'Avoids coupling to concrete classes when cloning.',
    ],
    downsides: [
      'Cloning complex structures can be tricky to implement correctly.',
      'Deep copy requirements make maintenance harder.',
    ],
    examples: [
      {
        title: 'Document Prototype',
        code: `interface Prototype<T> {
  clone(): T;
}

// Prototype
class DocumentTemplate implements Prototype<DocumentTemplate> {
  constructor(
    public title: string,
    public sections: string[]
  ) {}

  clone() {
    return new DocumentTemplate(this.title, [...this.sections]);
  }
}

const invoice = new DocumentTemplate('Invoice', ['Summary', 'Items']);
// Client
const copy = invoice.clone();
copy.sections.push('Notes');`,
      },
      {
        title: 'Enemy Prototype',
        code: `type EnemyStats = {
  health: number;
  attack: number;
};

// Prototype
class Enemy implements Prototype<Enemy> {
  constructor(public type: string, public stats: EnemyStats) {}

  clone() {
    return new Enemy(this.type, { ...this.stats });
  }
}

const baseOrc = new Enemy('Orc', { health: 100, attack: 15 });
// Client
const eliteOrc = baseOrc.clone();
eliteOrc.stats.attack += 10;`,
      },
    ],
  },
  {
    id: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    description:
      'Ensure a class has only one instance and provide a global access point to it.',
    whenToUse: [
      'You need a single shared resource such as configuration or cache.',
      'You want lazy initialization of a heavy dependency.',
    ],
    benefits: [
      'Controlled access to a single instance.',
      'Can provide lazy initialization and lifecycle management.',
    ],
    downsides: [
      'Hidden dependencies make testing harder.',
      'Can become a bottleneck if overused.',
    ],
    examples: [
      {
        title: 'AppConfig Singleton',
        code: `// Singleton
class AppConfig {
  private static instance: AppConfig | undefined;

  private constructor(public readonly apiUrl: string) {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new AppConfig('https://api.example.com');
    }
    return this.instance;
  }
}

// Client
const config = AppConfig.getInstance();`,
      },
      {
        title: 'Lazy Database Connection',
        code: `// Singleton
class Database {
  private static connection: Database | null = null;

  private constructor(private connectionString: string) {}

  static connect() {
    if (!Database.connection) {
      Database.connection = new Database('postgres://localhost');
    }
    return Database.connection;
  }
}

// Client
const db = Database.connect();`,
      },
    ],
  },
  {
    id: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    description:
      'Convert the interface of a class into another interface clients expect. Lets incompatible classes work together.',
    whenToUse: [
      'Integrating third-party code with a different interface.',
      'Reusing existing classes without modifying them.',
    ],
    benefits: [
      'Allows reuse of existing functionality.',
      'Supports incremental migration to new interfaces.',
    ],
    downsides: [
      'Adds an extra layer that can hide inefficient code.',
      'Multiple adapters can become hard to track.',
    ],
    examples: [
      {
        title: 'Payment Adapter',
        code: `// Target
interface PaymentProcessor {
  pay(total: number): void;
}

// Adaptee
class Stripe {
  charge(amount: number) {
    console.log('Charging', amount);
  }
}

// Adapter
class StripeAdapter implements PaymentProcessor {
  constructor(private stripe: Stripe) {}

  pay(total: number) {
    this.stripe.charge(total);
  }
}

function checkout(processor: PaymentProcessor) {
  // Client
  processor.pay(42);
}

checkout(new StripeAdapter(new Stripe()));`,
      },
      {
        title: 'Legacy Logger Adapter',
        code: `// Target
interface Logger {
  info(message: string): void;
}

// Adaptee
class LegacyLogger {
  write(message: string) {
    console.log('[legacy]', message);
  }
}

// Adapter
class LoggerAdapter implements Logger {
  constructor(private legacy: LegacyLogger) {}

  info(message: string) {
    this.legacy.write(message);
  }
}

const logger = new LoggerAdapter(new LegacyLogger());
// Client
logger.info('Migrated to adapter');`,
      },
    ],
  },
  {
    id: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    description:
      'Decouple an abstraction from its implementation so the two can vary independently.',
    whenToUse: [
      'You have classes that can be combined with multiple implementations.',
      'Inheritance would lead to a Cartesian explosion of subclasses.',
    ],
    benefits: [
      'Simplifies combining abstractions and implementations.',
      'Improves testability by mocking either side independently.',
    ],
    downsides: [
      'Requires planning two class hierarchies.',
      'Can be overkill for simple use cases.',
    ],
    examples: [
      {
        title: 'Remote & Device Bridge',
        code: `// Implementation
interface Device {
  togglePower(): void;
  setChannel(channel: number): void;
}

// Concrete Implementation
class Tv implements Device {
  togglePower() {
    console.log('TV power');
  }
  setChannel(channel: number) {
    console.log('TV channel', channel);
  }
}

// Abstraction
class RemoteControl {
  constructor(protected device: Device) {}

  toggle() {
    this.device.togglePower();
  }
}

// Refined Abstraction
class AdvancedRemoteControl extends RemoteControl {
  setChannel(channel: number) {
    this.device.setChannel(channel);
  }
}

const remote = new AdvancedRemoteControl(new Tv());
// Client
remote.toggle();
remote.setChannel(7);`,
      },
      {
        title: 'Report & Exporter Bridge',
        code: `// Implementation
interface Exporter {
  export(data: object): string;
}

// Concrete Implementation
class JsonExporter implements Exporter {
  export(data: object) {
    return JSON.stringify(data);
  }
}

// Abstraction
abstract class Report {
  constructor(protected exporter: Exporter) {}
  abstract build(): object;

  print() {
    console.log(this.exporter.export(this.build()));
  }
}

// Refined Abstraction
class SalesReport extends Report {
  build() {
    return { total: 1000, region: 'EU' };
  }
}

// Client
new SalesReport(new JsonExporter()).print();`,
      },
    ],
  },
  {
    id: 'composite',
    name: 'Composite',
    category: 'Structural',
    description:
      'Compose objects into tree structures to represent part-whole hierarchies and work with all nodes uniformly.',
    whenToUse: [
      'You need to treat individual and composite objects the same way.',
      'Tree-like structures are core to the domain (UI, file systems).',
    ],
    benefits: [
      'Simplifies client code by handling leaf and composite uniformly.',
      'Makes it easy to add new element types.',
    ],
    downsides: [
      'Can make validation and constraints harder to enforce.',
      'Difficult to restrict certain components in the tree.',
    ],
    examples: [
      {
        title: 'File System Composite',
        code: `// Component
interface FileSystemNode {
  getSize(): number;
}

// Leaf
class FileLeaf implements FileSystemNode {
  constructor(private size: number) {}
  getSize() {
    return this.size;
  }
}

// Composite
class Folder implements FileSystemNode {
  private children: FileSystemNode[] = [];

  add(child: FileSystemNode) {
    this.children.push(child);
  }

  getSize() {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }
}

// Client
const root = new Folder();
root.add(new FileLeaf(10));
root.add(new FileLeaf(20));
console.log(root.getSize());`,
      },
      {
        title: 'UI Component Tree',
        code: `// Component
interface Component {
  draw(): void;
}

// Leaf
class Button implements Component {
  draw() {
    console.log('Drawing button');
  }
}

// Composite
class Panel implements Component {
  private children: Component[] = [];

  add(component: Component) {
    this.children.push(component);
  }

  draw() {
    this.children.forEach((child) => child.draw());
  }
}

// Client
const panel = new Panel();
panel.add(new Button());
panel.draw();`,
      },
    ],
  },
  {
    id: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    description:
      'Attach additional responsibilities to an object dynamically. Provides a flexible alternative to subclassing for extending functionality.',
    whenToUse: [
      'You need to add behavior without modifying original classes.',
      'Different combinations of features should be possible at runtime.',
    ],
    benefits: [
      'Stacks features without subclass explosion.',
      'Keeps core classes lightweight.',
    ],
    downsides: [
      'Many small objects can make debugging harder.',
      'Order of decorators may affect behavior.',
    ],
    examples: [
      {
        title: 'Coffee Decorators',
        code: `// Component
interface Coffee {
  cost(): number;
}

// Concrete Component
class Espresso implements Coffee {
  cost() {
    return 2;
  }
}

// Decorator
class MilkDecorator implements Coffee {
  constructor(private base: Coffee) {}

  cost() {
    return this.base.cost() + 0.5;
  }
}

const latte = new MilkDecorator(new Espresso());
// Client
console.log(latte.cost());`,
      },
      {
        title: 'HTTP Client with Decorators',
        code: `// Component
interface HttpClient {
  get(url: string): Promise<string>;
}

// Concrete Component
class FetchClient implements HttpClient {
  async get(url: string) {
    const res = await fetch(url);
    return res.text();
  }
}

// Decorator
class LoggingClient implements HttpClient {
  constructor(private inner: HttpClient) {}

  async get(url: string) {
    console.log('Requesting', url);
    return this.inner.get(url);
  }
}

// Client
const client = new LoggingClient(new FetchClient());`,
      },
    ],
  },
  {
    id: 'facade',
    name: 'Facade',
    category: 'Structural',
    description:
      'Provide a unified interface to a set of interfaces in a subsystem, making it easier to use.',
    whenToUse: [
      'Subsystems are complex or difficult to understand.',
      'You want a single entry point to common workflows.',
    ],
    benefits: [
      'Simplifies usage of complex libraries.',
      'Promotes loose coupling between clients and subsystems.',
    ],
    downsides: [
      'Can become a god object if it grows too much.',
      'Hiding details might limit advanced usage.',
    ],
    examples: [
      {
        title: 'Video Conversion Facade',
        code: `// Subsystem
class FileLoader {
  load(path: string) {
    console.log('Loading file', path);
  }
}

// Subsystem
class CodecConverter {
  convert(format: string) {
    console.log('Converting to', format);
  }
}

// Facade
class VideoConverterFacade {
  private loader = new FileLoader();
  private converter = new CodecConverter();

  convert(path: string, format: string) {
    this.loader.load(path);
    this.converter.convert(format);
    console.log('Done!');
  }
}

// Client
new VideoConverterFacade().convert('intro.mov', 'mp4');`,
      },
      {
        title: 'Analytics Facade',
        code: `// Subsystem
class EventTracker {
  track(event: string) {
    console.log('Tracking', event);
  }
}

// Subsystem
class UserStorage {
  save(userId: string) {
    console.log('Saving user', userId);
  }
}

// Facade
class AnalyticsFacade {
  private tracker = new EventTracker();
  private storage = new UserStorage();

  identify(userId: string) {
    this.storage.save(userId);
    this.tracker.track('identify');
  }
}

// Client
const analytics = new AnalyticsFacade();
analytics.identify('123');`,
      },
    ],
  },
  {
    id: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    description:
      'Share common state between multiple objects to support large numbers efficiently.',
    whenToUse: [
      'You have many similar objects that use a lot of memory.',
      'Most object data can be shared rather than duplicated.',
    ],
    benefits: [
      'Reduces memory footprint by reusing intrinsic state.',
      'Can improve cache locality for repeated data.',
    ],
    downsides: [
      'Requires splitting state into shared vs. unique parts.',
      'Introduces complexity in managing shared objects.',
    ],
    examples: [
      {
        title: 'Tree Type Flyweight',
        code: `// Flyweight
class TreeType {
  constructor(public texture: string) {}
}

// Flyweight Factory
class TreeFactory {
  private types = new Map<string, TreeType>();

  getType(texture: string) {
    if (!this.types.has(texture)) {
      this.types.set(texture, new TreeType(texture));
    }
    return this.types.get(texture)!;
  }
}

// Client
const factory = new TreeFactory();
const oak1 = factory.getType('oak.png');
const oak2 = factory.getType('oak.png');
console.log(oak1 === oak2);`,
      },
      {
        title: 'Text Character Flyweight',
        code: `type GlyphState = {
  symbol: string;
};

type Position = {
  x: number;
  y: number;
  color: string;
};

// Flyweight Factory
class GlyphFactory {
  private glyphs = new Map<string, GlyphState>();

  get(symbol: string) {
    if (!this.glyphs.has(symbol)) {
      this.glyphs.set(symbol, { symbol });
    }
    return this.glyphs.get(symbol)!;
  }
}

// Client
const glyphFactory = new GlyphFactory();
const sharedA = glyphFactory.get('A');
const secondA = glyphFactory.get('A');
console.log(sharedA === secondA);`,
      },
    ],
  },
  {
    id: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    description:
      'Provide a surrogate or placeholder for another object to control access to it.',
    whenToUse: [
      'You need lazy loading, caching, or access control.',
      'You want to add cross-cutting concerns around a class.',
    ],
    benefits: [
      'Adds behavior without changing the real subject.',
      'Can defer heavy work until necessary.',
    ],
    downsides: [
      'Introduces extra indirection and latency.',
      'Increases code complexity and maintenance.',
    ],
    examples: [
      {
        title: 'Image Proxy',
        code: `// Subject
interface Image {
  display(): void;
}

// Real Subject
class RealImage implements Image {
  constructor(private path: string) {}

  display() {
    console.log('Showing image', this.path);
  }
}

// Proxy
class ImageProxy implements Image {
  private real?: RealImage;

  constructor(private path: string) {}

  display() {
    if (!this.real) {
      this.real = new RealImage(this.path);
    }
    this.real.display();
  }
}

// Client
const image = new ImageProxy('logo.png');
image.display();`,
      },
      {
        title: 'Permissions Proxy',
        code: `// Subject
interface Document {
  read(): string;
}

// Real Subject
class ProtectedDocument implements Document {
  constructor(private content: string) {}

  read() {
    return this.content;
  }
}

// Proxy
class DocumentProxy implements Document {
  constructor(private doc: Document, private canRead: boolean) {}

  read() {
    if (!this.canRead) {
      throw new Error('Access denied');
    }
    return this.doc.read();
  }
}

// Client
const secureDoc = new DocumentProxy(new ProtectedDocument('secret'), true);
console.log(secureDoc.read());`,
      },
    ],
  },
  {
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    description:
      'Pass requests along a chain of handlers until one of them handles it.',
    whenToUse: [
      'Multiple objects can handle a request, and you want the handler chosen at runtime.',
      'You need to decouple senders and receivers.',
    ],
    benefits: [
      'Promotes loose coupling between sender and handler.',
      'Supports adding or reordering handlers without breaking code.',
    ],
    downsides: [
      'Requests might go unhandled if not terminated properly.',
      'Debugging across many handlers can be difficult.',
    ],
    examples: [
      {
        title: 'Support Ticket Escalation',
        code: `// Handler
abstract class SupportHandler {
  private next?: SupportHandler;

  setNext(handler: SupportHandler) {
    this.next = handler;
    return handler;
  }

  handle(level: 'low' | 'high') {
    if (this.next) {
      this.next.handle(level);
    } else {
      console.log('No handler available');
    }
  }
}

// Concrete Handler
class AgentSupport extends SupportHandler {
  handle(level: 'low' | 'high') {
    if (level === 'low') {
      console.log('Agent resolved ticket');
    } else {
      super.handle(level);
    }
  }
}

// Concrete Handler
class ManagerSupport extends SupportHandler {
  handle(level: 'low' | 'high') {
    if (level === 'high') {
      console.log('Manager resolved ticket');
    } else {
      super.handle(level);
    }
  }
}

// Client
const supportChain = new AgentSupport();
supportChain.setNext(new ManagerSupport());
supportChain.handle('high');`,
      },
      {
        title: 'Middleware Chain',
        code: `type Context = { user?: string };

// Handler
abstract class Middleware {
  private next?: Middleware;

  linkWith(next: Middleware) {
    this.next = next;
    return next;
  }

  handle(context: Context) {
    if (this.next) {
      this.next.handle(context);
    }
  }
}

// Concrete Handler
class AuthMiddleware extends Middleware {
  handle(context: Context) {
    if (!context.user) {
      throw new Error('No user');
    }
    console.log('User authenticated');
    super.handle(context);
  }
}

// Client
const pipeline = new AuthMiddleware();
pipeline.handle({ user: 'sarah' });`,
      },
    ],
  },
  {
    id: 'command',
    name: 'Command',
    category: 'Behavioral',
    description:
      'Encapsulate a request as an object, letting you parameterize clients, queue, and log requests.',
    whenToUse: [
      'You need to queue, undo, or log operations.',
      'Commands should be executed at different times by different objects.',
    ],
    benefits: [
      'Decouples sender from receiver.',
      'Supports undo/redo via command history.',
    ],
    downsides: [
      'Adds new classes for each command type.',
      'Can complicate simple operations unnecessarily.',
    ],
    examples: [
      {
        title: 'Light Switch Command',
        code: `// Command
interface Command {
  execute(): void;
}

// Receiver
class Light {
  on() {
    console.log('Light on');
  }
  off() {
    console.log('Light off');
  }
}

// Concrete Command
class OnCommand implements Command {
  constructor(private light: Light) {}
  execute() {
    this.light.on();
  }
}

// Invoker
class Remote {
  constructor(private command: Command) {}
  press() {
    this.command.execute();
  }
}

// Client
new Remote(new OnCommand(new Light())).press();`,
      },
      {
        title: 'Queueable Job Command',
        code: `// Command
interface Job {
  run(): Promise<void>;
}

// Concrete Command
class EmailJob implements Job {
  async run() {
    console.log('Sending email...');
  }
}

// Invoker
class JobRunner {
  private queue: Job[] = [];

  add(job: Job) {
    this.queue.push(job);
  }

  async process() {
    for (const job of this.queue) {
      await job.run();
    }
  }
}

// Client
const runner = new JobRunner();
runner.add(new EmailJob());
runner.process();`,
      },
    ],
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioral',
    description:
      'Define a representation for a simple language and interpret its sentences.',
    whenToUse: [
      'You have a simple grammar to evaluate repeatedly.',
      'You want to build DSL-like features with composable expressions.',
    ],
    benefits: [
      'Each grammar rule gets its own class for clarity.',
      'Composing expressions is straightforward.',
    ],
    downsides: [
      'Complex grammars lead to many small classes.',
      'Performance can suffer compared to optimized parsers.',
    ],
    examples: [
      {
        title: 'Math Expression Interpreter',
        code: `// Expression
interface Expression {
  interpret(): number;
}

// Terminal Expression
class NumberLiteral implements Expression {
  constructor(private value: number) {}

  interpret() {
    return this.value;
  }
}

// Nonterminal Expression
class Add implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret() {
    return this.left.interpret() + this.right.interpret();
  }
}

// Client
const result = new Add(new NumberLiteral(2), new NumberLiteral(3)).interpret();`,
      },
      {
        title: 'Boolean DSL',
        code: `// Expression
interface BooleanExpression {
  interpret(context: Record<string, boolean>): boolean;
}

// Terminal Expression
class Variable implements BooleanExpression {
  constructor(private name: string) {}
  interpret(context: Record<string, boolean>) {
    return context[this.name];
  }
}

// Nonterminal Expression
class And implements BooleanExpression {
  constructor(private left: BooleanExpression, private right: BooleanExpression) {}
  interpret(context: Record<string, boolean>) {
    return this.left.interpret(context) && this.right.interpret(context);
  }
}

// Client
const expr = new And(new Variable('isAdmin'), new Variable('isActive'));
expr.interpret({ isAdmin: true, isActive: false });`,
      },
    ],
  },
  {
    id: 'iterator',
    name: 'Iterator',
    category: 'Behavioral',
    description:
      'Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.',
    whenToUse: [
      'You need multiple traversal strategies for a collection.',
      'Want to hide collection internals from consumers.',
    ],
    benefits: [
      'Supports different traversals over the same collection.',
      'Encapsulates iteration state.',
    ],
    downsides: [
      'Extra classes for custom iterators.',
      'Can be unnecessary when language already provides iteration tools.',
    ],
    examples: [
      {
        title: 'Custom Range Iterator',
        code: `// Iterable
class Range implements Iterable<number> {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator]() {
    let current = this.start;
    return {
      next: () => ({
        value: current,
        done: current++ > this.end,
      }),
    };
  }
}

// Client
for (const value of new Range(1, 3)) {
  console.log(value);
}`,
      },
      {
        title: 'Playlist Iterator',
        code: `// Iterable
class Playlist implements Iterable<string> {
  constructor(private tracks: string[]) {}

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this.tracks[index],
        done: index++ >= this.tracks.length,
      }),
    };
  }
}

// Client
for (const track of new Playlist(['Intro', 'Verse'])) {
  console.log(track);
}`,
      },
    ],
  },
  {
    id: 'mediator',
    name: 'Mediator',
    category: 'Behavioral',
    description:
      'Define an object that encapsulates how a set of objects interact, promoting loose coupling.',
    whenToUse: [
      'Components communicate in complex ways.',
      'You want to centralize communication logic.',
    ],
    benefits: [
      'Reduces direct dependencies between components.',
      'Encapsulates protocols in one place.',
    ],
    downsides: [
      'Mediator can become monolithic if it grows unchecked.',
      'Another layer to maintain and test.',
    ],
    examples: [
      {
        title: 'Chat Room Mediator',
        code: `// Mediator
class ChatRoom {
  private participants: Participant[] = [];

  register(participant: Participant) {
    this.participants.push(participant);
  }

  broadcast(from: string, message: string) {
    this.participants.forEach((user) => {
      if (user.name !== from) {
        user.receive(message);
      }
    });
  }
}

// Colleague
class Participant {
  constructor(public name: string, private room: ChatRoom) {
    this.room.register(this);
  }

  send(message: string) {
    this.room.broadcast(this.name, message);
  }

  receive(message: string) {
    console.log(this.name + ' received: ' + message);
  }
}

// Client
const room = new ChatRoom();
const alex = new Participant('Alex', room);
alex.send('Hello');`,
      },
      {
        title: 'UI Form Mediator',
        code: `// Mediator
class FormMediator {
  constructor(private fields: FormField[]) {
    fields.forEach((field) => field.setMediator(this));
  }

  notify(sender: FormField, event: 'focus' | 'blur') {
    if (event === 'focus') {
      this.fields.forEach((field) => {
        if (field !== sender) field.blur();
      });
    }
  }
}

// Colleague
abstract class FormField {
  protected mediator?: FormMediator;

  setMediator(mediator: FormMediator) {
    this.mediator = mediator;
  }

  focus() {
    this.mediator?.notify(this, 'focus');
  }

  abstract blur(): void;
}

// Concrete Colleague
class TextField extends FormField {
  blur() {
    console.log('Field blurred');
  }
}

// Client
const username = new TextField();
const password = new TextField();
new FormMediator([username, password]);
username.focus();`,
      },
    ],
  },
  {
    id: 'memento',
    name: 'Memento',
    category: 'Behavioral',
    description:
      'Capture and externalize an object’s internal state so it can be restored later without violating encapsulation.',
    whenToUse: [
      'You need undo/redo functionality.',
      'Snapshots of object state should be stored safely.',
    ],
    benefits: [
      'Encapsulates state snapshots cleanly.',
      'Allows restoring state without exposing internals.',
    ],
    downsides: [
      'Can consume a lot of memory for large states.',
      'Requires care when dealing with mutable references.',
    ],
    examples: [
      {
        title: 'Text Editor History',
        code: `// Memento
class EditorMemento {
  constructor(public readonly content: string) {}
}

// Originator
class TextEditor {
  private history: EditorMemento[] = [];

  constructor(private content = '') {}

  type(text: string) {
    this.content += text;
    this.save();
  }

  save() {
    this.history.push(new EditorMemento(this.content));
  }

  undo() {
    const memento = this.history.pop();
    if (memento) {
      this.content = memento.content;
    }
  }
}

// Client
const editor = new TextEditor();
editor.type('Hello');
editor.undo();`,
      },
      {
        title: 'Game Save System',
        code: `type GameState = {
  level: number;
  health: number;
};

// Memento
class GameMemento {
  constructor(public readonly state: GameState) {}
}

// Originator
class Game {
  private saves: GameMemento[] = [];

  constructor(private state: GameState) {}

  save() {
    this.saves.push(new GameMemento({ ...this.state }));
  }

  restore() {
    const memento = this.saves.pop();
    if (memento) {
      this.state = memento.state;
    }
  }
}

// Client
const game = new Game({ level: 1, health: 100 });
game.save();
game.restore();`,
      },
    ],
  },
  {
    id: 'observer',
    name: 'Observer',
    category: 'Behavioral',
    description:
      'Define a one-to-many dependency between objects so when one object changes state, all its dependents are notified.',
    whenToUse: [
      'Multiple consumers need to react to state changes.',
      'You want to decouple publishers from subscribers.',
    ],
    benefits: [
      'Supports broadcast communication.',
      'Observers can be added or removed at runtime.',
    ],
    downsides: [
      'Notification order might be unpredictable.',
      'Observers can miss updates if not managed carefully.',
    ],
    examples: [
      {
        title: 'Stock Price Observer',
        code: `type Listener = (price: number) => void;

// Subject
class StockTicker {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  update(price: number) {
    this.listeners.forEach((listener) => listener(price));
  }
}

// Client
const ticker = new StockTicker();
ticker.subscribe((price) => console.log('Price:', price));
ticker.update(120);
`,
      },
      {
        title: 'Weather Station Observer',
        code: `interface WeatherObserver {
  notify(temp: number): void;
}

// Subject
class WeatherStation {
  private observers = new Set<WeatherObserver>();

  add(observer: WeatherObserver) {
    this.observers.add(observer);
  }

  setTemperature(temp: number) {
    this.observers.forEach((observer) => observer.notify(temp));
  }
}

// Observer
class Display implements WeatherObserver {
  notify(temp: number) {
    console.log('Now', temp);
  }
}

// Client
const station = new WeatherStation();
station.add(new Display());
station.setTemperature(22);`,
      },
    ],
  },
  {
    id: 'state',
    name: 'State',
    category: 'Behavioral',
    description:
      'Allow an object to alter its behavior when its internal state changes.',
    whenToUse: [
      'Object behavior depends on current state.',
      'State transitions are frequent and complex.',
    ],
    benefits: [
      'Localizes state-specific logic to dedicated classes.',
      'Makes transitions explicit and testable.',
    ],
    downsides: [
      'More classes and indirection.',
      'State transitions may be scattered across state classes.',
    ],
    examples: [
      {
        title: 'Order Lifecycle States',
        code: `// State
interface OrderState {
  next(order: Order): void;
}

// Context
class Order {
  constructor(public state: OrderState) {}

  advance() {
    this.state.next(this);
  }
}

// Concrete State
class PendingState implements OrderState {
  next(order: Order) {
    order.state = new ShippedState();
  }
}

// Concrete State
class ShippedState implements OrderState {
  next(order: Order) {
    order.state = new DeliveredState();
  }
}

// Concrete State
class DeliveredState implements OrderState {
  next() {
    console.log('Order complete');
  }
}

// Client
const order = new Order(new PendingState());
order.advance();`,
      },
      {
        title: 'Audio Player States',
        code: `// State
interface PlayerState {
  play(player: AudioPlayer): void;
}

// Context
class AudioPlayer {
  state: PlayerState = new StoppedState();

  play() {
    this.state.play(this);
  }
}

// Concrete State
class StoppedState implements PlayerState {
  play(player: AudioPlayer) {
    console.log('Playing');
    player.state = new PlayingState();
  }
}

// Concrete State
class PlayingState implements PlayerState {
  play(player: AudioPlayer) {
    console.log('Already playing');
  }
}

// Client
const player = new AudioPlayer();
player.play();`,
      },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'Behavioral',
    description:
      'Define a family of algorithms, encapsulate each one, and make them interchangeable.',
    whenToUse: [
      'Multiple algorithms can solve the same problem.',
      'You want to swap implementations at runtime.',
    ],
    benefits: [
      'Isolates algorithm implementations.',
      'Follows open/closed principle for new strategies.',
    ],
    downsides: [
      'Clients must understand differences between strategies.',
      'Requires creating additional objects.',
    ],
    examples: [
      {
        title: 'Shipping Cost Strategy',
        code: `// Strategy
interface ShippingStrategy {
  calculate(weight: number): number;
}

// Concrete Strategy
class GroundShipping implements ShippingStrategy {
  calculate(weight: number) {
    return weight * 1.2;
  }
}

// Concrete Strategy
class AirShipping implements ShippingStrategy {
  calculate(weight: number) {
    return weight * 2.5;
  }
}

// Context
class ShippingCostCalculator {
  constructor(private strategy: ShippingStrategy) {}

  total(weight: number) {
    return this.strategy.calculate(weight);
  }
}

// Client
new ShippingCostCalculator(new GroundShipping()).total(3);`,
      },
      {
        title: 'Sorting Strategy',
        code: `// Strategy
type SortStrategy = {
  sort(items: number[]): number[];
};

// Concrete Strategy
class AscendingSort implements SortStrategy {
  sort(items: number[]) {
    return [...items].sort((a, b) => a - b);
  }
}

// Concrete Strategy
class DescendingSort implements SortStrategy {
  sort(items: number[]) {
    return [...items].sort((a, b) => b - a);
  }
}

// Client
const sorter = new AscendingSort();
sorter.sort([3, 1, 2]);`,
      },
    ],
  },
  {
    id: 'template-method',
    name: 'Template Method',
    category: 'Behavioral',
    description:
      'Define the skeleton of an algorithm in an operation, deferring some steps to subclasses.',
    whenToUse: [
      'Algorithms share structure but differ in details.',
      'You want to enforce ordering of operations.',
    ],
    benefits: [
      'Promotes reuse of high-level workflow logic.',
      'Keeps variant steps customizable via subclassing.',
    ],
    downsides: [
      'Inheritance-based, so it increases coupling.',
      'Changes in template require touching all subclasses.',
    ],
    examples: [
      {
        title: 'Data Export Template',
        code: `// Template
abstract class DataExporter {
  export() {
    const data = this.fetchData();
    const transformed = this.transform(data);
    this.save(transformed);
  }

  protected abstract fetchData(): string;
  protected abstract transform(data: string): string;
  protected save(data: string) {
    console.log('Saving', data);
  }
}

// Concrete Class
class JsonExporter extends DataExporter {
  protected fetchData() {
    return '{"name":"Pat"}';
  }
  protected transform(data: string) {
    return data.toUpperCase();
  }
}

// Client
new JsonExporter().export();`,
      },
      {
        title: 'Build Pipeline Template',
        code: `// Template
abstract class BuildPipeline {
  run() {
    this.install();
    this.test();
    this.deploy();
  }

  protected abstract install(): void;
  protected abstract test(): void;
  protected abstract deploy(): void;
}

// Concrete Class
class WebPipeline extends BuildPipeline {
  protected install() {
    console.log('npm install');
  }
  protected test() {
    console.log('npm test');
  }
  protected deploy() {
    console.log('Deploying web build');
  }
}

// Client
new WebPipeline().run();`,
      },
    ],
  },
  {
    id: 'visitor',
    name: 'Visitor',
    category: 'Behavioral',
    description:
      'Represent an operation to be performed on elements of an object structure without changing the classes of the elements.',
    whenToUse: [
      'You need to perform new operations on objects without modifying them.',
      'The object structure rarely changes but new operations are added often.',
    ],
    benefits: [
      'Adds new operations without touching element classes.',
      'Collects related behavior in visitor implementations.',
    ],
    downsides: [
      'Adding new element types requires updating all visitors.',
      'Breaks encapsulation if visitors need access to internals.',
    ],
    examples: [
      {
        title: 'Tax Visitor',
        code: `// Visitor
interface ProductVisitor {
  visitBook(book: Book): number;
  visitFood(food: Food): number;
}

// Element
interface Product {
  accept(visitor: ProductVisitor): number;
}

// Concrete Element
class Book implements Product {
  constructor(public price: number) {}
  accept(visitor: ProductVisitor) {
    return visitor.visitBook(this);
  }
}

// Concrete Element
class Food implements Product {
  constructor(public price: number) {}
  accept(visitor: ProductVisitor) {
    return visitor.visitFood(this);
  }
}

// Concrete Visitor
class TaxCalculator implements ProductVisitor {
  visitBook(book: Book) {
    return book.price * 1.1;
  }
  visitFood(food: Food) {
    return food.price * 1.05;
  }
}

// Client
const cart: Product[] = [new Book(20), new Food(10)];
const total = cart.reduce((sum, item) => sum + item.accept(new TaxCalculator()), 0);`,
      },
      {
        title: 'AST Visitor',
        code: `// Visitor
interface NodeVisitor {
  visitLiteral(literal: Literal): void;
  visitBinary(binary: BinaryExpression): void;
}

// Element
interface AstNode {
  accept(visitor: NodeVisitor): void;
}

// Concrete Element
class Literal implements AstNode {
  constructor(public value: number) {}
  accept(visitor: NodeVisitor) {
    visitor.visitLiteral(this);
  }
}

// Concrete Element
class BinaryExpression implements AstNode {
  constructor(public left: AstNode, public right: AstNode) {}
  accept(visitor: NodeVisitor) {
    visitor.visitBinary(this);
  }
}

// Concrete Visitor
class PrintVisitor implements NodeVisitor {
  visitLiteral(literal: Literal) {
    console.log(literal.value);
  }
  visitBinary(binary: BinaryExpression) {
    binary.left.accept(this);
    binary.right.accept(this);
  }
}

// Client
const ast = new BinaryExpression(new Literal(1), new Literal(2));
ast.accept(new PrintVisitor());`,
      },
    ],
  },
  {
    id: 'flux',
    name: 'Flux',
    category: 'Modern',
    description:
      'A unidirectional data flow architecture often used with React applications.',
    whenToUse: [
      'Your UI state becomes complex and needs predictable updates.',
      'You want to separate state updates from view rendering.',
    ],
    benefits: [
      'Predictable data flow with centralized state changes.',
      'Simplifies debugging with action logs.',
    ],
    downsides: [
      'Boilerplate for defining actions and dispatchers.',
      'Single store can grow large without modularization.',
    ],
    examples: [
      {
        title: 'Counter Flux Loop',
        code: `type Action = { type: 'increment' } | { type: 'reset' };

type State = { count: number };

// Dispatcher
class Dispatcher {
  private listeners: ((action: Action) => void)[] = [];
  register(listener: (action: Action) => void) {
    this.listeners.push(listener);
  }
  dispatch(action: Action) {
    this.listeners.forEach((listener) => listener(action));
  }
}

// Store
class Store {
  private state: State = { count: 0 };
  constructor(private dispatcher: Dispatcher) {
    dispatcher.register((action) => this.reduce(action));
  }
  private reduce(action: Action) {
    if (action.type === 'increment') {
      this.state.count++;
    } else {
      this.state.count = 0;
    }
    console.log('State:', this.state);
  }
}

// Client
const dispatcher = new Dispatcher();
new Store(dispatcher);
dispatcher.dispatch({ type: 'increment' });`,
      },
      {
        title: 'Todo Flux Example',
        code: `type TodoAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number };

type Todo = { id: number; text: string; completed: boolean };

type Listener = () => void;

// Store
class TodoStore {
  private todos: Todo[] = [];
  private listeners: Listener[] = [];

  constructor(dispatcher: Dispatcher) {
    dispatcher.register((action) => this.reduce(action));
  }

  private reduce(action: TodoAction) {
    if (action.type === 'add') {
      this.todos.push({ id: Date.now(), text: action.text, completed: false });
    } else {
      this.todos = this.todos.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    }
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }
}

// Client
const dispatcher = new Dispatcher();
const store = new TodoStore(dispatcher);
store.subscribe(() => console.log('Updated todos'));
dispatcher.dispatch({ type: 'add', text: 'Learn Flux' });`,
      },
    ],
  },
  {
    id: 'event-bus',
    name: 'Event Bus',
    category: 'Modern',
    description:
      'A simple publish/subscribe mechanism for decoupled communication across an application.',
    whenToUse: [
      'Different parts of the app should react to events without tight coupling.',
      'You want to reduce direct dependencies between modules.',
    ],
    benefits: [
      'Lightweight messaging that is easy to drop into any project.',
      'Supports many listeners reacting to the same event.',
    ],
    downsides: [
      'Harder to trace flows because communication is indirect.',
      'No built-in guarantees about delivery order or reliability.',
    ],
    examples: [
      {
        title: 'Basic Event Bus',
        code: `type Handler<T> = (payload: T) => void;

// Event Bus
class EventBus {
  private channels = new Map<string, Handler<unknown>[]>();

  on<T>(event: string, handler: Handler<T>) {
    const handlers = this.channels.get(event) ?? [];
    handlers.push(handler as Handler<unknown>);
    this.channels.set(event, handlers);
  }

  emit<T>(event: string, payload: T) {
    const handlers = this.channels.get(event) ?? [];
    handlers.forEach((handler) => handler(payload));
  }
}

// Client
const bus = new EventBus();
bus.on('login', (user: string) => console.log('User:', user));
bus.emit('login', 'Ada');`,
      },
      {
        title: 'Event Bus with Unsubscribe',
        code: `// Event Bus
class ReactiveBus {
  private listeners = new Map<string, Set<Function>>();

  on(event: string, listener: Function) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener);
    this.listeners.set(event, set);
    return () => set.delete(listener);
  }

  emit(event: string, payload: unknown) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

// Client
const reactive = new ReactiveBus();
const off = reactive.on('change', (value) => console.log('Changed', value));
reactive.emit('change', 1);
off();`,
      },
    ],
  },
  {
    id: 'cache-pattern',
    name: 'Cache Pattern',
    category: 'Modern',
    description:
      'Store expensive computation or fetch results so subsequent calls return quickly.',
    whenToUse: [
      'Fetching data or computing results is expensive.',
      'Duplicate requests for the same data are common.',
    ],
    benefits: [
      'Improves performance with minimal code.',
      'Reduces load on databases and APIs.',
    ],
    downsides: [
      'Cached data can become stale.',
      'Requires invalidation strategy and storage management.',
    ],
    examples: [
      {
        title: 'Function Memoization',
        code: `// Cache
function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, unknown>();
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  }) as T;
}

const slowFib = (n: number): number => (n <= 1 ? n : slowFib(n - 1) + slowFib(n - 2));
// Client
const fastFib = memoize(slowFib);
fastFib(20);`,
      },
      {
        title: 'Request Cache',
        code: `// Cache
class RequestCache {
  private cache = new Map<string, Promise<string>>();

  fetch(url: string) {
    if (!this.cache.has(url)) {
      this.cache.set(url, fetch(url).then((res) => res.text()));
    }
    return this.cache.get(url)!;
  }
}

// Client
const cache = new RequestCache();
cache.fetch('/api/profile');
cache.fetch('/api/profile');`,
      },
    ],
  },
];

const nav = document.getElementById('pattern-nav');
const summaryEl = document.getElementById('pattern-summary');
const benefitsEl = document.getElementById('pattern-benefits');
const examplesEl = document.getElementById('pattern-examples');
const titleEl = document.getElementById('pattern-title');
const categoryEl = document.getElementById('pattern-category');

const categories = patterns.reduce((map, pattern) => {
  if (!map.has(pattern.category)) {
    map.set(pattern.category, []);
  }
  map.get(pattern.category).push(pattern);
  return map;
}, new Map());

const navItems = new Map();

categories.forEach((items, category) => {
  const group = document.createElement('div');
  group.className = 'nav-group';

  const title = document.createElement('h2');
  title.className = 'nav-group__title';
  title.textContent = `${category} Patterns`;
  group.appendChild(title);

  items.forEach((pattern) => {
    const link = document.createElement('a');
    link.href = `#${pattern.id}`;
    link.className = 'nav-item';
    link.textContent = pattern.name;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActivePattern(pattern.id);
    });
    group.appendChild(link);
    navItems.set(pattern.id, link);
  });

  nav.appendChild(group);
});

function setActivePattern(id) {
  const pattern = patterns.find((item) => item.id === id);
  if (!pattern) return;

  navItems.forEach((link, patternId) => {
    link.classList.toggle('nav-item--active', patternId === id);
  });

  titleEl.textContent = pattern.name;
  categoryEl.textContent = `${pattern.category} Pattern`;

  summaryEl.innerHTML = `
    <h3 class="card__title">${icon('overview')}Overview</h3>
    <p>${pattern.description}</p>
    <div class="pattern-meta">
      <div>
        <h4 class="card__subtitle">${icon('usage')}When to use it</h4>
        <ul>
          ${pattern.whenToUse.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  benefitsEl.innerHTML = `
    <h3 class="card__title">${icon('balance')}Benefits & Trade-offs</h3>
    <div class="benefits-grid">
      <div>
        <h4 class="card__subtitle">${icon('pros', 'success')}Benefits</h4>
        <ul>
          ${pattern.benefits.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4 class="card__subtitle">${icon('cons', 'warning')}Downsides</h4>
        <ul>
          ${pattern.downsides.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  renderExamples(pattern);

  history.replaceState(null, '', `#${pattern.id}`);
}

function renderExamples(pattern) {
  examplesEl.innerHTML = '';
  const header = document.createElement('h3');
  header.className = 'card__title';
  header.innerHTML = `${icon('code')}TypeScript Examples`;
  examplesEl.appendChild(header);

  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  const tabList = document.createElement('div');
  tabList.className = 'tab-list';
  tabList.setAttribute('role', 'tablist');

  const panels = document.createElement('div');

  pattern.examples.forEach((example, index) => {
    const tab = document.createElement('button');
    tab.className = 'tab-button';
    tab.textContent = example.title;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.addEventListener('click', () => activateTab(index));
    tabList.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    if (index === 0) {
      panel.classList.add('tab-panel--active');
      tab.classList.add('tab-button--active');
    }

    const codeCard = document.createElement('div');
    codeCard.className = 'code-card';

    const codeHeader = document.createElement('div');
    codeHeader.className = 'code-card__header';

    const title = document.createElement('h4');
    title.className = 'code-card__title';
    title.textContent = example.title;

    const copy = document.createElement('button');
    copy.className = 'copy-button';
    copy.textContent = 'Copy code';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(example.code);
        copy.textContent = 'Copied!';
        setTimeout(() => (copy.textContent = 'Copy code'), 1500);
      } catch (error) {
        copy.textContent = 'Press Ctrl+C';
      }
    });

    codeHeader.appendChild(title);
    codeHeader.appendChild(copy);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-typescript';
    code.textContent = example.code;
    pre.appendChild(code);

    codeCard.appendChild(codeHeader);
    codeCard.appendChild(pre);

    panel.appendChild(codeCard);
    panels.appendChild(panel);
  });

  tabs.appendChild(tabList);
  tabs.appendChild(panels);
  examplesEl.appendChild(tabs);

  highlightSnippets(panels);

  function activateTab(index) {
    const buttons = tabList.querySelectorAll('.tab-button');
    const allPanels = panels.querySelectorAll('.tab-panel');

    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle('tab-button--active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    allPanels.forEach((panel, panelIndex) => {
      panel.classList.toggle('tab-panel--active', panelIndex === index);
      if (panelIndex === index) {
        highlightSnippets(panel);
      }
    });
  }
}

const initialId = window.location.hash.replace('#', '') || patterns[0].id;
setActivePattern(initialId);
