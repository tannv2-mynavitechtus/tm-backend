**Tổng quan kiến trúc hệ thống**

- Client-Server architecture diagram
- Request-Response lifecycle
- REST API conventions (GET, POST, PUT/PATCH, DELETE)

**Luồng dữ liệu chi tiết của Task Management System**

- User login flow: `FE Form → POST /auth/login → Validate credentials → Generate JWT → Return token → Store token`
- Lấy danh sách tasks: `FE Dashboard → GET /tasks (with Bearer token) → Auth Middleware → Controller → Service → Repository → DB Query → Response`
- Tạo task mới: `FE Form → POST /tasks → Validate body (DTO) → Service logic → Insert DB → Return created task`
- Update task (drag/drop): `FE Drag event → PATCH /tasks/:id → Validate → Update DB → Return updated task`
- Cập nhật detail: `FE Edit form → PUT /tasks/:id → Full validation → Update → Response`

**NestJS Request Lifecycle**

```
Incoming Request
  → Middleware (logging, cors)
    → Guards (JWT Auth)
      → Interceptors (transform response)
        → Pipes (validation, transformation)
          → Controller (route handler)
            → Service (business logic)
              → Repository/ORM (database query)
                ← Return data
              ← Transform response
            ← Interceptor post-processing
          ← Guard check
        ← Middleware post-processing
  ← Response to Client
```

**MVC Pattern trong NestJS**

- Model: Entity/DTO definitions
- View: Response serialization (không có view template vì là API)
- Controller: Route handlers, request parsing
- Service: Business logic layer

**Structure**

```
tm-backend/
├── src/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── modules/
│   │   ├── auth/               # Auth module (skeleton)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── tasks/              # Tasks module (skeleton)
│   │   │   ├── tasks.module.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-task.dto.ts
│   │   │   │   └── update-task.dto.ts
│   │   │   └── entities/
│   │   │       └── task.entity.ts
│   │   └── users/              # Users module (skeleton)
│   │       ├── users.module.ts
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── entities/
│   │           └── user.entity.ts
│   ├── package.json
│   └── tsconfig.json
└── docs/
    ├── week1-data-flow.md
    └── other-docs

```

**Week 1 focus chính:**

- [x] Init NestJS project với `@nestjs/cli`
- [x] Setup module structure theo MVC
- [x] Tạo skeleton cho Tasks modules
- [x] Viết DTOs với `class-validator` decorations
- [x] Tạo basic Controller + Service (hardcode data) tasks
- [x] Test API bằng Postman để demo luồng dữ liệu CRUD tasks
