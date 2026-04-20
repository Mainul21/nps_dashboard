# Testing Guide - Email-Based Business Unit Filtering

## Quick Start

### 1. Start the Server
```bash
cd c:\Web_devlopment\custom
node server.js
```
Expected output:
```
✅  NPS Dashboard running at  http://localhost:3000
```

### 2. Access the Email Generator
Open your browser and go to:
```
http://localhost:3000/email-generator.html
```

This page allows you to:
- View all mock employees
- Generate personalized dashboard links
- Copy email templates

## Test Scenarios

### Scenario 1: Access Dashboard with Email Parameter

**Step 1**: Open the email generator
- URL: `http://localhost:3000/email-generator.html`

**Step 2**: Click "Generate Link" on John Doe's card
- This generates: `http://localhost:3000/?email=john.doe@company.com`

**Step 3**: Follow the generated link
- Expected result:
  - Header shows: "👤 John Doe" with email and "📊 Global Tech"
  - Dashboard shows only NPS data for "Global Tech" business unit
  - All charts filter to Global Tech data

### Scenario 2: Direct Email Link Access

**Step 1**: Open directly in browser
```
http://localhost:3000/?email=jane.smith@company.com
```

**Step 2**: Observe the page load
- Loading spinner shows "Connecting to Analytics Engine..."
- Header displays: "👤 Jane Smith" and "📊 SoftCorp"
- Dashboard loads filtered data

### Scenario 3: Invalid Email

**Step 1**: Try accessing with non-existent email
```
http://localhost:3000/?email=nonexistent@company.com
```

**Step 2**: Expected behavior
- Error alert appears: "Employee not found"
- Page shows loading spinner but no data

### Scenario 4: No Email Parameter (Standard Access)

**Step 1**: Access dashboard normally
```
http://localhost:3000/
```

**Step 2**: Expected behavior
- Header doesn't show user info
- Dashboard loads ALL data (no business unit filter)
- Full employee/account filtering available
- Works exactly as before

## API Testing

### Test 1: Query Business Unit Endpoint

**Request**:
```bash
curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"
```

**Expected Response (200)**:
```json
{
  "success": true,
  "employee": {
    "email": "john.doe@company.com",
    "name": "John Doe",
    "businessUnit": "Global Tech"
  },
  "npsData": {
    "count": 0,
    "records": []
  }
}
```

### Test 2: Submit NPS Data

**Request - Global Tech**:
```bash
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "Account Name": "Global Tech",
      "Score": "9",
      "Response": "Excellent service and support",
      "Year": "2025",
      "Month": "Jan",
      "Status": "Active"
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "total": 1
}
```

### Test 3: Verify Filtered Data

**Request**:
```bash
curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"
```

**Expected Response (should now include the record)**:
```json
{
  "success": true,
  "employee": {
    "email": "john.doe@company.com",
    "name": "John Doe",
    "businessUnit": "Global Tech"
  },
  "npsData": {
    "count": 1,
    "records": [
      {
        "values": {
          "Account Name": "Global Tech",
          "Score": "9",
          "Response": "Excellent service and support",
          "Year": "2025",
          "Month": "Jan",
          "Status": "Active"
        }
      }
    ]
  }
}
```

### Test 4: Add Multiple Records for Different Business Units

**For SoftCorp**:
```bash
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "Account Name": "SoftCorp",
      "Score": "8",
      "Response": "Good product quality",
      "Year": "2025",
      "Month": "Jan",
      "Status": "Active"
    }
  }'
```

**For Nexus Data**:
```bash
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "Account Name": "Nexus Data",
      "Score": "7",
      "Response": "Average experience",
      "Year": "2025",
      "Month": "Feb",
      "Status": "Active"
    }
  }'
```

### Test 5: Verify Isolation Between Business Units

**Query for Jane Smith (SoftCorp)**:
```bash
curl "http://localhost:3000/api/businessunit?email=jane.smith@company.com"
```

**Expected**:
- Returns only SoftCorp records (count: 1)
- Does NOT include Global Tech or Nexus Data records

**Query for Bob Wilson (Nexus Data)**:
```bash
curl "http://localhost:3000/api/businessunit?email=bob.wilson@company.com"
```

**Expected**:
- Returns only Nexus Data records (count: 1)
- Does NOT include Global Tech or SoftCorp records

## Complete Test Data Setup

Run these commands to populate test data:

