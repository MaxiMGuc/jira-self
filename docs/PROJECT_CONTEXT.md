# DefectFlow — Project Context

## 1. Project Overview

DefectFlow is a full-stack web application for software defect
management and test management.

The system is designed for:

- QA engineers;
- developers;
- project managers;
- administrators.

The main purpose is to provide one system where a software team can:

- manage projects;
- create and track software defects;
- manage the defect lifecycle;
- create and organize test cases;
- organize test suites;
- execute test runs;
- record test results;
- manage releases;
- view testing and defect statistics.

The project has two main purposes:

1. University project.
2. Portfolio project for Java Developer / QA Automation Java career.

The application should therefore look and behave like a realistic
software product rather than a simple CRUD demonstration.

---

# 2. Project Goal

Develop a complete Bug Tracking and Test Management System with:

- a small Java Core backend (HTTP/REST, JDBC, PostgreSQL);
- React/TypeScript frontend;
- PostgreSQL database;
- basic authentication and authorization;
- automated testing;
- Docker support;
- project documentation.

The Java backend is intentionally implemented primarily by the project
owner as part of the learning and portfolio process.

The backend does not need every feature of a production bug tracker.
Keep it small enough that a junior Java developer can implement and
explain it.

---

# 3. Development Ownership

## Backend

The project owner personally implements and understands the Java Core
backend.

This includes:

- Java code;
- HTTP/REST handlers;
- services;
- JDBC repositories;
- domain models;
- DTOs;
- validation;
- exception handling;
- business logic;
- basic authentication;
- basic authorization;
- PostgreSQL integration;
- SQL schema;
- backend tests.

AI assistance is allowed for:

- explanations;
- architecture discussion;
- debugging;
- code review;
- identifying problems;
- implementation hints;
- small examples;
- test suggestions;
- reviewing the user's implementation.

The AI should not independently build the backend unless explicitly
asked to generate a specific implementation.

## Backend Scope

DefectFlow is an educational university/pet project, not a production
enterprise system.

The Java Core backend should remain intentionally small and
understandable.

The goal is to demonstrate practical understanding of:

- Java Core;
- OOP;
- collections;
- exceptions;
- HTTP;
- REST API concepts;
- JDBC;
- PostgreSQL;
- layered architecture;
- basic authentication/authorization concepts;
- testing.

Do not overengineer the backend.

Do not introduce enterprise-level complexity unless it is necessary for
the project demonstration or explicitly requested.

Prefer a simple working implementation over a highly sophisticated
architecture.

Some frontend functionality may remain simplified or be supported by
a smaller backend implementation.

The AI agent must help the project owner learn and implement the
backend rather than turning it into a large generated system.

Do not introduce Spring Boot, Spring Data JPA, Hibernate, Spring
Security, or similar frameworks unless the project owner explicitly
asks for them.

## Frontend

The AI agent may implement the React/TypeScript frontend.

## Testing

Testing is shared.

The AI may implement Selenium and API automation and help with unit and
integration tests.

The project owner should understand the backend-related tests.

## Infrastructure

The AI may help with:

- Docker;
- Docker Compose;
- environment configuration;
- documentation.

---

# 4. Technology Stack

## Backend

- Java 25
- Maven
- Java HTTP / REST (keep the server small)
- JDBC
- PostgreSQL
- SQL schema (simple scripts if needed)
- JUnit 5

## Frontend

- React
- TypeScript
- Axios
- HTML
- CSS

## Testing

- JUnit 5
- Mockito
- REST Assured
- Selenium WebDriver
- Testcontainers only if they stay simple and are explicitly wanted

## Infrastructure

- Docker
- Docker Compose
- Git
- GitHub

---

# 5. Architecture

Use a small layered monolith.

Do not introduce microservices unless there is a strong technical
reason.

The backend exposes a REST API.

The frontend communicates with the backend using HTTP/REST.

PostgreSQL provides persistent storage.

Data access uses JDBC. Keep SQL schema simple.

The system should maintain clear separation between:

- frontend;
- backend;
- database;
- testing;
- infrastructure.

---

# 6. Main Roles

Initial roles:

- ADMIN
- PROJECT_MANAGER
- QA
- DEVELOPER

The exact permissions should be implemented consistently.

Backend authorization is mandatory.

Frontend UI restrictions are not a replacement for backend security.

---

# 7. Authentication

The application must provide real authentication.

Requirements:

- login;
- secure password hashing;
- authenticated access;
- protected endpoints;
- role-based authorization;
- unauthorized/forbidden handling.

Passwords must never be stored in plaintext.

Keep authentication explainable (for example session or token checks
in the HTTP layer). Do not add Spring Security unless explicitly
requested.

---

# 8. Users

Users should contain appropriate information such as:

- id;
- username;
- email;
- password hash;
- role;
- active/inactive status;
- created date.

