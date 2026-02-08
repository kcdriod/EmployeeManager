# Employee Command Center (Full Stack)

This project is a full-stack Employee Management app:
- Backend: Spring Boot REST API + Spring Data JPA + in-memory H2 database
- Frontend: React 18 + Axios UI dashboard

The UI lets you create, view, update, and delete employees, plus search/filter/sort and view salary/department insights.

## Project structure and code reference

### Backend (Spring Boot, root project)

- `pom.xml`
  - Maven config, Spring Boot `3.3.5`, Java `21`, dependencies for Web, JPA, Validation, and H2.
- `src/main/java/com/kcorp/Main.java`
  - Spring Boot entry point (`@SpringBootApplication`).
- `src/main/java/com/kcorp/controllers/Employees.java`
  - REST controller for employee CRUD:
    - `POST /employees`
    - `GET /employees`
    - `PUT /employees/{id}`
    - `DELETE /employees/{id}`
  - CORS enabled for frontend origin `http://localhost:3000`.
- `src/main/java/com/kcorp/controllers/HelloController.java`
  - Health/sample endpoint: `GET /hello` returns `Hello World`.
- `src/main/java/com/kcorp/service/EmployeeService.java`
  - Business logic for create/list/update/delete, repository usage.
- `src/main/java/com/kcorp/repository/EmployeeRepository.java`
  - `JpaRepository<Employee, Long>`.
- `src/main/java/com/kcorp/model/Employee.java`
  - JPA entity + validation:
    - `name`: `@NotBlank`
    - `email`: `@NotBlank`, `@Email`
    - `department`: `@NotBlank`
    - `salary`: `@Positive`
- `src/main/java/com/kcorp/exception/GlobalExceptionHandler.java`
  - Handles validation errors (`MethodArgumentNotValidException`) and returns field-level error map.
- `src/main/resources/application.properties`
  - In-memory H2 datasource and JPA settings.
  - H2 console enabled at `/h2-console`.

### Frontend (`frontend/employee-ui`)

- `frontend/employee-ui/src/App.js`
  - Main page and state management.
  - Loads employee data and wires create/update/delete API calls.
  - Includes analytics cards, salary sparkline, department mix, salary bands, search/filter/sort.
- `frontend/employee-ui/src/api.js`
  - Axios client with base URL `http://localhost:8080`.
- `frontend/employee-ui/src/EmployeeForm.js`
  - Employee form (create/edit), sends payload with numeric salary.
- `frontend/employee-ui/src/EmployeeTable.js`
  - Employee listing table with edit/delete actions.
- `frontend/employee-ui/src/App.css`, `frontend/employee-ui/src/index.css`
  - Styling, responsive layout, visual theme, typography.
- `frontend/employee-ui/src/App.test.js`
  - Basic UI test mocking API call.

## API contract (current backend)

Base URL: `http://localhost:8080`

### 1) Create employee
`POST /employees`

Request JSON:

```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "department": "Engineering",
  "salary": 95000
}
```

### 2) Get all employees
`GET /employees`

### 3) Update employee
`PUT /employees/{id}`

Same request body shape as create.

### 4) Delete employee
`DELETE /employees/{id}`

### 5) Health/sample endpoint
`GET /hello`

## Prerequisites

- Java `21`
- Maven `3.9+`
- Node.js `18+` (or `20+`)
- npm `9+`

## How to run locally

Run backend and frontend in separate terminals.

### 1) Start backend

From project root (`d:\java\LearnJava`):

```bash
mvn spring-boot:run
```

Backend will run on:
- API: `http://localhost:8080`
- H2 Console: `http://localhost:8080/h2-console`

Quick check:

```bash
curl http://localhost:8080/hello
```

Expected: `Hello World`

### 2) Start frontend

From `d:\java\LearnJava\frontend\employee-ui`:

```bash
npm install
npm start
```

Frontend will run on:
- `http://localhost:3000`

## Run tests

### Backend tests

From root:

```bash
mvn test
```

### Frontend tests

From `frontend/employee-ui`:

```bash
npm test -- --watchAll=false
```

## Build artifacts

### Backend jar

From root:

```bash
mvn clean package
```

Jar output:
- `target/LearnJava-1.0-SNAPSHOT.jar`

Run jar:

```bash
java -jar target/LearnJava-1.0-SNAPSHOT.jar
```

### Frontend production build

From `frontend/employee-ui`:

```bash
npm run build
```

Build output:
- `frontend/employee-ui/build`

## Notes and troubleshooting

- Data is stored in in-memory H2 (`jdbc:h2:mem:testdb`), so data resets when backend restarts.
- Frontend expects backend at `http://localhost:8080` (`frontend/employee-ui/src/api.js`).
- CORS in backend is configured for frontend origin `http://localhost:3000`.
- Validation errors are returned as JSON map (for example `{ "email": "must be a well-formed email address" }`) and displayed in the frontend form.
