# DefectFlow — AI Agent Instructions

## 1. Project Context

The project is called **DefectFlow**.

DefectFlow is a full-stack Bug Tracking and Test Management System
designed for QA engineers, developers, project managers and
administrators.

The detailed project specification is located at:

`docs/PROJECT_CONTEXT.md`

Always read and follow `docs/PROJECT_CONTEXT.md` before making
important project decisions.

---

# 2. Primary Development Model

The project owner is personally responsible for implementing and
understanding the Java Core backend.

This is intentional.

The backend is a major learning and portfolio component of the project.

The AI agent must NOT independently implement the backend.

The AI agent should primarily assist the project owner with:

- explanations;
- architecture discussions;
- debugging;
- code review;
- identifying bugs;
- explaining errors;
- suggesting implementation approaches;
- reviewing API design;
- reviewing database design;
- reviewing backend tests;
- frontend implementation;
- Selenium automation;
- Docker;
- documentation.

The goal is not simply to generate working software.

The goal is for the project owner to understand and be able to explain
the Java backend during a university presentation and technical
interview.

---

# 3. Backend Scope

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

The backend does not need to implement every feature of a production
Bug Tracking System.

Some frontend functionality may remain simplified or be supported by
a smaller backend implementation.

The final backend should be realistically implementable and
understandable by a junior Java developer working on a university/pet
project.

The AI agent must help the project owner learn and implement the
backend rather than turning it into a large generated system.

Do not introduce Spring Boot, Spring Data JPA, Hibernate, Spring
Security, or similar frameworks unless the project owner explicitly
asks for them.

---

# 4. Backend Ownership

The project owner implements the backend.

Backend technologies:

- Java 25
- Maven
- Java HTTP / REST (keep the server and routing small)
- JDBC
- PostgreSQL
- SQL schema (simple migration scripts if needed)
- JUnit 5 and related tests

The project owner should personally implement and understand:

- Java classes;
- domain models;
- JDBC data access;
- services;
- HTTP/REST handlers;
- request/response DTOs;
- validation;
- exception handling;
- business logic;
- basic authentication;
- basic authorization;
- PostgreSQL integration;
- backend tests.

---

# 5. Backend AI Assistance

The AI agent may assist with backend development.

Preferred assistance order:

1. Explain the concept.
2. Explain the problem.
3. Give hints.
4. Review the user's implementation.
5. Identify errors.
6. Suggest improvements.
7. Provide a small example if necessary.

Do not immediately generate an entire backend feature when the user is
trying to implement it themselves.

Do not silently create or rewrite backend files.

Do not modify backend business logic unless the user explicitly asks
for implementation or modification.

If the user provides backend code, review the code and explain problems
clearly.

When reviewing code, distinguish between:

- actual bugs;
- architectural problems;
- maintainability issues;
- optional improvements.

Do not present optional improvements as mandatory requirements.

---

# 6. Do Not Hide Complexity

If a backend implementation is complicated, explain the important
concepts instead of hiding them behind generated code.

The project owner should understand:

- why a solution is used;
- how it works;
- what alternatives exist;
- what trade-offs exist.

The AI agent should help the user learn the technology rather than
turning the backend into a black box.

---

# 7. Architecture

Use a small layered monolith.

Typical layers:

- HTTP/REST handlers;
- services;
- JDBC repositories;
- domain models / DTOs.

Do not introduce microservices unless there is a strong technical reason
and the decision is explicitly discussed first.

The backend should expose a REST API.

The frontend should communicate with the backend through the REST API.

PostgreSQL is the primary persistent database.

Prefer plain SQL / JDBC. Do not add Flyway, connection pools, or extra
infrastructure unless the project owner asks for them or they are
needed to run the demo.

---

# 8. Frontend

The AI agent may implement the frontend.

Frontend technologies:

- React
- TypeScript
- Axios
- HTML
- CSS

The frontend must communicate with the real backend.

Do not replace missing backend functionality with permanent fake APIs or
mock data.

If a required backend endpoint does not exist yet:

1. identify the required API contract;
2. explain what the frontend needs;
3. ask whether to temporarily mock it or wait for the backend.

The frontend should include:

- routing;
- authentication pages;
- application layout;
- navigation;
- dashboards;
- forms;
- tables;
- filtering;
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

---

# 9. Authentication and Authorization

Authentication must be real, but the implementation should stay basic
and explainable (for example session or token checks in the HTTP
layer).

Passwords must be securely hashed.

Never store plaintext passwords.

Backend authorization is mandatory.

Frontend hiding of UI elements is not a security mechanism.

Initial roles:

- ADMIN
- PROJECT_MANAGER
- QA
- DEVELOPER

Permissions must be enforced on the backend.

A small role check is enough. Do not build a full permission engine.

---

# 10. Bug Lifecycle

