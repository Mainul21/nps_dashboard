# NPS Dashboard - Email-Based Business Unit Filtering

## Overview

The NPS Dashboard now supports **email-based access** with automatic business unit filtering. When users access the dashboard with an email parameter in the URL, the system will:

1. ✅ Validate and fetch the employee data by email
2. ✅ Identify the employee's business unit
3. ✅ Filter NPS data to show only responses from that business unit
4. ✅ Display personalized dashboard with employee information

## Features

### 1. Email-Based Access
Access the dashboard with a user's email:
```
http://localhost:3000/?email=john.doe@company.com
```

### 2. Automatic Employee Lookup
The system matches the email against employee data from Corteza CRM:
- Searches employee database by email address
- Retrieves employee name and assigned business unit
- Returns error if employee not found

### 3. Business Unit Filtering
Once the business unit is identified:
- Automatically filters all NPS records by the business unit (Account Name)
- Only shows sentiment data relevant to that business unit
- Maintains all filtering, sorting, and visualization features

### 4. User Information Display
When accessed via email, the header displays:
- Employee Name
- Email Address
- Business Unit (highlighted)

## API Endpoints

### GET `/api/businessunit?email=<email>`

**Description**: Fetch employee data and filtered NPS data for a specific email

**Parameters**:
- `email` (required): User email address

**Response** (Success - 200):
```json
{
  "success": true,
  "employee": {
    "email": "john.doe@company.com",
    "name": "John Doe",
    "businessUnit": "Global Tech"
  },
  "npsData": {
    "count": 5,
    "records": [
      {
        "values": {
          "Account Name": "Global Tech",
          "Score": 9,
          "Response": "Excellent service",
          "Year": "2025",
          "Month": "Jan",
          "Status": "Active"
        }
      }
    ]
  }
}
```

**Response** (Error - 404):
```json
{
  "success": false,
  "error": "Employee not found"
}
```

### POST `/api/nps` (Data Submission)

**Description**: Submit NPS survey responses

**Request Body**:
```json
{
  "data": {
    "Account Name": "Global Tech",
    "Score": 9,
    "Response": "Great service",
    "Year": "2025",
    "Month": "Jan",
    "Status": "Active"
  }
}
```

**Response** (Success - 201):
```json
{
  "success": true,
  "total": 1
}
```

### GET `/api/nps`

**Description**: Retrieve all submitted NPS records

**Response**:
```json
[
  {
    "data": { ... }
  }
]
```

### GET `/api/corteza`

**Description**: Fetch all employee and account data from Corteza

**Response**:
```json
{
  "data": [
    {
      "values": {
        "Account Name": "Global Tech",
        "Score": 9,
        "Response": "Excellent",
        "Year": "2025",
        "Month": "Jan",
        "Status": "Active"
      }
    }
  ]
}
```

## Implementation Details

### Files Modified

#### 1. **api/businessunit.js** (New)
- Main API handler for email-based lookups
- Matches email with employee data
- Filters NPS records by business unit
- Fallback to mock data if Corteza credentials not available

#### 2. **api/npsData.js** (New)
- Shared in-memory data store for NPS records
- Methods:
  - `getRecords()` - Get all records
  - `addRecord(data)` - Add new record
  - `getRecordsByAccount(name)` - Filter by business unit
  - `getCount()` - Get total record count

#### 3. **api/nps.js** (Modified)
- Updated to use shared `npsData` module
- POST endpoint stores records in shared store
- GET endpoint retrieves from shared store

#### 4. **server.js** (Modified)
- Added import for `businessunit` handler
- Added `/api/businessunit` route handler

#### 5. **index.html** (Modified)
- Added email parameter detection in URL
- Added `fetchBusinessUnitData()` function
- Added `displayUserInfo()` function to show employee details
- Updated `initApp()` to handle email parameter
- Added `State.employee` property

## How It Works

