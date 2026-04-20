# System Architecture & Data Flow Diagrams

## 1. Email Access Flow

```
┌──────────────────────────────────────────┐
│  Employee Receives Email                 │
│  "View Your NPS Dashboard"              │
│                                         │
│  Link: http://dashboard.com/            │
│        ?email=john.doe@company.com      │
└─────────────────────┬────────────────────┘
                      │
                      │ [Click Link]
                      ▼
        ┌─────────────────────────────┐
        │  Browser Opens Dashboard    │
        │  URL: /?email=john.doe...   │
        └────────────┬────────────────┘
                     │
                     │ [Extract Email from URL]
                     ▼
        ┌─────────────────────────────┐
        │  Call /api/businessunit     │
        │  ?email=john.doe@company.com│
        └────────────┬────────────────┘
                     │
                     │ [Server Processing]
                     ▼
        ┌─────────────────────────────┐
        │  Look Up Employee Record    │
        │  (Corteza or Mock DB)       │
        │  Find: john.doe@company.com │
        └────────────┬────────────────┘
                     │
                     │ [Found!]
                     ▼
        ┌─────────────────────────────┐
        │  Extract Business Unit      │
        │  Result: "Global Tech"      │
        └────────────┬────────────────┘
                     │
                     │ [Filter Data]
                     ▼
        ┌─────────────────────────────┐
        │  Filter NPS Records         │
        │  Where Account Name =       │
        │  "Global Tech"              │
        └────────────┬────────────────┘
                     │
                     │ [Compile Response]
                     ▼
        ┌─────────────────────────────┐
        │  Return to Browser:         │
        │  - Employee Info            │
        │  - Business Unit            │
        │  - Filtered NPS Records     │
        └────────────┬────────────────┘
                     │
                     │ [Render Dashboard]
                     ▼
        ┌─────────────────────────────┐
        │  Display Dashboard          │
        │  ✓ User Info in Header      │
        │  ✓ Filtered Metrics         │
        │  ✓ Business Unit Charts     │
        │  ✓ Filtered Trends          │
        └─────────────────────────────┘
```

## 2. Data Filtering Architecture

```
                    All NPS Records
                           │
                           ▼
        ┌──────────────────────────────┐
        │   [John Doe Access]          │
        │   ?email=john.doe@...        │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼────────────┐
        │  Look Up Business Unit   │
        │  Find in Employee DB     │
        │  Result: "Global Tech"   │
        └─────────────┬────────────┘
                      │
        ┌─────────────▼────────────────┐
        │   Filter NPS Records         │
        │                              │
        │  Global Tech Records: ✓      │
        │  SoftCorp Records:    ✗      │
        │  Nexus Data Records:  ✗      │
        │  Alpha Systems:       ✗      │
        │  BlueWave:            ✗      │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │  Filtered Results        │
        │  (Global Tech Only)      │
        │                          │
        │  - 5 NPS Records         │
        │  - NPS Score: 87         │
        │  - Avg Score: 9.2        │
        │  - Promoters: 5          │
        │  - Passives: 0           │
        │  - Detractors: 0         │
        └──────────────────────────┘
```

## 3. Multi-User Isolation

```
┌────────────────────────────────────────────────────────────┐
│                    NPS Database                            │
│                 (All Records Mixed)                        │
│                                                            │
│  • Global Tech - Score 9 - Jan                           │
│  • SoftCorp - Score 8 - Jan                              │
│  • Nexus Data - Score 7 - Jan                            │
│  • Global Tech - Score 10 - Feb                          │
│  • Alpha Systems - Score 6 - Feb                         │
│  • BlueWave - Score 8 - Mar                              │
│  • Global Tech - Score 8 - Mar                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
     │                    │                    │
     │                    │                    │
     ▼                    ▼                    ▼

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   John Doe       │ │   Jane Smith     │ │   Bob Wilson     │
│   email=john...  │ │   email=jane...  │ │   email=bob...   │
│                  │ │                  │ │                  │
│  Business Unit:  │ │  Business Unit:  │ │  Business Unit:  │
│  Global Tech     │ │  SoftCorp        │ │  Nexus Data      │
│                  │ │                  │ │                  │
│  Sees:           │ │  Sees:           │ │  Sees:           │
│  • Tech - 9      │ │  • SoftCorp - 8  │ │  • Data - 7      │
│  • Tech - 10     │ │                  │ │                  │
│  • Tech - 8      │ │                  │ │                  │
│                  │ │                  │ │                  │
│  NPS: 92         │ │  NPS: 80         │ │  NPS: 70         │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## 4. API Request/Response Flow

```
CLIENT (Browser)              SERVER                    DATABASE
      │                          │                          │
      │  GET /?email=john.doe... │                          │
      │─────────────────────────>│                          │
      │                          │                          │
      │                          │ Extract email param      │
      │                          │ john.doe@company.com     │
      │                          │                          │
      │                          │ GET /api/businessunit    │
      │                          │ ?email=john.doe@...      │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │ Query employee table     │
      │                          │ WHERE email = ...        │
      │                          │<─────────────────────────│
      │                          │ Found: John Doe          │
      │                          │ Business Unit: Global Tech
      │                          │                          │
      │                          │ Query NPS records        │
      │                          │ WHERE Account = GlobalTech
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │ Found 5 records          │
      │                          │<─────────────────────────│
      │                          │                          │
      │<─────────────────────────│                          │
      │  JSON Response:          │                          │
      │  {                       │                          │
      │    employee: {...},      │                          │
      │    npsData: {            │                          │
      │      count: 5,           │                          │
      │      records: [...]      │                          │
      │    }                     │                          │
      │  }                       │                          │
      │                          │                          │
      │ Render Dashboard         │                          │
      │─────────────────────────>│                          │
