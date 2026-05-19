# 🔌 API Integration: Member Management

**Status**: Backend Specification | **Version**: 1.0 | **Last Updated**: May 19, 2026

---

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Endpoints Reference](#endpoints-reference)
4. [Request/Response Format](#requestresponse-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Example Workflows](#example-workflows)
8. [Testing with Postman](#testing-with-postman)

---

## API Overview

### Base URL

```
Development:  http://localhost:3000/api
Production:   https://api.example.com/api
```

### API Version

```
Current Version: v1
```

### Response Format

All responses return JSON with consistent structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* actual data */
  },
  "error": null,
  "timestamp": "2024-05-19T10:30:00Z"
}
```

---

## Authentication

### JWT Token

All endpoints (except `/auth/login`) require JWT token in header:

```
Authorization: Bearer <token>
```

### Token Acquisition

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "quan.nt@ute.udn.vn",
  "password": "password"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "role": "BCN",
      "email": "quan.nt@ute.udn.vn"
    }
  }
}
```

### Token Expiration

- **Expiry**: 24 hours
- **Refresh**: Use refresh token endpoint
- **Storage**: localStorage (key: `authToken`)

---

## Endpoints Reference

### 1. GET /api/members

**Purpose**: Retrieve all members

**Query Parameters**:

| Param  | Type   | Required | Example    |
| ------ | ------ | -------- | ---------- |
| tab    | string | No       | "official" |
| page   | number | No       | 1          |
| limit  | number | No       | 20         |
| search | string | No       | "Nguyễn"   |

**Request**:

```bash
GET /api/members?tab=official&page=1&limit=20
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": {
    "members": [
      {
        "id": "mem_001",
        "name": "Nguyễn Văn An",
        "mssv": "2021001",
        "role": "Thành viên",
        "joinDate": "2024-01-15",
        "contribution": 85,
        "avatar": "https://i.pravatar.cc/150?u=2021001"
      }
    ],
    "total": 9,
    "page": 1,
    "pages": 1
  }
}
```

---

### 2. GET /api/members/:id

**Purpose**: Get single member details

**Path Parameters**:

| Param | Type   | Example   |
| ----- | ------ | --------- |
| id    | string | "mem_001" |

**Request**:

```bash
GET /api/members/mem_001
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "mem_001",
    "name": "Nguyễn Văn An",
    "mssv": "2021001",
    "role": "Thành viên",
    "joinDate": "2024-01-15",
    "contribution": 85,
    "avatar": "https://i.pravatar.cc/150?u=2021001",
    "phone": "0912345678",
    "email": "an.nguyen@ute.udn.vn",
    "major": "Công nghệ thông tin"
  }
}
```

---

### 3. POST /api/members

**Purpose**: Create new member

**Request Body**:

```json
{
  "name": "Võ Hữu Tài",
  "mssv": "2023001",
  "role": "Thành viên",
  "email": "tai.vo@ute.udn.vn",
  "phone": "0987654321"
}
```

**Request**:

```bash
POST /api/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Võ Hữu Tài",
  "mssv": "2023001",
  "role": "Thành viên"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "id": "mem_010",
    "name": "Võ Hữu Tài",
    "mssv": "2023001",
    "role": "Thành viên",
    "joinDate": "2024-05-19",
    "contribution": 0,
    "avatar": "https://i.pravatar.cc/150?u=2023001"
  }
}
```

**Validation Rules**:

| Field | Rule                    | Example            |
| ----- | ----------------------- | ------------------ |
| name  | 1-100 chars, not empty  | "Võ Hữu Tài"       |
| mssv  | 7 digits, unique        | "2023001"          |
| role  | One of predefined roles | "Thành viên"       |
| email | Valid email format      | "email@ute.udn.vn" |

---

### 4. PUT /api/members/:id

**Purpose**: Update member information

**Path Parameters**:

| Param | Type   | Example   |
| ----- | ------ | --------- |
| id    | string | "mem_001" |

**Request Body** (partial update allowed):

```json
{
  "role": "Trưởng ban Sự kiện",
  "contribution": 92
}
```

**Request**:

```bash
PUT /api/members/mem_001
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Trưởng ban Sự kiện"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {
    "id": "mem_001",
    "name": "Nguyễn Văn An",
    "mssv": "2021001",
    "role": "Trưởng ban Sự kiện",
    "joinDate": "2024-01-15",
    "contribution": 92,
    "avatar": "https://i.pravatar.cc/150?u=2021001"
  }
}
```

---

### 5. DELETE /api/members/:id

**Purpose**: Remove member from club

**Path Parameters**:

| Param | Type   | Example   |
| ----- | ------ | --------- |
| id    | string | "mem_001" |

**Request**:

```bash
DELETE /api/members/mem_001
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Member deleted successfully",
  "data": {
    "id": "mem_001",
    "movedTo": "inactive"
  }
}
```

---

### 6. POST /api/members/:id/approve

**Purpose**: Approve pending membership request

**Path Parameters**:

| Param | Type   | Example   |
| ----- | ------ | --------- |
| id    | string | "mem_010" |

**Request**:

```bash
POST /api/members/mem_010/approve
Authorization: Bearer <token>
Content-Type: application/json
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Member approved successfully",
  "data": {
    "id": "mem_010",
    "status": "approved",
    "movedTo": "official",
    "approvalDate": "2024-05-19"
  }
}
```

---

### 7. POST /api/members/:id/reject

**Purpose**: Reject pending membership request

**Path Parameters**:

| Param | Type   | Example   |
| ----- | ------ | --------- |
| id    | string | "mem_010" |

**Request Body** (optional):

```json
{
  "reason": "Không đủ điều kiện"
}
```

**Request**:

```bash
POST /api/members/mem_010/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Không đủ điều kiện"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Member rejected successfully",
  "data": {
    "id": "mem_010",
    "status": "rejected",
    "reason": "Không đủ điều kiện",
    "rejectionDate": "2024-05-19"
  }
}
```

---

### 8. GET /api/members/export/csv

**Purpose**: Export members list as CSV

**Query Parameters**:

| Param  | Type   | Example    |
| ------ | ------ | ---------- |
| tab    | string | "official" |
| format | string | "csv"      |

**Request**:

```bash
GET /api/members/export/csv?tab=official
Authorization: Bearer <token>
```

**Response** (200 OK):

File download with header:

```
Content-Type: text/csv
Content-Disposition: attachment; filename="members_official_2024-05-19.csv"
```

**CSV Content**:

```csv
ID,Họ và tên,MSSV,Vai trò,Ngày tham gia,Điểm đóng góp
mem_001,Nguyễn Văn An,2021001,Thành viên,2024-01-15,85
mem_002,Trần Thị Bảo,2021002,Thành viên,2024-02-20,92
```

---

### 9. GET /api/members/export/excel

**Purpose**: Export members list as Excel

**Request**:

```bash
GET /api/members/export/excel?tab=official
Authorization: Bearer <token>
```

**Response** (200 OK):

File download with header:

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="members_official_2024-05-19.xlsx"
```

---

## Request/Response Format

### Standard Request Format

```bash
POST /api/members
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json

{
  "name": "Nguyễn Văn A",
  "mssv": "2021001",
  "role": "Thành viên"
}
```

### Standard Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  },
  "timestamp": "2024-05-19T10:30:00Z",
  "requestId": "req_abc123"
}
```

### Headers Required

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
Accept-Language: vi-VN
User-Agent: Mozilla/5.0...
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details",
    "field": "fieldName" /* optional */
  },
  "data": null,
  "timestamp": "2024-05-19T10:30:00Z"
}
```

### Common Error Codes

| Code             | Status | Message                 | Cause                    |
| ---------------- | ------ | ----------------------- | ------------------------ |
| VALIDATION_ERROR | 400    | Invalid input data      | Missing/invalid fields   |
| UNAUTHORIZED     | 401    | Unauthorized            | Invalid/missing token    |
| FORBIDDEN        | 403    | Forbidden               | Insufficient permissions |
| NOT_FOUND        | 404    | Resource not found      | Member doesn't exist     |
| DUPLICATE_ERROR  | 409    | Resource already exists | MSSV already used        |
| SERVER_ERROR     | 500    | Internal server error   | Backend issue            |

### Example Errors

**Validation Error (400)**:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Missing required fields: name, role"
  }
}
```