### Flow Diagram
```
User Access with Email
    ↓
URL Parameter Extraction (?email=user@company.com)
    ↓
Call /api/businessunit?email=user@company.com
    ↓
Lookup Employee in Corteza/Mock Data
    ↓
Extract Business Unit from Employee Record
    ↓
Filter NPS Records by Business Unit
    ↓
Return Employee Info + Filtered NPS Data
    ↓
Display Personalized Dashboard
```

### Authentication Flow

1. **Email Extraction**:
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const userEmail = urlParams.get("email");
   ```

2. **API Call**:
   ```javascript
   fetch(`/api/businessunit?email=${encodeURIComponent(email)}`)
   ```

3. **Employee Lookup**:
   - Search employee database by email (case-insensitive)
   - Extract business unit from matched record

4. **NPS Filtering**:
   - Get all NPS records
   - Filter where Account Name matches business unit
   - Return filtered results

## Configuration

### Environment Variables

The system uses these environment variables (from `.env`):

```env
# Corteza Configuration (Optional - falls back to mock data)
CORTEZA_BASE_URL=https://corteza.example.com
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
NAMESPACE_ID=your_namespace_id
MODULE_ID=your_module_id
EMPLOYEE_MODULE_ID=your_employee_module_id
```

### Mock Data

If Corteza credentials are not available, the system uses mock data:

**Mock Employees**:
- john.doe@company.com → Global Tech
- jane.smith@company.com → SoftCorp
- bob.wilson@company.com → Nexus Data
- alice.brown@company.com → Alpha Systems
- charlie.johnson@company.com → BlueWave

**Mock Accounts** (Business Units):
- Global Tech
- SoftCorp
- Nexus Data
- Alpha Systems
- BlueWave

## Usage Examples

### Example 1: Direct Dashboard Access
```html
<!-- Access with email parameter -->
<a href="http://localhost:3000/?email=john.doe@company.com">
  John's Dashboard
</a>
```

### Example 2: Email-Based Reports
```javascript
// Embed in email template
const userEmail = "john.doe@company.com";
const dashboardUrl = `http://localhost:3000/?email=${encodeURIComponent(userEmail)}`;
```

### Example 3: API Testing
```bash
# Test the businessunit endpoint
curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"

# Submit NPS data
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "Account Name": "Global Tech",
      "Score": 9,
      "Response": "Great!",
      "Year": "2025",
      "Month": "Jan",
      "Status": "Active"
    }
  }'
```

## Key Features

✅ **Email-Based Access** - Direct dashboard access via email parameter  
✅ **Automatic Business Unit Detection** - Employee lookup and filtering  
✅ **Personalized Display** - Shows user and business unit info  
✅ **Secure Fallback** - Works with mock data if Corteza unavailable  
✅ **Full Dashboard Features** - All charts and filters work on filtered data  
✅ **RESTful API** - Simple GET endpoint for integration  

## Testing

1. **Start the server**:
   ```bash
   node server.js
   ```

2. **Access with email**:
   ```
   http://localhost:3000/?email=john.doe@company.com
   ```

3. **Submit test data**:
   ```bash
   curl -X POST http://localhost:3000/api/nps \
     -H "Content-Type: application/json" \
     -d '{
       "data": {
         "Account Name": "Global Tech",
         "Score": 8,
         "Response": "Good experience",
         "Year": "2025",
         "Month": "Jan",
         "Status": "Active"
       }
     }'
   ```

4. **Check filtered results**:
   - Visit the dashboard with the email parameter
   - Verify that only matching business unit data is shown
   - Confirm employee info displays correctly

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Employee not found" | Email doesn't exist in employee database (check mock data or Corteza) |
| "Business unit not found" | Employee record doesn't have Business Unit field |
| Empty dashboard | No NPS records exist for that business unit (submit test data) |
| No header info | JavaScript error - check browser console |
| Corteza connection error | Check credentials in `.env`, system falls back to mock data |

## Future Enhancements

- 🔐 Add authentication/verification for email access
- 📧 Send secure email links with encrypted tokens
- 🔔 Email notifications on new NPS submissions
- 📊 Executive summaries sent via email
- 🔄 Scheduled reports by business unit
- 📱 Mobile-friendly email dashboard links
