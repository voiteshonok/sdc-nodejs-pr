# Assignment 6 - Testing, Logging, Monitoring, Swagger

## Tasks

### Cover your application logic with unit tests

Cover your server functionality with unit tests.

Here what you can use:

- [Jest](https://jestjs.io/) (the most popular third-party testing library)
  - [Getting Started](https://jestjs.io/docs/getting-started)
- [Node.js test runner](https://nodejs.org/docs/latest/api/test.html#test-runner) (built-in solution)
  - [Discovering Node.js's test runner](https://nodejs.org/en/learn/test-runner/introduction)

### Cover your application with logging

In previous assignments you should have already implemented your custom `Logger` for general usage. Since your project has grown bigger and more complex, having better and more functional logging will make it easier for you to analyze errors and investigate bugs.

`winston` is a logging library which you can integrate into a project. With it you will be able to transport logs into different destinations (local files, database or dedicated services for analyzing application metrics).

It is expected that you will log different logging levels at least into different files:

- File with combined logs (everything including info, errors, fatal, debug, etc.).
- File with error logs (only errors and fatal).

#### Implement environment-based logging

Your application's logging should work at least in two modes based on value stored in `NODE_ENV` variable:

- `production` - should store your logs into different files
- `development` - should just print everything into a `console` in a simple format

### Integrate simple monitoring

Integrate simple metrics collector of your system server resources that can be easily monitored on a web-page.

You may use several options:

- [Express Status Monitor](https://www.npmjs.com/package/express-status-monitor) - simple and easy to setup.
- [Clinic.js Doctor](https://www.clinicjs.org/doctor/) - can be challenging to setup but it will reward you with useful metrics, warnings and recommendations.

It is ok to use one of them or either to bring some other existing solution into your project. Don't forget that it should visually display common metrics (CPU usage, RAM, requests/responses, etc.)

### Integrate Swagger

You need to follow up your API with documentation that serves as a source of truth for anyone who will work with your API later.

The most common option is to use [Swagger](https://swagger.io/).

Since you're using Express framework you can use this npm library:

- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)

## Evaluation criteria

- **Unit Tests**
  - **2 pts** - Core functionality is covered with unit tests.
    - **1 pts** - Unit tests are written but core functionality is covered partially.
    - **0 pts** - Tests are missing or broken.
- **Logging**
  - **2 pts** - Your core functionality is fully logged with different levels of severity. Logs are written into the different files. Environment-based logging is supported.
    - **1 pts** - Logging works but it there is lack of utilization of severity levels. Some of the required functionality is missing.
    - **0 pts** - Logging is missing or the initial logger from previous assignments remains untouched.
- **Metrics**
  - **2 pts** - Activity of a running server can be monitored.
    - **0 pts** - Missing or broken.
- **Swagger**
  - **4 pts** - Swagger is integrated into your application. It supports UI and can be easily viewed as the web-page.
    - **2 pts** - Swagger is integrated but with issues.
    - **0 pts** - Missing or broken.

### Penalties

- If you haven't uploaded your assignment before the deadline - your max grade would be **7 pts** + you are allowed to send your work before the next practical lesson. If the work would not be sent before the second deadline - it will be automatically evaluated to **0 pts**.

- If the submitted code is suspected of being artificially generated and/or copy-pasted, the work will be either returned with **0 pts** or the student will be asked to explain their code in detail. If student fails to explain their code, the practical task is considered as failed and will be returned with **0 pts**.
