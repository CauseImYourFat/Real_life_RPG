## XP Logic Debug & Concepts (2025-09-20)

- XP logic was implemented for Tamagotchi pets with boost from health and skills.
- XP bar and level logic were designed to update based on mascotXP per pet.
- Frontend forced XP bar refresh and always used backend mascotXP after each action.
- Backend patched to always increment mascotXP from DB, merge and persist correctly, and return latest XP to frontend.
- Extensive debug logging added to both frontend and backend for XP state and updates.
- Multiple attempts made to resolve XP not accumulating (stuck at 1 XP).
- Issue persisted due to environment, DB, or state sync problems.
- Decision: Once all debug and fixes are complete, remove all XP logic and restart from scratch for a clean, maintainable solution.
## Asset Management Decision (2025-09-20)

- We will use hashed filenames for images and GIFs (for cache busting and production reliability).
- All assets will remain organized in their respective folders and subfolders for easy management.
- Hashing will only affect filenames, not folder structure.
- This decision ensures both browser cache safety and developer asset organization.
## Important Note

Never run tests on local development. Always deploy and test directly on the cloud.

Reason: Running tests locally can confuse the logic and AI, mixing stories between two structures and causing errors. For consistency and reliability, only use cloud deployment for testing and validation.
## [2025-09-17] Tamagotchi Shop Monetization & Dynamic Actions

**Problem:**
- Shop pets previously had static unlock logic and no monetization.
- Needed scalable, secure system for progressive pet action unlocks and Gnee! points purchases.

**Solution:**
- Refactored TamagotchiPage.js to display Gnee! points and enforce secure shop logic:
  - First pet is free; subsequent pets cost 5 Gnee! points each.
  - Gnee! points are displayed in the shop modal.
  - Purchase logic checks points and updates user data securely.
- Updated UserDataService.js:
  - buyPet checks purchased pets and Gnee! points before allowing purchase.
  - Deducts points and updates backend via updateTamagotchi API.
- Dynamic pet actions:
  - Actions for each pet are detected from GIF filenames in assets.
  - New actions unlock every 5 levels for each pet.
  - Logic is scalable for future pets and actions.

**Result:**
- Shop is secure, scalable, and supports monetization via Gnee! points.
- Pet actions unlock progressively and are detected dynamically from assets.

**Maintenance Notes:**
- To add new pets or actions, place GIFs in the appropriate assets folder.
- No code changes needed for new actions; logic auto-detects available actions.
- Gnee! points can be awarded for achievements, level-ups, or other events.
# Solutions Log

## [2025-09-16] Fixing 404 Errors for Username/Password Change

**Problem:**
- Frontend POST requests to `/api/user/username` and `/api/user/password` returned 404 errors.
- Backend implemented these endpoints as PUT routes, not POST.

**Solution:**
- Update frontend code to use `PUT` instead of `POST` for these requests in `UserDataService.js`.
- Example:
  ```js
  await fetch(`${this.baseURL}/api/user/username`, { method: 'PUT', ... })
  await fetch(`${this.baseURL}/api/user/password`, { method: 'PUT', ... })
  ```
- Commit and push the changes.

**Backend Reference:**
- `server.js` contains:
  ```js
  app.put('/api/user/username', authenticateToken, ...)
  app.put('/api/user/password', authenticateToken, ...)
  ```

**Result:**
- Username and password changes now work without 404 errors.

---

## [2025-09-16] Asset Not Found (pixel-heart.gif)

**Problem:**
- Mascot image `/assets/pixel-heart.gif` was not showing up in deployment/GitHub.

**Solution:**
- Add `assets/pixel-heart.gif` to git, commit, and push to repository:
  ```sh
  git add assets/pixel-heart.gif
  git commit -m "Add pixel-heart.gif mascot asset"
  git push
  ```

**Result:**
- Mascot image now appears correctly in the app.

---


---

## [2025-09-16] Gnee!! Point System & Donut Animation

**Problem:**
- Needed a fun, geeky way to reward users for every meaningful action in the app.
- Wanted a visible counter and a celebratory animation.

**Solution:**
- Updated header to "Real Life" and added Gnee.png mascot.
- Added a Gnee!!'s Points counter styled as a geek badge.
- Incremented counter on every app change (add skill, health/anatomy, share progress, etc.).
- Showed donut.gif near the top right of the click location for 1 second when a point is earned.

**Result:**
- Users now see their Gnee!! points and get a donut celebration for every achievement.

---
Add new solutions below as needed.
