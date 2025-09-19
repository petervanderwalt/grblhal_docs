---
title: "Complete G-code & M-code Reference"
description: "A comprehensive list of all grblHAL G-code and M-code commands, including core functions, plugins, and driver-specific codes."
---

# Complete G-code & M-code Reference

This page is a comprehensive reference for all known grblHAL G-code and M-code commands. It is designed to be a single source of truth for machine operation and G-code programming.

Use the table of contents on the right to navigate, or use your browser's search function (`Ctrl+F`) to find a specific command.

---

# General Tips & Best Practices

1.  **Start Every File with a Safety Block:** Every G-code program should begin with a "safety block" or preamble that sets the machine to a known, predictable state. This prevents crashes and unexpected behavior.
    ```gcode
    G90 G21 G17 G40 G49 G80 G94 ; Absolute, MM, XY Plane, Cancel Comp/Offsets, Cancel Cycle, Units/Min
    M5 M9 ; Spindle and Coolant Off
    G53 G0 Z0 ; Retract Z to machine top safely
    ```

2.  **Explicit is Better Than Implicit:** Don't assume the machine is in the correct state. Explicitly command `G90`/`G91`, `G20`/`G21`, and select your work offset (`G54`, etc.) in your program.

3.  **Understand Modality:** Remember which commands are modal. Forgetting that a `G1` is active can lead to an unintended cutting move when you meant to make a rapid `G0` move. Forgetting a canned cycle (`G81`) is active can lead to unintended drilling. Always cancel modes (`G80`) when you are done with them.

4.  **Use `G53` for Safety:** When you need to move to a known, fixed machine position (like a tool change station or home), use `G53`. It bypasses all offsets and is the most reliable way to avoid collisions in these situations. A `G53 G0 Z0` is one of the safest commands in G-code.

5.  **Comment Your Code:** Use parentheses `()` or semicolons `;` to add comments to your G-code. This is invaluable for documenting complex sections, manual tool changes, or special setups.
    ```gcode
    (*** Begin Finishing Pass for Part A ***)
    T2 M6 (Load 3mm Ball End Mill)
    G43.1 Z125.5 (Apply tool length offset)
    S18000 M3
    ```  
    or  
    ```gcode
    M3 S10000 ; Set spindle speed to 10,000RPM
    ```


---

---

# Command Letters

These letters have a specific, singular meaning in a G-code block. They can appear on their own or with other commands.

| Word | Description |
|------|-------------|
| **`F-`** | **Feed Rate.**  |
| **`S-`** | **Spindle Speed.**  |
| **`T-`** | **Tool Select.**  |
| **`O-`** | **Program Name / Subroutine Number.**|

## `F` – Feed Rate
Sets the velocity for linear moves (`G1`, `G2`, `G3`) in units per minute (`G94`) or units per revolution (`G95`).
#### Examples
* **Set feed rate, then start the a move:**  
  `F500`  
  `G1 X100`

## `S` – Spindle Speed
Sets the target RPM for the spindle. It is used by `M3` and `M4`.
#### Examples
* **Set spindle speed, then start the spindle:**  
  `S10000`  
  `M3`


## `T` – Tool Select
Pre-selects a tool number for a subsequent `M6` tool change command.
#### Examples
* **Pre-select tool number 5 for a later change:**  
  `T5`  
  `( ... some cutting operations ... )`  
  `M6 T5` (The `T5` here is often optional if the tool is already pre-selected)


## `O` – Program Name / Subroutine Number
Used to identify a subroutine (`O100`) or as a label for a program.
#### Examples
* **Define a subroutine named (or numbered) 100:**  
  `O100`  
  `( ... subroutine commands ... )`  
  `M99` (return from subroutine)


---

# G-Codes

G-codes primarily control the machine's motion, coordinate systems, and operational modes.

---

## `G0` – Rapid Positioning

**Syntax:**  
> `G0 axes`  

Moves the machine at the maximum possible travel speed to a specified coordinate. `G0` is a non-cutting move intended to reduce job time by moving quickly between operations.

:::info Context
- **Modal:** `G0` is part of the Motion Mode group. It remains active until another motion mode command (`G1`, `G2`, `G3`, etc.) is issued.
- **Feed Rate:** The `F` word is ignored during a `G0` move; the machine always moves at its rapids rate, defined by settings `$110-$115` (Max rate) and `$120-$125` (Acceleration).
- **Coordination:** All specified axes move together and will complete their travel at the same time.
:::

| Parameter | Description |
|-----------|-------------|
| **X, Y, Z, A, B, C, U, V** | Target coordinates for any of the 8 supported axes. |

#### Common Examples
* **Move to X=100, Y=50 in machine rapids (absolute mode):**  
  `G90 G0 X100 Y50`

* **Move Z axis up by 10mm and rotate A axis to 90 degrees rapidly (incremental mode):**  
  `G91 G0 Z10 A90`

* **Full rapid move of a 5-axis machine:**  
  `G90 G0 X15.5 Y32.75 Z-2.0 B45 C-180`

#### Tips & Tricks
- Always ensure the path is clear before executing a `G0` command to avoid collisions. It's common practice to retract the Z-axis to a safe height first.
- `G0` is functionally similar to a `G1` move with the feed rate set to maximum, but `G0` is the standard, more explicit, and safer way to command a rapid move.

---

## `G1` – Linear Interpolation

**Syntax:**  
> `G1 axes <F->`  

Moves the machine in a straight line at a defined feed rate (`F`). This is the primary command for cutting, engraving, printing, and any other material-affecting process.

:::info Context
- **Modal:** `G1` is part of the Motion Mode group and will stay active until another motion command is issued.
- **Feed Rate:** A feed rate (`F` word) must be active for `G1` to execute. This can be set on the same line or a preceding line.
- **Coordination:** All specified axes move in a synchronized straight line to their destination.
:::

| Parameter | Description |
|-----------|-------------|
| **X, Y, Z, A, B, C, U, V** | Target coordinates for any of the 8 supported axes. |
| **F** | Feed rate for the move in current units (mm/min or inches/min). This is modal. |

#### Common Examples
* **Cut a straight line to X=200 at a feed rate of 500 mm/min:**  
  `G1 X200 F500`

* **Perform a 4-axis tapered cut:**  
  `G1 X100 A30 F300`

* **Complex 6-axis move:**  
  `G1 X50 Y25 Z-5 A90 B45 C180 F150`

#### Tips & Tricks
- The `F` value is modal. Once you set it, all subsequent `G1` moves will use that feed rate until a new `F` value is commanded.
- To cut a simple line, you only need to specify the axes that are changing. `G1 X100` will move only the X-axis if the machine is already at the correct Y and Z position.

---

## `G2` & `G3` – Arc / Helical Interpolation

**Syntax:**  
> `G2 axes offsets (center format)`  
> `G2 axes R- (radius format)`  
> `G2 offsets|R- <P-> (full circles)`  

Moves the machine along a circular arc (`G2` = Clockwise, `G3` = Counter-Clockwise) at the current feed rate. If a linear axis (like Z) is also commanded, it creates a helical motion.

