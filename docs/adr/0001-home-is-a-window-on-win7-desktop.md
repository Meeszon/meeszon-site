# Home page is a window on a Win7 desktop

The site's chrome bar and page body are treated as a single **home window** sitting on a persistent **Win7 desktop** backdrop, with traffic lights that close / minimize / maximize the whole thing. This extends the existing "Chrome-browser-as-UI" metaphor up one level — Chrome now visibly runs on Windows 7 — so the traffic lights on the chrome bar can do the same kinds of things they already do on **project windows**.

## Considered options

- **Dots are decorative or only hide the page body, chrome bar stays fixed.** Rejected because yellow + green would leave a chrome bar with no content — reads as broken, not as "minimized."
- **Make the home page literally a `.win` (project window) wrapping the chrome bar inside it.** Rejected because nesting a browser chrome bar inside a project-window titlebar inverts the metaphor.
- **No restore affordance — yellow is a one-way trip until refresh.** Rejected as hostile UX.

## Consequences

- The chrome bar can no longer be `position: fixed` at viewport top in all states — when the home window is windowed or minimized, the chrome bar moves with it. The bar's positioning becomes relative to the home window's frame.
- Project windows and the home window share a single z-stack. The chrome bar can be covered by a focused project window.
- The metaphor is desktop-only. Below the mobile breakpoint the dots are hidden and the Win7 backdrop is not loaded; behavior reverts to today's fixed chrome bar + body.
- Initial page load still renders maximized (current UX preserved). The metaphor is a discoverable easter egg, not a barrier.