The initial bug lifecycle is:

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

The backend must enforce valid state transitions.

The frontend should only display valid actions for the current user
and bug state.

---

# 11. Testing

Testing is a major part of the project.

Use:

- JUnit 5
- Mockito
- REST Assured
- Selenium WebDriver
- Testcontainers only if they stay simple and the owner wants them

The AI agent may help implement and maintain tests.

However, the project owner should understand tests related to the
backend.

Tests must verify real application behavior.

Do not create meaningless tests simply to increase code coverage.

Include both positive and negative scenarios.

Important business rules should have automated tests.

---

# 12. Selenium

The AI agent may implement Selenium end-to-end tests.

Important scenarios may include:

- login;
- project creation;
- bug creation;
- bug assignment;
- bug status changes;
- test case creation;
- test execution;
- dashboard verification.

Prefer stable locators.

Use explicit waits when synchronization is required.

Avoid unnecessary `Thread.sleep()`.

---

# 13. API Testing

REST Assured may be used for API-level automated testing.

Test:

- successful requests;
- validation errors;
- authentication;
- authorization;
- invalid requests;
- nonexistent resources;
- invalid bug transitions;
- other important business rules.

---

# 14. Database

Use PostgreSQL.

Use JDBC for data access.

Keep the schema small and explicit (SQL files or a few migration
scripts). Do not depend on undocumented manual tables for the demo.

Maintain appropriate:

- primary keys;
- foreign keys;
- constraints;
- indexes;
- relationships;
- uniqueness rules.

Do not introduce unnecessary database complexity.

---

# 15. Docker

The AI agent may help create and maintain:

- Dockerfiles;
- docker-compose.yml;
- environment configuration;
- development setup documentation.

The project owner should understand how the backend is containerized.

The Docker configuration must actually work.

Do not create Docker configuration only for appearance.

---

# 16. Documentation

The AI agent may create and maintain project documentation.

Documentation must reflect the actual implementation.

Do not document functionality that does not exist.

Important documentation includes:

- project overview;
- architecture;
- setup;
- configuration;
- database;
- API;
- testing;
- Docker;
- demo credentials;
- development instructions.

---

# 17. Code Quality

Prefer:

- clear naming;
- small focused methods;
- clear responsibilities;
- low duplication;
- maintainable structure;
- appropriate abstractions.

Avoid:

- unnecessary abstractions;
- overengineering;
- dead code;
- unused dependencies;
- duplicated business logic;
- magic values;
- unnecessary technologies.

Do not add technologies simply to make the technology stack look larger.

---

# 18. No Fake Functionality

Do not create:

- fake buttons;
- placeholder functionality;
- fake API responses;
- mock-only important features;
- unfinished critical modules;
- hardcoded data replacing real functionality.

If something is intentionally mocked for development/testing, clearly
mark it as such and explain what real functionality it represents.

---

# 19. Existing Code

Before modifying existing code:

1. inspect it;
2. understand its purpose;
3. identify dependencies;
4. check whether other components depend on it.

Do not overwrite working code unnecessarily.

Do not delete files without a reason.

Do not make unrelated changes.

---

# 20. Working Process

For significant tasks:

1. Read the relevant project context.
2. Inspect the existing implementation.
3. Explain the planned approach briefly.
4. Implement only the requested scope.
5. Run relevant checks/tests.
6. Fix discovered issues.
7. Report what was changed.
8. Mention anything that still requires user action.

For backend tasks, prefer guidance and review unless the user explicitly
asks the AI to write the implementation.

For frontend tasks, the AI may implement the required functionality.

---

# 21. Requirements and Ambiguities

Do not invent major business requirements.

If an ambiguity affects:

- architecture;
- database;
- API;
- authentication;
- authorization;
- roles;
- permissions;
- business workflow;

stop and ask for clarification.

For minor technical decisions, use reasonable engineering judgment.

When asking for clarification, explain:

1. what is unclear;
2. available options;
3. recommended option;
4. reason for the recommendation.

---

# 22. Verification

Never claim that a feature is complete simply because code was written.

Where possible, verify:

- compilation;
- tests;
- API behavior;
- database migrations;
- frontend build;
- frontend/backend integration;
- Selenium tests;
- Docker startup.

If something could not be verified, explicitly say so.

---

# 23. Final Objective

The final result should be a complete, runnable and demonstrable
DefectFlow application.

It should be suitable for:

- university project demonstration;
- Java Developer portfolio;
- QA Automation Java portfolio.

The project should demonstrate practical knowledge of:

- Java Core;
- OOP;
- REST APIs;
- JDBC;
- PostgreSQL;
- basic authentication and authorization;
- React;
- TypeScript;
- JUnit;
- Mockito;
- REST Assured;
- Selenium;
- Docker;
- software quality practices.

The backend should remain understandable and primarily authored by the
project owner.