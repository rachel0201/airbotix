# AI Development Guide: Workshop Management System

> **Purpose**: This document provides comprehensive guidance for AI assistants to develop a workshop management system for the Super Admin backend, with clear technical specifications, data structures, and implementation requirements.

## 🎯 Project Overview

### Core Objective
Build a "Completed Workshops" management system in the Super Admin backend that allows staff to input, edit, and publish historical workshop data. The main website will display these workshops to showcase past projects and results.

### Technical Context
- **Backend**: Super Admin system (React + TypeScript + Supabase)
- **Frontend**: Main website (existing React + TypeScript structure)
- **Data Flow**: Backend → API → Main website display
- **Current State**: Main website uses local mock data from `src/data/workshops.ts`

## 📋 Development Requirements

### 1. Backend Pages (Super Admin)

#### 1.1 Workshop List Page
**File Location**: `super-admin/src/pages/Workshops.tsx`

**Features Required**:
- Display workshops in table/card format
- Filter by status: Draft, Completed, Archived
- Filter by date range (start/end dates)
- Search by title/keywords
- Sort by: date, title, status
- Actions: Edit, Delete, Archive, Preview

**UI Components Needed**:
- Data table with pagination
- Filter controls (dropdowns, date pickers, search input)
- Action buttons for each workshop
- Status badges (color-coded)

#### 1.2 Workshop Form Page
**File Location**: `super-admin/src/pages/WorkshopForm.tsx`

**Form Sections**:
1. **Basic Information**
   - Title (required, text input)
   - Short Overview (required, textarea)
   - Target Audience (required, text input)
   - Duration (required, text input)

2. **Time & Status**
   - Start Date (required, date picker)
   - End Date (required, date picker)
   - Status (required, dropdown: Draft/Completed/Archived)

3. **Content Modules**
   - Highlights (required, array of text inputs - minimum 1 item)
   - Syllabus (required, array of day objects - minimum 1 day)
   - Materials (required, object with hardware/software/onlineResources arrays - each array minimum 1 item)
   - Assessment (required, array of assessment objects - minimum 1 item)
   - Learning Outcomes (required, array of text inputs - minimum 1 item)

4. **Media Assets**
   - Videos (required, array of video objects - minimum 1 video)
   - Photos (required, array of photo objects - minimum 1 photo)

5. **SEO Settings**
   - SEO Title (required, text input)
   - SEO Description (required, textarea)
   - Source (required, text input)

**Form Validation**:
- All fields are required and must be filled
- Date validation (end date > start date)
- URL validation for media links
- Array fields must have at least one item
- Highlights: minimum 1 highlight required
- Syllabus: minimum 1 day required
- Materials: each category (hardware/software/onlineResources) must have at least 1 item
- Assessment: minimum 1 assessment item required
- Learning Outcomes: minimum 1 outcome required
- Media: minimum 1 video and 1 photo required
- SEO fields: both title and description required
- Source: required for tracking workshop origin

#### 1.3 Workshop Preview Page
**File Location**: `super-admin/src/pages/WorkshopPreview.tsx`

**Features**:
- Display workshop data in main website format
- Show how it will appear to end users
- Include all sections: header, content, media, etc.
- Responsive design preview

### 2. Data Structure

#### 2.1 Workshop Interface
```typescript
interface Workshop {
  id: string
  slug: string
  title: string
  subtitle?: string
  overview: string
  duration: string
  targetAudience: string
  startDate: Date
  endDate: Date
  status: 'draft' | 'completed' | 'archived'
  highlights: string[] // Required - minimum 1 item
  syllabus: Array<{
    day: number
    title: string
    objective: string
    activities: string[]
  }> // Required - minimum 1 day
  materials: {
    hardware: string[] // Required - minimum 1 item
    software: string[] // Required - minimum 1 item
    onlineResources: string[] // Required - minimum 1 item
  }
  assessment: Array<{
    item: string
    weight: string
    criteria?: string
  }> // Required - minimum 1 item
  learningOutcomes: string[] // Required - minimum 1 item
  media: {
    video: { src: string; poster?: string; caption?: string } // Required - minimum 1 video
    photos: Array<{ src: string; alt?: string }> // Required - minimum 1 photo
  }
  seo: {
    title: string // Required
    description: string // Required
  }
  source: string // Required
  createdAt: Date
  updatedAt: Date
}
```

#### 2.2 Database Schema (Supabase)
```sql
-- Workshops table
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  overview TEXT NOT NULL,
  duration TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'archived')),
  highlights JSONB NOT NULL, -- Required - minimum 1 item
  syllabus JSONB NOT NULL, -- Required - minimum 1 day
  materials JSONB NOT NULL, -- Required - each category minimum 1 item
  assessment JSONB NOT NULL, -- Required - minimum 1 item
  learning_outcomes JSONB NOT NULL, -- Required - minimum 1 item
  media JSONB NOT NULL, -- Required - minimum 1 video and 1 photo
  seo JSONB NOT NULL, -- Required - title and description
  source TEXT NOT NULL, -- Required
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

-- Policies for different user roles
CREATE POLICY "Super Admin can do everything" ON workshops
  FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admin can manage workshops" ON workshops
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 3. API Endpoints

#### 3.1 Workshop CRUD Operations
```typescript
// GET /api/workshops
interface GetWorkshopsResponse {
  workshops: Workshop[]
  total: number
  page: number
  limit: number
}

// GET /api/workshops/:id
interface GetWorkshopResponse {
  workshop: Workshop
}