Password hashes must never be returned by REST APIs.

Administrators should be able to manage users according to the
authorization model.

---

# 9. Projects

Projects represent software products or workspaces managed inside
DefectFlow.

A project should contain appropriate information such as:

- id;
- name;
- description;
- status;
- created date;
- updated date.

Projects are related to:

- bugs;
- test cases;
- test suites;
- test runs;
- releases.

---

# 10. Bug Management

Bug management is one of the core modules.

Users with appropriate permissions should be able to:

- create bugs;
- view bugs;
- edit bugs;
- assign bugs;
- change bug status;
- filter bugs;
- search bugs;
- sort bugs;
- paginate bug lists;
- view bug details;
- add comments;
- view history.

A bug should contain appropriate information such as:

- id;
- title;
- description;
- priority;
- severity;
- status;
- reporter;
- assignee;
- project;
- environment where applicable;
- created date;
- updated date.

---

# 11. Bug Lifecycle

Initial lifecycle:

OPEN
→ IN PROGRESS
→ FIXED
→ READY FOR QA
→ VERIFIED
→ CLOSED

If QA rejects a fix:

READY FOR QA
→ REOPENED
→ IN PROGRESS

The backend must enforce valid transitions.

Clients must not be able to bypass workflow rules by submitting
arbitrary status changes.

The frontend should display actions appropriate to:

- current status;
- current user;
- user role.

---

# 12. Bug Comments and History

Users should be able to add comments to bugs according to permissions.

Important bug changes should be recorded in history.

Examples:

- status changed;
- assignee changed;
- priority changed;
- severity changed;
- comment added;
- important field updated.

The history should make it possible to understand how a defect evolved.

---

# 13. Test Cases

QA users should be able to create and manage test cases.

A test case should contain appropriate information such as:

- id;
- title;
- description;
- preconditions;
- test steps;
- expected result;
- priority;
- status;
- project;
- author;
- created date;
- updated date.

The system should support practical manual test management.

---

# 14. Test Suites

Test cases should be organizable into test suites.

Users with appropriate permissions should be able to:

- create suites;
- rename suites;
- delete suites where appropriate;
- add test cases;
- remove test cases;
- view suite contents.

---

# 15. Test Runs

The system should support execution of test suites.

A test run represents a testing session for a project and/or release.

Users should be able to:

- create test runs;
- select test cases or suites;
- execute test cases;
- record results;
- view execution progress;
- view final results.

---

# 16. Test Results

Test execution should support at least:

- PASSED;
- FAILED;
- BLOCKED;
- NOT_RUN.

A result should be associated with:

- test run;
- test case;
- executor;
- execution time;
- optional comment.

The system should make it easy to understand which tests passed,
failed or were blocked.

---

# 17. Releases

The application should support basic release management.

A release may contain:

- id;
- name/version;
- description;
- status;
- project;
- release date.

Bugs and test runs should be associated with releases where
appropriate.

---

# 18. Dashboard

The application should provide a useful dashboard based on real data.

Possible information:

- total bugs;
- open bugs;
- bugs by status;
- bugs by severity;
- bugs by priority;
- test case count;
- test runs;
- passed tests;
- failed tests;
- blocked tests;
- release information.

Statistics must be based on real application data.

---

# 19. Reports

The application should provide useful statistics such as:

- defects by status;
- defects by severity;
- defects by priority;
- test execution results;
- test pass/fail rate;
- release quality overview.

Reports should use real database data.

---

# 20. Frontend

The frontend should be a real working application.

It should contain:

- authentication;
- routing;
- application layout;
- navigation;
- dashboards;
- forms;
- tables;
- filters;
- search;
- sorting;
- pagination;
- detail pages;
- modals where appropriate;
- notifications;
- loading states;
- empty states;
- error states;
- responsive layout.

The frontend must communicate with the real backend.

Do not permanently replace backend functionality with mock data.

---

# 21. Backend

The backend should use a clean, small, maintainable architecture.

Appropriate layers may include:

- HTTP/REST handlers;
- services;
- JDBC repositories;
- domain models;
- DTOs;
- validation;
- basic security checks;
- exception handling.

HTTP handlers should not contain large amounts of business logic.

Business rules should be implemented in the appropriate service/domain
layer.

Database rows and internal models should not automatically be exposed
as public API contracts.

---

# 22. Validation

Validate incoming user input.

Validation should cover:

- required fields;
- invalid values;
- invalid formats;
- invalid relationships;
- invalid state transitions;
- unauthorized operations;
- nonexistent resources.

The API should return appropriate HTTP status codes and consistent
error responses.

---

# 23. Database

Use PostgreSQL and JDBC.

Keep the schema in versioned SQL files or a few simple scripts.

Do not rely on undocumented manual tables for the demo.

