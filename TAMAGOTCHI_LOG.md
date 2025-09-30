# Tamagotchi System Log

## Final Architecture Fusion: Tamagotchi System

### Concept & Vision
- Gamified virtual pet ecosystem, tightly integrated with user health, skills, achievements, and social features.
- Multi-user, real-time, extensible, and maintainable by design.

### Core Modules & Services
- **Pet Service:** Manages pet entities, XP, levels, actions, status, and asset references. Handles pet logic, growth, and unlocks.
- **User Service:** Manages user profiles (avatars, preferences, privacy), Gnee! points, owned pets, health/skills linkage, transaction history, and notification controls. Supports guest/demo users and data versioning.
- **Shop Service:** Handles pet purchases, Gnee! point deduction, validation, atomic transactions, and backend sync. Supports rollback and audit logging.
- **Health/Skills Service:** Listens for health/skills changes, calculates boosts, and updates pet XP/level in real time.
- **Asset Registry:** Scans, validates, and registers all pet/action assets (GIFs/images) on startup. Uses manifest files and logs errors for missing/duplicates.
- **Event Bus:** Centralized event-driven communication for all modules. Supports real-time updates, notifications, and decoupling.
- **Notification Service:** Delivers and logs all events (level-up, unlock, purchase, achievement) to users. Supports localization and accessibility.
- **Backup/Restore Service:** Manages versioned backups and restores for all user, pet, and transaction data. Ensures data integrity and migration support.
- **API Gateway:** Exposes REST/GraphQL endpoints for frontend/backend communication. Handles authentication, validation, error logging, and permission roles.

### Data Flow & Sync
- All user actions (pet care, purchases, health updates) trigger events on the event bus.
- Services react to events, update state, and sync with backend as needed.
- Real-time sync via WebSocket ensures multi-user and collaborative features.
- Optimistic UI updates with rollback on error for seamless user experience.

### Extensibility & Maintenance
- New pets, actions, or shop features added via plugins/extensions, not core code changes.
- Asset manifest and registry enable dynamic asset management.
- Automated tests and CI/CD pipelines ensure reliability and maintainability.
- Comprehensive documentation for all modules, events, data flows, edge cases, and error handling.
- Migration tools and onboarding guides for future contributors.

### Security, Analytics, & Accessibility
- Data encryption at rest and in transit for all sensitive user and pet information.
- Strict API validation, authentication, authorization, and audit logging.
- Analytics for user engagement, pet usage, shop transactions, and health/skills impact.
- Accessibility (WCAG compliance) and localization for all UI components.
- Permissions system for user roles (admin, moderator, player).
- Fallback and offline support for pet care and shop actions when network is unavailable.
- Hooks for third-party integrations (social sharing, external health apps, etc.).

### Testing, Bug Handling, & Finalization
- Automated tests for all critical flows, edge cases, and multi-user scenarios.
- Stress test real-time sync and optimistic UI updates under heavy load.
- Deep bug checks for purchases, XP/level sync, asset load, notification delivery, backup/restore, and security.
- Finalized architecture diagrams, module contracts, and documentation.

---
This fusion combines the best of both review cycles for a robust, scalable, and maintainable Tamagotchi system architecture. Ready for implementation or further review.

---

## Tamagotchi Inventory & Asset Structure (2025-09-25)

### 1. Inventory Structure
- Two main asset folders:
  - `dist/assets/food` (for food items)
  - `dist/assets/pets` (for pet assets)

### 2. Food Assets
- Located in `dist/assets/pets/shop/food`
- All food items are `.gif` files
- Each food grants buffs: +20% XP for 12 hours and +100 XP instantly
- Displayed on the main Tamagotchi tab

### 3. Pet Assets & Actions
- Located in `dist/assets/pets/shop`
- Each pet has its own folder containing `.gif` files for actions (e.g., `frog-jump`)
- Actions appear as buttons on Tamagotchi page
- One action unlocked initially; additional actions unlocked every 5 levels
- Locked actions are blurred by 25%

### 4. Shop Functionality
- Shop button allows users to earn +1 Gnee point daily
- Shop has two tabs:
  - Food Tab: Each food item costs 1 Gnee point (unique data for special items planned)
  - Pet Tab: Each pet costs 30 Gnee points

