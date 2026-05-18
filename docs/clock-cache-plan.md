# Plan: Persistent Match Clock Cache

## Context

During a live broadcast, the reporter's match clock (`seconds` React state in `LiveControlPanel`) is entirely ephemeral — if the browser tab closes, the device restarts, or connectivity drops and the user navigates away, the running clock is lost. Firestore only persists `currentMinute` at phase transitions (e.g., "end first half"), so reopening the page mid-half resets the clock to 0:00. This feature saves the running clock to localStorage every 30 seconds with a wall-clock timestamp, then restores it on re-mount by adding the time that passed while the browser was closed.

---

## Files Modified

- `src/types/index.ts`
- `src/lib/utils.ts`
- `src/components/match/LiveControlPanel.tsx`

---

## How it works

### Save
Every 30 seconds while the match is in a running status, the component writes to the existing `flive_session` localStorage key:
```json
{
  "matchId": "abc123",
  "pendingEvents": [],
  "clock": {
    "seconds": 2122,
    "savedAt": 1716034800000
  }
}
```

### Restore
On mount, if the session matchId matches and the match status is still running:
```
restoredSeconds = savedSeconds + (Date.now() - savedAt) / 1000
```
Example: saved at 35:22, browser closed for 2 minutes → restores to 37:22.

### Cleanup
- **Phase change** — `clearMatchClock()` removes the `clock` field so the next mount starts fresh from `currentMinute`.
- **Match end** — existing `clearBroadcastSession()` wipes the entire session (including `clock`).

---

## Edge cases handled

| Scenario | Behavior |
|---|---|
| Browser crash mid-half | Clock restored: `savedSeconds + elapsedSinceClose` |
| Tab closed, device restarted | Same — wall clock difference added |
| Match already finished on reload | `match.status` not in `RUNNING_STATUSES` → no restoration |
| Offline on reload | Cache still readable from localStorage → clock restored |
| Phase transition (normal flow) | `prevStatusRef` triggers reset to `match.currentMinute * 60`; cache cleared |
| Wrong match session | `session.matchId !== match.id` guard skips restoration |

---

## Verification

1. Start a live match broadcast
2. Let the clock run to ~5 minutes
3. Close the browser tab
4. Wait 2 minutes
5. Reopen the match dashboard
6. Verify clock shows ~7 minutes and the "restored" banner appears
7. Dismiss banner, continue broadcasting normally
8. Trigger a phase change — verify clock resets correctly and banner is gone
