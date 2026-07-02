# Work Tracker

A tiny macOS menu-bar app to measure your own workday on the two axes that matter: **achievement** (what you did each hour) and **learning** (what you learned that day). Built for a Wed-Fri work rhythm, but the active days are configurable.

## What it does

- **On the first open of an active day**, a small box appears top-right for your main goal / tasks.
- **Every hour, 10am to 5pm**, a gentle Mac notification asks what you got done in the past hour. Click it to open the box.
- **Missed an hour?** It waits. Unanswered check-ins queue up and are answered one at a time, in order.
- **At 5pm**, it also asks what you learned, then opens the **weekly dashboard** comparing your days (Wed/Thu/Fri highlighted).
- Lives in the **menu bar** (no Dock icon). Shows today's goal in its tooltip/menu.

## Run it

```bash
npm install        # installs Electron + deps
npm run vendor     # copies Chart.js into src/renderer/vendor (also safe to re-run)
npm start          # launches the app (menu-bar item appears)
```

### Test mode (no waiting for real hours)

```bash
npm run dev        # same as: electron-forge start -- --test
```

In test mode every day is active and the menu-bar menu gains Dev items:
- **Dev: trigger check-in now** — fire an hourly prompt on demand
- **Dev: learning + dashboard** — fire the 5pm learning prompt, then open the dashboard
- **Dev: seed sample week** — fill this week's Wed/Thu/Fri with sample data and open the dashboard

## Build a double-clickable app

```bash
npm run make       # outputs .app + .dmg to out/make/
```

The build is **unsigned** (personal use). First launch: right-click the app → **Open** to get past Gatekeeper, or run `xattr -dr com.apple.quarantine "Work Tracker.app"`.

## Where data lives

A single JSON file in `~/Library/Application Support/work-tracker/`. Nothing leaves your machine.

## Settings

Menu bar → **Settings…**: active days (default Wed/Thu/Fri), the morning-goal start hour, the learning/dashboard hour, and launch-at-login.
