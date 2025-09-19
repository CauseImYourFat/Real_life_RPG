# Real Life RPG - Gnee!! Point System

**Ready for static hosting! Zero-gap mobile optimized.**

## ✅ Username Protection Built-In

### **Duplicate Username Prevention**
- When registering, system checks if `localStorage["user_username"]` exists
- If exists → Shows **"User already exists. Please login instead."**
- If unique → Creates new user and logs in automatically
- **No overwriting possible** - usernames are protected!

## 📱 **Zero-Gap Mobile Optimization**
- **Mobile padding: 0** - Maximum screen utilization
- **No wasted space** - Content fills entire screen width
- **Touch-optimized** - Perfect for mobile interaction
- **Responsive design** - Adapts to any screen size

### **How It Works**
```javascript
// Registration Check
const userKey = `user_${username}`;
const existingUser = localStorage.getItem(userKey);

if (existingUser) {
  setError('User already exists. Please login instead.');
  return; // Stops registration process
}
```

## � Upload Instructions

1. **Upload entire folder contents** to your hosting provider
2. **Access via your domain** - works immediately!
3. **No database or server setup** required


## 🎮 Features

- **Gnee!! Point System**: Earn points for every meaningful action (add skill, health change, share progress, etc.)
- **Geeky Point Counter**: See your Gnee!!'s Points in the header, styled as a geek badge
- **Donut Animation**: Every time you earn a Gnee!! point, a donut.gif appears near the top right of your click for 1 second
- **Secure User System**: Username collision protection
- **Multiple Users**: Each browser can have multiple accounts
- **Guest Mode**: Quick access without registration  
- **Data Persistence**: Everything saved to localStorage
- **Interactive Anatomy Tracker**: Body visualization system
- **Skill Progression**: 8 categories, 80+ skills
- **Export Data**: JSON/CSV for AI analysis

## 📱 How to Use

1. **Register**: Enter unique username + password
2. **Login**: Use same credentials anytime
3. **Guest Mode**: Click "Continue as Guest" for quick access
4. **Track Skills**: Level up across 8 major life categories
5. **Export Data**: Download your progress for analysis

---

**No server required • Perfect for static hosting • 292KB total size**
- **Text Report**: Human-readable summary of your skill progression
- **Timestamp Tracking**: All activities logged with dates for trend analysis

### 💾 Data Persistence
- **Local Storage**: All data saved locally in your browser
- **Auto-Save**: Changes saved automatically as you make them
- **Import/Export**: Easy backup and sharing of your skill data

## How to Use


### Gnee!! Point System
1. The header now shows "Real Life", the Gnee mascot, and your Gnee!!'s Points counter.
2. Every time you add a skill, change health/anatomy, or share progress, you earn a Gnee!! point.
3. When you earn a point, a donut.gif appears near the top right of your click for 1 second.
4. Points are persistent for your session and reset on logout.

### Getting Started
1. Open `index.html` in your web browser
2. The app will automatically load with predefined skill categories
3. Click on any skill circle to view details and add progress

### Adding Progress
1. Click on a skill to open the detail modal
2. Use the **"+ Add Progress"** button to increase skill level
3. Use the **"- Remove Progress"** button to decrease if needed
4. Add descriptions and notes to track your learning journey

### Managing Skills
- **Add Custom Skills**: Use the "+" button in each category header
- **Edit Skill Info**: Click on any skill to add descriptions and notes
- **Delete Skills**: Use the delete button in the skill detail modal

### Creating Categories
1. Click **"Add Category"** in the header
2. Enter category name, choose an icon, and pick a color
3. Add custom skills to your new category

### Exporting Data for AI Analysis
1. Click **"Export Data"** in the header
2. Choose your preferred format:
   - **JSON**: Best for AI analysis and programming applications
   - **CSV**: Perfect for spreadsheet analysis and data visualization
   - **Text**: Human-readable format for sharing with others