// POST /api/workshops
interface CreateWorkshopRequest {
  workshop: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'>
}

// PUT /api/workshops/:id
interface UpdateWorkshopRequest {
  workshop: Partial<Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'>>
}

// DELETE /api/workshops/:id
interface DeleteWorkshopResponse {
  success: boolean
}
```

#### 3.2 Filtering and Search
```typescript
// GET /api/workshops?status=completed&startDate=2025-01-01&endDate=2025-12-31&search=robotics
interface WorkshopFilters {
  status?: 'draft' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: 'title' | 'startDate' | 'endDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}
```

### 4. Main Website Integration

#### 4.1 Update Workshop Data Source
**File**: `src/data/workshops.ts`

**Current State**: Uses local mock data
**Target State**: Fetch from API endpoint

```typescript
// Replace local data with API call
export const fetchWorkshops = async (): Promise<Workshop[]> => {
  const response = await fetch('/api/workshops?status=completed&sortBy=endDate&sortOrder=desc')
  const data = await response.json()
  return data.workshops
}
```

#### 4.2 Update Workshop Pages
**Files**: `src/pages/Workshops.tsx`, `src/pages/WorkshopDetail.tsx`

**Changes Required**:
- Replace static data import with API calls
- Add loading states
- Add error handling
- Maintain existing UI/UX

### 5. Implementation Steps

#### Phase 1: Backend Foundation
1. **Database Setup**
   - Create Supabase tables
   - Set up RLS policies
   - Create database functions

2. **API Development**
   - Implement CRUD endpoints
   - Add filtering and search
   - Add validation middleware

3. **Basic UI**
   - Create workshop list page
   - Create workshop form page
   - Add basic navigation

#### Phase 2: Form Development
1. **Form Components**
   - Build sectioned form layout
   - Implement field validation
   - Add media upload functionality

2. **Data Handling**
   - Form state management
   - API integration
   - Error handling

#### Phase 3: Integration
1. **Main Website Updates**
   - Replace mock data with API calls
   - Add loading states
   - Test end-to-end flow

2. **Testing & Polish**
   - Unit tests
   - Integration tests
   - UI/UX improvements

### 6. Technical Considerations

#### 6.1 Performance
- Implement pagination for large datasets
- Use lazy loading for media
- Optimize database queries with indexes

#### 6.2 Security
- Validate all inputs
- Implement proper authentication
- Use RLS for data access control

#### 6.3 User Experience
- Provide clear feedback for all actions
- Implement auto-save for drafts
- Add confirmation dialogs for destructive actions

### 7. File Structure

```
super-admin/src/
├── pages/
│   ├── Workshops.tsx           # Workshop list page
│   ├── WorkshopForm.tsx        # Workshop form page
│   └── WorkshopPreview.tsx     # Workshop preview page
├── components/
│   ├── WorkshopCard.tsx        # Workshop card component
│   ├── WorkshopForm/
│   │   ├── BasicInfo.tsx       # Basic information section
│   │   ├── ContentModules.tsx  # Content modules section
│   │   ├── MediaAssets.tsx     # Media assets section
│   │   └── SEOSettings.tsx     # SEO settings section
│   └── WorkshopPreview/
│       └── WorkshopDisplay.tsx # Preview display component
├── hooks/
│   ├── useWorkshops.ts         # Workshop data hook
│   ├── useWorkshopForm.ts      # Form management hook
│   └── useWorkshopPreview.ts   # Preview hook
├── services/
│   └── workshopService.ts      # API service functions
└── types/
    └── workshop.ts             # Workshop type definitions
```

### 8. Success Criteria

#### Functional Requirements
- [ ] Staff can create, edit, and delete workshops
- [ ] All form fields are required and validated
- [ ] Array fields enforce minimum item requirements
- [ ] Media fields require both video and photo uploads
- [ ] Workshop status controls visibility
- [ ] Main website displays completed workshops
- [ ] Media uploads work correctly
- [ ] Search and filtering function properly

#### Technical Requirements
- [ ] All TypeScript interfaces are properly defined
- [ ] No magic strings (use constants)
- [ ] Files stay under 1000 lines
- [ ] Follow SOLID principles
- [ ] Proper error handling
- [ ] Responsive design

#### Performance Requirements
- [ ] Page load times < 3 seconds
- [ ] Form submissions < 2 seconds
- [ ] Media uploads handle large files
- [ ] Database queries are optimized

### 9. Common Pitfalls to Avoid

1. **Data Structure Mismatch**: Ensure backend data structure matches frontend expectations
2. **Missing Validation**: All fields are required - validate every field and array minimum requirements
3. **Incomplete Media**: Ensure both video and photo uploads are mandatory
4. **Poor Error Handling**: Provide clear error messages for all failure scenarios
5. **Performance Issues**: Implement pagination and lazy loading for large datasets
6. **Security Gaps**: Use proper authentication and authorization
7. **UI/UX Inconsistency**: Maintain consistent design patterns across all pages
8. **Optional Field Confusion**: All fields are now required - remove any optional field indicators

### 10. Testing Strategy

#### Unit Tests
- Test individual components
- Test form validation logic
- Test API service functions

#### Integration Tests
- Test complete user workflows
- Test API endpoints
- Test database operations

#### End-to-End Tests
- Test workshop creation flow
- Test main website display
- Test status changes

---

**Note**: This guide should be used in conjunction with the existing codebase analysis and the project's coding standards. Always follow the established patterns and conventions when implementing new features.
