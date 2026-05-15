# Super Admin Management System Product Requirements Document

## Product Overview

### What We're Building (MVP)

A lightweight web-based admin dashboard to replace Excel and WhatsApp workflows. Core focus: manage workshops, students, teachers, courses, and lesson content through a unified system with role-based access control.

### Current Problems
- Workshop scheduling done manually via WhatsApp
- Student records scattered across Excel files
- Teacher coordination via phone calls
- Lesson materials lost in random Google Drive folders
- No centralized access control or role management

### MVP Success Goals
- Replace Excel/WhatsApp for workshop and student management
- Centralized content and user access management
- Role-based access for admins and teachers
- Daily admin tasks completed in under 30 minutes

---

## Core User Flows

### Admin Daily Workflow:
1. **Check Dashboard:** Today's workshops, teacher assignments, student counts
2. **Manage Students:** Add new students, enroll in workshops
3. **Coordinate Workshops:** Create/modify workshops, assign teachers
4. **Content Management:** Upload/organize lesson materials
5. **Monitor Progress:** Mark attendance, track course completion

### Teacher Daily Workflow:
1. **View Assigned Workshops:** Check today's schedule and student roster
2. **Mark Attendance:** Record student participation
3. **Access Content:** Download lesson materials for workshops
4. **Update Availability:** Set availability status

---

## Core Modules

### Module 1: CMS (Content Management System)

**Core Function:** Centralized storage and organization of lesson materials

**Features:**
- File upload to Supabase Storage (documents, videos, images)
- Content categorization: age group, topic, difficulty level
- Search and filter by tags, filename, or metadata
- Download/preview capabilities
- Version control for updated materials

**Access Control:**
- Admins: Full CRUD access
- Teachers: Read-only access to assigned content

---

### Module 2: IAM + RBAC (Identity & Access Management)

**Core Function:** Secure authentication and role-based access control

**User Roles & Permissions:**
- **Super Admin:** Full system access, user management
- **Admin:** Workshop/student/teacher management, content upload
- **Teacher:** View assigned workshops, mark attendance, access content

**Features:**
- Email-based authentication via Supabase Auth
- Magic link or Google OAuth login
- Role assignment and management
- Session management and security
- Audit trail for sensitive actions

**Access Matrix:**
```
Feature                | Super Admin | Admin | Teacher
--------------------- |-------------|-------|--------
User Management       | ✅          | ❌    | ❌
Workshop Management   | ✅          | ✅    | View Only
Student Management    | ✅          | ✅    | View Assigned
Content Management    | ✅          | ✅    | Read Only
Attendance Marking    | ✅          | ✅    | ✅
```

---

### Module 3: Student Management

**Core Function:** Comprehensive student information and enrollment system

**Features:**
- Student profiles: name, age, school, parent contact, medical notes
- Bulk import/export capabilities
- Advanced search and filtering
- Workshop enrollment management
- Student participation history and progress tracking
- Parent communication records

**Data Fields:**
- Personal: Name, DOB, School, Grade
- Contact: Parent email, phone, emergency contact
- Program: Enrolled courses, completed workshops, skill level
- Notes: Special requirements, progress comments

---

### Module 4: Workshop Management

**Core Function:** Complete workshop lifecycle management with comprehensive content and media management

**Features:**
- Workshop creation with detailed metadata and content modules
- Scheduling with conflict detection and date validation
- Media asset management (videos, photos)
- SEO optimization settings
- Workshop status management (Draft/Completed/Archived)
- Preview functionality for main website display

**Workshop Properties:**
- **Basic Information:** Title, subtitle, overview, duration, target audience
- **Time & Status:** Start date, end date, status (Draft/Completed/Archived)
- **Content Modules:** 
  - Highlights (required array of workshop highlights)
  - Syllabus (required day-by-day breakdown with objectives and activities)
  - Materials (required hardware, software, and online resources)
  - Assessment (required evaluation criteria with weights)
  - Learning Outcomes (required array of learning objectives)
- **Media Assets:** 
  - Videos (required with URL, poster, caption)
  - Photos (required array with alt text)