**Unauthorized (401)**:

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": {
    "code": "UNAUTHORIZED",
    "details": "Invalid or expired token"
  }
}
```

**Not Found (404)**:

```json
{
  "success": false,
  "message": "Member not found",
  "error": {
    "code": "NOT_FOUND",
    "details": "Member with ID mem_999 does not exist"
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1621425600
```

### Limits

| Endpoint            | Limit      | Window |
| ------------------- | ---------- | ------ |
| GET /members        | 60 req/min | Per IP |
| POST /members       | 10 req/min | Per IP |
| PUT /members/:id    | 20 req/min | Per IP |
| DELETE /members/:id | 10 req/min | Per IP |
| EXPORT              | 5 req/min  | Per IP |

### Rate Limit Response (429)

```json
{
  "success": false,
  "message": "Too many requests",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

---

## Example Workflows

### Workflow 1: Add New Member

```javascript
async function addNewMember(name, mssv, role) {
  try {
    // 1. Get token from storage
    const token = localStorage.getItem("authToken");

    // 2. Make request
    const response = await fetch("/api/members", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, mssv, role }),
    });

    // 3. Check response
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // 4. Parse response
    const result = await response.json();

    if (result.success) {
      console.log("Member added:", result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
}
```

### Workflow 2: Approve Pending Request

```javascript
async function approveMember(memberId) {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`/api/members/${memberId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("Member approved:", result.data);
      // Move member from pending to official
      // Update UI state
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error approving member:", error);
    throw error;
  }
}
```

### Workflow 3: Update Member Role

```javascript
async function updateMemberRole(memberId, newRole) {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`/api/members/${memberId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Role updated:", result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
}
```

---

## Testing with Postman

### Import Collection

1. Download: [member-management-api.postman_collection.json](#)
2. Open Postman → Import → Select file
3. Collection imported with all endpoints

### Setup Environment

Create new environment:

```json
{
  "base_url": "http://localhost:3000/api",
  "token": "your_jwt_token_here",
  "member_id": "mem_001"
}
```

### Test Sequence

1. **Login** → Get token
2. **Get Members** → Verify list
3. **Create Member** → Add new member
4. **Get Member** → Verify single member
5. **Update Member** → Change role
6. **Approve Member** → Approve pending
7. **Export** → Download CSV
8. **Delete Member** → Remove member

### Example Request in Postman

```bash
GET {{base_url}}/members
Authorization: Bearer {{token}}
Accept: application/json
```

---

## Changelog

### Version 1.0 (2024-05-19)

- Initial API specification
- 9 endpoints documented
- Error handling defined
- Rate limiting configured
- Example workflows provided

---

## Support

**API Documentation**: [swagger.io/member-api](#)
**Backend Repo**: [github.com/club-api](#)
**Issues**: [github.com/club-api/issues](#)

---

**Version**: 1.0 | **Status**: Final | **Author**: Backend Team
