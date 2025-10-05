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

const patterns = [
  {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    description:
      'Provide an interface for creating families of related objects without specifying their concrete classes. Useful when products should work well together and you need to swap entire families easily.',
    diagram: `Client
  |
  v
AbstractFactory --> AbstractProductA
AbstractFactory --> AbstractProductB
  ^                   ^
  | implements        | implemented by
ConcreteFactoryA   ConcreteProductA1
ConcreteFactoryB   ConcreteProductB1`,
    structure: `interface AbstractProductA {}
interface AbstractProductB {}

interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
}

class ConcreteProductA1 implements AbstractProductA {}
class ConcreteProductB1 implements AbstractProductB {}

class ConcreteFactoryA implements AbstractFactory {
  createProductA(): AbstractProductA {
    return new ConcreteProductA1();
  }
  createProductB(): AbstractProductB {
    return new ConcreteProductB1();
  }
}

class ConcreteFactoryB implements AbstractFactory {
  createProductA(): AbstractProductA {
    return new ConcreteProductA1();
  }
  createProductB(): AbstractProductB {
    return new ConcreteProductB1();
  }
}

function client(factory: AbstractFactory) {
  const productA = factory.createProductA();
  const productB = factory.createProductB();
  return { productA, productB };
}`,
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
        code: `interface Button {
  render(): string;
}

interface Dialog {
  open(): string;
}

interface WidgetFactory {
  createButton(): Button;
  createDialog(): Dialog;
}

class DarkButton implements Button {
  render() {
    return 'Rendering dark button';
  }
}

class DarkDialog implements Dialog {
  open() {
    return 'Opening dark dialog';
  }
}

class DarkFactory implements WidgetFactory {
  createButton() {
    return new DarkButton();
  }
  createDialog() {
    return new DarkDialog();
  }
}

function renderUI(factory: WidgetFactory) {
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

interface CloudToolkit {
  createBucket(): StorageBucket;
  createQueue(): MessageQueue;
}

class AwsBucket implements StorageBucket {
  upload(file: string) {
    console.log('Uploading to S3', file);
  }
}

class AwsQueue implements MessageQueue {
  publish(message: string) {
    console.log('Publishing to SNS', message);
  }
}

class AwsToolkit implements CloudToolkit {
  createBucket() {
    return new AwsBucket();
  }
  createQueue() {
    return new AwsQueue();
  }
}

function deploy(toolkit: CloudToolkit) {
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
    diagram: `Client --> Director
Director --> Builder (defines steps)
  ^
  | implemented by
ConcreteBuilder ----> Product
Builder.build() --> FinishedResult`,
    structure: `interface Product {}

interface Builder {
  reset(): void;
  buildPart(): void;
  getResult(): Product;
}

class ConcreteBuilder implements Builder {
  reset(): void {}
  buildPart(): void {}
  getResult(): Product {
    return {} as Product;
  }
}

class Director {
  constructor(private builder: Builder) {}

  construct() {
    this.builder.reset();
    this.builder.buildPart();
  }
}

function client() {
  const builder = new ConcreteBuilder();
  const director = new Director(builder);
  director.construct();
  return builder.getResult();
}`,
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
        code: `interface HttpRequest {
  method: 'GET' | 'POST';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

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
    diagram: `Client --> Creator
Creator -- factoryMethod() --> Product
  ^                           ^
  | subclassed by            | realized by
ConcreteCreator ------> ConcreteProduct`,
    structure: `interface Product {
  operation(): void;
}

class ConcreteProduct implements Product {
  operation(): void {}
}

abstract class Creator {
  abstract factoryMethod(): Product;

  someOperation() {
    const product = this.factoryMethod();
    product.operation();
  }
}

class ConcreteCreator extends Creator {
  factoryMethod(): Product {
    return new ConcreteProduct();
  }
}

function client(creator: Creator) {
  creator.someOperation();
}`,
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

class ConsoleLogger extends Logger {
  log(message: string) {
    console.log('[console]', message);
  }
}

class FileLogger extends Logger {
  log(message: string) {
    console.log('[file]', message);
  }
}

abstract class LoggerCreator {
  abstract createLogger(): Logger;

  report(message: string) {
    const logger = this.createLogger();
    logger.log(message);
  }
}

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

class SmsNotifier extends Notifier {
  send(message: string) {
    console.log('SMS:', message);
  }
}

class EmailNotifier extends Notifier {
  send(message: string) {
    console.log('Email:', message);
  }
}

abstract class NotifierCreator {
  abstract createNotifier(): Notifier;

  notifyUser(message: string) {
    this.createNotifier().send(message);
  }
}

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
    diagram: `Client --> Prototype.clone()
Prototype (interface)
  ^
  | implemented by
ConcretePrototype -- clones --> CopiedObject`,
    structure: `interface Prototype<T> {
  clone(): T;
}

class ConcretePrototype implements Prototype<ConcretePrototype> {
  constructor(public state: string) {}

  clone(): ConcretePrototype {
    return new ConcretePrototype(this.state);
  }
}

class PrototypeClient {
  constructor(private readonly prototype: Prototype<ConcretePrototype>) {}

  clonePrototype() {
    return this.prototype.clone();
  }
}

function client() {
  const prototype = new ConcretePrototype('ready');
  const api = new PrototypeClient(prototype);
  return api.clonePrototype();
}`,
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
const copy = invoice.clone();
copy.sections.push('Notes');`,
      },
      {
        title: 'Enemy Prototype',
        code: `type EnemyStats = {
  health: number;
  attack: number;
};

class Enemy implements Prototype<Enemy> {
  constructor(public type: string, public stats: EnemyStats) {}

  clone() {
    return new Enemy(this.type, { ...this.stats });
  }
}

const baseOrc = new Enemy('Orc', { health: 100, attack: 15 });
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
    diagram: `Client --> Singleton.getInstance()
Singleton -- stores --> single instance
getInstance() --> shared object reference`,
    structure: `class Singleton {
  private static instance: Singleton | null = null;

  private constructor() {}

  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

function client() {
  const first = Singleton.getInstance();
  const second = Singleton.getInstance();
  return first === second;
}`,
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
        code: `class AppConfig {
  private static instance: AppConfig | undefined;

  private constructor(public readonly apiUrl: string) {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new AppConfig('https://api.example.com');
    }
    return this.instance;
  }
}

const config = AppConfig.getInstance();`,
      },
      {
        title: 'Lazy Database Connection',
        code: `class Database {
  private static connection: Database | null = null;

  private constructor(private connectionString: string) {}

  static connect() {
    if (!Database.connection) {
      Database.connection = new Database('postgres://localhost');
    }
    return Database.connection;
  }
}

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
    diagram: `Client --> Target interface
Adapter implements Target
Adapter --> Adaptee
Adaptee provides legacy behavior`,
    structure: `interface Target {
  request(): void;
}

class Adaptee {
  specificRequest(): void {}
}

class Adapter implements Target {
  constructor(private adaptee: Adaptee) {}

  request(): void {
    this.adaptee.specificRequest();
  }
}

function client(target: Target) {
  target.request();
}`,
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
        code: `interface PaymentProcessor {
  pay(total: number): void;
}

class Stripe {
  charge(amount: number) {
    console.log('Charging', amount);
  }
}

class StripeAdapter implements PaymentProcessor {
  constructor(private stripe: Stripe) {}

  pay(total: number) {
    this.stripe.charge(total);
  }
}

function checkout(processor: PaymentProcessor) {
  processor.pay(42);
}

checkout(new StripeAdapter(new Stripe()));`,
      },
      {
        title: 'Legacy Logger Adapter',
        code: `interface Logger {
  info(message: string): void;
}

class LegacyLogger {
  write(message: string) {
    console.log('[legacy]', message);
  }
}

class LoggerAdapter implements Logger {
  constructor(private legacy: LegacyLogger) {}

  info(message: string) {
    this.legacy.write(message);
  }
}

const logger = new LoggerAdapter(new LegacyLogger());
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
    diagram: `Client --> Abstraction
Abstraction --> Implementor (bridge)
  ^                   ^
  | refined by        | implemented by
RefinedAbstraction  ConcreteImplementor`,
    structure: `interface Implementor {
  operationImpl(): void;
}

class ConcreteImplementor implements Implementor {
  operationImpl(): void {}
}

class Abstraction {
  constructor(protected implementor: Implementor) {}

  operation() {
    this.implementor.operationImpl();
  }
}

class RefinedAbstraction extends Abstraction {
  operation() {
    super.operation();
  }
}

function client() {
  const implementor = new ConcreteImplementor();
  const abstraction = new RefinedAbstraction(implementor);
  abstraction.operation();
}`,
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
        code: `interface Device {
  togglePower(): void;
  setChannel(channel: number): void;
}

class Tv implements Device {
  togglePower() {
    console.log('TV power');
  }
  setChannel(channel: number) {
    console.log('TV channel', channel);
  }
}

class RemoteControl {
  constructor(protected device: Device) {}

  toggle() {
    this.device.togglePower();
  }
}

class AdvancedRemoteControl extends RemoteControl {
  setChannel(channel: number) {
    this.device.setChannel(channel);
  }
}

const remote = new AdvancedRemoteControl(new Tv());
remote.toggle();
remote.setChannel(7);`,
      },
      {
        title: 'Report & Exporter Bridge',
        code: `interface Exporter {
  export(data: object): string;
}

class JsonExporter implements Exporter {
  export(data: object) {
    return JSON.stringify(data);
  }
}

abstract class Report {
  constructor(protected exporter: Exporter) {}
  abstract build(): object;

  print() {
    console.log(this.exporter.export(this.build()));
  }
}

class SalesReport extends Report {
  build() {
    return { total: 1000, region: 'EU' };
  }
}

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
    diagram: `Client --> Component interface
Component <-- Leaf element
Component <-- Composite node
Composite --> children: Component[]`,
    structure: `interface Component {
  operation(): void;
}

class Leaf implements Component {
  operation(): void {}
}

class Composite implements Component {
  private children: Component[] = [];

  add(component: Component) {
    this.children.push(component);
  }

  operation(): void {
    this.children.forEach((child) => child.operation());
  }
}

function client(component: Component) {
  component.operation();
}`,
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
        code: `interface FileSystemNode {
  getSize(): number;
}

class FileLeaf implements FileSystemNode {
  constructor(private size: number) {}
  getSize() {
    return this.size;
  }
}

class Folder implements FileSystemNode {
  private children: FileSystemNode[] = [];

  add(child: FileSystemNode) {
    this.children.push(child);
  }

  getSize() {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }
}

const root = new Folder();
root.add(new FileLeaf(10));
root.add(new FileLeaf(20));
console.log(root.getSize());`,
      },
      {
        title: 'UI Component Tree',
        code: `interface Component {
  draw(): void;
}

class Button implements Component {
  draw() {
    console.log('Drawing button');
  }
}

class Panel implements Component {
  private children: Component[] = [];

  add(component: Component) {
    this.children.push(component);
  }

  draw() {
    this.children.forEach((child) => child.draw());
  }
}

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
    diagram: `Client --> Component interface
ConcreteComponent implements Component
Decorator implements Component + holds Component
ConcreteDecorator --> wraps another Component`,
    structure: `interface Component {
  operation(): void;
}

class ConcreteComponent implements Component {
  operation(): void {}
}

abstract class Decorator implements Component {
  constructor(protected component: Component) {}

  operation(): void {
    this.component.operation();
  }
}

class ConcreteDecorator extends Decorator {
  operation(): void {
    super.operation();
  }
}

function client(component: Component) {
  component.operation();
}`,
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
        code: `interface Coffee {
  cost(): number;
}

class Espresso implements Coffee {
  cost() {
    return 2;
  }
}

class MilkDecorator implements Coffee {
  constructor(private base: Coffee) {}

  cost() {
    return this.base.cost() + 0.5;
  }
}

const latte = new MilkDecorator(new Espresso());
console.log(latte.cost());`,
      },
      {
        title: 'HTTP Client with Decorators',
        code: `interface HttpClient {
  get(url: string): Promise<string>;
}

class FetchClient implements HttpClient {
  async get(url: string) {
    const res = await fetch(url);
    return res.text();
  }
}

class LoggingClient implements HttpClient {
  constructor(private inner: HttpClient) {}

  async get(url: string) {
    console.log('Requesting', url);
    return this.inner.get(url);
  }
}

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
    diagram: `Client --> Facade
Facade --> SubsystemA
Facade --> SubsystemB
Facade orchestrates multiple subsystems`,
    structure: `class SubsystemA {
  operationA(): void {}
}

class SubsystemB {
  operationB(): void {}
}

class Facade {
  constructor(
    private subsystemA = new SubsystemA(),
    private subsystemB = new SubsystemB(),
  ) {}

  simpleOperation() {
    this.subsystemA.operationA();
    this.subsystemB.operationB();
  }
}

function client(facade: Facade) {
  facade.simpleOperation();
}`,
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
        code: `class FileLoader {
  load(path: string) {
    console.log('Loading file', path);
  }
}

class CodecConverter {
  convert(format: string) {
    console.log('Converting to', format);
  }
}

class VideoConverterFacade {
  private loader = new FileLoader();
  private converter = new CodecConverter();

  convert(path: string, format: string) {
    this.loader.load(path);
    this.converter.convert(format);
    console.log('Done!');
  }
}

new VideoConverterFacade().convert('intro.mov', 'mp4');`,
      },
      {
        title: 'Analytics Facade',
        code: `class EventTracker {
  track(event: string) {
    console.log('Tracking', event);
  }
}

class UserStorage {
  save(userId: string) {
    console.log('Saving user', userId);
  }
}

class AnalyticsFacade {
  private tracker = new EventTracker();
  private storage = new UserStorage();

  identify(userId: string) {
    this.storage.save(userId);
    this.tracker.track('identify');
  }
}

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
    diagram: `Client --> FlyweightFactory
FlyweightFactory --> shared Flyweight
Flyweight.operation(extrinsic)
Client supplies extrinsic state per call`,
    structure: `interface Flyweight {
  operation(extrinsic: string): void;
}

class ConcreteFlyweight implements Flyweight {
  constructor(private intrinsic: string) {}

  operation(extrinsic: string): void {}
}

class FlyweightFactory {
  private cache = new Map<string, Flyweight>();

  getFlyweight(key: string): Flyweight {
    if (!this.cache.has(key)) {
      this.cache.set(key, new ConcreteFlyweight(key));
    }
    return this.cache.get(key)!;
  }
}

function client(factory: FlyweightFactory, key: string, extrinsic: string) {
  const flyweight = factory.getFlyweight(key);
  flyweight.operation(extrinsic);
}`,
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
        code: `class TreeType {
  constructor(public texture: string) {}
}

class TreeFactory {
  private types = new Map<string, TreeType>();

  getType(texture: string) {
    if (!this.types.has(texture)) {
      this.types.set(texture, new TreeType(texture));
    }
    return this.types.get(texture)!;
  }
}

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

class GlyphFactory {
  private glyphs = new Map<string, GlyphState>();

  get(symbol: string) {
    if (!this.glyphs.has(symbol)) {
      this.glyphs.set(symbol, { symbol });
    }
    return this.glyphs.get(symbol)!;
  }
}

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
    diagram: `Client --> Subject interface
Proxy implements Subject --> RealSubject
Proxy guards access and forwards calls
RealSubject performs the real work`,
    structure: `interface Subject {
  request(): void;
}

class RealSubject implements Subject {
  request(): void {}
}

class Proxy implements Subject {
  constructor(private realSubject: RealSubject) {}

  request(): void {
    this.realSubject.request();
  }
}

function client(subject: Subject) {
  subject.request();
}`,
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
        code: `interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private path: string) {}

  display() {
    console.log('Showing image', this.path);
  }
}

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

const image = new ImageProxy('logo.png');
image.display();`,
      },
      {
        title: 'Permissions Proxy',
        code: `interface Document {
  read(): string;
}

class ProtectedDocument implements Document {
  constructor(private content: string) {}

  read() {
    return this.content;
  }
}

class DocumentProxy implements Document {
  constructor(private doc: Document, private canRead: boolean) {}

  read() {
    if (!this.canRead) {
      throw new Error('Access denied');
    }
    return this.doc.read();
  }
}

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
    diagram: `Client --> Handler1
Handler1 --> Handler2 --> Handler3
Each handler can process or delegate
Chain stops when a handler handles the request`,
    structure: `abstract class Handler {
  private next?: Handler;

  setNext(handler: Handler) {
    this.next = handler;
    return handler;
  }

  handle(request: string) {
    if (this.next) {
      this.next.handle(request);
    }
  }
}

class ConcreteHandler1 extends Handler {
  handle(request: string) {
    super.handle(request);
  }
}

class ConcreteHandler2 extends Handler {
  handle(request: string) {
    super.handle(request);
  }
}

function client(handler: Handler) {
  handler.handle('request');
}`,
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
        code: `abstract class SupportHandler {
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

class AgentSupport extends SupportHandler {
  handle(level: 'low' | 'high') {
    if (level === 'low') {
      console.log('Agent resolved ticket');
    } else {
      super.handle(level);
    }
  }
}

class ManagerSupport extends SupportHandler {
  handle(level: 'low' | 'high') {
    if (level === 'high') {
      console.log('Manager resolved ticket');
    } else {
      super.handle(level);
    }
  }
}

const supportChain = new AgentSupport();
supportChain.setNext(new ManagerSupport());
supportChain.handle('high');`,
      },
      {
        title: 'Middleware Chain',
        code: `type Context = { user?: string };

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

class AuthMiddleware extends Middleware {
  handle(context: Context) {
    if (!context.user) {
      throw new Error('No user');
    }
    console.log('User authenticated');
    super.handle(context);
  }
}

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
    diagram: `Client --> Invoker
Invoker --> Command.execute()
Command --> Receiver
ConcreteCommand binds Receiver action`,
    structure: `interface Command {
  execute(): void;
}

class Receiver {
  action(): void {}
}

class ConcreteCommand implements Command {
  constructor(private receiver: Receiver) {}

  execute(): void {
    this.receiver.action();
  }
}

class Invoker {
  constructor(private command: Command) {}

  run() {
    this.command.execute();
  }
}

function client() {
  const receiver = new Receiver();
  const command = new ConcreteCommand(receiver);
  const invoker = new Invoker(command);
  invoker.run();
}`,
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
        code: `interface Command {
  execute(): void;
}

class Light {
  on() {
    console.log('Light on');
  }
  off() {
    console.log('Light off');
  }
}

class OnCommand implements Command {
  constructor(private light: Light) {}
  execute() {
    this.light.on();
  }
}

class Remote {
  constructor(private command: Command) {}
  press() {
    this.command.execute();
  }
}

new Remote(new OnCommand(new Light())).press();`,
      },
      {
        title: 'Queueable Job Command',
        code: `interface Job {
  run(): Promise<void>;
}

class EmailJob implements Job {
  async run() {
    console.log('Sending email...');
  }
}

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
    diagram: `Client --> Expression.interpret(context)
Expression (abstract)
  |-- TerminalExpression
  |-- NonterminalExpression (combines expressions)
Context supplies variables and state`,
    structure: `interface Expression {
  interpret(context: Map<string, number>): number;
}

class TerminalExpression implements Expression {
  constructor(private value: number) {}

  interpret(): number {
    return this.value;
  }
}

class NonterminalExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

function client(expression: Expression, context = new Map<string, number>()) {
  return expression.interpret(context);
}`,
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
        code: `interface Expression {
  interpret(): number;
}

class NumberLiteral implements Expression {
  constructor(private value: number) {}

  interpret() {
    return this.value;
  }
}

class Add implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret() {
    return this.left.interpret() + this.right.interpret();
  }
}

const result = new Add(new NumberLiteral(2), new NumberLiteral(3)).interpret();`,
      },
      {
        title: 'Boolean DSL',
        code: `interface BooleanExpression {
  interpret(context: Record<string, boolean>): boolean;
}

class Variable implements BooleanExpression {
  constructor(private name: string) {}
  interpret(context: Record<string, boolean>) {
    return context[this.name];
  }
}

class And implements BooleanExpression {
  constructor(private left: BooleanExpression, private right: BooleanExpression) {}
  interpret(context: Record<string, boolean>) {
    return this.left.interpret(context) && this.right.interpret(context);
  }
}

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
    diagram: `Client --> Aggregate
Aggregate --> createIterator()
Iterator --> next() / hasNext()
ConcreteIterator traverses ConcreteAggregate`,
    structure: `interface Iterator<T> {
  next(): T | undefined;
  hasNext(): boolean;
}

interface Aggregate<T> {
  createIterator(): Iterator<T>;
}

class ConcreteIterator implements Iterator<string> {
  private index = 0;

  constructor(private items: string[]) {}

  next(): string | undefined {
    return this.items[this.index++];
  }

  hasNext(): boolean {
    return this.index < this.items.length;
  }
}

class ConcreteAggregate implements Aggregate<string> {
  constructor(private items: string[]) {}

  createIterator(): Iterator<string> {
    return new ConcreteIterator(this.items);
  }
}

function client(aggregate: Aggregate<string>) {
  const iterator = aggregate.createIterator();
  while (iterator.hasNext()) {
    iterator.next();
  }
}`,
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
        code: `class Range implements Iterable<number> {
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

for (const value of new Range(1, 3)) {
  console.log(value);
}`,
      },
      {
        title: 'Playlist Iterator',
        code: `class Playlist implements Iterable<string> {
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
    diagram: `ColleagueA --> Mediator <-- ColleagueB
Mediator routes messages between colleagues
Colleagues only talk to the Mediator
Mediator can trigger operations back on colleagues`,
    structure: `interface Mediator {
  notify(sender: Colleague, event: string): void;
}

class ConcreteMediator implements Mediator {
  colleagueA!: Colleague;
  colleagueB!: Colleague;

  notify(sender: Colleague, event: string): void {
    if (sender === this.colleagueA) {
      this.colleagueB.receive(event);
    } else {
      this.colleagueA.receive(event);
    }
  }
}

class Colleague {
  constructor(private mediator: Mediator) {}

  send(event: string) {
    this.mediator.notify(this, event);
  }

  receive(event: string) {}
}

function client() {
  const mediator = new ConcreteMediator();
  const colleagueA = new Colleague(mediator);
  const colleagueB = new Colleague(mediator);
  mediator.colleagueA = colleagueA;
  mediator.colleagueB = colleagueB;
  colleagueA.send('ping');
}`,
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
        code: `class ChatRoom {
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

const room = new ChatRoom();
const alex = new Participant('Alex', room);
alex.send('Hello');`,
      },
      {
        title: 'UI Form Mediator',
        code: `class FormMediator {
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

class TextField extends FormField {
  blur() {
    console.log('Field blurred');
  }
}

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
    diagram: `Originator --> createMemento() -> Memento
Caretaker stores Memento snapshots
Caretaker --> restore() --> Originator
Memento carries the saved state data`,
    structure: `class Memento {
  constructor(public readonly state: string) {}
}

class Originator {
  constructor(private state = '') {}

  createMemento(): Memento {
    return new Memento(this.state);
  }

  restore(memento: Memento) {
    this.state = memento.state;
  }
}

class Caretaker {
  private history: Memento[] = [];

  backup(originator: Originator) {
    this.history.push(originator.createMemento());
  }

  undo(originator: Originator) {
    const memento = this.history.pop();
    if (memento) {
      originator.restore(memento);
    }
  }
}

function client() {
  const originator = new Originator('initial');
  const caretaker = new Caretaker();
  caretaker.backup(originator);
  caretaker.undo(originator);
}`,
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
        code: `class EditorMemento {
  constructor(public readonly content: string) {}
}

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

class GameMemento {
  constructor(public readonly state: GameState) {}
}

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
    diagram: `Subject <-- register() -- Observer
Subject.stateChanged() --> notifyObservers()
Observers implement update()
Multiple observers react to the same subject`,
    structure: `interface Observer {
  update(state: string): void;
}

class Subject {
  private observers: Observer[] = [];

  register(observer: Observer) {
    this.observers.push(observer);
  }

  notify(state: string) {
    this.observers.forEach((observer) => observer.update(state));
  }
}

class ConcreteObserver implements Observer {
  update(state: string): void {}
}

function client() {
  const subject = new Subject();
  subject.register(new ConcreteObserver());
  subject.notify('updated');
}`,
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

class StockTicker {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  update(price: number) {
    this.listeners.forEach((listener) => listener(price));
  }
}

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

class WeatherStation {
  private observers = new Set<WeatherObserver>();

  add(observer: WeatherObserver) {
    this.observers.add(observer);
  }

  setTemperature(temp: number) {
    this.observers.forEach((observer) => observer.notify(temp));
  }
}

class Display implements WeatherObserver {
  notify(temp: number) {
    console.log('Now', temp);
  }
}

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
    diagram: `Context --> current State
State.handle(context)
State interface <-- ConcreteStateA/B
ConcreteState can swap Context.state`,
    structure: `interface State {
  handle(context: Context): void;
}

class Context {
  constructor(public state: State) {}

  request() {
    this.state.handle(this);
  }
}

class ConcreteStateA implements State {
  handle(context: Context): void {
    context.state = new ConcreteStateB();
  }
}

class ConcreteStateB implements State {
  handle(context: Context): void {
    context.state = new ConcreteStateA();
  }
}

function client() {
  const context = new Context(new ConcreteStateA());
  context.request();
}`,
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
        code: `interface OrderState {
  next(order: Order): void;
}

class Order {
  constructor(public state: OrderState) {}

  advance() {
    this.state.next(this);
  }
}

class PendingState implements OrderState {
  next(order: Order) {
    order.state = new ShippedState();
  }
}

class ShippedState implements OrderState {
  next(order: Order) {
    order.state = new DeliveredState();
  }
}

class DeliveredState implements OrderState {
  next() {
    console.log('Order complete');
  }
}

const order = new Order(new PendingState());
order.advance();`,
      },
      {
        title: 'Audio Player States',
        code: `interface PlayerState {
  play(player: AudioPlayer): void;
}

class AudioPlayer {
  state: PlayerState = new StoppedState();

  play() {
    this.state.play(this);
  }
}

class StoppedState implements PlayerState {
  play(player: AudioPlayer) {
    console.log('Playing');
    player.state = new PlayingState();
  }
}

class PlayingState implements PlayerState {
  play(player: AudioPlayer) {
    console.log('Already playing');
  }
}

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
    diagram: `Client selects Strategy
Context --> Strategy interface
Strategy interface <-- ConcreteStrategyA/B
Context delegates algorithm to Strategy`,
    structure: `interface Strategy {
  execute(data: string[]): string[];
}

class ConcreteStrategyA implements Strategy {
  execute(data: string[]): string[] {
    return [...data].sort();
  }
}

class ConcreteStrategyB implements Strategy {
  execute(data: string[]): string[] {
    return [...data].reverse();
  }
}

class Context {
  constructor(private strategy: Strategy) {}

  run(data: string[]) {
    return this.strategy.execute(data);
  }
}

function client() {
  const context = new Context(new ConcreteStrategyA());
  return context.run(['a', 'b', 'c']);
}`,
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
        code: `interface ShippingStrategy {
  calculate(weight: number): number;
}

class GroundShipping implements ShippingStrategy {
  calculate(weight: number) {
    return weight * 1.2;
  }
}

class AirShipping implements ShippingStrategy {
  calculate(weight: number) {
    return weight * 2.5;
  }
}

class ShippingCostCalculator {
  constructor(private strategy: ShippingStrategy) {}

  total(weight: number) {
    return this.strategy.calculate(weight);
  }
}

new ShippingCostCalculator(new GroundShipping()).total(3);`,
      },
      {
        title: 'Sorting Strategy',
        code: `type SortStrategy = {
  sort(items: number[]): number[];
};

class AscendingSort implements SortStrategy {
  sort(items: number[]) {
    return [...items].sort((a, b) => a - b);
  }
}

class DescendingSort implements SortStrategy {
  sort(items: number[]) {
    return [...items].sort((a, b) => b - a);
  }
}

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
    diagram: `AbstractClass --> templateMethod()
templateMethod() calls primitive steps
ConcreteClass overrides primitiveOperation()
Shared steps live in AbstractClass`,
    structure: `abstract class AbstractClass {
  templateMethod() {
    this.stepOne();
    this.stepTwo();
  }

  protected abstract stepOne(): void;

  protected stepTwo(): void {}
}

class ConcreteClass extends AbstractClass {
  protected stepOne(): void {}
}

function client() {
  const instance = new ConcreteClass();
  instance.templateMethod();
}`,
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
        code: `abstract class DataExporter {
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

class JsonExporter extends DataExporter {
  protected fetchData() {
    return '{"name":"Pat"}';
  }
  protected transform(data: string) {
    return data.toUpperCase();
  }
}

new JsonExporter().export();`,
      },
      {
        title: 'Build Pipeline Template',
        code: `abstract class BuildPipeline {
  run() {
    this.install();
    this.test();
    this.deploy();
  }

  protected abstract install(): void;
  protected abstract test(): void;
  protected abstract deploy(): void;
}

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
    diagram: `Client --> Element.accept(visitor)
Element interface <-- ConcreteElementA/B
Visitor interface <-- ConcreteVisitor
accept() calls visitor.visitConcreteElement(this)`,
    structure: `interface Visitor {
  visitElementA(element: ConcreteElementA): void;
  visitElementB(element: ConcreteElementB): void;
}

interface Element {
  accept(visitor: Visitor): void;
}

class ConcreteElementA implements Element {
  accept(visitor: Visitor): void {
    visitor.visitElementA(this);
  }
}

class ConcreteElementB implements Element {
  accept(visitor: Visitor): void {
    visitor.visitElementB(this);
  }
}

class ConcreteVisitor implements Visitor {
  visitElementA(element: ConcreteElementA): void {}
  visitElementB(element: ConcreteElementB): void {}
}

function client(elements: Element[], visitor: Visitor) {
  elements.forEach((element) => element.accept(visitor));
}`,
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
        code: `interface ProductVisitor {
  visitBook(book: Book): number;
  visitFood(food: Food): number;
}

interface Product {
  accept(visitor: ProductVisitor): number;
}

class Book implements Product {
  constructor(public price: number) {}
  accept(visitor: ProductVisitor) {
    return visitor.visitBook(this);
  }
}

class Food implements Product {
  constructor(public price: number) {}
  accept(visitor: ProductVisitor) {
    return visitor.visitFood(this);
  }
}

class TaxCalculator implements ProductVisitor {
  visitBook(book: Book) {
    return book.price * 1.1;
  }
  visitFood(food: Food) {
    return food.price * 1.05;
  }
}

const cart: Product[] = [new Book(20), new Food(10)];
const total = cart.reduce((sum, item) => sum + item.accept(new TaxCalculator()), 0);`,
      },
      {
        title: 'AST Visitor',
        code: `interface NodeVisitor {
  visitLiteral(literal: Literal): void;
  visitBinary(binary: BinaryExpression): void;
}

interface AstNode {
  accept(visitor: NodeVisitor): void;
}

class Literal implements AstNode {
  constructor(public value: number) {}
  accept(visitor: NodeVisitor) {
    visitor.visitLiteral(this);
  }
}

class BinaryExpression implements AstNode {
  constructor(public left: AstNode, public right: AstNode) {}
  accept(visitor: NodeVisitor) {
    visitor.visitBinary(this);
  }
}

class PrintVisitor implements NodeVisitor {
  visitLiteral(literal: Literal) {
    console.log(literal.value);
  }
  visitBinary(binary: BinaryExpression) {
    binary.left.accept(this);
    binary.right.accept(this);
  }
}

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
    diagram: `View --> Action --> Dispatcher
Dispatcher --> Store (register listeners)
Store updates state --> View re-renders
Cycle repeats with unidirectional flow`,
    structure: `type Action = { type: string; payload?: unknown };

type State = { value: number };

class Dispatcher {
  private listeners: ((action: Action) => void)[] = [];

  register(listener: (action: Action) => void) {
    this.listeners.push(listener);
  }

  dispatch(action: Action) {
    this.listeners.forEach((listener) => listener(action));
  }
}

class Store {
  private state: State = { value: 0 };

  constructor(dispatcher: Dispatcher) {
    dispatcher.register((action) => this.reduce(action));
  }

  private reduce(action: Action) {
    if (action.type === 'increment') {
      this.state = { value: this.state.value + 1 };
    }
  }
}

class View {
  constructor(private dispatcher: Dispatcher) {}

  triggerIncrement() {
    this.dispatcher.dispatch({ type: 'increment' });
  }
}

function client() {
  const dispatcher = new Dispatcher();
  new Store(dispatcher);
  new View(dispatcher).triggerIncrement();
}`,
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

class Dispatcher {
  private listeners: ((action: Action) => void)[] = [];
  register(listener: (action: Action) => void) {
    this.listeners.push(listener);
  }
  dispatch(action: Action) {
    this.listeners.forEach((listener) => listener(action));
  }
}

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
    diagram: `Publisher --> EventBus.emit(event)
EventBus notifies SubscriberA, SubscriberB
Subscribers handle(payload)
Subscribers can subscribe/unsubscribe dynamically`,
    structure: `type EventHandler = (payload: unknown) => void;

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();

  subscribe(event: string, handler: EventHandler) {
    const handlers = this.listeners.get(event) ?? new Set<EventHandler>();
    handlers.add(handler);
    this.listeners.set(event, handlers);
  }

  emit(event: string, payload: unknown) {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }
}

class Publisher {
  constructor(private bus: EventBus) {}

  publish(event: string, payload: unknown) {
    this.bus.emit(event, payload);
  }
}

class Subscriber {
  constructor(bus: EventBus) {
    bus.subscribe('event', (payload) => this.handle(payload));
  }

  handle(payload: unknown) {}
}

function client() {
  const bus = new EventBus();
  new Subscriber(bus);
  new Publisher(bus).publish('event', {});
}`,
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

const bus = new EventBus();
bus.on('login', (user: string) => console.log('User:', user));
bus.emit('login', 'Ada');`,
      },
      {
        title: 'Event Bus with Unsubscribe',
        code: `class ReactiveBus {
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
    diagram: `Client --> Cache.lookup(key)
Cache hit? --> return cached value
Cache miss --> DataSource.fetch()
Store new value back in Cache`,
    structure: `interface DataSource {
  fetch(key: string): Promise<string>;
}

class Cache {
  private store = new Map<string, string>();

  constructor(private source: DataSource) {}

  async lookup(key: string) {
    if (!this.store.has(key)) {
      const value = await this.source.fetch(key);
      this.store.set(key, value);
    }
    return this.store.get(key);
  }
}

class ApiSource implements DataSource {
  async fetch(key: string): Promise<string> {
    return 'value for ' + key;
  }
}

async function client() {
  const cache = new Cache(new ApiSource());
  await cache.lookup('users');
}`,
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
        code: `function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
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
const fastFib = memoize(slowFib);
fastFib(20);`,
      },
      {
        title: 'Request Cache',
        code: `class RequestCache {
  private cache = new Map<string, Promise<string>>();

  fetch(url: string) {
    if (!this.cache.has(url)) {
      this.cache.set(url, fetch(url).then((res) => res.text()));
    }
    return this.cache.get(url)!;
  }
}

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
    <h3>Overview</h3>
    <p>${pattern.description}</p>
    <div class="pattern-overview">
      <div class="pattern-meta">
        <div>
          <h4>When to use it</h4>
          <ul>
            ${pattern.whenToUse.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="pattern-diagram">
        <h4 class="structure-heading">Structure Overview</h4>
        <pre>${pattern.diagram}</pre>
      </div>
    </div>
  `;

  benefitsEl.innerHTML = `
    <h3>Benefits & Trade-offs</h3>
    <div class="benefits-grid">
      <div>
        <h4>Benefits</h4>
        <ul>
          ${pattern.benefits.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4>Downsides</h4>
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
  header.textContent = 'TypeScript Examples';
  examplesEl.appendChild(header);

  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  const tabList = document.createElement('div');
  tabList.className = 'tab-list';
  tabList.setAttribute('role', 'tablist');

  const panels = document.createElement('div');

  const examples = pattern.structure
    ? [{ title: 'Structure Overview', code: pattern.structure, isStructure: true }, ...pattern.examples]
    : [...pattern.examples];

  examples.forEach((example, index) => {
    const tab = document.createElement('button');
    tab.className = 'tab-button';
    tab.textContent = example.title;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.addEventListener('click', () => activateTab(index));
    if (example.isStructure) {
      tab.classList.add('tab-button--structure');
    }
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
    if (example.isStructure) {
      title.classList.add('code-card__title--structure');
    }

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