- **SEO Settings:** Title and description for search optimization
- **Source:** Origin tracking for workshop content
- **Capacity:** Min/max students, current enrollment
- **Assignment:** Primary teacher, assistant teachers
- **Content:** Linked lesson materials

**Workshop Management Pages:**
- **Workshop List:** Filter by status, date range, keywords; sort by date/title/status; actions for edit/delete/archive/preview
- **Workshop Form:** Sectioned input with validation for all required fields
- **Workshop Preview:** Display workshop in main website format for review

**Data Validation Requirements:**
- All fields are required (no optional fields)
- Array fields must have minimum items (highlights: 1+, syllabus: 1+ days, materials: 1+ per category, assessment: 1+, learning outcomes: 1+)
- Media requirements: minimum 1 video and 1 photo
- Date validation: end date must be after start date
- URL validation for media links
- SEO fields: both title and description required

---

### Module 5: Teacher Management

**Core Function:** Teacher profiles and assignment coordination

**Features:**
- Teacher profiles: contact info, specializations, certifications
- Skills and subject expertise tracking
- Workshop assignment history
- Availability calendar management
- Performance metrics and feedback
- Communication preferences

**Teacher Data:**
- Profile: Name, email, phone, bio, photo
- Skills: Subject areas, age groups, experience level
- Schedule: Availability patterns, blackout dates
- History: Past workshops, ratings, notes

---

### Module 6: Course Management

**Core Function:** Structured learning program organization

**Features:**
- Course creation with learning objectives
- Session sequence planning (1-8 workshops per course)
- Age group and difficulty level assignment
- Workshop-to-course linking
- Student progress tracking across course sessions
- Course completion certificates

**Course Structure:**
- Metadata: Name, description, duration, objectives
- Sessions: Ordered workshop sequence, prerequisites
- Targeting: Age range, skill requirements, class size
- Tracking: Enrollment, completion rates, feedback

---

## Dashboard (System-wide Feature)

**Purpose:** Unified entry point aggregating cross-module information

### Dashboard Sections:
1. **Today's Overview**
   - Active workshops with teacher and student counts
   - Attendance completion status
   - Teacher availability alerts

2. **Weekly View**
   - Upcoming workshops and deadlines
   - New student registrations
   - Course completion milestones

3. **Quick Actions**
   - Add Student (→ Student Management)
   - Create Workshop (→ Workshop Management)
   - Upload Content (→ CMS)
   - Assign Teacher (→ Teacher Management)

4. **Key Metrics**
   - Weekly enrollment numbers
   - Attendance rates
   - Content usage statistics
   - Teacher utilization rates

---

## Integrations & Data Relationships

### Core Data Flow:
```
Users (IAM) ──→ Role-based access to all modules
    ↓
Students ←─→ Workshops (enrollment & attendance)
    ↓            ↓
Courses ←──→ Workshop sequences
    ↓            ↓
Content ←──→ Workshop materials
    ↓            ↓
Teachers ←─→ Workshop assignments
```

### Module Dependencies:
- **IAM:** Foundation for all other modules
- **CMS:** Independent but accessible by all roles
- **Student/Teacher Management:** Required for Workshop operations
- **Workshop Management:** Core connector between Students, Teachers, Courses
- **Course Management:** Orchestrates Workshop sequences

---

## Success Metrics

### Week 1 Milestones:
- IAM system functional with role-based access
- Basic Student and Workshop CRUD operations
- Teacher assignment capabilities
- Dashboard showing real-time data

### Week 2 Milestones:
- Complete Course management workflow
- CMS with file upload and search
- Attendance marking system
- Cross-module data integration complete

### Performance KPIs:
- User login < 2 seconds
- Workshop creation < 5 minutes
- Student search < 3 seconds
- File upload/retrieval < 1 minute
- Dashboard load < 3 seconds

### Business Impact Metrics:
- Admin task completion time: < 30 minutes daily
- Elimination of WhatsApp coordination
- 100% digital student record management
- Centralized content access for all teachers

---

## Technical Requirements

