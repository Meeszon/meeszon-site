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