## 🔐 Authentication System

### **How User Data Works**
```javascript
// User Registration
localStorage["user_john"] = {
  username: "john",
  password: "mypass",
  created: "2025-09-14T17:30:00.000Z",
  skills: {...},
  health: {...},
  preferences: {...}
}

// Current User Tracking
localStorage["currentUser"] = "john"
```

### **Registration Process**
1. Enter unique username + password
2. System checks if `user_[username]` already exists
3. If exists → "User already exists. Please login instead."
4. If new → Creates user data and logs in automatically

### **Login Process**
1. Enter username + password
2. System finds `user_[username]` in localStorage
3. Validates password match
4. Sets `currentUser` and loads data

### **Guest Mode**
- Creates temporary `user_guest_[timestamp]`
- No password required
- Data persists until browser cache cleared

## 🚀 Deployment for Static Hosting

### **Ready for Hostinger/Any Static Host**
- ✅ No server dependencies
- ✅ No API calls
- ✅ No database required
- ✅ Works purely with localStorage
- ✅ Perfect for shared hosting

### **Deployment Folder**
Location: `F:\APP\Skill\Website-package-life-rpg-deploy\`
```
Website-package-life-rpg-deploy/
├── index.html          # Main app page
├── dist/
│   └── bundle.js       # Complete React app bundle
└── README.md           # Deployment instructions
```

### **Upload Instructions**
1. Zip the `Website-package-life-rpg-deploy` folder contents
2. Upload to your hosting provider's public_html or www folder
3. Access via your domain - works immediately!

## File Structure
```
F:\APP\Skill\
├── src/                    # React source code
│   ├── components/         # React components
│   ├── services/          # UserDataService (localStorage)
│   └── styles/            # CSS styling
├── dist/                  # Built application
├── users/                 # Future file-based storage
└── Website-package-life-rpg-deploy/  # Ready for upload
```

## AI Analysis Integration

The exported data is specifically formatted for easy AI analysis:

### JSON Structure
```json
{
  "categories": [...],
  "skills": {
    "categoryId": {
      "skillId": {
        "name": "Skill Name",
        "level": 5,
        "maxLevel": 10,
        "description": "...",
        "notes": "...",
        "progressHistory": [...]
      }
    }
  },
  "userProfile": {
    "totalProgress": 123,
    "level": 13,
    "createdAt": "...",
    "lastUpdated": "..."
  }
}
```

### AI Prompt Suggestions
When sharing your data with AI for analysis, try these prompts:

1. **Progress Analysis**: "Analyze my skill development patterns and suggest areas for improvement"
2. **Career Guidance**: "Based on my skill set, what career paths would you recommend?"
3. **Learning Plan**: "Create a 6-month learning plan based on my current skill levels"
4. **Skill Gaps**: "Identify skill gaps for my target role in [industry/position]"

## Browser Compatibility
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Local Development
Simply open `index.html` in your web browser - no server required! The app works entirely client-side with local storage for data persistence.

## Future Enhancements
- Cloud sync capabilities
- Achievement system
- Social sharing features
- Advanced analytics dashboard
- Mobile app version

---

**Start tracking your life skills today and unlock your potential with data-driven personal development!**

---

# [2025-09-18] Major Patch & Security Update

**New Features & Improvements:**
- Google Sign-In integration (OAuth2) for secure authentication
- Modernized Google Sign-In button UI
- Backend security hardening (OWASP Top 10: input validation, HTTPS, logging, secure headers)
- Automated weekly dependency updates via Dependabot
- Patch/deploy log popup: Each new patch or deploy will now show as a modern popup on the sign-in page, styled to match the sign-in frame

**How Patch Popup Works:**
- When a new patch or deploy is made, a summary will appear on the sign-in page for that day
- Popup uses the same modern style as the sign-in frame for visibility and consistency
- Users can see what’s new or changed immediately after each update

---
