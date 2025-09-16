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

Add new solutions below as needed.
