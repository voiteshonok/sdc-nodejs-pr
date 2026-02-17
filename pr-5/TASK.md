# Assignment 5 - Authentication, Security, Roles, Permissions

## Tasks

### Expand your Students Management System database structure

Right now you should have only a `Students` table with some basic columns repeating your `Student` class properties.

This assignment requires more complex interaction with your system, so create new tables:

- `Roles` - will store roles which will be assigned to `Users` in your table. Some roles to consider: `student`, `teacher`, `admin`.
- `Users` - will store general user information such as `id`, `name`, `surname`, `email` (should be unique), `role`, `password` (don't forget to store only encrypted data here).
- `Subjects` - will store general information about subjects which students study at University. Columns to consider: `id`, `subject_name`
- `Grades` - will store grades assigned to students. Consider applying columns like `subject_id`, `student_id`, `grade`, `evaluated_at`, etc.

Your `Students` table will need to be updated as well since from now on your students should be considered as existing users in your system. Adding a new `user_id` column will be a good move.

### Implement authentication using JWT

Your application should support endpoints for `login` and `registration`.

Your existing endpoints should be protected from reaching them if user is ot authenticated into your system.

#### Login

User already exist in the database.

If everything is entered correctly - your backend should issue the JWT token which will contain general information about user, including it's role, id, name, etc.

Later your user should include this JWT token into `Authentication` header before sending a request to another API endpoints.

#### Registration

User should provide a unique email and all the information that will populate all necessary columns in `Users` table.

After that user should be able to login into the system without any problems.

#### Useful Links

- Encrypt user password:
  - [`bcrypt` npm package](https://www.npmjs.com/package/bcrypt)
- JWT
  - [Introduction to JWT](https://www.jwt.io/introduction#when-to-use-json-web-tokens)
  - [`jsonwebtoken` npm package](https://www.npmjs.com/package/jsonwebtoken)
  - [JSON Web Token (JWT) Debugger](https://www.jwt.io/)
- To generate random unique ID for your users (make sure that you've specified the correct length of stored ID string in your database):
  - [`crypto.randomUUID`](https://nodejs.org/docs/latest-v14.x/api/crypto.html#crypto_crypto_randomuuid_options)
  - [`uuid` npm package](https://www.npmjs.com/package/uuid)

### Setup User Roles and/or Permissions

You are free to choose either making a role-based access or permission-based access to your API resources.

In both approaches it is expected that you've updated database structure as it was proposed in the first section of this assignment.

You should have at least 3 roles. One of them should have all permissions (most commonly called `admin`) and one of them should have the least permissions (for example `guest` or `student`). There should be another role which will represent someone who can have more permissions than the `guest` but less than the `admin` (most commonly - `moderator` or `teacher` in your case).

Guard your endpoint with middleware which will check roles either by reading the payload from JWT token or make a request to your database.

## Evaluation criteria

- **Core Functionality**
  - **4 pts** - Your endpoints are guarded and not blocking any unauthorized access to your resources.
    - **2 pts** - Endpoints are mostly protected but with some issues.
    - **0 pts** - Missing or broken.
- **Database Structure Expansion**
  - **2 pts** - Your database structure is expanded based on the task description. Relations between tables are correct and everything works without issues.
    - **1 pt** - Tables are created but their relations or structure is incorrect or not working properly.
    - **0 pts** - No new tables were created.
- **Setup User Roles and/or Permissions**
  - **2 pts** - Your endpoints works correctly with roles or specified.permissions. Roles with the least permissions will never have access to operations requiring higher amount of permissions.
    - **1 pt** - Works but with issues.
    - **0 pts** - Roles are not implemented or not working completely.
- **Code Stability & Structure**
  - **2 pts** - Clean, modular, stable and easy to follow.
    - **1 pt** - Acceptable but has inconsistencies.
    - **0 pts** - Disorganized and confusing.

### Penalties [**Updated**]

- If you haven't uploaded your assignment before the deadline - your max grade would be **7 pts** + you are allowed to send your work before the next practical lesson. If the work would not be sent before the second deadline - it will be automatically evaluated to **0 pts**.

- If the submitted code is suspected of being artificially generated and/or copy-pasted, the work will be either returned with **0 pts** or the student will be asked to explain their code in detail. If student fails to explain their code, the practical task is considered as failed and will be returned with **0 pts**.