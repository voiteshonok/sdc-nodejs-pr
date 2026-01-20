# Assignment 7 - Shaping your server application

## Tasks

### Enable analyzing of codebase test coverage

Configure your test config (in case if you're using Jest or similar external libraries) so that it will analyze and report your percentage of test coverage of the whole codebase.

Coverage is mostly related to unit tests, so don't forget to configure your coverage with excluding parts which are related to functionality which will be covered in integration or e2e tests (like express endpoints, working with the real database or config files). Focus on your core logic: self-written services, utilities, components etc.

Don't forget to mock third-party libraries and functionality which works with external resources. Make your unit tests as isolated as possible.

#### Useful Links

- [Configuring Jest](https://jestjs.io/docs/configuration)
- Jest Mocks
  - [Mock Functions](https://jestjs.io/docs/mock-functions)
  - [Jest Mocking Cheat Sheet](https://cemkarakurt.com/notes/jest-mocking/)

### Implement integration tests

Use [supertest](https://www.npmjs.com/package/supertest) package to test your backend endpoints.

#### Useful Links

- [Getting Started](https://github.com/forwardemail/supertest?tab=readme-ov-file#getting-started)

### Compress server responses

Enable compression in Express using [compression](https://expressjs.com/en/resources/middleware/compression.html) middleware.

### Enable monitoring only for admins

In previous assignment you've already integrated system monitoring in your Express Server.

Protect your page so that only `admin` or `moderator` can view these metrics.

## Evaluation criteria

- **Test Coverage**
  - **2 pts** - Core logic coverage is ≥80%.
    - **2 pts** - Core logic coverage is <80%.
    - **0 pts** - Tests are missing or broken.
- **Integration tests**
  - **2 pts** - All endpoints are covered with integration tests.
    - **2 pts** - Integration tests are implemented but without full coverage and/or has some issues.
    - **0 pts** - Integration tests are missing or broken.
- **Response Compression**
  - **2 pts** - Compression is enabled. Decreased size of the response can be observed.
    - **0 pts** - Missing or broken.
- **System monitoring for admins only**
  - **2 pts** - System monitoring page can only viewed by users who have admin or moderator role.
    - **0 pts** - Missing or broken.
- **Code Stability & Structure**
  - **2 pts** - Clean, modular, stable and easy to follow.
    - **1 pt** - Acceptable but has inconsistencies.
    - **0 pts** - Disorganized and confusing.

### Penalties

- If you haven't uploaded your assignment before the deadline - your max grade would be **7 pts** + you are allowed to send your work before the next practical lesson. If the work would not be sent before the second deadline - it will be automatically evaluated to **0 pts**.

- If the submitted code is suspected of being artificially generated and/or copy-pasted, the work will be either returned with **0 pts** or the student will be asked to explain their code in detail. If student fails to explain their code, the practical task is considered as failed and will be returned with **0 pts**.