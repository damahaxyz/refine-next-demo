# Spring Boot Backend Code Analysis & Next.js Implementation Plan

## 1. Code Analysis (Spring Boot)

The `fpg-backend` `admin` module follows a highly generic **Controller-Service-Repository** pattern, relying heavily on inheritance to reduce boilerplate.

### Key Components:
- **BaseController<M, Q>**:
  - Provides standard RESTful endpoints:
    - `GET /` (List with pagination/filtering)
    - `GET /:id` (Retrieve single)
    - `POST /` (Create)
    - `PUT /:id` (Full Update)
    - `PATCH /:id` (Partial Update)
    - `DELETE /:id` (Delete)
    - `DELETE /batch` (Batch Delete)
    - `PATCH /batch` (Batch Update)
  - Lifecycle hooks (`onBeforePersist`, `onAfterUpdate`) allow subclasses to inject custom logic.
- **AuthController**:
  - Handles `/auth/login`, `/auth/profile`, `/auth/change_password`.
  - Uses `AdminLoginUser` session object.
- **Role-Based Access Control (RBAC)**:
  - **Annotations**:
    - `@AuthModule(code="CUSTOMER", name="Customer")`: Defines a resource module code.
    - `@AuthAction(value="VIEW", name="View")`: Defines an action on that resource.
  - **Interceptor (`AuthIntercept.java`)**:
    - Intercepts every request.
    - Checks if the user is logged in (unless marked `@NoAuth`).
    - Constructs a required permission string: `MODULE_CODE-ACTION_VALUE` (e.g., `CUSTOMER-VIEW`).
    - Verifies if the current user's session (`AdminLoginUser`) has this permission definition.
    - Supports hierarchical permission checks even on inherited methods from `BaseController`.

## 2. Next.js Implementation Scheme

To achieve the "same functionality" in Next.js (using App Router API Routes), we should replicate the **Generic Factory Pattern** and the **Permission Middleware**.

### Recommended Tech Stack
- **Framework**: Next.js App Router (`app/api/...`)
- **Database**: MongoDB (matching the Spring Boot backend)
- **ORM**: Mongoose (strongly typed schemas equivalent to Java entities)
- **Validation**: Zod (for request validation)
- **Auth**: JOSE (JWT handling)

### Architecture Proposal

#### A. Directory Structure
```
src/
  app/
    api/
      auth/
        login/
          route.ts       # POST /api/auth/login
      customers/
        route.ts         # GET (List), POST (Create)
        [id]/
          route.ts       # GET, PATCH, DELETE
  lib/
    db.ts                # MongoDB connection
    api-handler.ts       # Generic CRUD handler factory
    auth-middleware.ts   # Permission verification logic
  models/
    customer.ts          # Mongoose Model
```

#### B. Permission Control Implementation

In standard Next.js API routes, we don't have Java methods to annotate. Instead, we can pass metadata to our **Generic Handler Factory**.

**Permission Logic Mapping:**
- Java: `@AuthModule(code="CUSTOMER")` + `@AuthAction("VIEW")` on `get()` -> Permission: `CUSTOMER-VIEW`
- Next.js: Pass `{ module: "CUSTOMER", permissions: { GET: "VIEW", POST: "NEW" } }` to the factory.

**`src/lib/api-handler.ts` (Core Logic):**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyToken } from "@/lib/auth"; // Utility to verify JWT

interface PermissionConfig {
  module: string;            // e.g., "CUSTOMER"
  actions?: {
    GET?: string;           // default: "VIEW"
    POST?: string;          // default: "NEW"
    PATCH?: string;         // default: "EDIT"
    DELETE?: string;        // default: "DELETE"
  };
}

interface CrudOptions<T> {
  model: any; 
  auth: PermissionConfig;    // <-- New Auth Configuration
  // ... other hooks
}

export function createCrudHandlers<T>(options: CrudOptions<T>) {
  const checkPermission = async (req: Request, method: string) => {
    // 1. Get Token from Header
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) throw new Error("Unauthorized");

    // 2. Verify Token & Get User Permissions
    const user = await verifyToken(token);
    const userPermissions = user.permissions; // List of strings ["CUSTOMER-VIEW", ...]

    // 3. Construct Required Permission
    const defaultActions: Record<string, string> = {
      GET: "VIEW", POST: "NEW", PATCH: "EDIT", DELETE: "DELETE"
    };
    const action = options.auth.actions?.[method] || defaultActions[method];
    const requiredPermission = `${options.auth.module}-${action}`;

    // 4. Verify
    if (!userPermissions.includes(requiredPermission)) {
      throw new Error("Forbidden"); // 403
    }
    return user;
  };

  return {
    GET: async (req: NextRequest) => {
      await checkPermission(req, "GET"); 
      // ... logic for List/Get
    },
    // ... implement other methods similarly
  };
}
```

#### C. Handling Standard & Custom Actions

- **Standard Actions**: The factory handles `VIEW`, `NEW`, `EDIT`, `DELETE` automatically based on the HTTP method.
- **Custom Actions**: For custom endpoints (e.g., `cancelOrder`), you manually wrap the handler:
  ```typescript
  // src/app/api/orders/cancel/route.ts
  export const POST = withAuth(async (req) => {
     // logic
  }, { module: "ORDER", action: "cancelOrder" });
  ```

### Step-by-Step Migration Plan

1.  **Setup Auth Lib**: Create `verifyToken` using `jose` to parse JWTs and extract the `permissions` list (which should be in the JWT payload).
2.  **Enhance Handler Factory**: Update the `createCrudHandlers` to accept `auth` config and enforce permission checks before executing logic.
3.  **Refine Models**: Ensure the `Account/Role` models store permissions as a list of strings (`["CUSTOMER-VIEW, "ORDER-doOrder"]`) to match the simple check logic.
4.  **Migrate Controllers**:
    -   `CustomerController` -> `createCrudHandlers({ model: Customer, auth: { module: "CUSTOMER" } })`
    -   `OrderController` -> `createCrudHandlers({ model: Order, auth: { module: "ORDER" } })`

---

This revised plan ensures that the strict RBAC from the Spring Boot backend is faithfully reproduced in the Next.js API layer.
