# meeszon-site

Personal portfolio for Mees Zonneveld. The home page features an interactive portrait that follows the visitor's cursor as if making eye contact.

## Language

**FaceTracker**:
The interactive widget on the home page that displays a portrait which appears to follow the visitor's cursor.
_Avoid_: GazeTracker, face widget

**Gaze frame**:
One of the 170 pre-rendered webp images, each showing the portrait looking in one quantized direction. Selected at runtime based on cursor position relative to the viewport.
_Avoid_: face image, face frame, gaze image

**Gaze grid**:
The 13×13 quantization of possible gaze directions. Each axis runs from −15 to +15 in steps of 2.5. Cursor position is snapped to the nearest grid cell to pick a gaze frame.
_Avoid_: gaze positions, face grid

**face_looker**:
The (external) Python generator that produces the gaze frames and the index manifest. Naming is fossilized in filenames and a code comment; not used in app code.

**Gaze frame manifest**:
`public/faces/index.csv` — one row per gaze frame, listing the filename and the pupil x/y coordinates it represents. Produced by face_looker alongside the frames. Not currently consumed by app code (filenames are derived in JS via `gridToFilename`).

## Relationships

- A **FaceTracker** renders exactly one **gaze frame** at a time
- The **gaze grid** has 169 cells (13×13), matching 169 gaze frames on disk
- Cursor position → **gaze grid** cell → **gaze frame** filename

## Window chrome

The site presents itself as a Chrome browser window running on a Windows 7 desktop. The browser chrome and the page body together form one window; project case studies open as additional windows on the same desktop.

**Home window**:
The chrome bar plus the page body, treated as a single browser window. Has the three traffic lights and can be closed, minimized, maximized, or windowed.
_Avoid_: main page, home page (when referring to the window as a whole)

**Project window**:
A draggable browser-styled window opened from a venture card, showing a single project's case study. Implemented as `.win` in the DOM.
_Avoid_: modal, popup, project modal

**Chrome bar**:
The fixed two-row strip (tabs + URL toolbar) at the top of the home window. Functions as the home window's titlebar — the tabs row carries the traffic lights and is the drag handle when the home window is windowed.
_Avoid_: nav bar, header, toolbar

**Tab**:
An entry in the chrome bar's tabs row. The home tab is permanent; each open project window also has a tab. Closing a tab closes its project window.
_Avoid_: project tab (use just "tab")

**Traffic lights**:
The red/yellow/green dots at the top-left of any window (home or project). Red closes, yellow minimizes, green toggles maximize. On the home window, red also closes all open project windows.
_Avoid_: window controls, dots, buttons

**Win7 desktop**:
The persistent backdrop behind every window — `public/images/windows-7.jpg` covering the viewport. Only visible when the home window is minimized, closed, or windowed.
_Avoid_: background, wallpaper

**Desktop shortcut**:
The single icon on the Win7 desktop that double-clicks to restore the home window. Only rendered when the home window is hidden (minimized or closed).
_Avoid_: desktop icon, restore button

**Window state**:
One of four states the home window can be in: **maximized** (fills viewport, default), **windowed** (inset rectangle floating on the Win7 desktop, draggable), **minimized** (hidden, modals stay), **closed** (hidden, all project windows also dismissed). Project windows have their own analogous states except they have no "windowed" variant.
_Avoid_: mode

## Window chrome relationships

- The **chrome bar** is part of the **home window** — minimizing the home window hides the chrome bar with it
- Each open **project window** has exactly one **tab** in the **chrome bar**
- **Traffic lights** appear on both the **home window** and every **project window**
- The **desktop shortcut** exists only while the **home window** is hidden
- **Home window** and **project windows** share a single z-stack on the **Win7 desktop**