### Architecture:
- **Frontend:** React + Vite + TailwindCSS + Shadcn/ui
- **Backend:** Supabase (Database + Auth + Storage + Edge Functions)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth with role-based policies
- **Storage:** Supabase Storage for content files
- **Hosting:** Vercel for frontend deployment

### Security Implementation:
- Row Level Security (RLS) policies for all tables
- JWT-based session management
- Role-based API access control
- Secure file upload with type validation
- Audit logging for admin actions

### Mobile Responsiveness:
- Tablet-optimized for teacher attendance marking
- Mobile-friendly dashboard and quick actions
- Progressive Web App (PWA) capabilities
- Offline-first architecture not required for MVP

### Database Schema (Simplified):
```sql
-- IAM Tables
users: id, email, role, created_at
profiles: user_id, name, phone, avatar_url

-- Core Entity Tables  
students: id, name, age, school, parent_email, created_by
teachers: id, name, email, phone, skills, availability_status
workshops: id, slug, title, subtitle, overview, duration, target_audience, 
          start_date, end_date, status, highlights, syllabus, materials, 
          assessment, learning_outcomes, media, seo, source, capacity, 
          teacher_id, created_at, updated_at
courses: id, name, description, age_group, session_count

-- Relationship Tables
enrollments: student_id, workshop_id, attended, attendance_time
course_workshops: course_id, workshop_id, sequence_order
content: id, filename, file_url, tags, uploaded_by, course_id
```

---

## Implementation Timeline (2 Weeks)

### Week 1: Foundation + Core Operations
**Days 1-2:** Infrastructure Setup
- Supabase project configuration
- Database schema creation with RLS policies
- Authentication flow implementation
- Basic UI components and routing

**Days 3-4:** Core Modules
- IAM + RBAC implementation
- Student Management CRUD
- Teacher Management CRUD
- Workshop Management

**Days 5-7:** Integration + Dashboard
- Workshop-Student enrollment system
- Teacher assignment workflow
- Dashboard aggregation views
- Cross-module data flow testing

**Week 1 Success Criteria:**
- Role-based authentication working
- Students can be added and enrolled in workshops
- Teachers can be assigned to workshops
- Workshop Management system with all required fields and validation
- Workshop List, Form, and Preview pages functional
- Dashboard displays real-time data

### Week 2: Advanced Features + Polish
**Days 8-10:** Advanced Workflows
- Course Management system
- Workshop-Course linking
- Attendance marking interface
- Progress tracking implementation

**Days 11-12:** Content + Optimization
- CMS file upload and organization
- Search and filtering capabilities
- Mobile responsiveness optimization
- Performance optimization

**Days 13-14:** Testing + Deployment
- End-to-end workflow testing
- User acceptance testing
- Bug fixes and polish
- Production deployment

**Week 2 Success Criteria:**
- Complete course creation and management
- File upload and content management
- Attendance system functional
- All user roles can complete their workflows

---

## Definition of Done

### Functional Requirements:
- [ ] Super Admin can create and manage user accounts
- [ ] Admins can create workshops with comprehensive content and media management
- [ ] Workshop forms enforce all required fields and validation rules
- [ ] Workshop status management (Draft/Completed/Archived) controls visibility
- [ ] Workshop preview functionality shows main website display format
- [ ] Students can be enrolled in workshops and courses
- [ ] Teachers can view assignments and mark attendance
- [ ] Course sequences can be created and managed
- [ ] Content can be uploaded, tagged, and searched
- [ ] Dashboard provides real-time operational overview

### Technical Requirements:
- [ ] Role-based access control fully implemented
- [ ] All CRUD operations secured with RLS policies
- [ ] Mobile-responsive design tested on tablets
- [ ] File upload supports multiple formats with validation
- [ ] Search functionality works across all modules
- [ ] Data relationships maintain referential integrity

### Performance Standards:
- [ ] Page load times < 3 seconds
- [ ] Search operations < 2 seconds
- [ ] File uploads complete successfully > 95% of attempts
- [ ] System handles 100+ concurrent users
- [ ] Database queries optimized with proper indexing