:::info Context
- **Modal:** Part of the Motion Mode group.
- **Plane Selection:** Arcs are performed on the currently active plane (`G17` XY, `G18` XZ, `G19` YZ). The default is `G17` (XY plane).
- **Two Forms:** Can be defined using either `R` (radius) or `I, J, K` (center offset) parameters.
:::

| Parameter | Description |
|-----------|-------------|
| **X, Y, Z** | The destination coordinates of the arc on the selected plane. |
| **I, J, K** | **Offset Mode:** The X, Y, or Z offset from the *start point* to the arc's *center point*. `I` for X, `J` for Y, `K` for Z. Only the two axes on the active plane are used (e.g., `I` and `J` for the `G17` XY plane). |
| **R** | **Radius Mode:** The radius of the arc. Positive `R` for arcs < 180°. Negative `R` for arcs > 180°. |
| **P** | **Optional:** Number of full circles to make (if supported by plugins). |
| **F** | Feed rate for the move. |

#### `IJK` (Offset) Mode Example
* **Cut a 90° clockwise arc in the XY plane from (0,0) to (10,10) with the center at (10,0):**  
  `G17 G90` (Select XY plane, absolute mode)  
  `G0 X0 Y0` (Start at origin)  
  `G2 X10 Y10 I10 J0 F200`

#### `R` (Radius) Mode Example
* **Cut a semicircle clockwise in the XY plane from (0,0) to (20,0) with a radius of 10:**  
  `G17 G90`  
  `G0 X0 Y0`  
  `G2 X20 Y0 R10 F200`

#### Helical Motion Example
* **Create a thread-like motion by adding a Z move to an arc:**  
  `G17 G90`  
  `G2 X10 Y10 Z-5 I10 J0 F150` (Moves in an arc on XY while also moving down on Z)

#### Tips & Tricks
- **`IJK` mode is generally preferred** as it's mathematically unambiguous. `R` mode can sometimes describe two possible arcs between two points; grblHAL follows the standard convention (positive `R` for the shorter arc, negative `R` for the longer arc).
- Using `IJK` in `G91` (incremental) mode is very powerful for creating repeating patterns. The offsets are still calculated from the start point of the arc.

---

## `G4` – Dwell

**Syntax:**  
> `G4 P-`  

Pauses the machine for a specified period of time. All axes stop moving, but other machine functions (like spindle or coolant) remain in their current state.

:::info Context
- **Non-Modal:** `G4` is active only for the block in which it appears.
- **Purpose:** Useful for clearing chips at the bottom of a hole, allowing a spindle to reach full speed, or waiting for a tool change.
:::

| Parameter | Description |
|-----------|-------------|
| **P** | Dwell time in seconds. |

#### Common Examples
* **Pause for 2.5 seconds:**  
  `G4 P2.5`

* **Drill a hole, then dwell at the bottom to break the chip:**  
  `G1 Z-10 F100`  
  `G4 P0.5`  
  `G0 Z5`

#### Tips & Tricks
- The `P` value can be a decimal.
- Dwell commands are executed in order, so the machine will finish any preceding motion before the pause begins.

---

## `G10 L2` & `G10 L20` – Set Coordinate System Data

**Syntax:**  
> `G10 L2 P- axes` (absolute)  
> `G10 L20 P- axes` (relative)  

Provides a way to programmatically set and offset work coordinate systems (G54-G59.3). This is an advanced feature that allows for precise, repeatable fixture setups without manually touching off each time.

:::info Context
- **Non-Modal.**
- `L2` sets the specified coordinate system's origin *relative to the machine origin*.
- `L20` sets the specified coordinate system's origin *based on the current position*.
:::

| Parameter | Description |
|-----------|-------------|
| **L2** or **L20** | Specifies the "set data" mode. `L2` for absolute, `L20` for relative. |
| **P** | The work coordinate system to modify (1=`G54`, 2=`G55`, ... 9=`G59.3`). |
| **X,Y,Z,A,B,C,U,V**| The coordinate values to set for the origin of the selected system. |

#### `G10 L2` Example
* **Set the G55 origin to X=100, Y=250.5, Z=-20 from the machine's home position:**  
  `G10 L2 P2 X100 Y250.5 Z-20`  
  (Now, when `G55` is active, a `G0 X0 Y0` command will move the machine to machine coordinates X=100, Y=250.5)

