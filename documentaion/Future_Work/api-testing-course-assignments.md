# Course Teacher Assignment - API Testing Guide

## Quick Start

### 1. Create a Course (as Teacher)
```bash
POST http://localhost:3001/courses
Authorization: Bearer <teacher-token>
Content-Type: application/json

{
  "title": "Advanced Node.js",
  "description": "Master Node.js backend development",
  "categoryId": "<uuid>",
  "level": "advanced",
  "price": 99.99,
  "durationWeeks": 12,
  "durationHours": 60
}
```

### 2. Get Teacher's Courses
```bash
GET http://localhost:3001/courses/teacher
Authorization: Bearer <teacher-token>
```

### 3. Assign Teachers to Course (as Admin)
```bash
POST http://localhost:3001/admin/courses/<course-id>/teachers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "teacherIds": ["<teacher-uuid-1>", "<teacher-uuid-2>"],
  "canEdit": true,
  "canDelete": false,
  "notes": "Teaching assistants for this course"
}
```

### 4. View Assigned Teachers (as Admin)
```bash
GET http://localhost:3001/admin/courses/<course-id>/teachers
Authorization: Bearer <admin-token>
```

### 5. Remove Teacher Assignment (as Admin)
```bash
DELETE http://localhost:3001/admin/courses/<course-id>/teachers/<teacher-id>
Authorization: Bearer <admin-token>
```

## Permission Scenarios

### Scenario A: Assigned Teacher Can Edit
- Teacher B is assigned with `canEdit: true`
- Teacher B can update course via `PUT /courses/<id>`

### Scenario B: Assigned Teacher Cannot Delete
- Teacher B is assigned with `canDelete: false`
- Teacher B receives 403 when trying `DELETE /courses/<id>`

### Scenario C: Unassigned Teacher Has No Access
- Teacher C is not assigned to the course
- Teacher C receives 403 on any course operation

## Database Verification

Check the `course_teachers` table:
```sql
SELECT * FROM course_teachers WHERE course_id = '<course-uuid>';
```

Should show:
- `teacher_id`: The assigned teacher's UUID
- `can_edit`: Permission flag
- `can_delete`: Permission flag
- `assigned_by`: Admin who made the assignment