### 5. Hive Functionality
- Hive button acts as inventory with two tabs (Pets and Food)
- Items received from shop or other players

### 6. Buy-Sell System
- Items bought in shop are transferred to hive
- Items in hive can be resold for 50% of original price
- Ensure smooth item flow and monetization logic between shop and hive

### 7. Health Impact
- Pet performance reduced by up to 50% if user's "Overall Health %" in "❤️ Health & Anatomy" tab is below 100%
- Impact scales based on "Health Summary" in same tab

---
This section reflects the latest Tamagotchi inventory, asset, and gameplay logic as of 2025-09-25.

---

## Fusion Architecture Adaptation (2025-09-25)

### Key Updates for New Concept
- **Asset Registry:** Now scans only `dist/assets/pets/shop` and `dist/assets/pets/shop/food`. Uses manifest files to map pets, actions, and food items. Ignores legacy folders unless migrated.
- **Shop-Hive Service:** Implements atomic transaction queues for buy/sell actions. Backend validates item transfer and price logic, preventing duplication or loss.
- **Buff Management Service:** Tracks active buffs (+20% XP for 12h, +100 XP) per user/pet. Manages timers, stacking, and syncs state with backend and UI.
- **Health Sync Module:** Fetches and updates health data before pet actions. Re-calculates pet performance when health changes, scaling impact as needed.
- **Migration & Cleanup:** On startup, scans for legacy asset folders. Migrates valid assets or ignores them. Documents and enforces new structure in all modules.

### Conflict Avoidance Strategies
- Centralize asset validation and ignore outdated folders.
- Use backend-validated transaction queues for all inventory actions.
- Sync buff and health data in real time before pet actions.
- Document and enforce new asset and inventory logic in all modules.

---
This adaptation ensures the fusion architecture is fully aligned with your latest concept, avoids legacy conflicts, and supports robust, scalable Tamagotchi gameplay.

---

## Admin & Developer Functions: Architecture Adaptation (2025-09-25)

### Security & Access Control
- All admin/dev actions require backend authentication and session management.
- Dev button and admin panel are hidden from non-admin users in both frontend and backend APIs.
- Password protection and username check enforced server-side for 'CauseImYourFat'.

### State Consistency & Event Flow
- Admin actions (Gnee points, pets, food) trigger the same event bus flows and backend sync as user actions.
- All inventory, buff, and health changes initiated by admin are processed through transaction queues and validated by backend.

### Audit Logging & Notification
- Every admin action is logged with user, timestamp, and action details for audit and rollback.
- Notification service informs users of admin-granted items or points, and logs these events.

### Bulk Actions & Performance
- Bulk/batch admin actions (granting items to all users) use transaction queues and batch processing to avoid race conditions and performance issues.

### Environment Controls
- Admin/dev features are enabled only in development or with explicit admin access in production via feature flags.

---
These adaptations ensure admin/dev functions are fully integrated, secure, and consistent with the Tamagotchi system architecture, supporting robust management and testing without introducing conflicts.

---

## Frontend Synchronization & UI Assurance (2025-09-25)

### Event-Driven UI Updates
- Frontend listens to all backend events (pet changes, inventory updates, admin actions, buffs, health impact) and updates UI in real time.

### UI Triggers for All Functions
- Every backend function (shop, hive, admin actions, buffs, health sync) has a corresponding, clearly visible button or UI element in the frontend.
- No function is hidden or inaccessible unless restricted by user role.

### Feedback & Status Indicators
- All actions (buy, sell, grant, buff, health impact) provide immediate feedback (success, error, loading) to the user.

### Role-Based UI Visibility
- Admin/dev buttons and panels are only visible to authorized users, hidden for others.

### Error Handling & Recovery
- Frontend gracefully handles sync errors, stale data, or failed actions, and prompts the user to retry or refresh.

### Testing & QA
- Automated and manual tests ensure every function is accessible and triggers the correct backend logic.

---
This section ensures the frontend is always in sync with backend logic, and all features are accessible, testable, and user-friendly.
