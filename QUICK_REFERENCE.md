# Quick Reference Card - Email-Based NPS Dashboard

## 🚀 Start Here

### Start the Server
```bash
node server.js
# Opens at http://localhost:3000
```

### Test URLs (Mock Data)
```
Standard Dashboard:    http://localhost:3000/
Link Generator:        http://localhost:3000/email-generator.html
John's Dashboard:      http://localhost:3000/?email=john.doe@company.com
Jane's Dashboard:      http://localhost:3000/?email=jane.smith@company.com
Bob's Dashboard:       http://localhost:3000/?email=bob.wilson@company.com
```

## 📋 File Guide

| File | Purpose | When to Use |
|------|---------|------------|
| `index.html` | Main dashboard | User-facing, loads with email param |
| `email-generator.html` | Link generator | Generate links for employees |
| `server.js` | Backend server | Run this to start everything |
| `EMAIL_BUSINESS_UNIT_GUIDE.md` | API documentation | For developers/integration |
| `TESTING_GUIDE.md` | Testing procedures | Before deploying |
| `IMPLEMENTATION_SUMMARY.md` | What was built | Understand the system |
| `ARCHITECTURE_DIAGRAMS.md` | Visual diagrams | Understand data flow |
| `README.md` | Project overview | Getting started |

## 🔌 API Endpoints

### Email → Business Unit (NEW)
```bash
GET /api/businessunit?email=john.doe@company.com

Response:
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
```bash
POST /api/nps
Content-Type: application/json

{
  "data": {
    "Account Name": "Global Tech",
    "Score": "9",
    "Response": "Great!",
    "Year": "2025",
    "Month": "Jan",
    "Status": "Active"
  }
}
```

### Get All NPS Records
```bash
GET /api/nps
```

### Get Employee Data
```bash
GET /api/corteza
```

## 📊 Mock Data Reference

| Email | Name | Business Unit |
|-------|------|----------------|
| john.doe@company.com | John Doe | Global Tech |
| jane.smith@company.com | Jane Smith | SoftCorp |
| bob.wilson@company.com | Bob Wilson | Nexus Data |
| alice.brown@company.com | Alice Brown | Alpha Systems |
| charlie.johnson@company.com | Charlie Johnson | BlueWave |

## 🧪 Quick Test

### 1. Add Test Data
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

### 2. Verify It Works
```bash
curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"
```

### 3. View in Dashboard
```
http://localhost:3000/?email=john.doe@company.com
```

## 🎯 Key Features

✅ Email-based personalization  
✅ Automatic business unit detection  
✅ Data isolation between units  
✅ Full dashboard capabilities  
✅ Mock data for development  
✅ RESTful APIs  
✅ No authentication needed (development)  

## 📁 New Files Created

- `api/businessunit.js` - Email lookup API
- `api/npsData.js` - Shared data store  
- `email-generator.html` - Link generator tool
- Documentation files (3)
- Start scripts (2)

## 🔧 Configuration

### Development (Default)
Works out of the box with mock data!

### Production (Optional)
Create `.env` file:
```env
CORTEZA_BASE_URL=https://corteza.example.com
CLIENT_ID=your_id
CLIENT_SECRET=your_secret
NAMESPACE_ID=your_ns_id
MODULE_ID=your_module_id
EMPLOYEE_MODULE_ID=your_emp_module_id
```

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Employee not found" | Check email spelling in URL |
| No data in dashboard | Add test NPS data |
| Port 3000 in use | Use different port: `PORT=3001 node server.js` |
| Charts not showing | Check browser console (F12) for errors |
| Corteza error | Falls back to mock data automatically |

## 📞 Help Resources

1. **Full Docs**: `EMAIL_BUSINESS_UNIT_GUIDE.md`
2. **Testing**: `TESTING_GUIDE.md`
3. **Architecture**: `ARCHITECTURE_DIAGRAMS.md`
4. **Overview**: `README.md`
5. **Implementation**: `IMPLEMENTATION_SUMMARY.md`

## 🎓 How It Works (Simple)

```
User clicks email link
        ↓
System extracts email from URL
        ↓
Looks up employee in database
        ↓
Gets business unit from employee record
        ↓
Filters all NPS data by business unit
        ↓
Shows personalized dashboard
```

## 📧 Example Email Template

```
Subject: Your NPS Analytics Dashboard

Dear [Name],

Your personalized NPS dashboard is ready:
https://nps-dashboard.company.com/?email=[email]

This shows sentiment data for your business unit:
[Global Tech / SoftCorp / Nexus Data / etc.]

Click above to view your metrics.

Questions? Contact support@company.com
```

## 🚦 Status Checklist

- [ ] Server running (`node server.js`)
- [ ] Can access http://localhost:3000
- [ ] Can open email-generator.html
- [ ] Can access dashboard with email param
- [ ] Can add test NPS data
- [ ] Can verify filtered data
- [ ] Charts display correctly
- [ ] User info shows in header

## 📈 Next Steps

### Immediate
- Test with sample data
- Verify email filtering works
- Check all features

### Short Term
- Add test data for all business units
- Configure for your employee database
- Test with real employees

### Medium Term
- Connect to Corteza CRM
- Set up email sending
- Implement access control

### Long Term
- Mobile app
- Real-time alerts
- Advanced analytics

## 🎯 Success Criteria

✅ Email parameter extracted  
✅ Employee lookup works  
✅ Business unit identified  
✅ NPS data filtered  
✅ Dashboard displays correctly  
✅ User info shown  
✅ All features working  

---

**Version**: 1.0  
**Last Updated**: April 20, 2026  
**Status**: ✅ Ready to Use

**Need Help?** See the comprehensive documentation files included in the project.