```

## 5. Database Schema

```
┌──────────────────────────────────────┐
│  EMPLOYEES TABLE (Corteza)           │
├──────────────────────────────────────┤
│ id      │ email               │ name │
├─────────┼─────────────────────┼──────┤
│ emp-001 │ john.doe@...        │ John │
│ emp-002 │ jane.smith@...      │ Jane │
│ emp-003 │ bob.wilson@...      │ Bob  │
└──────────────────────────────────────┘
         │
         │ Link by Business Unit
         ▼
┌──────────────────────────────────────┐
│  EMPLOYEE_BUSINESS_UNITS             │
├──────────────────────────────────────┤
│ emp_id  │ business_unit               │
├─────────┼─────────────────────────────┤
│ emp-001 │ Global Tech                 │
│ emp-002 │ SoftCorp                    │
│ emp-003 │ Nexus Data                  │
└──────────────────────────────────────┘
         │
         │ Referenced by Account Name
         ▼
┌──────────────────────────────────────┐
│  NPS_RECORDS TABLE                   │
├──────────────────────────────────────┤
│ id │ Account Name  │ Score │ Month   │
├────┼───────────────┼───────┼─────────┤
│ 1  │ Global Tech   │ 9     │ Jan 2025│
│ 2  │ SoftCorp      │ 8     │ Jan 2025│
│ 3  │ Global Tech   │ 10    │ Feb 2025│
│ 4  │ Nexus Data    │ 7     │ Jan 2025│
│ 5  │ Global Tech   │ 8     │ Mar 2025│
└──────────────────────────────────────┘
```

## 6. Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    index.html                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  JavaScript Application                            │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │ URL Parameter Extraction                     │ │ │
│  │  │ Extract: email=john.doe@company.com         │ │ │
│  │  └────────────┬─────────────────────────────────┘ │ │
│  │               │                                     │ │
│  │  ┌────────────▼─────────────────────────────────┐ │ │
│  │  │ fetchBusinessUnitData()                      │ │ │
│  │  │ Call: /api/businessunit?email=...           │ │ │
│  │  └────────────┬─────────────────────────────────┘ │ │
│  │               │                                     │ │
│  │  ┌────────────▼─────────────────────────────────┐ │ │
│  │  │ displayUserInfo()                            │ │ │
│  │  │ Show employee name & business unit          │ │ │
│  │  └────────────┬─────────────────────────────────┘ │ │
│  │               │                                     │ │
│  │  ┌────────────▼─────────────────────────────────┐ │ │
│  │  │ processData()                                │ │ │
│  │  │ Calculate metrics from filtered data        │ │ │
│  │  └────────────┬─────────────────────────────────┘ │ │
│  │               │                                     │ │
│  │  ┌────────────▼─────────────────────────────────┐ │ │
│  │  │ updateDashboard()                            │ │ │
│  │  │ Render charts & visualizations              │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │Chart.js │          │ REST    │          │  State  │
    │Charts   │          │  APIs   │          │ Manager │
    └─────────┘          └─────────┘          └─────────┘
```

## 7. State Management Flow

