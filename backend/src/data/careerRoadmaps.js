/**
 * Static career roadmap data for all supported domains.
 * Includes 57 comprehensive job roles across 7 major tech categories.
 * Each domain features multi-stage roadmaps, topics, study resources, and stage projects.
 */

export const CAREER_DOMAINS = [
  // ── SOFTWARE ENGINEERING ───────────────────────────────────────
  {
    id: 'frontend',
    title: 'Frontend Development',
    category: 'Software Engineering',
    icon: '🌐', color: '#4f46e5', gradient: 'from-indigo-500 to-violet-500',
    description: 'Build stunning, interactive web interfaces using modern HTML, CSS, JavaScript, and React.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'Web Foundations', description: 'Master HTML5, CSS layout systems, Flexbox, Grid, and responsive design.', durationWeeks: 4, difficulty: 'Beginner', badge: '🏗️',
        topics: ['HTML5 Semantic Markup', 'CSS Box Model & Layouts', 'Flexbox & CSS Grid', 'Responsive Design & Media Queries', 'CSS Variables', 'Forms & Accessibility (ARIA)'],
        resources: [{ title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' }, { title: 'CSS Tricks Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }],
        project: { title: 'Portfolio Website', description: 'Build a personal portfolio with responsive design and dark mode.' },
      },
      {
        title: 'JavaScript Mastery', description: 'Deep dive into modern ES6+, async programming, and DOM manipulation.', durationWeeks: 6, difficulty: 'Beginner', badge: '⚡',
        topics: ['Variables & Scope', 'DOM Manipulation', 'Promises & Async/Await', 'Fetch API & JSON', 'ES6+ Modules', 'LocalStorage'],
        resources: [{ title: 'javascript.info', url: 'https://javascript.info' }],
        project: { title: 'Weather App', description: 'Build a weather dashboard fetching live data from OpenWeather API.' },
      },
      {
        title: 'React & State Management', description: 'Construct component-driven UIs with React and hooks.', durationWeeks: 6, difficulty: 'Intermediate', badge: '⚛️',
        topics: ['JSX & Components', 'useState & useEffect', 'Custom Hooks', 'React Router', 'Context API', 'Performance Optimization'],
        resources: [{ title: 'React Official Docs', url: 'https://react.dev' }],
        project: { title: 'Task Manager App', description: 'Build a task management application with filter and drag-and-drop features.' },
      },
      {
        title: 'Advanced Frontend & Next.js', description: 'Server-side rendering, TypeScript, and web performance.', durationWeeks: 5, difficulty: 'Advanced', badge: '🚀',
        topics: ['TypeScript Generics', 'Next.js App Router & SSR', 'Core Web Vitals', 'PWA & Service Workers', 'TailwindCSS'],
        resources: [{ title: 'Next.js Docs', url: 'https://nextjs.org/docs' }],
        project: { title: 'Full-Stack SaaS Frontend', description: 'Build an optimized SaaS landing page and user dashboard in Next.js.' },
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    category: 'Software Engineering',
    icon: '⚙️', color: '#059669', gradient: 'from-emerald-500 to-teal-500',
    description: 'Design and build scalable APIs, server architectures, databases, and microservices.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Node.js & Runtime Basics', description: 'Master Node.js runtime, asynchronous event loop, and modules.', durationWeeks: 4, difficulty: 'Beginner', badge: '📚',
        topics: ['Node.js Runtime', 'CommonJS vs ESM', 'File System & Streams', 'JSON Handling', 'Command Line Scripting'],
        resources: [{ title: 'Node.js Docs', url: 'https://nodejs.org/en/docs/' }],
        project: { title: 'CLI Todo Tool', description: 'Build a terminal CLI task manager reading and writing from JSON.' },
      },
      {
        title: 'REST APIs & Express.js', description: 'Build secure, structured REST APIs with Express.', durationWeeks: 5, difficulty: 'Beginner', badge: '🔌',
        topics: ['HTTP Methods & Status Codes', 'Express Routing & Middleware', 'Zod/Joi Input Validation', 'Error Handling', 'CORS & Rate Limiting'],
        resources: [{ title: 'Express.js Docs', url: 'https://expressjs.com/' }],
        project: { title: 'Blog Engine API', description: 'Build a REST API for a multi-user blog with authentication and post management.' },
      },
      {
        title: 'Databases & ORMs', description: 'Store and query data with PostgreSQL, MongoDB, and Prisma.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🗄️',
        topics: ['SQL Queries & Joins', 'PostgreSQL Administration', 'Prisma ORM', 'Indexing & Aggregations', 'MongoDB Document Storage'],
        resources: [{ title: 'PostgreSQL Tutorial', url: 'https://www.postgresql.org/docs/' }],
        project: { title: 'E-commerce API Engine', description: 'Build a backend supporting product catalogs, orders, transactions, and inventory.' },
      },
      {
        title: 'Caching & Message Queues', description: 'Scale backend systems using Redis and BullMQ.', durationWeeks: 4, difficulty: 'Advanced', badge: '⚡',
        topics: ['Redis In-Memory Caching', 'BullMQ Background Jobs', 'WebSockets Realtime', 'Docker Containerization'],
        resources: [{ title: 'Redis Documentation', url: 'https://redis.io/docs/' }],
        project: { title: 'Realtime Notification Service', description: 'Build a background job queue processing emails and push notifications.' },
      },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    category: 'Software Engineering',
    icon: '🔥', color: '#d97706', gradient: 'from-amber-500 to-orange-500',
    description: 'Master both frontend and backend to build complete production-ready web applications.',
    estimatedMonths: 9,
    stages: [
      {
        title: 'Full Stack Foundations', description: 'HTML, CSS, JavaScript, and Node basics.', durationWeeks: 5, difficulty: 'Beginner', badge: '🌱',
        topics: ['HTML5 & CSS Layouts', 'JS DOM & Fetch API', 'Node & Express Basics', 'Git Branching & GitHub'],
        resources: [{ title: 'The Odin Project', url: 'https://www.theodinproject.com' }],
        project: { title: 'Interactive Multi-page Website', description: 'Build a responsive website with backend contact form handling.' },
      },
      {
        title: 'React & Node Integration', description: 'Connect React client applications to Express APIs.', durationWeeks: 6, difficulty: 'Intermediate', badge: '⚛️',
        topics: ['React Component Architecture', 'Axios & TanStack Query', 'RESTful Endpoints', 'JWT Authentication'],
        resources: [{ title: 'React Docs', url: 'https://react.dev' }],
        project: { title: 'Social Media Dashboard', description: 'Build a full-stack social feed with user login, posts, and comments.' },
      },
      {
        title: 'Database Architecture & Deployment', description: 'Database modeling with PostgreSQL, Prisma, and Cloud hosting.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🗄️',
        topics: ['Relational Database Schema Design', 'Prisma Migrations', 'Docker Compose', 'Deploying on Render / Vercel'],
        resources: [{ title: 'Prisma Docs', url: 'https://www.prisma.io/docs' }],
        project: { title: 'SaaS Web Platform', description: 'Deploy a complete SaaS web application with auth, database, and payments.' },
      },
    ],
  },
  {
    id: 'sysarch',
    title: 'Software & System Architect',
    category: 'Software Engineering',
    icon: '🏗️', color: '#6366f1', gradient: 'from-indigo-600 to-blue-700',
    description: 'Design highly scalable, resilient, and fault-tolerant distributed systems and microservices.',
    estimatedMonths: 10,
    stages: [
      {
        title: 'Distributed System Principles', description: 'CAP theorem, load balancing, caching, and throughput.', durationWeeks: 5, difficulty: 'Intermediate', badge: '📐',
        topics: ['CAP & PACELC Theorem', 'Load Balancing & Reverse Proxies', 'Distributed Caching (Redis)', 'CDN Integration'],
        resources: [{ title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }],
        project: { title: 'Global URL Shortener Architecture', description: 'Draft a system architecture spec for a global URL shortener handling 1B links/day.' },
      },
      {
        title: 'Microservices & Messaging', description: 'Event-driven architecture with Kafka and RabbitMQ.', durationWeeks: 6, difficulty: 'Advanced', badge: '🔌',
        topics: ['Domain-Driven Design (DDD)', 'Event-Driven Architecture', 'Apache Kafka Streams', 'API Gateways & Service Mesh'],
        resources: [{ title: 'Microservices Patterns', url: 'https://microservices.io/' }],
        project: { title: 'Event-Driven Order Engine', description: 'Design an event-driven e-commerce order engine using Kafka.' },
      },
    ],
  },
  {
    id: 'qa',
    title: 'QA & Test Automation',
    category: 'Software Engineering',
    icon: '🧪', color: '#0d9488', gradient: 'from-teal-500 to-emerald-500',
    description: 'Ensure software quality by building robust automated testing frameworks and CI pipelines.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'Software QA Fundamentals', description: 'Test plans, test cases, bug tracking, and manual testing.', durationWeeks: 3, difficulty: 'Beginner', badge: '📋',
        topics: ['Test Pyramid', 'Test Case Writing', 'Bug Lifecycle & Jira', 'Agile QA Workflows'],
        resources: [{ title: 'ISTQB Foundation', url: 'https://www.istqb.org/' }],
        project: { title: 'Comprehensive Test Suite Plan', description: 'Draft a full test plan and 20 manual test cases for e-commerce checkout.' },
      },
      {
        title: 'Automation with Playwright & Cypress', description: 'Write end-to-end automated browser tests.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🌐',
        topics: ['Page Object Model (POM)', 'Playwright Selector Engine', 'API Test Automation', 'CI GitHub Actions Integration'],
        resources: [{ title: 'Playwright Docs', url: 'https://playwright.dev/' }],
        project: { title: 'Automated E2E Test Suite', description: 'Build a Playwright POM framework testing user registration and payment flows.' },
      },
    ],
  },
  {
    id: 'gamedev',
    title: 'Game Development',
    category: 'Software Engineering',
    icon: '🎮', color: '#ec4899', gradient: 'from-pink-500 to-rose-400',
    description: 'Design and program 2D and 3D video games using C# and Unity or Unreal Engine 5.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'C# Programming for Games', description: 'Object-oriented programming, data structures, and vector math.', durationWeeks: 4, difficulty: 'Beginner', badge: '⌨️',
        topics: ['C# OOP Principles', 'Vector Math (2D & 3D)', 'Events & Delegates', 'Data Structures for Games'],
        resources: [{ title: 'Unity Learn C#', url: 'https://learn.unity.com/' }],
        project: { title: 'Text Adventure Game', description: 'Build a console RPG text adventure in C# using OOP.' },
      },
      {
        title: 'Unity Engine & Physics', description: 'Prefabs, Rigidbodies, Colliders, and UI setup.', durationWeeks: 5, difficulty: 'Intermediate', badge: '⚙️',
        topics: ['Unity Editor Workflow', 'Rigidbody Physics & Colliders', 'Particle VFX', 'Tilemaps & 2D Physics'],
        resources: [{ title: 'Unity Manual', url: 'https://docs.unity3d.com/Manual/' }],
        project: { title: '2D Physics Platformer', description: 'Create a 2D platformer game with player movement, enemy AI, and collectibles.' },
      },
    ],
  },
  {
    id: 'compilers',
    title: 'Compiler & Systems Programmer',
    category: 'Software Engineering',
    icon: '🖥️', color: '#3b82f6', gradient: 'from-blue-600 to-cyan-600',
    description: 'Build programming languages, lexers, parsers, ASTs, LLVM IR, and low-level system runtimes.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'C/C++ & Memory Management', description: 'Pointers, stack vs heap, memory allocators, and assembly.', durationWeeks: 4, difficulty: 'Beginner', badge: '⚡',
        topics: ['Pointers & References', 'Manual Memory Allocation (malloc/free)', 'x86/ARM Assembly Basics', 'Makefiles & GDB Debugging'],
        resources: [{ title: 'Learn C++', url: 'https://www.learncpp.com/' }],
        project: { title: 'Custom Memory Allocator', description: 'Write a custom thread-safe `malloc` and `free` implementation in C.' },
      },
      {
        title: 'Lexing, Parsing & AST', description: 'Tokenizers, recursive descent parsers, and abstract syntax trees.', durationWeeks: 5, difficulty: 'Intermediate', badge: '📜',
        topics: ['Lexical Analysis (Lexing)', 'Context-Free Grammars & EBNF', 'Recursive Descent Parsers', 'AST Construction'],
        resources: [{ title: 'Crafting Interpreters', url: 'https://craftinginterpreters.com/' }],
        project: { title: 'Programming Language Interpreter', description: 'Build an interpreter for a custom scripting language with arithmetic and variables.' },
      },
    ],
  },
  {
    id: 'microservices',
    title: 'Microservices Platform Engineer',
    category: 'Software Engineering',
    icon: '📦', color: '#8b5cf6', gradient: 'from-violet-600 to-indigo-600',
    description: 'Architect modular microservices, API gateways, gRPC contracts, and distributed service meshes.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'gRPC & Protocol Buffers', description: 'High-performance inter-service communication with Protocol Buffers.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🔌',
        topics: ['Protobuf Schemas & Code Generation', 'gRPC Streaming (Unary, Server, Client)', 'HTTP/2 Protocol', 'gRPC Gateways'],
        resources: [{ title: 'gRPC Documentation', url: 'https://grpc.io/docs/' }],
        project: { title: 'gRPC Microservices Suite', description: 'Build order and user authentication microservices communicating over gRPC.' },
      },
    ],
  },

  // ── MOBILE DEVELOPMENT ─────────────────────────────────────────
  {
    id: 'android',
    title: 'Android Development',
    category: 'Mobile Development',
    icon: '📱', color: '#16a34a', gradient: 'from-green-500 to-emerald-600',
    description: 'Build modern native Android applications using Kotlin and Jetpack Compose.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Kotlin Fundamentals', description: 'Syntax, null safety, coroutines, and OOP in Kotlin.', durationWeeks: 3, difficulty: 'Beginner', badge: '🐦',
        topics: ['Kotlin Syntax', 'Coroutines Basics', 'Data Classes', 'Generics & Extension Functions'],
        resources: [{ title: 'Kotlin Official Docs', url: 'https://kotlinlang.org/docs/home.html' }],
        project: { title: 'Kotlin CLI Game', description: 'Build a command-line quiz game using Kotlin Coroutines.' },
      },
      {
        title: 'Jetpack Compose & UI', description: 'Build declarative Android UIs with Jetpack Compose.', durationWeeks: 5, difficulty: 'Beginner', badge: '🎨',
        topics: ['Composable Functions', 'State Management', 'Material 3 Components', 'Navigation Component'],
        resources: [{ title: 'Android Compose Guide', url: 'https://developer.android.com/jetpack/compose' }],
        project: { title: 'Android Notes App', description: 'Build a modern note-taking app in Jetpack Compose with local storage.' },
      },
    ],
  },
  {
    id: 'ios',
    title: 'iOS App Development',
    category: 'Mobile Development',
    icon: '🍎', color: '#007aff', gradient: 'from-blue-500 to-sky-400',
    description: 'Build native iOS applications for iPhone and iPad using Swift, SwiftUI, and Xcode.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Swift Language Foundations', description: 'Master Swift language basics and type safety.', durationWeeks: 4, difficulty: 'Beginner', badge: '🕊️',
        topics: ['Variables & Optionals', 'Structs vs Classes', 'Protocols & Extensions', 'Async/Await Structured Concurrency'],
        resources: [{ title: 'Swift.org Docs', url: 'https://www.swift.org/documentation/' }],
        project: { title: 'Flashcard App', description: 'Build a flashcard quiz application in Swift.' },
      },
      {
        title: 'SwiftUI & Navigation', description: 'Construct modern declarative layouts with SwiftUI.', durationWeeks: 5, difficulty: 'Beginner', badge: '📱',
        topics: ['SwiftUI Views', '@State & @Binding', 'NavigationStack & Sheets', 'Custom Animations'],
        resources: [{ title: 'Apple SwiftUI Tutorials', url: 'https://developer.apple.com/tutorials/swiftui' }],
        project: { title: 'Habit Tracker iOS', description: 'Build a habit tracker app with dark mode support and streak counters.' },
      },
    ],
  },
  {
    id: 'flutter',
    title: 'Flutter Cross-Platform',
    category: 'Mobile Development',
    icon: '🐦', color: '#0284c7', gradient: 'from-sky-400 to-blue-600',
    description: 'Build high-performance cross-platform mobile apps for iOS & Android with Dart and Flutter.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'Dart Language & OOP', description: 'Master Dart syntax, classes, futures, streams, and async programming.', durationWeeks: 3, difficulty: 'Beginner', badge: '🎯',
        topics: ['Dart Syntax & Type System', 'Object-Oriented Dart', 'Futures & Streams', 'Async/Await Patterns'],
        resources: [{ title: 'Dart Docs', url: 'https://dart.dev/guides' }],
        project: { title: 'Dart Expense Calculator', description: 'Build a command-line expense tracker in pure Dart.' },
      },
      {
        title: 'Flutter Widgets & BLoC / Riverpod', description: 'State management, navigation, and custom UI widgets.', durationWeeks: 5, difficulty: 'Intermediate', badge: '⚡',
        topics: ['Stateless & Stateful Widgets', 'BLoC & Riverpod State Management', 'REST API Integration with Dio', 'Local Hive Database'],
        resources: [{ title: 'Flutter Official Docs', url: 'https://flutter.dev/docs' }],
        project: { title: 'E-Commerce Mobile App', description: 'Build a cross-platform mobile shop with cart state management and checkout UI.' },
      },
    ],
  },
  {
    id: 'reactnative',
    title: 'React Native Mobile App',
    category: 'Mobile Development',
    icon: '📱', color: '#61dafb', gradient: 'from-cyan-400 to-blue-500',
    description: 'Build native iOS and Android apps using JavaScript, React, and Expo.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'React Native & Expo Basics', description: 'Core components, styling, Flexbox layout, and Expo SDK.', durationWeeks: 4, difficulty: 'Beginner', badge: '⚛️',
        topics: ['React Native Components', 'Flexbox Layouts', 'Expo CLI Workflow', 'React Navigation v6'],
        resources: [{ title: 'React Native Docs', url: 'https://reactnative.dev/' }],
        project: { title: 'Fitness Tracker App', description: 'Build a mobile workout tracker with screen navigation and AsyncStorage.' },
      },
    ],
  },
  {
    id: 'mobileqa',
    title: 'Mobile QA & App Testing',
    category: 'Mobile Development',
    icon: '🧪', color: '#ec4899', gradient: 'from-pink-500 to-rose-600',
    description: 'Automate mobile application testing on real devices and emulators using Appium and XCUITest.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'Appium & Mobile Automation', description: 'Appium server setup, element locators, and automated test scripts.', durationWeeks: 4, difficulty: 'Intermediate', badge: '📲',
        topics: ['Appium Architecture', 'Android ADB Commands', 'XCUITest Drivers', 'Automating Gestures & Swipes'],
        resources: [{ title: 'Appium Docs', url: 'https://appium.io/' }],
        project: { title: 'Appium Mobile Test Suite', description: 'Write an automated test suite verifying login and payment flows on Android emulators.' },
      },
    ],
  },

  // ── AI & DATA SCIENCE ──────────────────────────────────────────
  {
    id: 'aiml',
    title: 'AI / Machine Learning',
    category: 'AI & Data Science',
    icon: '🤖', color: '#7c3aed', gradient: 'from-violet-500 to-purple-600',
    description: 'Build intelligent systems with machine learning, deep learning, PyTorch, and GenAI.',
    estimatedMonths: 10,
    stages: [
      {
        title: 'Python for Data Science', description: 'NumPy, Pandas, Matplotlib, and data cleaning techniques.', durationWeeks: 4, difficulty: 'Beginner', badge: '🐍',
        topics: ['Python Syntax', 'NumPy Arrays', 'Pandas DataFrames', 'Matplotlib Charts'],
        resources: [{ title: 'Kaggle Python', url: 'https://www.kaggle.com/learn/python' }],
        project: { title: 'Exploratory Data Analysis', description: 'Perform EDA on a dataset and generate statistical visualization reports.' },
      },
      {
        title: 'Classical Machine Learning', description: 'Linear regression, decision trees, random forests, and scikit-learn.', durationWeeks: 6, difficulty: 'Intermediate', badge: '📊',
        topics: ['Regression & Classification', 'Decision Trees', 'Random Forests & XGBoost', 'Model Evaluation (F1, AUC)'],
        resources: [{ title: 'scikit-learn Docs', url: 'https://scikit-learn.org/' }],
        project: { title: 'Predictive Modeling App', description: 'Train and compare multiple ML models to predict loan defaults.' },
      },
      {
        title: 'Deep Learning & PyTorch', description: 'Neural networks, CNNs, RNNs, and PyTorch framework.', durationWeeks: 7, difficulty: 'Advanced', badge: '🧠',
        topics: ['Neural Network Architectures', 'Backpropagation & Optimizers', 'CNNs for Computer Vision', 'PyTorch Tensors & Modules'],
        resources: [{ title: 'PyTorch Docs', url: 'https://pytorch.org/' }],
        project: { title: 'Image Classifier App', description: 'Train a CNN image classifier and deploy as a web application.' },
      },
    ],
  },
  {
    id: 'datasci',
    title: 'Data Science',
    category: 'AI & Data Science',
    icon: '📊', color: '#0284c7', gradient: 'from-sky-500 to-blue-600',
    description: 'Extract insights from data using statistics, visualization, and predictive modeling.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Statistics & Wrangling', description: 'Hypothesis testing, probability distributions, and Pandas.', durationWeeks: 4, difficulty: 'Beginner', badge: '🐍',
        topics: ['Pandas Data Wrangling', 'Descriptive Statistics', 'Hypothesis Testing', 'A/B Testing Analysis'],
        resources: [{ title: 'Pandas Docs', url: 'https://pandas.pydata.org/' }],
        project: { title: 'A/B Test Statistical Report', description: 'Analyze customer conversion data and report p-values and confidence intervals.' },
      },
    ],
  },
  {
    id: 'dataanalytics',
    title: 'Data & BI Analytics',
    category: 'AI & Data Science',
    icon: '📈', color: '#f59e0b', gradient: 'from-amber-500 to-yellow-600',
    description: 'Transform raw data into business intelligence dashboards using SQL, Power BI, and Tableau.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'SQL & Power BI / Tableau', description: 'Complex SQL queries, DAX formulas, and interactive dashboards.', durationWeeks: 5, difficulty: 'Beginner', badge: '🖼️',
        topics: ['SQL Joins & CTEs', 'Power BI DAX Measures', 'Tableau Dashboards', 'Executive Storytelling'],
        resources: [{ title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' }],
        project: { title: 'Executive BI Dashboard', description: 'Build an interactive multi-page Power BI dashboard tracking sales metrics.' },
      },
    ],
  },
  {
    id: 'dataeng',
    title: 'Data Engineering',
    category: 'AI & Data Science',
    icon: '🗄️', color: '#0891b2', gradient: 'from-cyan-500 to-blue-500',
    description: 'Design and build scalable data pipelines, data warehouses, and lakes with Airflow and Spark.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Data Pipelines & Airflow', description: 'ETL vs ELT pipelines, dbt models, and Apache Airflow DAGs.', durationWeeks: 5, difficulty: 'Intermediate', badge: '⚙️',
        topics: ['ETL Pipeline Design', 'Apache Airflow DAGs', 'dbt Data Modeling', 'Snowflake & BigQuery'],
        resources: [{ title: 'Apache Airflow Docs', url: 'https://airflow.apache.org/' }],
        project: { title: 'Automated Airflow Pipeline', description: 'Build an Airflow pipeline extracting API data into Snowflake with dbt.' },
      },
    ],
  },
  {
    id: 'prompteng',
    title: 'AI / Prompt Engineering',
    category: 'AI & Data Science',
    icon: '✨', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600',
    description: 'Optimize prompts, RAG architectures, and AI agent workflows for Large Language Models.',
    estimatedMonths: 4,
    stages: [
      {
        title: 'LLMs & RAG Architectures', description: 'Few-shot prompting, embeddings, vector search, and LangChain.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🧠',
        topics: ['Prompt Design Patterns', 'Retrieval-Augmented Generation (RAG)', 'Pinecone Vector Database', 'LangChain Agents'],
        resources: [{ title: 'OpenAI Prompting Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' }],
        project: { title: 'Document AI Chatbot', description: 'Build a PDF document chatbot powered by LangChain and RAG.' },
      },
    ],
  },
  {
    id: 'quantum',
    title: 'Quantum Computing Developer',
    category: 'AI & Data Science',
    icon: '⚛️', color: '#7c3aed', gradient: 'from-purple-600 to-indigo-800',
    description: 'Develop quantum algorithms, circuits, and simulations using Qiskit and quantum logic.',
    estimatedMonths: 9,
    stages: [
      {
        title: 'Quantum Gates & Qiskit', description: 'Linear algebra, qubits, superposition, entanglement, and Qiskit SDK.', durationWeeks: 5, difficulty: 'Advanced', badge: '🔬',
        topics: ['Quantum Gates (X, Y, Z, CNOT)', 'Superposition & Entanglement', 'Qiskit Quantum Circuits', 'Grover\'s Algorithm'],
        resources: [{ title: 'IBM Qiskit Textbook', url: 'https://qiskit.org/textbook/' }],
        project: { title: 'Quantum Teleportation Circuit', description: 'Simulate the quantum teleportation protocol on IBM Quantum hardware.' },
      },
    ],
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing (NLP)',
    category: 'AI & Data Science',
    icon: '💬', color: '#ec4899', gradient: 'from-pink-500 to-purple-600',
    description: 'Build text analytics, sentiment engines, named entity recognition, and transformer models.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Text Processing & Transformers', description: 'Tokenization, NLTK/spaCy, Word2Vec, BERT, and Hugging Face.', durationWeeks: 5, difficulty: 'Intermediate', badge: '📜',
        topics: ['Tokenization & Lemmatization', 'TF-IDF & Embeddings', 'BERT & Hugging Face Transformers', 'Sentiment Analysis'],
        resources: [{ title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course' }],
        project: { title: 'Sentiment Classifier Model', description: 'Fine-tune a BERT transformer model on customer product reviews.' },
      },
    ],
  },
  {
    id: 'computervision',
    title: 'Computer Vision & AI Engineer',
    category: 'AI & Data Science',
    icon: '👁️', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-600',
    description: 'Process visual data using OpenCV, Convolutional Neural Networks (CNNs), YOLO, and PyTorch.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Image Processing & Object Detection', description: 'OpenCV image filters, feature extraction, YOLO object detection.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🖼️',
        topics: ['OpenCV Image Operations', 'Convolutional Neural Networks (CNNs)', 'YOLOv8 Object Detection', 'Semantic Segmentation'],
        resources: [{ title: 'OpenCV Documentation', url: 'https://docs.opencv.org/' }],
        project: { title: 'Real-Time Object Counter', description: 'Build a video stream processing app detecting and counting vehicles.' },
      },
    ],
  },
  {
    id: 'mlops',
    title: 'MLOps & AI Infrastructure',
    category: 'AI & Data Science',
    icon: '🔄', color: '#10b981', gradient: 'from-emerald-500 to-teal-600',
    description: 'Deploy, monitor, and automate machine learning model pipelines in production with MLflow and Kubeflow.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Model Deployment & Tracking', description: 'MLflow experiment tracking, Dockerizing models, and Triton inference servers.', durationWeeks: 5, difficulty: 'Advanced', badge: '🚀',
        topics: ['MLflow Experiment Tracking', 'Model Registry', 'FastAPI Model Serving', 'Data Drift Monitoring'],
        resources: [{ title: 'MLflow Documentation', url: 'https://mlflow.org/docs/latest/index.html' }],
        project: { title: 'Production MLOps Pipeline', description: 'Build a CI/CD pipeline retraining and deploying an ML model on drift alert.' },
      },
    ],
  },

  // ── CLOUD & SECURITY ───────────────────────────────────────────
  {
    id: 'devops',
    title: 'DevOps Engineer',
    category: 'Cloud & Security',
    icon: '🔄', color: '#ea580c', gradient: 'from-orange-500 to-red-500',
    description: 'Bridge development and operations with Docker, Kubernetes, CI/CD, and Terraform.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Linux & Docker Containers', description: 'Bash scripting, Linux administration, and Docker compose.', durationWeeks: 4, difficulty: 'Beginner', badge: '🐳',
        topics: ['Linux Administration', 'Bash Automation', 'Dockerfiles & Layers', 'Docker Compose'],
        resources: [{ title: 'Docker Docs', url: 'https://docs.docker.com' }],
        project: { title: 'Containerized App Stack', description: 'Containerize a full-stack web application using Docker Compose.' },
      },
      {
        title: 'CI/CD & Infrastructure as Code', description: 'GitHub Actions pipelines and Terraform provisioning.', durationWeeks: 4, difficulty: 'Intermediate', badge: '⚡',
        topics: ['GitHub Actions Workflows', 'Terraform HCL Syntax', 'AWS Cloud Infrastructure'],
        resources: [{ title: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs' }],
        project: { title: 'Automated CI/CD Pipeline', description: 'Build a pipeline testing, building Docker images, and deploying infrastructure.' },
      },
    ],
  },
  {
    id: 'cybersec',
    title: 'Cyber Security & Ethical Hacking',
    category: 'Cloud & Security',
    icon: '🛡️', color: '#dc2626', gradient: 'from-red-500 to-rose-600',
    description: 'Protect systems and networks using penetration testing, OWASP security, and Wireshark.',
    estimatedMonths: 9,
    stages: [
      {
        title: 'Web Security & Penetration Testing', description: 'OWASP Top 10, Burp Suite, SQL Injection, and Metasploit.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🔍',
        topics: ['OWASP Top 10 Vulnerabilities', 'Burp Suite Proxies', 'Network Scanning (Nmap)', 'Metasploit Exploitation'],
        resources: [{ title: 'PortSwigger Web Security', url: 'https://portswigger.net/web-security' }],
        project: { title: 'Penetration Test Report', description: 'Perform an ethical penetration test on a vulnerable target lab environment.' },
      },
    ],
  },
  {
    id: 'cloudsec',
    title: 'Cloud Security Engineer',
    category: 'Cloud & Security',
    icon: '🔒', color: '#0284c7', gradient: 'from-sky-600 to-indigo-700',
    description: 'Secure cloud infrastructure, manage IAM policies, and audit threats across AWS & Azure.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Cloud IAM & Perimeter Defense', description: 'Least privilege IAM, VPC security groups, AWS WAF, and KMS encryption.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🛡️',
        topics: ['IAM Policy Hardening', 'VPC Security Groups & WAF', 'Secrets Manager & KMS', 'AWS GuardDuty Threat Detection'],
        resources: [{ title: 'AWS Cloud Security Best Practices', url: 'https://aws.amazon.com/security/' }],
        project: { title: 'Cloud Security Audit Script', description: 'Write an automated script scanning an AWS account for public S3 buckets and open SSH ports.' },
      },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Computing (AWS/Azure)',
    category: 'Cloud & Security',
    icon: '☁️', color: '#2563eb', gradient: 'from-blue-500 to-indigo-600',
    description: 'Architect, deploy, and manage scalable cloud infrastructure on AWS and Azure.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'AWS Core Infrastructure', description: 'EC2, S3, VPC, RDS, Lambda, and CloudFormation.', durationWeeks: 5, difficulty: 'Beginner', badge: '🏗️',
        topics: ['EC2 Compute & Auto Scaling', 'S3 Object Storage', 'VPC & Networking', 'Serverless Lambda APIs'],
        resources: [{ title: 'AWS Skill Builder', url: 'https://skillbuilder.aws/' }],
        project: { title: 'High-Availability Cloud App', description: 'Deploy an auto-scaling multi-tier application on AWS EC2 and RDS.' },
      },
    ],
  },
  {
    id: 'sre',
    title: 'Site Reliability Engineering (SRE)',
    category: 'Cloud & Security',
    icon: '🔥', color: '#f97316', gradient: 'from-orange-500 to-amber-500',
    description: 'Ensure system reliability, observability, SLOs, Prometheus metrics, and chaos engineering.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Observability & Incident Ops', description: 'Prometheus metrics, Grafana dashboards, OpenTelemetry, and Chaos Mesh.', durationWeeks: 5, difficulty: 'Advanced', badge: '🔭',
        topics: ['SLIs, SLOs & Error Budgets', 'Prometheus & PromQL', 'Grafana Dashboards', 'Chaos Engineering Experiments'],
        resources: [{ title: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/' }],
        project: { title: 'Full Monitoring & Alert Stack', description: 'Build a Prometheus and Grafana stack with automated alert notifications.' },
      },
    ],
  },
  {
    id: 'neteng',
    title: 'Network Engineer',
    category: 'Cloud & Security',
    icon: '🌐', color: '#2563eb', gradient: 'from-blue-600 to-indigo-700',
    description: 'Design, configure, and maintain corporate routers, switches, OSPF, BGP, and Cisco networks.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'Routing, Switching & BGP', description: 'Subnetting, VLANs, OSPF, BGP routing protocols, and Wireshark.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🔌',
        topics: ['IPv4/IPv6 Subnetting', 'VLANs & Spanning Tree Protocol', 'OSPF & BGP Routing', 'Wireshark Packet Capture'],
        resources: [{ title: 'Cisco Networking Academy', url: 'https://www.netacad.com/' }],
        project: { title: 'Multi-Site Network Simulation', description: 'Simulate a corporate office network topology with redundant OSPF routers in Packet Tracer.' },
      },
    ],
  },
  {
    id: 'dba',
    title: 'Database Administrator (DBA)',
    category: 'Cloud & Security',
    icon: '🗄️', color: '#059669', gradient: 'from-emerald-600 to-teal-700',
    description: 'Optimize PostgreSQL & MySQL engines, point-in-time backups, replication, and query tuning.',
    estimatedMonths: 7,
    stages: [
      {
        title: 'DB Engine Tuning & High Availability', description: 'EXPLAIN query plans, WAL replication, PgBouncer pooling, and auto-failover.', durationWeeks: 5, difficulty: 'Advanced', badge: '⚙️',
        topics: ['PostgreSQL Configuration', 'Query Index Tuning (B-Tree/GIN)', 'Streaming Replication', 'PgBouncer Connection Pooling'],
        resources: [{ title: 'PostgreSQL Administration', url: 'https://www.postgresql.org/docs/current/admin.html' }],
        project: { title: 'Auto-Failover DB Cluster', description: 'Set up a 3-node primary-replica PostgreSQL cluster with Patroni automatic failover.' },
      },
    ],
  },
  {
    id: 'secops',
    title: 'SOC Analyst & Threat Hunter',
    category: 'Cloud & Security',
    icon: '🛡️', color: '#be123c', gradient: 'from-rose-700 to-red-600',
    description: 'Monitor enterprise security logs, respond to malware incidents, and operate SIEM tools.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'SIEM Operations & Incident Triage', description: 'Splunk dashboards, ELK log ingestion, Yara rules, and threat playbooks.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🚨',
        topics: ['Splunk SPL Queries', 'Incident Response Playbooks', 'Malware Analysis Basics', 'Yara Rules & Threat Intel'],
        resources: [{ title: 'TryHackMe SOC Pathway', url: 'https://tryhackme.com/' }],
        project: { title: 'SOC Incident Investigation', description: 'Analyze a simulated ransomware attack log in Splunk and issue a formal incident report.' },
      },
    ],
  },

  // ── PRODUCT & DESIGN ───────────────────────────────────────────
  {
    id: 'uiux',
    title: 'UI / UX Design',
    category: 'Product & Design',
    icon: '🎨', color: '#db2777', gradient: 'from-pink-500 to-rose-500',
    description: 'Design beautiful, user-centered digital products, wireframes, and prototypes in Figma.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'Visual Design & Figma', description: 'Color theory, typography hierarchy, Figma auto-layout, and components.', durationWeeks: 4, difficulty: 'Beginner', badge: '🖌️',
        topics: ['Design Systems', 'Figma Auto Layout', 'Typography & Spacing Grids', 'Color Theory'],
        resources: [{ title: 'Figma Learning Docs', url: 'https://help.figma.com/' }],
        project: { title: 'Mobile Prototype in Figma', description: 'Design a high-fidelity interactive prototype of a mobile banking app.' },
      },
    ],
  },
  {
    id: 'product',
    title: 'Product Management',
    category: 'Product & Design',
    icon: '📦', color: '#8b5cf6', gradient: 'from-purple-500 to-indigo-500',
    description: 'Lead product strategy, write PRDs, manage roadmaps, and guide cross-functional teams.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'Product Strategy & Roadmaps', description: 'User discovery, RICE prioritization, PRDs, and GTM strategy.', durationWeeks: 4, difficulty: 'Intermediate', badge: '💡',
        topics: ['Writing Product Requirements (PRD)', 'RICE Prioritization', 'Product Analytics', 'Go-To-Market Execution'],
        resources: [{ title: 'Product School Resources', url: 'https://productschool.com/' }],
        project: { title: 'Feature Launch PRD', description: 'Author a complete 8-page PRD for launching AI recommendation features.' },
      },
    ],
  },
  {
    id: 'gamedesign',
    title: 'Game & Level Designer',
    category: 'Product & Design',
    icon: '🎯', color: '#e11d48', gradient: 'from-rose-600 to-pink-500',
    description: 'Craft game mechanics, level blockouts, virtual economies, and interactive narrative arcs.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'Mechanics & Level Blockouts', description: 'MDA framework, level design blockouts in Unity, and Machinations economy design.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🎮',
        topics: ['MDA Framework', '3D Level Greyboxing', 'Game Economy Balancing', 'Branching Dialogues'],
        resources: [{ title: 'Game Maker\'s Toolkit', url: 'https://www.youtube.com/@gmtk' }],
        project: { title: 'Playable Level Blockout', description: 'Build a playable 3D combat level blockout in Unity or Unreal Engine.' },
      },
    ],
  },
  {
    id: 'uxresearch',
    title: 'UX Researcher',
    category: 'Product & Design',
    icon: '🔍', color: '#0284c7', gradient: 'from-sky-500 to-indigo-600',
    description: 'Conduct user interviews, usability tests, journey mapping, and qualitative data synthesis.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'User Testing & Synthesis', description: 'Moderated interviews, card sorting, usability testing, and empathy mapping.', durationWeeks: 4, difficulty: 'Beginner', badge: '🔬',
        topics: ['User Interviewing Techniques', 'Usability Test Planning', 'Empathy Maps & Personas', 'Affinity Diagramming'],
        resources: [{ title: 'Nielsen Norman Group Articles', url: 'https://www.nngroup.com/' }],
        project: { title: 'UX Research Case Study', description: 'Conduct 5 user tests on an e-commerce checkout and deliver an actionable UX report.' },
      },
    ],
  },

  // ── MANAGEMENT & BUSINESS ──────────────────────────────────────
  {
    id: 'engmgmt',
    title: 'Engineering Manager',
    category: 'Management & Business',
    icon: '👔', color: '#8b5cf6', gradient: 'from-purple-600 to-indigo-600',
    description: 'Lead software engineering teams, coach developers, manage tech roadmaps, and scale culture.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'People Management & DORA Metrics', description: '1-on-1s, career matrices, DORA metrics, and blameless retrospectives.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🤝',
        topics: ['Effective 1-on-1 Frameworks', 'DORA Metric Tracking', 'Performance Reviews', 'Technical Hiring Rubrics'],
        resources: [{ title: 'The Manager\'s Path Book', url: 'https://www.oreilly.com/' }],
        project: { title: 'Engineering Career Matrix', description: 'Draft a comprehensive career progression matrix for engineering teams.' },
      },
    ],
  },
  {
    id: 'finance',
    title: 'Financial Analyst',
    category: 'Management & Business',
    icon: '💰', color: '#10b981', gradient: 'from-emerald-500 to-green-600',
    description: 'Analyze financial statements, build 3-statement models, DCF valuations, and executive forecasts.',
    estimatedMonths: 6,
    stages: [
      {
        title: '3-Statement Financial Modeling', description: 'Income statements, balance sheets, cash flow, XLOOKUP, and DCF valuation.', durationWeeks: 5, difficulty: 'Intermediate', badge: '📊',
        topics: ['3-Statement Financial Models', 'Excel XLOOKUP & Pivot Tables', 'Discounted Cash Flow (DCF)', 'Corporate Valuation'],
        resources: [{ title: 'Corporate Finance Institute', url: 'https://corporatefinanceinstitute.com/' }],
        project: { title: 'Startup Valuation Model', description: 'Build a linked 3-statement financial model and DCF valuation for a tech company.' },
      },
    ],
  },
  {
    id: 'hr',
    title: 'Human Resources & People Ops',
    category: 'Management & Business',
    icon: '👥', color: '#f43f5e', gradient: 'from-rose-500 to-pink-600',
    description: 'Manage talent acquisition, employee retention, remote work policies, and workplace culture.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'Talent Acquisition & People Ops', description: 'Sourcing strategy, ATS tracking, onboarding 30-60-90 plans, and DEI policies.', durationWeeks: 4, difficulty: 'Beginner', badge: '🤝',
        topics: ['Recruitment Pipelines', 'Structured Behavioral Interviews', '30-60-90 Onboarding Plans', 'HR Analytics'],
        resources: [{ title: 'SHRM Resources', url: 'https://www.shrm.org/' }],
        project: { title: 'Onboarding Program Framework', description: 'Design a comprehensive 90-day onboarding program for remote tech workers.' },
      },
    ],
  },
  {
    id: 'sales',
    title: 'Tech Sales (B2B SaaS)',
    category: 'Management & Business',
    icon: '🤝', color: '#0ea5e9', gradient: 'from-sky-500 to-cyan-500',
    description: 'Master B2B outbound prospecting, discovery calls, demo presentation, and enterprise closing.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'Outbound Prospecting & Demos', description: 'Cold email sequences, MEDDIC qualification, product demos, and objection handling.', durationWeeks: 4, difficulty: 'Intermediate', badge: '📞',
        topics: ['B2B Sales Funnel', 'Cold Email Sequences', 'MEDDIC Lead Qualification', 'Value-Based Demos'],
        resources: [{ title: 'HubSpot Sales Academy', url: 'https://academy.hubspot.com/' }],
        project: { title: 'Outbound Sales Sequence', description: 'Draft a 5-step cold email/phone sequence targeting VP of Engineering buyers.' },
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Digital Marketing & Growth',
    category: 'Management & Business',
    icon: '📈', color: '#eab308', gradient: 'from-yellow-400 to-orange-500',
    description: 'Drive acquisition through SEO, content marketing, Google/Meta paid ads, and GA4 analytics.',
    estimatedMonths: 6,
    stages: [
      {
        title: 'SEO, Paid Ads & GA4 Analytics', description: 'Keyword research, technical SEO, Google Search Ads, and GA4 conversions.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🔍',
        topics: ['On-Page & Technical SEO', 'Google & Meta Paid Ads', 'Google Analytics 4 (GA4)', 'Conversion Rate Optimization'],
        resources: [{ title: 'Ahrefs SEO Academy', url: 'https://ahrefs.com/academy' }],
        project: { title: 'Full Growth Campaign Build', description: 'Build a complete SEO content strategy and Google Ads search campaign structure.' },
      },
    ],
  },
  {
    id: 'devrel',
    title: 'Developer Relations (DevRel)',
    category: 'Management & Business',
    icon: '📢', color: '#f43f5e', gradient: 'from-rose-500 to-amber-500',
    description: 'Empower developer communities through API documentation, SDK DX, hackathons, and talks.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'API Documentation & Community', description: 'OpenAPI specs, developer onboarding funnels, Discord community management.', durationWeeks: 4, difficulty: 'Intermediate', badge: '✍️',
        topics: ['OpenAPI / Swagger Specs', 'Developer Experience (DX) Audits', 'Hackathon Organization', 'Tech Public Speaking'],
        resources: [{ title: 'Write the Docs', url: 'https://www.writethedocs.org/' }],
        project: { title: 'API Quickstart Portal', description: 'Author interactive API reference documentation and code samples for an open SDK.' },
      },
    ],
  },
  {
    id: 'bizanalyst',
    title: 'Business Analyst',
    category: 'Management & Business',
    icon: '📋', color: '#0284c7', gradient: 'from-sky-500 to-cyan-600',
    description: 'Bridge business stakeholders and IT through requirements analysis, BPMN 2.0, and Jira epics.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'BPMN 2.0 & Agile Requirements', description: 'BPMN process flows, User Stories, UAT testing scripts, and SQL analytics.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🗺️',
        topics: ['BPMN 2.0 Diagrams', 'Agile User Stories & Epics', 'User Acceptance Testing (UAT)', 'Cost-Benefit Analysis'],
        resources: [{ title: 'IIBA BABOK Guide', url: 'https://www.iiba.org/' }],
        project: { title: 'Business Process Specification', description: 'Draw a complete BPMN 2.0 workflow and write 15 user story epics in Jira format.' },
      },
    ],
  },
  {
    id: 'growth',
    title: 'Growth Engineer',
    category: 'Management & Business',
    icon: '🚀', color: '#d97706', gradient: 'from-amber-600 to-red-600',
    description: 'Optimize user acquisition, activation funnels, feature flags, and referral growth loops.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'AARRR Funnels & Experimentation', description: 'Pirate metrics, LaunchDarkly feature flags, A/B testing math, and referral loops.', durationWeeks: 4, difficulty: 'Intermediate', badge: '🧪',
        topics: ['AARRR Funnel Metrics', 'Feature Flag Engineering', 'A/B Testing Math', 'Viral Referral Loops'],
        resources: [{ title: 'Reforge Growth Series', url: 'https://www.reforge.com/' }],
        project: { title: 'Viral Referral System', description: 'Build a referral program engine with personalized invite links and reward tracking.' },
      },
    ],
  },
  {
    id: 'scrum',
    title: 'Scrum Master & Agile Coach',
    category: 'Management & Business',
    icon: '🔄', color: '#14b8a6', gradient: 'from-teal-500 to-cyan-600',
    description: 'Facilitate Agile sprint ceremonies, remove team blockers, Jira board management, and coaching.',
    estimatedMonths: 5,
    stages: [
      {
        title: 'Scrum Ceremonies & Jira Boards', description: 'Sprint planning, daily standups, retrospectives, burndown charts, and backlog grooming.', durationWeeks: 4, difficulty: 'Beginner', badge: '📊',
        topics: ['Scrum Framework Principles', 'Sprint Planning & Grooming', 'Retrospective Techniques', 'Jira & Confluence Management'],
        resources: [{ title: 'Scrum.org Guides', url: 'https://www.scrum.org/' }],
        project: { title: 'Agile Team Sprint Setup', description: 'Configure a full 2-week sprint board in Jira with epic estimations and retrospectives.' },
      },
    ],
  },

  // ── EMERGING & HARDWARE ────────────────────────────────────────
  {
    id: 'blockchain',
    title: 'Blockchain & Smart Contracts',
    category: 'Emerging & Hardware',
    icon: '⛓️', color: '#6d28d9', gradient: 'from-violet-600 to-indigo-600',
    description: 'Build decentralized applications and Solidity smart contracts on Ethereum and Web3.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Solidity & Smart Contracts', description: 'Solidity syntax, ERC-20, ERC-721 tokens, Hardhat, and ethers.js.', durationWeeks: 5, difficulty: 'Intermediate', badge: '📝',
        topics: ['Solidity Programming', 'ERC-20 & ERC-721 Standards', 'Hardhat Testing & Deployment', 'Ethers.js / Wagmi Frontend'],
        resources: [{ title: 'Ethereum.org Docs', url: 'https://ethereum.org/' }],
        project: { title: 'DeFi Token Marketplace', description: 'Build and deploy smart contracts for an ERC-20 token exchange on testnet.' },
      },
    ],
  },
  {
    id: 'arvr',
    title: 'AR/VR Spatial Computing',
    category: 'Emerging & Hardware',
    icon: '🥽', color: '#ec4899', gradient: 'from-pink-600 to-purple-600',
    description: 'Create augmented and virtual reality experiences using Unity, OpenXR, and Apple visionOS.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Unity OpenXR & Spatial UI', description: '3D vector math, Meta Quest SDK, hand tracking, and ARKit plane detection.', durationWeeks: 5, difficulty: 'Intermediate', badge: '🖐️',
        topics: ['3D Graphics & Vector Math', 'Unity OpenXR Rig Setup', 'Hand Tracking & Spatial UI', 'ARKit Plane Detection'],
        resources: [{ title: 'Meta Quest Developer Portal', url: 'https://developer.oculus.com/' }],
        project: { title: 'Spatial VR Room App', description: 'Build an interactive 3D VR environment with hand tracking controls.' },
      },
    ],
  },
  {
    id: 'embedded',
    title: 'Embedded Systems & IoT',
    category: 'Emerging & Hardware',
    icon: '📟', color: '#14b8a6', gradient: 'from-teal-600 to-emerald-600',
    description: 'Program microcontrollers, C/C++ hardware drivers, I2C/SPI sensors, FreeRTOS, and MQTT.',
    estimatedMonths: 8,
    stages: [
      {
        title: 'Embedded C & Microcontrollers', description: 'C pointers, STM32 registers, I2C/SPI sensors, FreeRTOS, and AWS IoT.', durationWeeks: 5, difficulty: 'Advanced', badge: '🔌',
        topics: ['Embedded C Memory Control', 'I2C & SPI Sensor Interfacing', 'FreeRTOS Task Scheduling', 'MQTT & AWS IoT Core'],
        resources: [{ title: 'FreeRTOS Official Docs', url: 'https://www.freertos.org/' }],
        project: { title: 'Connected Smart IoT Node', description: 'Build an ESP32 IoT node reading sensors and publishing telemetry to AWS IoT.' },
      },
    ],
  },
  {
    id: 'robotics',
    title: 'Robotics & Autonomous Systems',
    category: 'Emerging & Hardware',
    icon: '🤖', color: '#0284c7', gradient: 'from-sky-600 to-blue-700',
    description: 'Program autonomous robots using Robot Operating System (ROS 2), Gazebo simulation, and SLAM.',
    estimatedMonths: 9,
    stages: [
      {
        title: 'ROS 2 & Robot Simulation', description: 'ROS 2 nodes, topics, services, Gazebo 3D simulation, and SLAM navigation.', durationWeeks: 5, difficulty: 'Advanced', badge: '⚙️',
        topics: ['ROS 2 Architecture (Nodes/Topics)', 'Gazebo Physics Simulation', 'Robot Kinematics & URDF', 'SLAM Navigation & LiDAR'],
        resources: [{ title: 'ROS 2 Documentation', url: 'https://docs.ros.org/en/humble/' }],
        project: { title: 'Autonomous LiDAR Navigation', description: 'Simulate a mobile robot mapping an unknown indoor building and navigating autonomously.' },
      },
    ],
  },
];

export const DOMAIN_MAP = Object.fromEntries(CAREER_DOMAINS.map((d) => [d.id, d]));