#### `G10 L20` Example
* **Move to a fixture location and set G56 to that exact spot:**  
  `G53 G0 X300 Y150` (Move to the desired origin in machine coordinates)  
  `G10 L20 P3 X0 Y0 Z5` (Set the G56 origin. The current XY is now G56's X0Y0. Z is set to 5)

#### Tips & Tricks
- `G10` is extremely powerful for automated setups, especially with multiple identical fixtures.
- The values are stored persistently in grblHAL's memory, so they survive a reset.
- You can omit axes. `G10 L2 P1 X50` will only change the X value for `G54` and leave Y, Z, etc., unchanged.

---

## `G17`, `G18`, `G19` – Plane Selection

**Syntax:**  
> `G17` (XY plane)  
> `G18` (XZ plane)  
> `G19` (YZ plane)  

Selects the active plane for circular interpolation (`G2`/`G3`), cutter compensation, and some canned cycles. This determines which pair of axes an arc will be drawn on.

:::info Context
- **Modal:** Belongs to the Plane Select modal group. `G17` is the default on startup.
- **`G17`**: XY Plane (most common for 2.5D CNC work). Arcs use `I` (X offset) and `J` (Y offset).
- **`G18`**: XZ Plane (used for lathes or profiling on the side of a part). Arcs use `I` (X offset) and `K` (Z offset).
- **`G19`**: YZ Plane. Arcs use `J` (Y offset) and `K` (Z offset).
:::

| Command | Selected Plane | Arc Center Offsets |
|---------|----------------|--------------------|
| **`G17`** | **XY**         | `I` (for X), `J` (for Y) |
| **`G18`** | **XZ**         | `I` (for X), `K` (for Z) |
| **`G19`** | **YZ**         | `J` (for Y), `K` (for Z) |

#### Common Examples
* **Standard milling operation in the XY plane:**  
  `G17`  
  `G2 X10 Y15 I5 J0 F300`

* **Creating an arc on the front face of a part (XZ plane):**  
  `G18`  
  `G3 X20 Z-5 I10 K0 F250`

#### Tips & Tricks
- Always explicitly set your plane at the beginning of a program or after a tool change to avoid unexpected arc movements.
- Even if you are not cutting arcs, some canned cycles may behave differently depending on the active plane.
- The non-selected axis can still be moved during an arc command, resulting in helical motion. For example, `G17 G2 X10 Y10 I10 J0 Z-5` creates a circular ramp.

---

## `G20`, `G21` – Unit Selection

**Syntax:**  
> `G20` (inches)  
> `G21` (millimeters)  

Sets the G-code interpreter's units for all position, feed rate, and offset data.

:::info Context
- **Modal:** Part of the Units modal group. The setting is persistent and will remain active until changed.
- **`G20`**: Inches. All values are interpreted as inches, and feed rates are in inches/minute.
- **`G21`**: Millimeters. All values are interpreted as millimeters, and feed rates are in mm/minute.
:::

| Command | System Units |
|---------|--------------|
| **`G20`** | Inches       |
| **`G21`** | Millimeters  |

#### Common Examples
* **Set the machine to work in millimeters:**  
  `G21`  
  `G1 X100 F500`  (Moves to X=100mm at 500mm/min)

* **Set the machine to work in inches:**  
  `G20`  
  `G1 X4 F20` (Moves to X=4in at 20in/min)

#### Tips & Tricks
- It is critical safety practice to include either `G20` or `G21` at the very beginning of every G-code file. This prevents misinterpreting a 10mm move as a 10-inch move, which could cause a crash.
- This setting affects how *grblHAL interprets G-code*, but does not change the machine's internal step/mm settings (`$100`, etc.).

---

## `G28`, `G30` – Go to Pre-Defined Position

**Syntax:**  
> `G28 <axes>`  
> `G30 <axes>`

Commands the machine to perform a rapid move to a stored, user-defined position. This is often used as a safe "home" or tool change position.

:::info Context
- **Non-Modal.**
- The command is a two-part move. First, it moves to the specified intermediate coordinate (`X`, `Y`, `Z`, etc.), then it moves to the final stored position for all axes.
- If no intermediate coordinate is given, it moves all axes directly to the stored position.
- The positions for `G28` and `G30` are set with `G28.1` and `G30.1`, respectively.
:::

| Command | Parameter(s) | Description |
|---------|----------------|-------------|
| **`G28`** | `X,Y,Z..` (optional) | Moves to the `G28` stored position. |
| **`G30`** | `X,Y,Z..` (optional) | Moves to the `G30` stored position. |

#### Common Examples
* **Go directly to the G28 position:**  
  `G28`

* **Go to the G28 position via an intermediate point (e.g., to lift Z first for safety):**  
  `G28 Z0` (First moves Z to 0 in the current WCS, then moves all axes to the stored `G28` position)

* **Go to the second saved position, G30:**
  `G30`

#### Tips & Tricks
- The pre-defined positions are stored in machine coordinates.
- A common use case is `G53 G0 Z0` followed by `G28`. This ensures the Z-axis is fully retracted in machine coordinates before moving to the `G28` XY position, which is a very safe sequence.

---

## `G28.1`, `G30.1` – Set Pre-Defined Position

**Syntax:**  
> `G28.1`  
> `G30.1`

Stores the machine's current absolute position as the `G28` or `G30` pre-defined location.

:::info Context
- **Non-Modal.**
- This command captures the machine's current coordinates at the moment of execution and saves them persistently.
:::

#### Common Examples
* **Move to a safe tool change location and store it as G28:**  
  `G53 G0 X-50 Y-50 Z-5` (Move to a safe spot in machine coordinates)  
  `G28.1` (Store this position)

* **Set a position at the front of the machine for easy access as G30:**
  `G53 G0 X-200 Y-400 Z-10`
  `G30.1`

#### Tips & Tricks
- Before running `G28.1` or `G30.1`, it's best to move the machine using `G53` (move in machine coordinates) to ensure you are setting the position precisely where you want it, independent of any work offsets.

---

## `G38.2`, `G38.3`, `G38.4`, `G38.5` – Probing

**Syntax:**  
> `G38.2 axes F-`  
> `G38.3 axes F-`  
> `G38.4 axes F-`  
> `G38.5 axes F-`  

Performs a straight probing operation. The machine moves along a specified path until a connected probe input changes state (e.g., makes or breaks contact). The machine stops and records the trigger coordinate.

:::info Context
- **Non-Modal.**
- **`G38.2`**: Probe toward workpiece, stop on contact, signal error if no contact.
- **`G38.3`**: Probe toward workpiece, stop on contact, no error if no contact.
- **`G38.4`**: Probe away from workpiece, stop on loss of contact, signal error if it starts un-triggered.
- **`G38.5`**: Probe away from workpiece, stop on loss of contact, no error if it starts un-triggered.
:::

| Command | Description |
|---------|-------------|
| **`G38.2`** | Probe towards, error on fail. |
| **`G38.3`** | Probe towards, success on fail. |
| **`G38.4`** | Probe away, error on fail. |
| **`G38.5`** | Probe away, success on fail. |
| **X,Y,Z..** | The destination coordinates of the probe move. The probe will stop short if it triggers. |
| **F** | The feed rate (speed) of the probing move. |

#### Common Examples
* **Probe down in Z to find the top of a workpiece:**  
  `G91 G38.2 Z-20 F100` (Probe down 20mm at 100mm/min. Will stop when the probe touches.)

* **Find the center of a bore by probing in two directions:**
  `G38.2 X-10 F50` (Probe left)  
  *Record position*  
  `G0 X1` (Move away slightly)  
  `G38.2 X10 F50` (Probe right)  
  *Record position and calculate center*

#### Tips & Tricks
- Upon successful probing, grblHAL reports the trigger position, which can be accessed via `?` status reports or parsed by a GUI.
- Use a slow feed rate (`F`) for probing to get accurate results and prevent damage to the probe tip. A common practice is to perform a fast probe to find the surface, back off slightly, then perform a second, much slower probe for high accuracy.
- `G38.3` is useful for checking if a tool is present or finding the edge of a part when you don't know exactly where it is.

---

## `G40` – Cancel Cutter Radius Compensation

**Syntax:**  
> `G40`  

Disables cutter radius compensation (`G41`/`G42`). This is the default state.

:::info Context
- **Modal:** Part of the Cutter Compensation group.
- It is recommended to issue a `G40` at the beginning and end of all CNC programs to ensure a known state.
:::

#### Example
* **Ensure compensation is off before starting a job:**  
  `G40`

---

*Note: Full `G41`/`G42` cutter radius compensation is not present in the grblHAL core but may be available via plugins. The `G40` command is included for compatibility and to ensure a known state.*

---

## `G43.1`, `G43.2`, `G49` – Tool Length Offsets

**Syntax:**  
> `G43.1 axes`  
> `G43.2 axes`  
> `G49`  

Applies or removes a tool length offset, primarily along the Z-axis. This allows the machine to compensate for tools of different lengths without changing the G-code program.

:::info Context
- **Modal:** Part of the Tool Length Offset group.
- **`G43.1`**: Dynamic Tool Length Offset. Applies the offset specified by the `Z`, `H`, or other axis word. This is a powerful, flexible way to manage tool lengths.
- **`G43.2`**: Additional Tool Length Offset. Applies a secondary offset, which can be stacked on top of the current offset.
- **`G49`**: Cancel Tool Length Offset. Removes any active tool length offset.
:::

| Command | Parameter(s) | Description |
|---------|----------------|-------------|
| **`G43.1`** | `Z,A,B,C...` | Applies a dynamic offset to the specified axis. For example `G43.1 Z10` shifts the Z-axis origin by 10 units. |
| **`G43.2`** | `Z,A,B,C...` | Applies an additional (additive) offset. |
| **`G49`** | None | Cancels all active tool length offsets. |

#### Common Examples
* **Load a tool that is 5.2mm longer than the master tool:**  
  `G43.1 Z5.2` (All subsequent Z moves will be adjusted by +5.2mm)

* **Cancel the tool offset before a tool change:**
  `G49`
  `M6 T2`

#### Tips & Tricks
- `G49` should be commanded before any tool change (`M6`) and at the end of a program.
- Unlike traditional CNCs that use an `H` word to look up an offset from a tool table, `G43.1` in grblHAL applies the offset directly. This makes it very suitable for GUIs and macros to manage tool changes. For example, after probing a new tool, a macro can calculate the difference and issue the correct `G43.1` command.

---

## `G53` – Move in Machine Coordinates

**Syntax:**  
> `G53 G0 axes`  
> `G53 G1 axes <F->`

Executes a linear or rapid move in the absolute machine coordinate system, temporarily ignoring any work coordinate systems (`G54`, etc.) and offsets.

:::info Context
- **Non-Modal:** `G53` is only active for the block in which it is commanded.
- It must be combined with a motion command like `G0` or `G1`.
:::

| Parameter(s) | Description |
|--------------|-------------|
| **`G0` or `G1`** | Specifies rapid or linear motion. |
| **`X,Y,Z...`** | The target coordinates in the machine's absolute reference frame. |

#### Common Examples
* **Rapidly move the Z-axis to its highest point (machine Z=0) regardless of work offsets:**  
  `G53 G0 Z0`  (A very common safety move)

* **Move to a specific fixture point for a tool probe, using machine coordinates for consistency:**
  `G53 G0 X-10 Y-10`

#### Tips & Tricks
- `G53` is the most reliable way to move to a known, fixed position on the machine (like a tool change station or probing location) because it is not affected by any offsets.
- The next block of G-code will revert to the previously active work coordinate system.

---

## `G54` to `G59.3` – Work Coordinate Systems (WCS)

**Syntax:**  
> `G54`  
> `G55`  
> `G56`  
> `G57`  
> `G58`  
> `G59`  
> `G59.1`  
> `G59.2`  
> `G59.3`  

Selects one of the available work coordinate systems. A WCS defines a user-programmable origin (X0, Y0, Z0, etc.) for a specific job or fixture. This separates the program's zero point from the machine's home position.

:::info Context
- **Modal:** Part of the WCS group. `G54` is typically the default.
- grblHAL supports 9 work coordinate systems:
  - `G54` (P1)
  - `G55` (P2)
  - `G56` (P3)
  - `G57` (P4)
  - `G58` (P5)
  - `G59` (P6)
  - `G59.1` (P7)
  - `G59.2` (P8)
  - `G59.3` (P9)
:::

| Command | WCS Selected |
|---------|--------------|
| **`G54`** | System 1     |
| **`G55`** | System 2     |
| **...** | ...          |
| **`G59.3`**| System 9     |

#### Common Example
* **Running a job on two different vices on the machine bed:**
  `G10 L20 P1 X0 Y0 Z0` (Set G54 origin on the first vice)  
  `G10 L20 P2 X150 Y0 Z0` (Set G55 origin on the second vice, 150mm to the right)

  `G54`  
  `(run g-code for part 1)`

  `G55`
  `(run the same g-code for part 2)`

#### Tips & Tricks
- The origins for each WCS are set using the `G10 L2` or `G10 L20` commands or through the GUI by "zeroing" the axes.
- WCS values are stored persistently.
- Use different WCS for different fixtures, or even for different sides of the same part in a multi-stage operation.

---

## `G61`, `G61.1`, `G64` – Path Control Mode

**Syntax:**  
> `G61` (exact stop)  
> `G61.1` (exact stop alias)  
> `G64 <P->` (continuous mode with optional tolerance)  

These commands control how the machine handles corners and transitions between sequential motion commands. This choice is a trade-off between speed and accuracy.

:::info Context
- **Modal:** Part of the Control Mode group.
- **`G61` (Exact Stop Mode):** The machine comes to a full stop at the end of each programmed move before starting the next. This ensures every corner is perfectly sharp but can cause jerky motion and slow down jobs significantly.
- **`G61.1` (Exact Stop Mode):** An alias for `G61`.
- **`G64` (Path Blending / Continuous Mode):** The machine blends sequential moves, rounding corners slightly to maintain a higher average speed. The amount of rounding is controlled by the junction deviation setting (`$12`). This is the default mode and is ideal for high-speed machining and 3D carving.
:::

| Command | Mode | Corner Behavior |
|---------|------|-----------------|
| **`G61`** | Exact Stop | Sharp corners, decelerates to zero at each vertex. |
| **`G64`** | Path Blending | Rounded corners, maintains velocity through transitions. |

#### Common Examples
* **Engraving a precise technical drawing with sharp corners:**  
  `G61`  
  `(G-code for drawing)`

* **Carving a smooth 3D relief where speed and flow are important:**  
  `G64 P0.05` (P value can specify tolerance, if supported by plugins)  
  `(G-code for 3D model)`

#### Tips & Tricks
- For most applications (2D profiling, 3D carving), `G64` is the preferred mode as it results in faster and smoother operation.
- Use `G61` only when absolute corner sharpness is required, such as inlays or mechanical parts with tight tolerances. Be aware that it can leave "witness marks" or small circular divots at each corner on some materials due to the momentary stop.
- The default grblHAL behavior is `G64`.

---

## `G80` – Cancel Canned Cycle

**Syntax:**  
> `G80`

Immediately cancels any active canned cycle mode (`G81`-`G89`). It is a critical safety command to ensure that subsequent motion commands are not interpreted as part of a cycle.

:::info Context
- **Modal:** Part of the Motion Mode group. It reverts the machine to `G1` (Linear Motion) behavior.
- Always use `G80` after a series of canned cycle operations.
:::

#### Example
* **Drill a series of holes and then cancel the cycle to move to a new area:**  
  `G81 Z-10 R2 F100` (Start drilling cycle)  
  `X10`  
  `X20`  
  `G80` (Cancel the drilling cycle)  
  `G0 X50 Y50` (Now a normal rapid move)

---

## `G76`, `G81` to `G89` – Canned Cycles

**Syntax:**  
> `G81 Z- R- <F-> <L->`  
> `G82 Z- R- P- <F-> <L->`  
> `G83 Z- R- Q- <F-> <L->`  
> `G73 Z- R- Q- <F-> <L->`  
> `G85 Z- R- <F-> <L->`  
> `G86 Z- R- <F-> <L->`  
> `G89 Z- R- P- <F-> <L->`  
> `G76 Z- R- <F-> <L->` (lathe threading)  

Canned cycles are powerful shortcuts that combine several distinct movements into a single G-code command, typically for hole-making operations like drilling, boring, and tapping. Instead of programming each feed, retract, and rapid move manually, you define the cycle's parameters once. The cycle then repeats at every new coordinate provided until a `G80` (Cancel Canned Cycle) is issued.

:::info Context
- **Modal:** Once a canned cycle is active, it remains active. Every new position command for the axes on the active plane (`X` and `Y` in `G17`) will execute the full cycle at that location.
- **Parameters:**
    - **`Z`**: The final depth of the hole (absolute or incremental).
    - **`R`**: The retract position (the Z-height to which the tool rapids before starting the feed move).
    - **`P`**: Dwell time (in seconds) at the bottom of the hole (used in `G82`, `G89`).
    - **`Q`**: The peck depth for each cutting feed in `G73` and `G83`.
    - **`F`**: The feed rate for the cutting portions of the cycle.
    - **`L`**: **Optional:** Number of repeats (if supported by plugins).
- **Return Behavior:** The return height after the cycle is controlled by `G98` and `G99` (see below).
:::

#### Available Cycles in grblHAL
*   **`G81`**: Simple Drilling Cycle. Rapids to R, feeds to Z, rapids out.
*   **`G82`**: Drilling Cycle with Dwell. Same as `G81` but dwells at the bottom of the hole for time `P`.
*   **`G83`**: Peck Drilling Cycle (Deep Hole). After each peck of depth `Q`, the drill fully retracts out of the hole to clear chips.
*   **`G73`**: Peck Drilling Cycle (Chip Breaking). After each peck of depth `Q`, the drill retracts a small, fixed amount to break the chip, but does not exit the hole.
*   **`G85`**: Boring Cycle. Feeds to Z, then feeds back out to R. Leaves a high-quality surface finish.
*   **`G86`**: Boring Cycle. Feeds to Z, stops spindle, rapids out.
*   **`G89`**: Boring Cycle with Dwell. Feeds to Z, dwells for time `P`, feeds back out to R.
*   **`G76`**: Threading Cycle (Lathe). A specialized cycle for cutting threads.

#### Canned Cycle Example (`G81`)
* **Drill three holes at X10, X20, and X30:**
  `G90 G21` (Absolute mode, millimeters)
  `G0 X0 Y0 Z5` (Start above the workpiece)
  `G99` (Set return plane to R-level)
  `G81 Z-10 R2 F150` (Define the cycle: drill to Z-10, retract plane is Z+2, feed 150)
  `X10 Y10` (Drills the first hole here)
  `X20` (Drills the second hole at X20, Y10)
  `X30` (Drills the third hole at X30, Y10)
  `G80` (Cancel the cycle)
  `G0 Z5` (Safely retract Z)

---

## `G90`, `G91` – Distance Mode

**Syntax:**  
> `G90` (absolute)  
> `G91` (incremental)  

Controls how coordinate values (`X`, `Y`, `Z`, etc.) are interpreted by the machine. This is one of the most fundamental G-code concepts.

:::info Context
- **Modal:** Part of the Distance Mode group. This setting is persistent. `G90` is the default.
- **`G90` (Absolute Mode):** All coordinate values are interpreted as a position relative to the current work coordinate system's origin (e.g., `X10` means "move to the X=10 line").
- **`G91` (Incremental Mode):** All coordinate values are interpreted as a distance *from the current position* (e.g., `X10` means "move 10 units in the positive X direction from where you are now").
:::

| Command | Mode | Interpretation of Coordinates |
|---------|-------------|-------------------------------|
| **`G90`** | Absolute    | As a destination from the WCS origin (0,0). |
| **`G91`** | Incremental | As a distance and direction from the current point. |

#### Common Examples
* **Moving to a specific point (10, 20) using Absolute mode:**  
  `G90`  
  `G0 X10 Y20`

* **Moving a rectangle 50 units wide and 30 units tall using Incremental mode:**  
  `G91`  
  `G1 X50 F300` (Move right 50)  
  `G1 Y30` (Move up 30)  
  `G1 X-50` (Move left 50)  
  `G1 Y-30` (Move down 30)

#### Tips & Tricks
- Most CAM software generates code in `G90` (Absolute) mode.
- `G91` is extremely useful for writing simple, repeatable subroutines and macros, such as probing routines or patterns, because they work correctly regardless of where they are started.
- It is good practice to explicitly state `G90` or `G91` at the beginning of a program.

---

## `G92`, `G92.1`, `G92.2` – Coordinate System Offset

**Syntax:**  
> `G92 axes`  
> `G92.1` (cancel offset)  
> `G92.2` (suspend offset)  

`G92` applies a temporary, "volatile" offset to the machine's coordinate system. It makes the machine believe its current position is the value specified in the command. This is an older method of setting a work zero and is often discouraged in favor of `G10` and the persistent `G54-G59` work coordinate systems.

:::info Context
- **Modal.**
- **`G92`**: Apply an offset. For example, `G92 X0 Y0` tells the machine "your current location is now X0, Y0".
- **`G92.1` or `G92.2`**: Clear any active `G92` offset, restoring the original coordinate system.
- **`G92.3`**: Restore a previously-cleared `G92` offset. (Less common).
:::

| Command | Action |
|---------|--------|
| **`G92 X.. Y..`** | Sets the current point to the specified coordinate value. |
| **`G92.1`** | Clears any active `G92` offset. |

#### `G92` Example
* **Temporarily set the corner of a workpiece as the origin:**  
  `G0 X100 Y50` (Move to the physical corner)  
  `G92 X0 Y0 Z0` (Tell grblHAL this spot is now the origin)  
  `(All subsequent moves are relative to this new temporary zero)`
  ...
  `G92.1` (Clear the offset and return to the underlying G54/etc. system)

#### Tips & Tricks
- **Warning:** `G92` offsets are easy to forget about and can lead to unexpected crashes. It's often safer to use a dedicated Work Coordinate System like `G55` for temporary setups.
- A `G92` offset is applied *on top of* the active G54-G59 WCS.
- Some legacy CAM posts still use `G92`, particularly for multi-axis machines to reset a rotary axis's position (e.g., `G92 A0`).

---

## `G93`, `G94`, `G95` – Feed Rate Mode

**Syntax:**  
> `G93` (inverse time)  
> `G94` (units per minute)  
> `G95` (units per revolution)  

Determines how the `F` word (feed rate) is interpreted.

:::info Context
- **Modal:** Part of the Feed Rate Mode group. `G94` is the default and most common mode for milling.
- **`G93` (Inverse Time Mode):** The `F` word represents "1 / minutes". The feed rate is calculated so that the move completes in `1/F` minutes. This is mainly used in 5-axis simultaneous motion where maintaining a constant tool-tip speed is complex.
- **`G94` (Units Per Minute Mode):** The `F` word is interpreted directly as linear units (mm or inches) per minute. This is the standard for most CNC mills, routers, and 3D printers.
- **`G95` (Units Per Revolution Mode):** The `F` word is interpreted as linear units per spindle revolution. This is the standard for CNC lathes, where chip load is directly tied to RPM.
:::

| Command | Feed Rate Interpretation | Primary Use |
|---------|--------------------------|-------------|
| **`G93`** | 1 / minutes (Inverse Time) | 5-Axis Simultaneous Machining |
| **`G94`** | Units / Minute           | Milling, Routing, 3D Printing |
| **`G95`** | Units / Revolution       | Lathes, Threading |

#### Examples
* **Standard milling at 500 mm/min:**  
  `G94`  
  `G1 X100 F500`

* **Lathe turning at 0.2 mm per revolution:**  
  `G95`  
  `S1000 M3` (Spindle at 1000 RPM)  
  `G1 Z-50 F0.2` (The effective feed rate is 1000 RPM * 0.2 mm/rev = 200 mm/min)

---

## `G96`, `G97` – Spindle Speed Mode

**Syntax:**  
> `G96 S- <D->` (constant surface speed)  
> `G97 S-` (constant RPM)  

Controls how the `S` word (spindle speed) is interpreted. This is primarily for CNC lathes but can be useful in other specialized applications.

:::info Context
- **Modal:** Part of the Spindle Speed Mode group. `G97` is the default.
- **`G96` (Constant Surface Speed - CSS):** The `S` word defines a desired surface speed (e.g., meters per minute or feet per minute). The controller will continuously adjust the spindle RPM based on the X-axis diameter to maintain this speed at the cutting edge. A maximum RPM must be set with `G50`.
- **`G97` (Constant RPM Mode):** The `S` word is interpreted directly as revolutions per minute. The spindle speed is fixed until a new `S` command is issued.
:::

| Command | Spindle Speed Interpretation | Primary Use |
|---------|------------------------------|-------------|
| **`G96`** | Constant Surface Speed (CSS) | Lathe Facing/Turning |
| **`G97`** | Constant RPM                 | Milling, Drilling, Lathe Threading |

#### `G96` Example (Lathe)
* **Facing a part on a lathe with a surface speed of 150 m/min:**
  `G50 S4000` (Limit the spindle to a max of 4000 RPM for safety)
  `G96 S150 M3` (Turn on CSS mode at 150 m/min)
  `G1 X0 F0.2` (As X moves from a large diameter to zero, RPM will increase to maintain S150)

#### Tips & Tricks
- Always use `G97` for drilling, tapping, and threading operations, as a constant, known RPM is required. `G97 S800 M3`.
- `G96` provides a better surface finish and improved tool life on lathes when diameter is changing significantly.

---

## `G98`, `G99` – Canned Cycle Return Mode

**Syntax:**  
> `G98` (return to initial level)  
> `G99` (return to R level)  

Controls the Z-height that the tool retracts to *between holes* during a canned cycle sequence.

:::info Context
- **Modal:** Part of the Canned Cycle Return group.
- **`G98` (Return to Initial Z):** At the end of each cycle, the tool retracts all the way to the Z-position that it was at *just before* the canned cycle was initiated. This is the safest mode, as it can clear clamps and other obstructions between hole locations.
- **`G99` (Return to R-Plane):** At the end of each cycle, the tool retracts only to the R-level specified in the canned cycle block. This is faster when drilling a series of holes on a flat, unobstructed surface, as it minimizes Z-axis travel.
:::

| Command | Retract Behavior in Canned Cycle |
|---------|----------------------------------|
| **`G98`** | Retract to initial Z-height.     |
| **`G99`** | Retract to the `R` level.        |

#### Example
* **Drilling two holes, one of which has a clamp in between:**
  `G90 G0 X10 Y10 Z20` (Start high above the part, Z=20 is the "initial height")

  `G98` (Use G98 to retract fully to Z=20, clearing the clamp)
  `G81 Z-5 R2 F100` (Define cycle)
  `X10 Y10` (Drill first hole, tool retracts to Z=20)
  `X50 Y10` (Drill second hole across the clamp, tool retracts to Z=20)
  `G80`

* **Drilling a fast pattern on a flat plate:**
  `G90 G0 X10 Y10 Z5` (Start just above the part)

  `G99` (Use G99 to retract only to R-level for speed)
  `G81 Z-5 R2 F100` (R-level is Z=2)
  `X10 Y10` (Drill hole, retracts to Z=2)
  `X20 Y10` (Drill hole, retracts to Z=2)
  `G80`

---

# M-Codes

M-codes control miscellaneous machine functions. These are actions that are not related to axis motion, such as controlling the spindle, coolant, program flow, and I/O.

---

## `M0`, `M1`, `M2`, `M30` – Program Flow & Stopping

**Syntax:**  
> `M0 <P->|(message)` (program stop)  
> `M1 <P->|(message)` (optional stop)  
> `M2` (program end)  
> `M30` (program end & rewind)  

These commands control the execution and termination of a G-code program.

:::info Context
- **`M0` (Program Stop):** Unconditionally halts the program. All axes, spindle, and coolant stop. The operator must press the cycle start button to resume the program from the next line.
- **`M1` (Optional Stop):** Behaves exactly like `M0`, but only if the "Optional Stop" input or switch on the machine/GUI is enabled. If the switch is off, the controller ignores `M1` and continues execution. This is useful for inspection points that are not needed on every run.
- **`M2` (Program End):** Ends the program. Typically performs a reset of the controller, clears offsets, and puts the machine in an idle state. Behavior can vary slightly.
- **`M30` (Program End, Pallet Change):** The most common command to end a program. It does everything `M2` does but also typically rewinds the G-code file back to the beginning, ready for the next part.
:::

| Command | Action | Resumption |
|---------|--------|------------|
| **`M0`**  | Unconditional Program Stop | Requires operator intervention (Cycle Start) |
| **`M1`**  | Optional Program Stop      | Requires operator intervention if enabled |
| **`M2`**  | Program End and Reset      | Program ends |
| **`M30`** | Program End and Rewind     | Program ends |

#### Common Examples
* **Stop the program to allow for manual chip clearing:**  
  `G0 Z20`  
  `M0`  
  `G0 X50 Y50`

* **Place an optional stop after a critical feature for inspection:**  
  `(G-code for a finishing pass)`  
  `M1` (If Optional Stop is on, machine will pause here)

* **Standard way to end a G-code file:**  
  `G0 Z20` (Retract to a safe height)  
  `M5` (Spindle off)  
  `M30`

---

## `M3`, `M4`, `M5` – Spindle Control

**Syntax:**  
> `M3 S-` (spindle on CW)  
> `M4 S-` (spindle on CCW)  
> `M5` (spindle off)  

These are the fundamental commands for controlling the spindle's rotation.

:::info Context
- **`M3` (Spindle On, Clockwise - CW):** Starts the spindle rotating in the clockwise direction (the standard direction for most right-hand tools). The speed is determined by the last active `S` word.
- **`M4` (Spindle On, Counter-Clockwise - CCW):** Starts the spindle rotating in the counter-clockwise direction. This is used for left-hand tools, such as some taps and specialty cutters.
- **`M5` (Spindle Off):** Stops the spindle's rotation.
:::

| Command | Spindle State | Direction |
|---------|---------------|-----------|
| **`M3 S<rpm>`** | On | Clockwise (CW) |
| **`M4 S<rpm>`** | On | Counter-Clockwise (CCW) |
| **`M5`** | Off | N/A |

#### Common Examples
* **Start the spindle at 10,000 RPM in the forward direction:**  
  `S10000 M3`

* **Stop the spindle:**  
  `M5`

* **Start the spindle for a left-hand thread tapping operation at 500 RPM:**  
  `S500 M4`

#### Tips & Tricks
- It's good practice to command the `S` word on the same line or just before the `M3`/`M4` command.
- The controller will wait for the spindle to reach the commanded speed before executing the next motion command if "Wait for Spindle at Speed" is enabled in the settings. This is crucial for tapping and heavy cuts.

---

## `M6` – Automatic Tool Change (ATC)

**Syntax:**  
> `M6 <T->`

Initiates a tool change sequence. The behavior of `M6` is highly dependent on the machine's configuration and whether an automatic tool changer is present.

:::info Context
- **With ATC:** An `M6` command, typically combined with a tool number (`T` word), will trigger a pre-defined macro (`M6.nc`) that executes the physical tool change.
- **Without ATC:** On a machine without an automatic changer, `M6` typically functions as a programmed stop (`M0`). It moves the machine to a safe tool change position, turns off the spindle, and waits for the operator to manually change the tool and press "Cycle Start" to continue.
:::

| Parameter | Description |
|-----------|-------------|
| **`T<number>`** | The tool number to be loaded. For example, `T3` selects tool #3. |

#### Common Examples
* **Command a change to Tool #5:**  
  `T5 M6`

* **Simple manual tool change sequence:**  
  `M5` (Stop spindle)  
  `G53 G0 Z0` (Move Z to machine home)  
  `G53 G0 X0 Y0` (Move to front for access)  
  `T2 M6` (Select tool 2 and pause. A message "Change to tool 2" may appear in the GUI)

#### Tips & Tricks
- The `T` word only *selects* the tool. `M6` is the command that *executes* the change.
- The logic for the tool change process (both manual and automatic) is often defined in a system macro file (`M6.nc`) located on the controller's SD card or accessible by the sender. This allows for extensive customization of the tool change procedure.
- After a tool change, a `G43.1` command is typically used to apply the new tool's length offset.

---

## `M7`, `M8`, `M9` – Coolant Control

**Syntax:**  
> `M7` (mist coolant on)  
> `M8` (flood coolant on)  
> `M9` (all coolant off)  

These commands control the machine's coolant systems. In grblHAL, these are typically mapped to specific output pins which can control relays for pumps or solenoids.

:::info Context
- **`M7` (Mist Coolant On):** Activates the mist coolant output pin. This is intended for an air/oil mist system.
- **`M8` (Flood Coolant On):** Activates the flood coolant output pin. This is the primary coolant command for most machines.
- **`M9` (Coolant Off):** Deactivates *both* the mist (`M7`) and flood (`M8`) outputs.
:::

| Command | Mapped Output | Action |
|---------|---------------|--------|
| **`M7`** | Mist | On |
| **`M8`** | Flood | On |
| **`M9`** | Both | Off |

#### Common Examples
* **Turn on the flood coolant before a cutting move:**  
  `M8`  
  `G1 Z-5 F300`

* **Turn on both mist and flood (if the machine is equipped):**  
  `M7 M8`

* **Turn off all coolant at the end of the job:**  
  `G0 Z20`  
  `M9`

#### Tips & Tricks
- The specific physical pins used for coolant are defined in the driver board's configuration file.
- These outputs can be repurposed to control other accessories, like a vacuum clamp or an air blast, if coolant is not used.



---

## `M48`, `M49` – Override Control

**Syntax:**  
> `M48` (enable overrides)  
> `M49` (disable overrides)

Enables or disables the real-time feed rate, spindle speed, and rapid override switches. This allows the G-code program to enforce a specific speed or feed, preventing accidental changes by the operator.

:::info Context
- **`M48` (Enable Overrides):** Allows the physical override switches/dials and GUI sliders to function normally. This is the default state.
- **`M49` (Disable Overrides):** Ignores all override controls. The machine will run at 100% of the programmed feed, rapid, and spindle speeds.
:::

| Command | Override State |
|---------|----------------|
| **`M48`** | Enabled |
| **`M49`** | Disabled |

#### Example
* **Ensure a critical finishing pass is run at the exact programmed feed rate:**  
  `... (roughing passes with M48 active) ...`  
  `M49` (Disable overrides)  
  `G1 X100 F150` (This move will be exactly 150 units/min)  
  `... (finishing path) ...`  
  `M48` (Re-enable overrides for the next operation)

---

## `M62`, `M63`, `M64` and  `M65` – Synchronized and Asynchronous I/O

**Syntax:**  
> `M62 P-` (sync output on)  
> `M63 P-` (sync output off)  
> `M64 P-` (async output on)  
> `M65 P-` (async output off)  

These are advanced commands for controlling digital output pins, either synchronized with motion or immediately.

:::info Context
- **`P<n>`**: The digital output pin number to control.
- **`M62`/`M63` (Synchronized):** The output pin change is queued with motion commands. The pin will switch its state at the *exact moment* the next motion command begins. This is perfect for laser firing or triggering a camera.
- **`M64`/`M65` (Asynchronous):** The output pin change happens immediately when the command is read, without waiting for motion. This is for general-purpose I/O.
:::

| Command | Action | Timing |
|---------|--------|----------|
| **`M62 P<n>`** | Turn Output `n` ON | Synchronized with next motion |
| **`M63 P<n>`** | Turn Output `n` OFF | Synchronized with next motion |
| **`M64 P<n>`** | Turn Output `n` ON | Immediate |
| **`M65 P<n>`** | Turn Output `n` OFF | Immediate |

#### Synchronized Example (Laser Engraving)
* **Turn on the laser just as the cut starts, and turn it off just as it ends:**  
  `G0 X10 Y10` (Move to start position)  
  `M62 P1` (Queue "Laser ON" for output pin 1)  
  `G1 X20 F500` (Laser turns on at the start of this move)  
  `M63 P1` (Queue "Laser OFF")  
  `G0 X30` (Laser turns off at the start of this rapid move)

---

## `M99` – Return from Subprogram

**Syntax:**  
> `M99 <P->`

Marks the end of a subprogram and returns execution to the main program. This is used with `M98` (which is not a standard grblHAL command but often implemented by senders).

*This command is primarily for compatibility with G-code structures from other controllers. Its functionality in grblHAL depends heavily on the sender or workflow being used.*

---


## `M114` – Get Current Position

**Syntax:**  
> `M114`

Requests the controller to report its current position. This is often used by G-code senders and GUIs to synchronize their internal state with the machine's actual location.

:::info Context
- **Origin:** This command is widely used by 3D printing firmware and has been adopted by some plugins and senders in the grblHAL ecosystem (e.g., OpenPnP).
- The response format is typically a string sent back over the serial connection, such as `ok C: X:10.000 Y:20.000 Z:5.000`.
:::

#### Example
* **Sender requests a position update:**  
  `M114`

#### Tips & Tricks
- This command is functionally similar to sending a `?` character to grblHAL, which is the native way to request a status report. `M114` is provided for compatibility with software that expects it.

---

## `M115` – Get Firmware Information

**Syntax:**  
> `M115`

Requests the controller to report its firmware version and capabilities. This is another command used by host software to identify the controller it's communicating with.

:::info Context
- **Origin:** Also common in 3D printing firmware.
- The response is a string containing firmware details, such as the name, version, and supported features.
:::

#### Example
* **Host software identifying the controller on connection:**  
  `M115`

---

## `M220` – Set Feed Rate Override Percentage

**Syntax:**  
> `M220 S-`

Allows setting the feed rate override value programmatically from within G-code.

:::info Context
- **Origin:** Marlin firmware.
- This command provides a way to control the feed rate override slider/knob via code. `S` is typically used for the percentage value.
:::

| Parameter | Description |
|-----------|-------------|
| **`S<percent>`** | The feed rate override percentage (e.g., `S100` for 100%, `S50` for 50%). |

#### Example
* **Slow down the next section of a program to 50% of the programmed feed rate:**  
  `M220 S50`  
  `(G-code for a detailed or difficult section)`
  `M220 S100` (Return to 100% feed rate)

---

## `M280` – Set Servo Position

**Syntax:**  
> `M280 P- S-`

Commands a servo motor connected to a specific output pin to move to a given position. This is often used for controlling auxiliary machine components like tool probes, dust shoes, or material clamps.

:::info Context
- **Origin:** Marlin firmware.
- Requires a servo plugin to be active in grblHAL.
- The `P` word specifies the servo index (which pin it's connected to), and the `S` word specifies the position, typically in microseconds (e.g., 1000-2000µs) or degrees (0-180).
:::

| Parameter | Description |
|-----------|-------------|
| **`P<index>`** | The servo number/pin index to command. |
| **`S<position>`** | The target position for the servo. |

#### Example
* **Deploy a touch probe connected to servo #0:**  
  `M280 P0 S90` (Move servo 0 to the 90-degree position)

* **Stow the touch probe:**  
  `M280 P0 S0` (Move servo 0 back to the 0-degree position)

---

## `M400` – Finish Moves

**Syntax:**  
> `M400`

Waits for all moves in the planner buffer to complete before processing the next command. It is functionally similar to a `G4 P0` (zero-second dwell).

:::info Context
- **Origin:** Marlin / OpenPnP.
- This command ensures the machine is completely stationary before the next G-code line is executed. This is useful when an external action needs to happen at a precise location, like taking a picture for a computer vision system.
:::

#### Example
* **Move to a location, wait until stopped, then trigger an output:**  
  `G0 X50 Y50`  
  `M400` (Wait for the move to finish completely)  
  `M64 P1` (Immediately turn on output 1 to trigger a camera)

---

## Trinamic Stepper Driver M-Codes (`M122`, `M569`, `M906`, `M911-M914`)

If your grblHAL setup uses Trinamic stepper drivers (e.g., TMC2209, TMC2130, TMC5160), a set of specialized M-codes allow real-time configuration and diagnostics. These are similar to the Marlin firmware commands but tailored for grblHAL.

:::info Context
- Only available if Trinamic drivers are installed and supported by your grblHAL firmware.
- Changing driver parameters on the fly allows tuning for speed, torque, noise, and thermal behavior.
:::

---

### `M122` — Driver Diagnostic Report

**Purpose:** Reads and reports detailed status for each configured Trinamic driver.

**Syntax:**  
> `M122 [X<axis>] [S<silent>]`

**Parameters:**
- `X<axis>` — Optional. Limit report to specific axis (X, Y, Z, A, B, C).
- `S<0|1>` — Optional. Silent output (1 = minimal, 0 = full debug info).

**Example:**

`M122`

*Outputs:* Temperature, current settings, error flags, microstepping, driver mode.

---

### `M569` — Set Driver Mode (StealthChop / SpreadCycle)

**Purpose:** Switches stepper drivers between silent and high-torque modes.

**Syntax:**  
> `M569 S<0|1> [X<axes>] [I<interpolate>]`

**Parameters:**
- `S0` — StealthChop (silent mode)  
- `S1` — SpreadCycle (high torque)
- `X<axes>` — Target axes (e.g., `X Y Z`)  
- `I<0|1>` — Optional interpolation enable/disable (some drivers)

**Example:**

`M569 S1 X Y ; Set X and Y to high-torque mode`
`M569 S0 X Y ; Return X and Y to silent mode`



---

### `M906` — Set Motor Current

**Purpose:** Sets the RMS motor current for each axis.

**Syntax:**  
> `M906 [X<mA>] [Y<mA>] [Z<mA>] [A<mA>] [B<mA>] [C<mA>]`

**Parameters:**
- Axis values in milliamps (RMS)
- Only specified axes are updated

**Example:**

`M906 X800 Y800 Z1200 ; Set X/Y to 800mA, Z to 1200mA`
`M906 Z800 ; Reset Z to 800mA after heavy job`


---

### `M911-M914` — Advanced Driver Configuration

**Purpose:** Configure microstepping, hold current, and other driver-specific parameters.

**M911 — Configure StallGuard and CoolStep**  

**Syntax:**  
> `M911 X<value> Y<value> Z<value> A<value>`

*Sets thresholds for stall detection and load-based current adjustment.*

**M912 — Read StallGuard / load data**  

**Syntax:**  
> `M912 X Y Z A`

*Returns real-time load or stall info per axis.*

**M913 — Set dynamic current adjustment**  

**Syntax:**  
> `M913 X<hold%,run%> Y<hold%,run%> ...`

*Adjust holding vs running current.*

**M914 — Set microstepping interpolation**  

**Syntax:**  
> `M914 X<steps> Y<steps> Z<steps> ...`

*Example: `M914 X16 Y16` enables 16x interpolation for X/Y.*


---


## `M70`, `M71`, `M72`, `M73` – Modal State Save/Restore

**Syntax:**  
> `M70` (save state)  
> `M71` (invalidate state)  
> `M72` (restore state)  
> `M73` (save & auto-restore)  

These are powerful but advanced M-codes that allow the controller to save and restore its current modal state. This includes the active G-codes (like `G0`/`G1`, `G17`/`G18`, `G54`, `G90`/`G91`), feed rate, spindle speed, etc.

:::info Context
- These are part of the grblHAL core but are considered advanced features.
- They are extremely useful for writing "safe" subroutines or macros that can perform an action without permanently altering the machine's state from the main G-code program.
- **`M70` (Save Modal State):** Pushes the current modal state onto a memory stack.
- **`M71` (Invalidate Modal State):** Marks the saved state as invalid (less common).
- **`M72` (Restore Modal State):** Pops the last saved state from the memory stack, restoring the machine to exactly how it was before the `M70` call.
- **`M73` (Save and Auto-Restore):** A more advanced feature used for subprograms.
:::

#### Example: A Safe Probing Macro
Imagine you have a macro to find the center of a hole. This macro needs to use `G91` (incremental mode) and `G1` with a specific feed rate. However, the main program might be running in `G90` with a different feed rate. Using `M70`/`M72` ensures the macro doesn't mess up the main program's state.

* **Macro G-code (`find_center.nc`):**  
  `M70` (Save the state of the main program)

  `G91 G1 F100` (Switch to incremental, set a slow feed rate for probing)  
  `(G-code for probing in X and Y to find the center...)`

  `M72` (Restore the original state. The machine is now back in G90/G91, G54, etc., with its original feed rate)


---