```
┌────────────────────────────────────────────────┐
│               State Object                     │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ employee: {                              │ │
│  │   email: "john.doe@company.com"          │ │
│  │   name: "John Doe"                       │ │
│  │   businessUnit: "Global Tech"            │ │
│  │ }                                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ rawRecords: [                            │ │
│  │   { values: {...} },                     │ │
│  │   { values: {...} },                     │ │
│  │   ...                                    │ │
│  │ ]                                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ filters: {                               │ │
│  │   year: "",                              │ │
│  │   month: "",                             │ │
│  │   account: "",                           │ │
│  │   status: ""                             │ │
│  │ }                                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ processedData: {                         │ │
│  │   metrics: { nps, avg, total, p, d, pa },
│  │   monthly: { "Jan 25": {...} },          │ │
│  │   latest: [...]                          │ │
│  │ }                                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ charts: {                                │ │
│  │   trends: Chart instance,                │ │
│  │   dist: Chart instance                   │ │
│  │ }                                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
         │                    │                 │
         │                    │                 │
         ▼                    ▼                 ▼
    processData()      updateDashboard()   setupFilterListeners()
```

## 8. Error Handling Flow

```
┌────────────────────────────────────────────┐
│  User Accesses Dashboard with Email        │
└──────────────┬─────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Valid Email? │
        └─┬───────┬────┘
          │       │
         YES      NO
          │       │
          │       ▼
          │    ┌──────────────────┐
          │    │ Error: Invalid   │
          │    │ Email Format     │
          │    └──────────────────┘
          │
          ▼
      ┌──────────────────────┐
      │ Call API with Email  │
      └──────┬───────────────┘
             │
             ▼
      ┌──────────────────┐
      │ Employee Found?  │
      └─┬──────────┬──────┘
        │          │
       YES         NO
        │          │
        │          ▼
        │      ┌────────────────────┐
        │      │ Error: Employee    │
        │      │ not found          │
        │      └────────────────────┘
        │
        ▼
    ┌──────────────────────────┐
    │ Business Unit Assigned?  │
    └─┬──────────┬─────────────┘
      │          │
     YES         NO
      │          │
      │          ▼
      │      ┌────────────────────┐
      │      │ Error: No business │
      │      │ unit found         │
      │      └────────────────────┘
      │
      ▼
  ┌──────────────────────────┐
  │ Filter NPS Records       │
  │ by Business Unit         │
  └──────┬───────────────────┘
         │
         ▼
  ┌──────────────────────────┐
  │ Display Dashboard        │
  │ with Filtered Data       │
  └──────────────────────────┘
```

## 9. Comparison: Standard vs Email Access

```
┌─────────────────────────────┬──────────────────────────────┐
│  STANDARD ACCESS            │  EMAIL-BASED ACCESS          │
│  URL: /?                    │  URL: /?email=john.doe@...   │
├─────────────────────────────┼──────────────────────────────┤
│                             │                              │
│  Header:                    │  Header:                     │
│  "NPS.Analytics"            │  "NPS.Analytics"             │
│  [No user info]             │  "👤 John Doe"              │
│                             │  "📊 Global Tech"            │
│                             │                              │
│  Data Shown:                │  Data Shown:                 │
│  • All business units       │  • Global Tech only          │
│  • All employees            │  • Filtered to user's unit   │
│  • All time periods         │  • Same filtering options    │
│  • Full comparison          │  • Personalized view         │
│                             │                              │
│  Filters Available:         │  Filters Available:          │
│  • Year ✓                   │  • Year ✓                    │
│  • Month ✓                  │  • Month ✓                   │
│  • Account ✓ (All)          │  • Account ✓ (Pre-filtered)  │
│  • Status ✓                 │  • Status ✓                  │
│                             │                              │
│  Use Case:                  │  Use Case:                   │
│  Executive Overview         │  Employee Dashboard          │
│  Cross-unit Analysis        │  Personal Performance        │
│  Comparative Metrics        │  Unit-Specific Insights      │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

## 10. Deployment Architecture (Production)

```
┌────────────────────────────────────────────────────────────┐
│                      INTERNET                              │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │    NGINX / Load Balancer         │
        │    HTTPS / SSL                   │
        │    CORS / Rate Limiting          │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┴─────────────────┐
        │                                │
        ▼                                ▼
   ┌─────────────┐              ┌──────────────┐
   │  Node.js    │              │  Node.js     │
   │  Server 1   │              │  Server 2    │
   │  Port 3000  │              │  Port 3001   │
   └──────┬──────┘              └───────┬──────┘
          │                             │
          └──────────────┬──────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌──────────┐
    │Corteza │      │ Redis  │      │PostgreSQL│
    │ CRM    │      │ Cache  │      │  NPS DB  │
    └────────┘      └────────┘      └──────────┘
```

---

These diagrams illustrate:
- Email access flow from click to personalized dashboard
- Data filtering architecture ensuring isolation
- Multi-user access with separate dashboards
- Complete API request/response cycle
- Database schema and relationships
- Component interaction
- State management
- Error handling paths
- Standard vs email-based comparison
- Production deployment architecture

All flows are based on the implemented system and represent the actual data pathways in the application.
