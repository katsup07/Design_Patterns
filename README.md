# Design Patterns Guide

A comprehensive, TypeScript-focused guide to classic and modern design patterns with clear explanations and simple examples.

<img width="2549" height="1130" alt="Design-Patterns-Guide-10-05-2025_11_05_PM" src="https://github.com/user-attachments/assets/1e82363e-3a8a-46b0-9354-b15952686765" />

## Overview

This interactive web application provides detailed explanations of 26+ software design patterns, organized into Creational, Structural, Behavioral, and Modern categories. Each pattern includes:

- Clear description and use cases
- Benefits and when to use it
- TypeScript code examples with syntax highlighting
- Visual ASCII diagrams

## Patterns Covered

### Creational Patterns
- Abstract Factory
- Builder
- Factory Method
- Prototype
- Singleton

### Structural Patterns
- Adapter
- Bridge
- Composite
- Decorator
- Facade
- Flyweight
- Proxy

### Behavioral Patterns
- Chain of Responsibility
- Command
- Interpreter
- Iterator
- Mediator
- Memento
- Observer
- State
- Strategy
- Template Method
- Visitor

### Modern Patterns
- Flux
- Event Bus
- Cache Pattern

## Project Structure

```
Design_Patterns/
├── Design_Patterns/
│   ├── index.html          # Main application structure
│   ├── script.js           # Pattern data and interactive logic
│   ├── styles.css          # Application styling
│   ├── robot-logo.svg      # Application logo
│   └── README.md
├── vercel.json             # Vercel deployment configuration
└── 404.html                # Custom 404 page
```

## Features

- **Interactive Navigation**: Browse patterns by category with a clean sidebar interface
- **Syntax Highlighting**: Custom TypeScript syntax highlighting for code examples
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **SEO Optimized**: Includes meta tags for social sharing and search engines
- **Fast Loading**: Optimized caching headers configured for static assets

## Getting Started

### Local Development

1. Clone the repository
2. Open `Design_Patterns/index.html` in a web browser, or serve it with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (serve)
npx serve Design_Patterns

# Using Node.js (http-server)
npx http-server Design_Patterns
```

3. Navigate to the local server URL in your browser:
   - Python: `http://localhost:8000`
   - serve: `http://localhost:3000`
   - http-server: `http://localhost:8080`

### Deployment

The project is configured for deployment on Vercel with optimized caching headers. Simply connect your repository to Vercel or run:

```bash
vercel deploy
```

## Technologies

- Pure HTML/CSS/JavaScript (no framework dependencies)
- Custom TypeScript syntax highlighting
- Google Fonts (Inter)
- Semantic HTML structure