The schema should maintain:

- primary keys;
- foreign keys;
- constraints;
- indexes where appropriate;
- relationships;
- uniqueness rules.

Main entities are expected to include concepts such as:

- users;
- roles;
- projects;
- bugs;
- comments;
- history;
- test cases;
- test suites;
- test runs;
- test results;
- releases.

The final schema may be refined during implementation when justified.

---

# 24. Testing Strategy

Testing is a major part of DefectFlow.

## Unit Testing

Use:

- JUnit 5;
- Mockito.

Important business logic should have unit tests.

Examples:

- bug lifecycle;
- authorization rules;
- services;
- validation;
- business rules.

## Integration Testing

Test interactions between application components.

Examples:

- repositories;
- database;
- services;
- security;
- REST controllers.

Testcontainers may be used where useful.

## API Testing

Use REST Assured where appropriate.

Test:

- successful requests;
- validation failures;
- authentication;
- authorization;
- invalid requests;
- missing resources;
- invalid bug transitions;
- important business rules.

## UI Automation

Use Selenium WebDriver for important end-to-end scenarios.

Possible scenarios:

- login;
- create project;
- create bug;
- assign bug;
- change bug status;
- create test case;
- execute test case;
- verify dashboard.

---

# 25. Negative Testing

Negative testing is important.

The application should be tested against:

- invalid input;
- missing required fields;
- unauthorized access;
- forbidden operations;
- invalid state transitions;
- nonexistent IDs;
- duplicate data where applicable;
- invalid authentication;
- malformed requests.

---

# 26. Docker

Provide Docker support for the application and infrastructure.

Docker Compose should be used where appropriate.

The final setup should allow the project to be started with documented
commands.

The Docker setup must be tested rather than merely created.

---

# 27. Demo Data

Provide realistic fake demo data.

The demo environment should contain:

- several users;
- different roles;
- at least one project;
- several bugs;
- different bug statuses;
- test cases;
- test suites;
- test runs;
- test results;
- releases.

All credentials must be fake.

Never use real personal credentials.

---

# 28. Security

Security requirements include:

- secure password hashing;
- authentication;
- authorization;
- protected endpoints;
- input validation;
- safe API responses;
- no password exposure;
- no sensitive information in error responses.

Security must be enforced on the backend.

---

# 29. Error Handling

Use centralized and consistent error handling.

Handle:

- validation errors;
- authentication errors;
- authorization errors;
- resource not found;
- business rule violations;
- invalid requests;
- unexpected server errors.

Do not expose stack traces or sensitive implementation details.

---

# 30. Code Quality

The project should use:

- readable code;
- meaningful names;
- clear responsibilities;
- maintainable architecture;
- reasonable abstractions;
- minimal unnecessary duplication.

Avoid:

- overengineering;
- dead code;
- unused dependencies;
- unnecessary technologies;
- duplicated business logic.

---

# 31. No Fake Functionality

The final application must not contain important functionality that is
only simulated.

Do not consider the project complete if it contains:

- fake buttons;
- placeholder pages;
- mock-only core functionality;
- hardcoded API responses;
- unfinished critical modules;
- TODOs in important functionality.

Temporary mocks may be used during development only when clearly
identified and later replaced with real functionality.

---

# 32. Requirements and Ambiguities

Do not invent major business requirements.

If an unclear requirement affects:

- architecture;
- database;
- API;
- authentication;
- authorization;
- roles;
- permissions;
- workflow;

the issue should be discussed before making a major decision.

For minor technical decisions, reasonable engineering judgment may be
used.

---

# 33. Verification

The final project should be verified through actual execution.

Verify where applicable:

- backend compilation;
- frontend build;
- database migrations;
- application startup;
- authentication;
- authorization;
- REST API;
- frontend/backend integration;
- unit tests;
- integration tests;
- API tests;
- Selenium tests;
- Docker.

Do not claim completion based only on generated source code.

---

# 34. Documentation

The final project should document:

- purpose;
- architecture;
- technology stack;
- installation;
- configuration;
- database setup;
- backend startup;
- frontend startup;
- testing;
- Docker;
- demo credentials;
- API functionality.

The documentation must reflect the actual implementation.

---

# 35. Final Quality Target

DefectFlow should be a realistic small-scale professional software
product.

It should be suitable for:

- university commission demonstration;
- Java Developer portfolio;
- QA Automation Java portfolio.

The project should demonstrate practical understanding of:

- Java Core;
- OOP;
- REST APIs;
- JDBC;
- PostgreSQL;
- basic authentication and authorization;
- React;
- TypeScript;
- JUnit 5;
- Mockito;
- REST Assured;
- Selenium;
- Docker;
- software testing and quality practices.

The most important learning objective is that the project owner
understands and can explain the Java backend rather than merely having
AI-generated backend code.