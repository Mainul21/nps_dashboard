# NPS Dashboard - Email-Based Business Unit Filtering System

A sophisticated Net Promoter Score (NPS) analytics dashboard with **email-based personalization** that automatically filters data by employee business unit.

## 🎯 Overview

This system allows you to send employees personalized dashboard links via email. When they click the link, the dashboard automatically:

1. ✅ Identifies the employee by email
2. ✅ Looks up their business unit
3. ✅ Filters all NPS data to show only their business unit's sentiment
4. ✅ Displays a personalized dashboard with their information

No login or authentication needed - just click the link!

## 🚀 Quick Start

### Option 1: Windows (Easiest)
```bash
# Double-click start.bat
# Or run in PowerShell:
.\start.bat
```

### Option 2: Mac/Linux
```bash
# Run the shell script
./start.sh
```

### Option 3: Manual
```bash
node server.js
```

Then open: http://localhost:3000

## 📱 Usage

### 1. Access Standard Dashboard
```
http://localhost:3000/
```
Shows all NPS data across all business units with full filtering.

### 2. Access Personalized Dashboard
```
http://localhost:3000/?email=john.doe@company.com
```
Shows NPS data filtered to John's business unit (Global Tech).

### 3. Generate Links for Employees
```
http://localhost:3000/email-generator.html
```
Interactive tool to generate personalized links for each employee.

## 📋 System Structure

```
├── index.html                      # Main NPS dashboard
├── email-generator.html            # Link generator tool
├── server.js                       # Node.js server
├── package.json                    # Dependencies
│
├── api/
│   ├── businessunit.js             # 🆕 Email → Business Unit API
│   ├── corteza.js                  # Employee data from Corteza
│   ├── nps.js                      # NPS record management
│   └── npsData.js                  # 🆕 Shared NPS data store
│
├── EMAIL_BUSINESS_UNIT_GUIDE.md    # Full API documentation
├── TESTING_GUIDE.md                # Comprehensive testing guide
├── IMPLEMENTATION_SUMMARY.md       # What was implemented
│
└── start.sh / start.bat            # Quick start scripts
```

## 🔑 Key Features

### Email-Based Access
- Users access via personalized email link
- No login required
- Case-insensitive email matching
- Secure fallback to mock data

### Automatic Data Filtering
- Employee lookup from Corteza (or mock data)
- Business unit extraction
- NPS data filtered by business unit
- Complete data isolation between units

### Full Dashboard Capabilities
- Net Promoter Score (NPS) calculations
- Average sentiment scores
- Promoter/Passive/Detractor distribution
- Monthly trend analysis
- Interactive charts and visualizations
- Advanced filtering options

### Personalized Display
- Shows employee name in header
- Displays assigned business unit
- Email address for reference
- All on a clean, modern interface

## 🔌 API Endpoints

### 🆕 Email → Business Unit Lookup
```
GET /api/businessunit?email=<email>
```
Returns employee info + filtered NPS data

**Example**:
```bash
curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"
```

**Response**:
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
    "records": [...]
  }
}
```

### Submit NPS Data
```
POST /api/nps
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "Account Name": "Global Tech",
      "Score": "9",
      "Response": "Excellent!",
      "Year": "2025",
      "Month": "Jan",
      "Status": "Active"
    }
  }'
```

### Get All NPS Records
```
GET /api/nps
```

### Get All Employee/Account Data
```
GET /api/corteza
```

## 📊 Test Data

The system includes mock data for development:

**Mock Employees**:
| Email | Name | Business Unit |
|-------|------|----------------|
| john.doe@company.com | John Doe | Global Tech |
| jane.smith@company.com | Jane Smith | SoftCorp |
| bob.wilson@company.com | Bob Wilson | Nexus Data |
| alice.brown@company.com | Alice Brown | Alpha Systems |
| charlie.johnson@company.com | Charlie Johnson | BlueWave |

**Quick Test URLs**:
- John: http://localhost:3000/?email=john.doe@company.com
- Jane: http://localhost:3000/?email=jane.smith@company.com
- Bob: http://localhost:3000/?email=bob.wilson@company.com

## 🧪 Testing

### Add Sample Data
```bash
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "Account Name": "Global Tech",
      "Score": "9",
      "Response": "Great service!",
      "Year": "2025",
      "Month": "Jan",
      "Status": "Active"
    }
  }'
```

### Verify Filtering
```bash
# Should return only Global Tech data
curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"
```

See `TESTING_GUIDE.md` for comprehensive testing procedures.

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `EMAIL_BUSINESS_UNIT_GUIDE.md` | Complete API documentation and features |
| `TESTING_GUIDE.md` | Step-by-step testing procedures |
| `IMPLEMENTATION_SUMMARY.md` | Technical implementation details |
| `README.md` | This file |

## ⚙️ Configuration

### No Config Needed (Development)
The system works out of the box with mock data!

### Connect to Corteza (Production)
Create a `.env` file:
```env
CORTEZA_BASE_URL=https://corteza.example.com
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
NAMESPACE_ID=your_namespace_id
MODULE_ID=your_module_id
EMPLOYEE_MODULE_ID=your_employee_module_id
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│        User Email Link                  │
│ http://../?email=john.doe@company.com   │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  index.html     │
        │ - Extract email │
        │ - Call API      │
        └────────┬────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ /api/businessunit?email=.. │
    │ businessunit.js            │
    └────────┬───────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
    ▼                   ▼
