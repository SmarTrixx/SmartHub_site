# Quick Test Guide - SmartHub Website Fixes

## Quick Test Scenarios (5-10 minutes)

### Test 1: Portfolio Images & Modal (2 min)
1. Navigate to **Portfolio** page
2. Verify all project images load (should see thumbnails)
3. Hover over any project card
4. Click "Quick View" button
5. Modal should open with full image and details
6. Click project image to verify it loads
7. Close modal

### Test 2: Services Page (1 min)
1. Navigate to **Services** page
2. Wait for loading spinner to finish
3. Verify 5+ service cards display
4. Each card should show icon, title, description
5. Click "Get Started" on any service

### Test 3: Portfolio About Me Section (1 min)
1. Scroll to bottom of **Portfolio** page
2. Find "About Me" section (after projects grid)
3. Verify it shows a profile image
4. Verify name is displayed
5. Verify title/role is displayed
6. Verify bio text is present
7. Verify social media icons (Email, GitHub, LinkedIn) are clickable

### Test 4: Footer Social Icons (1 min)
1. Go to any page footer (scroll to bottom)
2. Look for social icons section
3. Should show: Email, GitHub, LinkedIn, Twitter, Instagram
4. Click each icon and verify it opens correct profile

### Test 5: Admin Profile Settings (3 min)
1. Login to admin dashboard
2. Click "Profile Settings" 
3. Update Name field
4. Update Title field
5. Update Bio
6. Find new "Work Availability" section
7. Change "Availability Status" dropdown
8. Enter "Available Time" (e.g., "Mon-Fri, 9 AM - 6 PM")
9. Add/update social links
10. Click "Save Changes"
11. Go back to Portfolio page
12. Verify About Me section updated with new data

### Test 6: Admin Services (2 min)
1. Login to admin dashboard
2. Click "Services"
3. Click "Add Service"
4. Fill in all fields:
   - Service ID: e.g., "test-service"
   - Title: e.g., "Test Service"
   - Description: e.g., "This is a test service"
   - Icon: 🧪 or emoji
   - Price: "Contact for quote"
   - Status: Active
5. Click "Create Service"
6. Go to public **Services** page
7. Verify new service appears

### Test 7: Admin Projects (2 min)
1. Login to admin dashboard
2. Click "Projects"
3. Verify existing projects show thumbnail images
4. If no projects, create one with images
5. Upload at least one image
6. Fill in all fields and save
7. Go back to Projects list
8. Verify thumbnail displays correctly
9. Go to **Portfolio** page
10. Verify new project appears with correct image

---

## Quick Checklist

| Feature | Status |
|---------|--------|
| Portfolio images load | ✓ |
| Quick View modal works | ✓ |
| Services page loads | ✓ |
| Services from API display | ✓ |
| About Me section shows profile data | ✓ |
| Social icons in About Me work | ✓ |
| Footer social icons display | ✓ |
| Admin can edit work availability | ✓ |
| Services can be added in admin | ✓ |
| Admin projects show images | ✓ |

---

## Common Issues & Solutions

### Images Not Loading
**Solution:** Check browser Network tab. Images should come from `/uploads/` folder or use API URL prefix.

### Modal Won't Open
**Solution:** Make sure JavaScript is enabled. Check console for errors. Try refreshing page.

### Services Not Showing
**Solution:** Check if service status is "Active" in admin. Public page only shows active services.

### Admin Changes Not Appearing on Frontend
**Solution:** Refresh browser. Check if you're logged in for admin-specific features.

### Social Icons Missing
**Solution:** Check Profile Settings to ensure social links are saved. Icons only show if links are configured.

---

## Browser Console Checks

Open DevTools (F12) and check:
1. **Console tab** - No red error messages
2. **Network tab** - API requests should return 200 status
3. **Application tab** - Check localStorage has admin token if logged in

---

## Endpoints to Test

```
GET http://localhost:5000/api/services
GET http://localhost:5000/api/projects?limit=100
GET http://localhost:5000/api/profile
GET http://localhost:5000/api/projects/:projectId
```

---

## Admin Login

**URL:** http://localhost:3000/admin
**Default Path:** 
- Navigate to Contact page if prompted
- Or directly go to login

---

## Quick Reset (if needed)

1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+Shift+R for hard refresh)
3. Check backend logs: `npm run dev`
4. Check frontend console: F12 > Console

---

## Test Duration: ~15 minutes total

- Test 1-3: 4 min (Basic frontend tests)
- Test 4: 1 min (Footer verification)
- Test 5: 3 min (Admin profile update)
- Test 6-7: 4 min (Admin services & projects)
- Verification on frontend: 3 min

**All 6 issues should be fully resolved and working!**