```bash
# Test Data for Global Tech (John Doe)
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"Global Tech","Score":"9","Response":"Excellent service","Year":"2025","Month":"Jan","Status":"Active"}}'

curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"Global Tech","Score":"10","Response":"Outstanding","Year":"2025","Month":"Jan","Status":"Active"}}'

curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"Global Tech","Score":"8","Response":"Very good","Year":"2025","Month":"Feb","Status":"Active"}}'

# Test Data for SoftCorp (Jane Smith)
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"SoftCorp","Score":"7","Response":"Good product","Year":"2025","Month":"Jan","Status":"Active"}}'

curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"SoftCorp","Score":"8","Response":"Solid experience","Year":"2025","Month":"Feb","Status":"Active"}}'

# Test Data for Nexus Data (Bob Wilson)
curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"Nexus Data","Score":"6","Response":"Average","Year":"2025","Month":"Jan","Status":"Active"}}'

curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"Nexus Data","Score":"7","Response":"Acceptable","Year":"2025","Month":"Feb","Status":"Active"}}'

curl -X POST http://localhost:3000/api/nps \
  -H "Content-Type: application/json" \
  -d '{"data":{"Account Name":"Nexus Data","Score":"5","Response":"Below expectations","Year":"2025","Month":"Mar","Status":"Active"}}'
```

## Verification Checklist

### Frontend Tests

- [ ] Email parameter extracted from URL
- [ ] Employee info displayed in header (name, email, business unit)
- [ ] Dashboard loads without filters in normal mode
- [ ] Dashboard loads with email-filtered data
- [ ] Charts render correctly with filtered data
- [ ] Filter dropdowns populate correctly
- [ ] NPS, Average Score, and Total metrics calculate correctly
- [ ] Monthly trend chart shows correct data
- [ ] Distribution chart (doughnut) shows correct split

### API Tests

- [ ] GET `/api/businessunit?email=john.doe@company.com` returns 200
- [ ] Returns correct employee object
- [ ] Returns filtered NPS records (only matching business unit)
- [ ] Invalid email returns 404
- [ ] Missing email parameter returns 400
- [ ] POST `/api/nps` stores records correctly
- [ ] Records isolated between business units
- [ ] GET `/api/nps` returns all records

### Integration Tests

- [ ] Email link opens dashboard with correct user info
- [ ] Switching between different email links updates data correctly
- [ ] Standard access (no email) shows all business units
- [ ] Metrics change when new data is added
- [ ] Charts update when filters are applied

## Mock Employee/Business Unit Mapping

| Name | Email | Business Unit |
|------|-------|----------------|
| John Doe | john.doe@company.com | Global Tech |
| Jane Smith | jane.smith@company.com | SoftCorp |
| Bob Wilson | bob.wilson@company.com | Nexus Data |
| Alice Brown | alice.brown@company.com | Alpha Systems |
| Charlie Johnson | charlie.johnson@company.com | BlueWave |

## Troubleshooting

### Issue: "Employee not found" error
- **Solution**: Check email spelling matches exactly (case-insensitive)
- **Check**: Email is in the mock employee list above

### Issue: Dashboard loads but shows no data
- **Solution**: Add test NPS records using the curl commands above
- **Check**: Records must have matching "Account Name" to business unit

### Issue: Header shows user info but no NPS data
- **Possible cause**: No NPS records exist for that business unit
- **Solution**: Submit at least one NPS record with matching Account Name

### Issue: All business units showing when accessed with email
- **Possible cause**: Email not found, falls back to full data
- **Solution**: Verify employee email is in the system

### Issue: Charts show "undefined" or strange data
- **Solution**: Clear browser cache and reload
- **Check**: Ensure all required NPS fields are present in test data

## Performance Testing

### Load Test - Multiple Records

Add 100 records and verify performance:

```bash
# Add 100 Global Tech records
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/nps \
    -H "Content-Type: application/json" \
    -d '{"data":{"Account Name":"Global Tech","Score":"'$((RANDOM % 11))'","Response":"Response '$i'","Year":"2025","Month":"Jan","Status":"Active"}}'
  sleep 0.1
done
```

**Expected behavior**:
- Dashboard still loads quickly
- Charts render without lag
- Filters work smoothly
- No memory leaks (check DevTools)

## Browser Compatibility Testing

Test in these browsers:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Check for**:
- Proper loading and rendering
- Charts display correctly
- Email parameter extraction works
- Charts animation smooth

## Next Steps

Once all tests pass:

1. **Deploy to production** with real Corteza credentials
2. **Set up email templates** for sending dashboard links
3. **Implement authentication** for production security
4. **Monitor performance** with analytics
5. **Gather user feedback** on usability