┌────────────┐  ┌─────────────┐
│ Corteza/   │  │ npsData     │
│ Mock DB    │  │ Store       │
└────┬───────┘  └────┬────────┘
     │               │
     └───────┬───────┘
             │
             ▼
    ┌────────────────────┐
    │ Filter by Business │
    │ Unit               │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Return to Frontend │
    │ Display Dashboard  │
    └────────────────────┘
```

## 🔐 Security Considerations

### Current (Development)
- No authentication required
- Mock data only
- Suitable for testing and development

### Production Recommendations
1. Add token-based authentication
2. Verify email ownership via OTP or link signing
3. Implement rate limiting on API endpoints
4. Use HTTPS for all connections
5. Add request logging and monitoring
6. Implement CORS restrictions
7. Add request validation and sanitization

## 🚦 Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green | Server running, dashboard loaded |
| 🟡 Yellow | Loading data, processing requests |
| 🔴 Red | Error occurred, check console |

## 📈 Metrics Calculated

| Metric | Formula | Definition |
|--------|---------|------------|
| **NPS** | % Promoters - % Detractors | Net Promoter Score |
| **Avg Score** | Sum of Scores / Total Count | Average sentiment (0-10) |
| **Total** | Count of all responses | Total survey responses |
| **Promoters** | Count with Score 9-10 | Loyal, satisfied customers |
| **Passives** | Count with Score 7-8 | Satisfied but not loyal |
| **Detractors** | Count with Score 0-6 | Unhappy, likely to churn |

## 🛠️ Troubleshooting

### Dashboard shows "Employee not found"
- Check email spelling is correct
- Verify email is in the employee database
- Try a different employee from the mock list

### No NPS data showing
- Add test data using the curl examples above
- Verify Account Name matches business unit
- Check that filters aren't too restrictive

### Header doesn't show user info
- Check browser console for errors (F12)
- Verify email parameter in URL is correct
- Clear browser cache and reload

### Server won't start
- Ensure port 3000 is not in use
- Check Node.js is installed: `node --version`
- Try: `netstat -ano | findstr :3000` (Windows)

## 📞 Support

For detailed help:
1. Check `TESTING_GUIDE.md` for testing procedures
2. Review `EMAIL_BUSINESS_UNIT_GUIDE.md` for API details
3. Check browser console (F12) for JavaScript errors
4. Review server logs for backend errors

## 🎓 Learning Resources

### How Email Linking Works
```javascript
// 1. User clicks: http://localhost:3000/?email=john.doe@company.com
// 2. JavaScript extracts email from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");

// 3. Call API with email
const response = await fetch(`/api/businessunit?email=${email}`);

// 4. API returns employee info + filtered data
// 5. Dashboard renders with personalized content
```

### How Filtering Works
```javascript
// 1. Get employee's business unit
// 2. Filter all NPS records where Account Name = business unit
const filtered = allRecords.filter(r => 
  r.values["Account Name"] === businessUnit
);
// 3. Display filtered records in dashboard
// 4. All visualizations use filtered data
```

## 🔄 Workflow

```
Sender Flow:
1. Manager logs into system
2. Generates links for employees (email-generator.html)
3. Sends personalized emails with links
4. Employees receive links

Employee Flow:
1. Employee receives email with dashboard link
2. Clicks link (no login needed)
3. Dashboard loads with their business unit data
4. Views their NPS metrics and sentiment trends
5. Can explore detailed responses
```

## 📊 Example Use Cases

### 1. Executive Dashboard
Send executives links showing their division's NPS

### 2. Team Performance Reviews
Share NPS data with teams based on their business unit

### 3. Customer Success Reports
Send periodic NPS updates to account managers

### 4. Training Analytics
Track NPS improvements after training programs

### 5. Regional Analysis
Compare NPS across different business units

## 🎯 Next Steps

### Immediate
- ✅ Test with sample data
- ✅ Verify email filtering works
- ✅ Check dashboard displays correctly

### Short Term
- Add authentication for production
- Implement email verification
- Set up automated reporting

### Medium Term
- Connect to real Corteza instance
- Implement role-based access
- Add audit logging

### Long Term
- Mobile app version
- Real-time notifications
- Advanced analytics
- Machine learning insights

## 📜 License & Attribution

This dashboard combines modern web technologies with practical business intelligence features.

**Technology Stack**:
- Node.js for backend
- HTML5/CSS3/JavaScript for frontend
- Chart.js for visualizations
- Corteza CRM API integration (optional)

---

**Version**: 1.0  
**Last Updated**: April 20, 2026  
**Status**: ✅ Ready for Use

For questions or issues, refer to the comprehensive documentation files included in this project.
