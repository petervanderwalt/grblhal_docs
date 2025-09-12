---
title: "Complete Settings Reference"
description: "A comprehensive list of all grblHAL settings, including core, driver, and plugin parameters."
---

# Complete Settings Reference

This page is a comprehensive reference for all known grblHAL settings. It is designed to be a single source of truth for configuration. Use the table of contents on the right to navigate to a specific section, or use your browser's search function (`Ctrl+F`) to find a specific setting.

---

## `$0` – Step Pulse Time

Controls the length of the step signal pulse (in microseconds) sent to all stepper drivers.  
If too short, drivers may **miss steps**. If too long, it can **limit maximum step rate**.

:::info Context
- Applies to **all axes**.  
- Works together with `$2` (Step Pulse Invert) and `$29` (Pulse Delay).  
- Adjust only if your drivers require longer pulses.
:::

| Value (µs) | Effect |
|------------|--------|
| **1–2**    | Typical for modern drivers (Trinamic, TB6600, Leadshine, etc.). |
| **3–5**    | Safer setting for slower opto-isolated inputs. |
| **10+**    | Rare, but sometimes required by old/slow external drivers. |

#### Common Examples
* **Modern Digital Drivers (default):**  
  `$0=2`

* **Opto-Isolated Drivers (slow input stage):**  
  `$0=5`

* **Debugging Missed Steps:**  
  `$0=10`

#### Tips & Tricks
- Always start **low** (e.g. 2 µs) and only increase if you see reliability issues.  
- A higher value reduces maximum achievable step frequency.  
- If `$29` (Pulse Delay) is used, the **effective pulse width** is `$0 + $29`.  

---

## `$1` – Step Idle Delay

Controls how long (in milliseconds) the stepper motors remain energized after motion stops.  
This affects whether motors **hold position** when idle or are allowed to release torque.

:::info Context
- Applies to **all axes**.  
- The delay starts counting **after the last motion command finishes**.  
- A value of `255` keeps steppers always enabled.  
:::

| Value (ms) | Effect |
|------------|--------|
| **0**      | Disable motors immediately when motion stops. |
| **1–254**  | Keep motors energized for the given time, then disable. |
| **255**    | Keep motors **always enabled** (no timeout). |

#### Common Examples
* **Power Saving, Light Machine:**  
  Release motors quickly to reduce heat.  
  `$1=25`

* **Medium Hold Needed:**  
  Keep motors on briefly to prevent drift, but still allow cooldown.  
  `$1=100`

* **Heavy Machines / Critical Position Hold:**  
  Always keep motors enabled to maintain position.  
  `$1=255`

#### Tips & Tricks
- For small hobby machines, a short delay can reduce **motor heat and power use**.  
- For heavy gantries or machines with **gravity-loaded axes (like Z)**, keeping motors **always on** (`255`) is safest.  
- If you notice motors “dropping” or losing zero when idle, increase this value.  

---

## `$2` – Step Pulse Invert (mask)

Controls the polarity of the **step pulses** for each axis.  
Some stepper drivers require the step signal to be inverted (active-low instead of active-high).  
This setting allows you to configure that per axis.

:::info Context
- Applies **individually per axis** (X, Y, Z, A, B, C).  
- Expressed as a **bitmask**: add together the axis values you want inverted.  
- Related settings:  
  - `$3` – Direction Invert (mask)  
  - `$4` – Invert Stepper Enable  
:::

| Axis | Bit Value | Description |
|------|-----------|-------------|
| X    | 1         | Invert X step pulse |
| Y    | 2         | Invert Y step pulse |
| Z    | 4         | Invert Z step pulse |
| A    | 8         | Invert A step pulse |
| B    | 16        | Invert B step pulse |
| C    | 32        | Invert C step pulse |

#### Common Examples
* **All normal (default):**  
  `$2=0`

* **Invert X only:**  
  `1` → `$2=1`

* **Invert X and Y:**  
  `1 + 2 = 3` → `$2=3`

* **Invert all six axes:**  
  `1+2+4+8+16+32 = 63` → `$2=63`

#### Tips & Tricks
- Only change this if your **drivers require inverted pulses**.  
- If motors don’t move even though steps are being sent, check this setting.  
- Do **not confuse** with `$3` (Direction Invert) — `$2` affects the **pulse signal polarity**, not movement direction.  

---

## `$3` – Direction Invert (mask)

Controls the polarity of the **direction signal** for each axis.  
If an axis moves in the opposite direction than expected, invert it here instead of rewiring the motor.

:::info Context
- Applies **individually per axis** (X, Y, Z, A, B, C).  
- Expressed as a **bitmask**: add together the axis values you want inverted.  
- Related settings:  
  - `$2` – Step Pulse Invert (mask)  
  - `$23` – Homing Direction Invert (mask)  
:::

| Axis | Bit Value | Description |
|------|-----------|-------------|
| X    | 1         | Invert X direction |
| Y    | 2         | Invert Y direction |
| Z    | 4         | Invert Z direction |
| A    | 8         | Invert A direction |
| B    | 16        | Invert B direction |
| C    | 32        | Invert C direction |

#### Common Examples
* **Default (no inversion):**  
  `$3=0`

* **Invert Y only:**  
  `2` → `$3=2`

* **Invert X and Z:**  
  `1 + 4 = 5` → `$3=5`

* **Invert all six axes:**  
  `1+2+4+8+16+32 = 63` → `$3=63`

#### Tips & Tricks
- If an axis jogs in the **wrong direction**, flip it here.  
- `$23` (Homing Direction Invert) is **separate** — `$3` affects **normal motion**, `$23` affects **homing only**.  
- Prefer changing this setting instead of swapping motor wires, so configs are **self-documented** and repeatable.  


---

## `$4` – Invert Stepper Enable (boolean/mask)

Controls the polarity of the **enable signal** for stepper drivers.  
Some drivers expect an **active-low** enable, while others expect **active-high**.  
This setting lets you match the signal to what your driver requires.

:::info Context
- In grblHAL, `$4` may be applied as a **mask per axis** (X, Y, Z, A, B, C).  
- Expressed as either:  
  - A **boolean** (classic behavior, all axes together).  
  - A **bitmask** (per-axis inversion, newer grblHAL builds).  
- Related settings:  
  - `$2` – Step Pulse Invert (mask)  
  - `$3` – Direction Invert (mask)  
:::

| Axis | Bit Value | Description |
|------|-----------|-------------|
| X    | 1         | Invert X enable signal |
| Y    | 2         | Invert Y enable signal |
| Z    | 4         | Invert Z enable signal |
| A    | 8         | Invert A enable signal |
| B    | 16        | Invert B enable signal |
| C    | 32        | Invert C enable signal |

#### Common Examples
* **Default (active-low, all axes same):**  
  `$4=0`

* **Invert all axes (active-high enable):**  
  `$4=255` (or `$4=63` if only 6 axes are defined)

* **Invert Z only:**  
  `4` → `$4=4`

#### Tips & Tricks
- If your motors **never engage** (drivers always disabled), try toggling this.  
- Some driver boards **share a single enable line** — in that case, all axes must match.  
- On multi-axis boards with **independent enables**, masking per axis can help if different driver types are used together.  

---

## `$5` – Invert Limit Inputs (mask)

Controls the polarity of the **limit switch inputs**.  
If your limit switches trigger in reverse (always “on” when idle, “off” when pressed), invert them here.

:::info Context
- Expressed as a **bitmask** (X, Y, Z, A, B, C).  
- Related to `$18` (Pull-up Disable Limit Inputs).  
:::

| Axis | Bit Value | Description |
|------|-----------|-------------|
| X    | 1         | Invert X limit input |
| Y    | 2         | Invert Y limit input |
| Z    | 4         | Invert Z limit input |
| A    | 8         | Invert A limit input |
| B    | 16        | Invert B limit input |
| C    | 32        | Invert C limit input |

#### Common Examples
* **Default (normally-open switches):**  
  `$5=0`

* **Normally-closed switches on all axes:**  
  `$5=63`

* **Invert Z only:**  
  `$5=4`

#### Tips & Tricks
- Normally-closed (NC) switches are safer (detect wire breaks).  
- Always test each axis with `$C` (Check Mode) before running a job.  
---

## `$6` – Invert Probe Input (boolean/mask)

Controls the polarity of the **probe input pin(s)**.  
If your probe shows **triggered when not connected**, invert it here.

:::info Context
- In most builds: `$6` is a simple **boolean** (0=normal, 1=invert).  
- In grblHAL builds with **multiple probes enabled**, `$6` becomes a **bitmask**: each probe input can be inverted independently.  
:::

### Single-Probe Mode (default)
| Value | Description |
|-------|-------------|
| **0** | Normal (active-high probe trigger) |
| **1** | Inverted (active-low probe trigger) |

### Multi-Probe Mode (bitmask)
| Probe | Bit Value | Description |
|-------|-----------|-------------|
| Probe 1 | 1   | Invert Probe 1 input |
| Probe 2 | 2   | Invert Probe 2 input |
| Probe 3 | 4   | Invert Probe 3 input |
| Probe 4 | 8   | Invert Probe 4 input |

#### Common Examples
* **Default wiring (NO probe):**  
  `$6=0`

* **NC probe, triggers “off” when idle:**  
  `$6=1`

* **Multiple probes, invert Probe 2 only:**  
  `2` → `$6=2`

* **Invert Probes 1 and 3:**  
  `1 + 4 = 5` → `$6=5`

#### Tips & Tricks
- If `$6` is wrong, probing will either **alarm immediately** or **never trigger**.  
- For safety, test with a continuity meter or status reports (`?`) before running a probing cycle.  
- Multi-probe configs are common in **toolsetter + touch plate** setups.  

---

## `$7` – Spindle PWM Behavior (implementation-dependent)

Defines special behavior for the **spindle PWM output**.  
Not all builds use `$7`; its function depends on the driver or plugin.

:::info Context
- May control whether spindle PWM starts at minimum duty, clamps, or scales differently.  
- Exact behavior is **driver/plugin-specific**.  
:::

#### Tips & Tricks
- Check your driver or plugin docs if `$7` is available.  
- If unused in your build, `$7` may not appear at all.  
---

## `$8` – Ganged Axes Direction Invert (mask)

Controls the polarity of the **secondary motor** in a ganged (dual-motor) axis.  
For example, on a dual-Y gantry machine, you may need one motor to spin in the opposite direction.

:::info Context
- Only applies if you have **ganged axes** (e.g., dual-Y or dual-Z).  
- Expressed as a bitmask like `$3`.  
:::

| Axis | Bit Value | Description |
|------|-----------|-------------|
| X    | 1         | Invert secondary X motor direction |
| Y    | 2         | Invert secondary Y motor direction |
| Z    | 4         | Invert secondary Z motor direction |
| A    | 8         | Invert secondary A motor direction |
| B    | 16        | Invert secondary B motor direction |
| C    | 32        | Invert secondary C motor direction |

#### Common Examples
* **Dual-Y axis, invert second Y motor:**  
  `$8=2`

* **Dual-Z gantry, invert second Z motor:**  
  `$8=4`

#### Tips & Tricks
- Always check squaring after changing this.  
- Combine with `$23` (Homing Direction Invert) for proper dual-axis homing.  
---

## `$9` – PWM Spindle Options (mask)

Configures extra options for the **PWM spindle output**.  
These options vary by build, but typically include enabling certain behaviors or safety features.

:::info Context
- Expressed as a **bitmask**.  
- Options are **driver/plugin-specific**, common flags include:  
  - Invert PWM output  
  - Enable spindle off clamp  
  - Allow “at speed” tolerance checks  
:::

#### Tips & Tricks
- Always check your board’s documentation for exact bit meanings.  
- Used in combination with `$30–$36` (spindle speed & PWM range).  

---

## `$10` – Status Report Options (mask)

Configures what information is included in the **real-time status reports** (`?` command).  
This allows you to customize what grblHAL streams back to the host.

:::info Context
- Expressed as a **bitmask**.  
- More flags may appear in grblHAL than in classic Grbl.  
- Frequent use: `$10=511` (full report) or a reduced set for performance.  
:::

| Bit | Value | Option |
|-----|-------|--------|
| 0   | 1     | Machine Position (MPos) |
| 1   | 2     | Work Position (WPos) |
| 2   | 4     | Planner buffer usage |
| 3   | 8     | RX buffer usage |
| 4   | 16    | Limit pin state |
| 5   | 32    | Work coordinate offset |
| 6   | 64    | Overriding feed, spindle, rapid |
| 7   | 128   | Probe pin state |
| 8   | 256   | Spindle speed |
| 9   | 512   | Accessory states (coolant, mist, etc.) |

#### Common Examples
* **Minimal (positions only):**  
  `$10=3` (MPos + WPos)

* **Classic Grbl behavior:**  
  `$10=255`

* **Full report (all flags):**  
  `$10=511`

#### Tips & Tricks
- More info = more **serial traffic**. Tune for your controller + sender.  
- If your GUI shows wrong or missing data, check `$10`.  
---

## `$11` – Junction Deviation

Controls the path blending tolerance when the toolpath changes direction.  
It affects **cornering speed** and **smoothness**.

:::info Context
- Units: millimeters.  
- Smaller values = more accurate corners, but slower.  
- Larger values = faster, smoother motion, but less accurate corners.  
:::

#### Common Examples
* **Standard CNC routing:**  
  `$11=0.01`

* **High precision machining:**  
  `$11=0.002`

* **Fast plasma/laser cutting:**  
  `$11=0.05`

#### Tips & Tricks
- This is an advanced tuning parameter — defaults are usually fine.  
- Lowering too much can cause **jerky motion** or stalls.  
---

## `$12` – Arc Tolerance

Defines the maximum error allowed when interpolating arcs (G2/G3).  
Smaller values = more precise arcs, but more segments.

:::info Context
- Units: millimeters.  
- Controls how finely arcs are broken into small line segments.  
:::

#### Common Examples
* **General CNC routing:**  
  `$12=0.002`

* **High-speed laser/plasma:**  
  `$12=0.01`

#### Tips & Tricks
- If arcs appear “choppy,” reduce `$12`.  
- Too low wastes CPU time on excessive segmentation.  
---

## `$13` – Report in Inches (boolean)

Switches between metric and imperial units in **status reports only**.  
Does **not** affect G-code commands.

:::info Context
- G-code units are set with `G20` (inches) and `G21` (mm).  
- `$13` affects only the report format to the host.  
:::

| Value | Effect |
|-------|--------|
| 0     | Reports in millimeters |
| 1     | Reports in inches |

#### Common Examples
* **Default (metric):**  
  `$13=0`

* **For imperial-based senders:**  
  `$13=1`

#### Tips & Tricks
- Leave at `0` unless your sender specifically requires inches.  
---

## `$14` – Invert Control Inputs (mask)

Controls polarity of **control inputs** (Cycle Start, Feed Hold, Reset, Safety Door).  
Useful if buttons are wired **normally closed (NC)** instead of **normally open (NO)**.

:::info Context
- Expressed as a **bitmask**:  
  - Bit 0 = Cycle Start  
  - Bit 1 = Feed Hold  
  - Bit 2 = Reset  
  - Bit 3 = Safety Door  
:::

#### Common Examples
* **Default (NO buttons):**  
  `$14=0`

* **All buttons wired NC:**  
  `$14=15`

* **Invert Feed Hold only:**  
  `$14=2`

#### Tips & Tricks
- Safer to use **NC buttons** → system detects broken wires.  
---

## `$15` – Invert Coolant Outputs (mask)

Inverts the logic of the **coolant outputs** (Flood, Mist).  
Some relays expect an active-low signal.

:::info Context
- Expressed as a **mask**:  
  - Bit 0 = Flood  
  - Bit 1 = Mist  
:::

#### Common Examples
* **Default (active-high relays):**  
  `$15=0`

* **Invert Flood only:**  
  `$15=1`

* **Invert Flood + Mist:**  
  `$15=3`

#### Tips & Tricks
- If coolant relays **toggle backwards**, change this instead of rewiring.  
---

## `$16` – Invert Spindle Outputs (mask)

Controls polarity of the **spindle control outputs** (PWM, enable, direction).  
Some spindle drivers expect inverted logic.

:::info Context
- Expressed as a **mask**:  
  - Bit 0 = Spindle Enable  
  - Bit 1 = Spindle Direction  
  - Bit 2 = Spindle PWM  
:::

#### Common Examples
* **Default:**  
  `$16=0`

* **Invert Spindle Enable only:**  
  `$16=1`

* **Invert all signals:**  
  `$16=7`

#### Tips & Tricks
- If the spindle **runs when it should stop**, check `$16`.  
- Combine with `$33–$36` for full PWM control tuning.  

---

---

## `$17` – Pull-up Disable Control Inputs (mask)
Disables the internal pull-up resistors on the control input pins (Cycle Start, Feed Hold, Reset).

:::info Context
- Most control buttons are simple switches that connect an input pin to Ground. For this to work, the pin needs a "pull-up" resistor to keep it at a high voltage when the button isn't pressed.
- Disabling this is only necessary if you have **external pull-up resistors** or are using **active drivers** for these inputs.
:::

| Bit | Value | Input |
|:---:|:-----:|:------|
| 0   | 1     | Cycle Start |
| 1   | 2     | Feed Hold |
| 2   | 4     | Reset |

#### Common Examples
*   **Default (Internal Pull-ups Enabled):**
    *   This is correct for 99% of setups.
    *   `$17=0`
*   **Disable Pull-up for Feed Hold Only:**
    *   You have an external circuit providing the signal for the Feed Hold pin.
    *   `$17=2`

##### Tips & Tricks
- If a control input seems "stuck" or doesn't respond, do **not** change this setting first. Check your wiring and the `$14` (Invert Control Inputs) setting.
- For most hobbyist setups, you should never need to change this from `0`.

---

## `$18` – Pull-up Disable Limit Inputs (mask)
Disables the internal pull-up resistors on the limit switch input pins.

:::info Context
- This works exactly like `$17`, but applies to the limit switch pins.
- It is extremely rare to disable this, as nearly all limit switches (NO or NC) rely on these internal pull-ups.
:::

| Bit | Value | Input |
|:---:|:-----:|:------|
| 0   | 1     | X-Limit |
| 1   | 2     | Y-Limit |
| 2   | 4     | Z-Limit |
| 3   | 8     | A-Limit |
| 4   | 16    | B-Limit |
| 5   | 32    | C-Limit |

#### Common Examples
*   **Default (Internal Pull-ups Enabled):**
    *   This is the correct setting for standard mechanical or optical limit switches.
    *   `$18=0`

##### Tips & Tricks
- Only disable this if your limit switches are part of an active circuit (e.g., a buffer board) that provides its own pull-ups.
- Disabling this with standard switches will cause the inputs to "float," leading to random limit triggers.

---

## `$19` – Pull-up Disable Probe Inputs (mask)
Disables the internal pull-up resistors on the probe input pins.

:::info Context
- This works exactly like `$17`, but applies to the probe inputs.
- You might disable this if you are using an optically-isolated probe or a powered probe interface that provides its own clean signal.
:::

| Bit | Value | Input |
|:---:|:-----:|:------|
| 0   | 1     | Primary Probe (PRB) |
| 1   | 2     | Toolsetter Probe (TLS) |

#### Common Examples
*   **Default (Internal Pull-ups Enabled):**
    *   Correct for simple touch plates and most common probes.
    *   `$19=0`
*   **Disable Pull-up for Primary Probe:**
    *   Your main probe has a powered interface board.
    *   `$19=1`

##### Tips & Tricks
- If your probe input seems noisy or unreliable, ensuring the pull-up is **enabled** (`$19=0`) is the first step.
- Disabling the pull-up for a passive switch/touch plate will make probing completely non-functional.

---

## `$20` – Soft Limits Enable (boolean)
Enables a safety feature that prevents the machine from moving beyond its configured travel limits.

:::info Context
- This is a **software** check. It monitors G-code commands and jogging to see if a move would exceed the axis travel defined in `$130` - `$135`.
- It is a critical feature for preventing crashes.
- It **requires a successful homing cycle** to know where the machine's boundaries are.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| No software travel limits are enforced. |
| 1     | Enabled | grblHAL will throw an error if a move exceeds the max travel for any axis. |

#### Common Examples
*   **Machine Not Yet Homed/Calibrated:**
    *   Keep soft limits off until homing is working perfectly.
    *   `$20=0`
*   **Production Use (Highly Recommended):**
    *   Enable soft limits for safe operation.
    *   `$20=1`

##### Tips & Tricks
- Always enable soft limits once your machine is properly configured. It's free insurance against typos in G-code or jogging mistakes.
- If you get a "soft limit" error, it means your G-code is trying to move outside the machine's work area defined by `$130`+.

---

## `$21` – Hard Limits Enable (boolean)
Enables a safety feature that uses the physical limit switches to stop the machine instantly in an emergency.

:::info Context
- This is a **hardware** check. If any limit switch is triggered *during* a move, grblHAL will immediately halt all axes and enter an alarm state.
- This is your last line of defense against a crash if soft limits fail or are not active.
- It requires physical switches to be wired to the limit input pins.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Limit switch triggers are ignored during motion. |
| 1     | Enabled | A limit switch trigger will cause an immediate alarm and stop. |

#### Common Examples
*   **No Limit Switches Installed:**
    *   You must keep this disabled.
    *   `$21=0`
*   **Production Use (Highly Recommended):**
    *   Enable hard limits for maximum safety.
    *   `$21=1`

##### Tips & Tricks
- Hard limits can sometimes be triggered by electrical noise. If you get false alarms, check the shielding on your limit switch wires and consider adding a small capacitor (e.g., 0.1uF) across the switch input pins.
- When hard limits are enabled, the switches are **only** active during motion. They are ignored when the machine is idle to prevent accidental alarms.

---

---

## `$22` – Homing Options (mask)
Configures the behavior of the homing cycle.

:::info Context
- This setting **enables and configures homing options only**.
- It does **not** control which axes are homed. That is managed by the Homing Pass settings, starting with `$43`.
- This is a **bitmask**: add together the values of the options you want to enable.
:::

| Value | Bit | Option Description |
| :--- | :--- | :--- |
| **1** | 0 | **Enable Homing Cycle:** This is the master switch. It must be enabled to allow the `$H` command to run. |
| **2** | 1 | **Enable Single Axis Homing Commands:** Allows using `G28.1`/`G30.1` on individual axes. |
| **4** | 2 | **Homing on Startup Required:** Forces the user to run a homing cycle before any G-code motion is allowed. A key safety feature. |
| **8** | 3 | **Set Machine Origin to 0:** After homing, sets the machine position at the switch trigger point to `0`. If disabled, it's set to the axis maximas |
| **16**| 4 | **Two Switches Share One Input:** Informs grblHAL that two homing switches are wired in parallel to a single input pin. |
| **32**| 5 | **Allow Manual Homing:** Enables manual homing commands. |
| **64**| 6 | **Override Locks:** Allows jogging motion even when the machine is in an alarm state that normally requires homing. |
| **256**| 8 | **Use Limit Switches:** Allows homing switches to also function as hard limit switches when the homing cycle is not active. |
| **512**| 9 | **Per-Axis Feedrates:** Allows using separate feed rates for each axis during homing. |
| **1024**| 10 | **Run Startup Scripts on Homing Complete:** If enabled, startup scripts will only execute after a successful homing cycle. |

#### Common Examples
*   **Simple Homing Enabled:**
    *   Enables the `$H` command and nothing else.
    *   `1` → `$22=1`
*   **Safe & Standard Homing:**
    *   A typical setup that requires homing on startup and uses the switches as limits for safety.
    *   `1` (Enable) + `4` (Homing Required) + `256` (Use Limits) → `$22=261`

##### Tips & Tricks
- Homing is one of the most important features to configure for a reliable machine.
- For a new machine, start with just `$22=1` and then add more options like `4` and `256` once you have confirmed the basic cycle works.

---

## `$23` – Homing Direction Invert (mask)
Controls the initial direction of movement for each axis during a homing cycle.

:::info Context
- This setting is **only** for the homing cycle (`$H`). It does not affect normal jogging or G-code motion.
- Use this if an axis moves **away** from its limit switch when you start the homing cycle.
- This is a **bitmask**: add together the values of the axes you want to invert.
:::

| Value | Axis | Description |
|:-----:|:-----|:------------|
| 1     | X    | Invert Homing Direction for X-Axis |
| 2     | Y    | Invert Homing Direction for Y-Axis |
| 4     | Z    | Invert Homing Direction for Z-Axis |
| 8     | A    | Invert Homing Direction for A-Axis |
| 16    | B    | Invert Homing Direction for B-Axis |
| 32    | C    | Invert Homing Direction for C-Axis |

#### Common Examples
*   **Default (All axes home towards positive):**
    *   `$23=0`
*   **Z-Axis Homes Up (Negative Direction):**
    *   Most common configuration. The Z-axis moves up towards its switch.
    *   `4` → `$23=4`
*   **X and Y Home Towards Negative:**
    *   Common for machines where the origin (0,0) is the front-left corner.
    *   `1` (X) + `2` (Y) → `$23=3`

##### Tips & Tricks
- Do not confuse this with `$3` (Direction Invert). `$3` flips the direction for **all** motion, while `$23` **only** flips it for the homing search.
- If an axis moves the correct way during jogging but the wrong way during homing, `$23` is the setting to change.

---

## `$24` – Homing Locate Rate (mm/min)
Sets the slower feed rate used to precisely locate the switch trigger point.

:::info Context
- After the initial fast search (`$25`) finds the switch, the machine backs off (`$27`) and then re-approaches slowly at this rate.
- A slower rate here results in a more accurate and repeatable machine zero position.
:::

| Value (mm/min) | Meaning | Description |
|:--------------:|:--------|:------------|
| 10-50          | Precise | Good for most machines, ensures a very accurate zero. |
| 50-100         | Faster  | A good compromise if homing cycles are too slow. |

#### Common Examples
*   **High-Precision Machine:**
    *   `$24=25`
*   **Standard Hobby CNC:**
    *   `$24=50`

##### Tips & Tricks
- This value should always be significantly slower than your `$25` search rate.
- If your homing position is inconsistent between cycles, try lowering this value.

---

## `$25` – Homing Search Rate (mm/min)
Sets the faster feed rate used to initially find the homing switches.

:::info Context
- This is the speed the machine moves at the start of the homing cycle (`$H`).
- Setting it too high can cause a crash if the switch fails, but setting it too low makes the homing cycle take a long time.
:::

| Value (mm/min) | Meaning | Description |
|:--------------:|:--------|:------------|
| 200-500        | Safe    | A conservative speed for initial setup. |
| 500-1500+      | Fast    | A typical speed for a well-tuned machine. |

#### Common Examples
*   **Initial Machine Setup:**
    *   `$25=400`
*   **Tuned Production Machine:**
    *   `$25=1000`

##### Tips & Tricks
- This rate should never be higher than the axis maximum rate (`$110` - `$115`). A value of 50-70% of the maximum rate is a good starting point.
- If the motor stalls during the homing search, this value is too high.

---

## `$26` – Homing Switch Debounce Delay (ms)
Sets a delay to filter electrical noise from the homing switches.

:::info Context
- Mechanical switches can "bounce" when they make contact, causing multiple rapid triggers. Electrical noise can also cause false triggers.
- This setting tells grblHAL to wait a few milliseconds to ensure the switch signal is stable before accepting it as a valid trigger.
:::

| Value (ms) | Meaning | Description |
|:----------:|:--------|:------------|
| 10-50      | Standard | Sufficient for most mechanical switches and setups with moderate noise. |
| 50-100     | High Noise | Use if you are getting false limit triggers in a noisy environment (e.g., near a plasma torch or VFD). |

#### Common Examples
*   **Standard Setup:**
    *   `$26=25`
*   **Noisy Environment:**
    *   `$26=75`

##### Tips & Tricks
- Setting this value too high will cause a small inaccuracy in the homed position, as the machine will travel slightly further before the trigger is registered.
- If homing fails randomly, increasing this value slightly is a good troubleshooting step.

---

## `$27` – Homing Pull-off Distance (mm)
Sets the distance each axis moves *away* from the limit switches after they have been triggered.

:::info Context
- This ensures that the switches are not left in a pressed state after the homing cycle completes.
- It defines the small gap between your machine's physical limit and the established Machine Zero (`Mpos:0`).
:::

| Value (mm) | Meaning | Description |
|:----------:|:--------|:------------|
| 1-3        | Typical | A small, safe distance that works for most machines. |
| 3-5+       | Large   | Useful for machines with less accurate switches to ensure they are fully released. |

#### Common Examples
*   **Standard CNC:**
    *   `$27=2.0`
*   **Machine with Roller Switches:**
    *   `$27=5.0`

##### Tips & Tricks
- This value must be large enough to fully release your mechanical switches.
- After homing, the machine position will be `MPos:-2.0` (or whatever value you set), which is correct. The switch itself is at Machine Zero.

---

## `$28` – G73 Retract Distance (mm)
Sets the retract distance for the `G73` high-speed peck drilling cycle.

:::info Context
- `G73` is a specific canned cycle for drilling where the drill bit makes small "pecks" to break chips, but only retracts a very small amount between each peck.
- This setting defines that small retract distance.
:::

| Value (mm) | Meaning | Description |
|:----------:|:--------|:------------|
| 0.5 - 2.0  | Typical | A small value to quickly break the chip without fully retracting from the hole. |

#### Common Examples
*   **Default for General Use:**
    *   `$28=1.0`

##### Tips & Tricks
- This is a specialized setting only used for `G73`. It does not affect standard `G81` or `G82` cycles.
- The full retract for other cycles is controlled by the `G98`/`G99` command in your G-code.

---

## `$29` – Pulse Delay (microseconds)
Adds an extra delay between the direction pin being set and the step pulse being sent.

:::info Context
- Some older or slower stepper drivers require a "setup time" — a brief pause after the direction is commanded before they can accept a step pulse.
- This setting provides that pause. For most modern drivers, it is not needed.
:::

| Value (µs) | Meaning | Description |
|:----------:|:--------|:------------|
| 0          | None    | Correct for nearly all modern drivers (Trinamic, TB6600, etc.). |
| 1-10       | Short Delay | May be required for some drivers with slow opto-isolators. |

#### Common Examples
*   **Modern Digital Drivers (Default):**
    *   `$29=0`

##### Tips & Tricks
- Only add a delay here if you are experiencing randomly missed steps on fast direction changes and have already ruled out mechanical issues and acceleration (`$12x`) being too high.
- This delay can slightly limit the maximum achievable step rate.

---

---

## `$30` – Maximum Spindle Speed (RPM)
Sets the spindle speed that corresponds to the maximum PWM output signal (100% duty cycle).

:::info Context
- This setting is the key to scaling your spindle speed. It links a G-code `S` value to the analog/PWM output.
- For example, if `$30=10000`, then an `S10000` command will result in 100% PWM, and an `S5000` command will result in 50% PWM.
- This works together with `$31` (Minimum Spindle Speed) and the PWM range (`$34`-`$36`).
:::

| Value (RPM) | Meaning | Description |
|:-----------:|:--------|:------------|
| 1 - 100000+ | Max RPM | The maximum rated speed of your spindle or the max speed your VFD is configured for. |

#### Common Examples
*   **10,000 RPM Spindle:**
    *   `$30=10000`
*   **24,000 RPM Spindle:**
    *   `$30=24000`
*   **Laser Engraver:**
    *   A common convention is to treat power as a percentage from 0-1000.
    *   `$30=1000` (Now `S500` means 50% power).

##### Tips & Tricks
- This value should match the `Max RPM` setting in your VFD or spindle controller for accurate speed control.
- If you command `S` values higher than `$30`, the PWM output will simply be clamped to 100%.

---

## `$31` – Minimum Spindle Speed (RPM)
Sets the minimum spindle speed that can be commanded.

:::info Context
- Many spindles, especially on VFDs, have a minimum speed below which they may stall or overheat. This setting prevents `S` commands from going below that safe limit.
- If a G-code command requests a speed lower than this value (but not zero), the PWM output will be set to the minimum value defined by `$35`.
- A value of `0` disables this feature.
:::

| Value (RPM) | Meaning | Description |
|:-----------:|:--------|:------------|
| 0           | Disabled| Allows any `S` command, including very low speeds. |
| 100 - 8000+ | Min RPM | The minimum safe operating speed of your spindle. |

#### Common Examples
*   **Laser Engraver (where S0 is valid):**
    *   `$31=0`
*   **VFD-controlled Spindle with 6000 RPM Min Speed:**
    *   `$31=6000`

##### Tips & Tricks
- This setting is crucial for preventing VFD faults or spindle stalls at low RPMs. Check your spindle's datasheet.
- If you use a router (like a Makita), which is not designed for low-speed operation, setting a minimum can prevent accidentally running it too slowly.

---

## `$32` – Laser Mode (boolean)
Enables or disables Laser Mode, which fundamentally changes motion control to suit laser cutting and engraving.

:::info Context
- This is one of the most important settings for laser users.
- When enabled, it eliminates spindle "spin-up" delays (`M3`/`M5`), allowing power to be changed instantly with motion.
- It also automatically adjusts laser power (`S` value) to compensate for feed rate overrides, ensuring consistent burn depth.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Standard CNC operation for spindles. Motion pauses for `M3`/`M5`. |
| 1     | Enabled | Optimized for lasers. Motion is continuous, and power scales with speed. |

#### Common Examples
*   **CNC Mill or Router:**
    *   `$32=0`
*   **Laser Engraver or Cutter:**
    *   `$32=1`

##### Tips & Tricks
- **Never** enable Laser Mode (`$32=1`) when using a physical spindle. The machine will not pause for the spindle to get up to speed, which is dangerous and will damage your workpiece and tools.
- When Laser Mode is on, use the `M4` (Dynamic Power) command in your G-code for the best engraving results.

---

## `$33` – Spindle PWM Frequency (Hz)
Sets the frequency of the PWM signal used for spindle speed control.

:::info Context
- The correct frequency depends entirely on what the receiving device (VFD, laser driver, spindle controller) expects.
- An incorrect frequency can lead to poor speed control, audible whining, or the controller not responding at all.
:::

| Value (Hz) | Common Use Case |
|:----------:|:----------------|
| ~1000      | Many laser diode drivers. |
| 5000       | Often recommended for VFD analog inputs (0-10V conversion). |
| 10000+     | Some CO2 laser power supplies. |

#### Common Examples
*   **Typical Hobby Laser Driver:**
    *   `$33=1000`
*   **Huanyang VFD (via PWM-to-Analog converter):**
    *   `$33=5000`

##### Tips & Tricks
- **Always** check the documentation for your specific VFD or laser driver. There is no "universal" correct value.
- If your spindle speed is erratic, this is one of the first settings to verify.

---

## `$34` – Spindle PWM Off Value
The raw PWM value (0-255) to be output when the spindle is off (`M5`).

:::info Context
- This value corresponds to 0% duty cycle, which should be `0` for almost all applications.
- In rare cases, a controller might need a slight offset to register as fully "off."
:::

| Value | Meaning |
|:-----:|:--------|
| 0     | 0% Duty Cycle. The output pin is held low. |

#### Common Examples
*   **Universal Default:**
    *   `$34=0`

##### Tips & Tricks
- You should not need to change this setting from `0`.

---

## `$35` – Spindle PWM Min Value
The raw PWM value (0-255) corresponding to the minimum spindle speed (`$31`).

:::info Context
- This sets the lower limit of the PWM duty cycle range.
- For example, if your VFD's 0-10V input doesn't start responding until it receives 1.2V, you would set this value to provide a 12% minimum duty cycle.
:::

| Value | Meaning |
|:-----:|:--------|
| 0-255 | The 8-bit PWM value for the minimum duty cycle (e.g., `25` is ~10%). |

#### Common Examples
*   **Full Range (0-100%):**
    *   Your controller has a linear response starting from 0.
    *   `$35=0`
*   **VFD Ignores Low Voltages:**
    *   Your spindle doesn't start until 15% power.
    *   15% of 255 is ~38.
    *   `$35=38`

##### Tips & Tricks
- This helps linearize the output for controllers that have a "dead zone" at the low end.
- To tune this, find the lowest `S` command that makes your spindle turn reliably, then adjust `$35` until that `S` value just starts to register.

---

## `$36` – Spindle PWM Max Value
The raw PWM value (0-255) corresponding to the maximum spindle speed (`$30`).

:::info Context
- This sets the upper limit of the PWM duty cycle range.
- For almost all applications, this should be `255` to allow for 100% power output.
- You might lower it if your spindle controller reaches its maximum input voltage *before* the PWM signal reaches 100% duty cycle.
:::

| Value | Meaning |
|:-----:|:--------|
| 0-255 | The 8-bit PWM value for the maximum duty cycle (e.g., `255` is 100%). |

#### Common Examples
*   **Universal Default:**
    *   Allows the full 0-100% duty cycle range.
    *   `$36=255`
*   **Limit Max Voltage:**
    *   Your 0-10V converter outputs 10V at 95% duty cycle.
    *   95% of 255 is ~242.
    *   `$36=242`

##### Tips & Tricks
- Unless you have a specific reason and have measured your controller's output, leave this at `255`.
- Incorrectly lowering this value will prevent you from ever reaching your spindle's maximum speed.

---

---

## `$37` – Steppers to Keep Enabled (mask)
Specifies which axes should ignore the `$1` idle delay and remain energized at all times.

:::info Context
- This is a grblHAL-specific feature that provides per-axis control over the motor idle state.
- It is useful for axes that must resist external forces even when idle (e.g., a Z-axis subject to gravity, or a heavy gantry).
- This is a **bitmask**: add together the values of the axes you want to keep permanently enabled.
:::

| Bit | Value | Axis to Keep Enabled |
|:---:|:-----:|:---------------------|
| 0   | 1     | X-Axis |
| 1   | 2     | Y-Axis |
| 2   | 4     | Z-Axis |
| 3   | 8     | A-Axis |
| 4   | 16    | B-Axis |
| 5   | 32    | C-Axis |

#### Common Examples
*   **Default (All axes use `$1` delay):**
    *   No axes are forced to stay on.
    *   `$37=0`
*   **Keep Z-Axis Enabled:**
    *   Prevents the Z-axis from dropping under gravity when idle. X and Y will disable as normal.
    *   `4` → `$37=4`
*   **Keep Z and a Heavy Rotary A-Axis Enabled:**
    *   `4` (Z) + `8` (A) → `$37=12`

##### Tips & Tricks
- This setting is an **override**. If `$1=255` (always enabled), this setting has no effect.
- Use this to save power and reduce motor heat on axes that don't need holding torque, while keeping critical axes locked.

---

## `$38` – Spindle Pulses Per Revolution (PPR)
Informs grblHAL how many pulses it will receive from a spindle encoder for one full revolution.

:::info Context
- This is an advanced feature required for **spindle-synchronized motion**, such as G33 rigid tapping and lathe threading.
- It does **not** control spindle speed; it provides high-resolution positional feedback of the spindle's rotation.
- It requires a physical encoder (often with A, B, and Index pulses) mounted to the spindle.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Spindle synchronization features are turned off. |
| 1-N   | PPR/CPR | The number of Pulses (or Counts) Per Revolution of your encoder. |

#### Common Examples
*   **Feature Disabled (Default):**
    *   `$38=0`
*   **Using a 1024-line Encoder:**
    *   `$38=1024`

##### Tips & Tricks
- This setting is the foundation for lathe functionality in grblHAL.
- Do not enable this unless you have a properly configured spindle encoder connected to the correct input pins on your controller.

---

## `$39` – Enable Legacy RT Commands (boolean)
Enables compatibility for older G-code senders that use legacy, single-byte real-time commands.

:::info Context
- Modern real-time commands are ASCII characters like `?`, `!`, `~`.
- Legacy commands were non-printable characters (e.g., `0x80` to `0x87`). Some older control programs may still send these.
- This setting is purely for backward compatibility.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Only modern ASCII real-time commands are accepted. |
| 1     | Enabled | Both modern and legacy single-byte commands are accepted. |

#### Common Examples
*   **Using a Modern Sender (ioSender, UGS, CNCjs):**
    *   `$39=0`
*   **Using an Old or Custom Sender:**
    *   If your sender fails to get status or control overrides, try enabling this.
    *   `$39=1`

##### Tips & Tricks
- For 99% of users with up-to-date software, this setting should be left disabled (`0`).
- Enabling this can sometimes cause issues if serial data corruption occurs, as a random byte might be misinterpreted as a legacy command.

---

## `$40` – Limit Jog Commands (boolean)
Prevents jogging moves from exceeding the machine's software travel limits (`$13x`).

:::info Context
- This is a safety feature that works in conjunction with Soft Limits (`$20`).
- It checks the target position of any manual jog command and will reject it if it would move beyond the machine's defined boundaries.
- It **requires a successful homing cycle** to be effective.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Jogging commands can be sent regardless of software limits. |
| 1     | Enabled | Jogging commands that would exceed the machine's workspace are blocked. |

#### Common Examples
*   **During Initial Setup (before homing works):**
    *   `$40=0`
*   **For Safe Operation (Recommended):**
    *   `$40=1`

##### Tips & Tricks
- It is highly recommended to enable this (`$40=1`) along with Soft Limits (`$20=1`) to prevent accidental crashes while jogging.
- If this is enabled but the machine has not been homed, it will have no effect.

---

## `$41` – Parking Cycle (mask)
Configures the behavior of the `G28.1` parking command, which moves the spindle to a predefined safe location.

:::info Context
- This is a grblHAL-specific feature for moving the machine to a convenient spot (e.g., for a tool change) with a single command.
- The destination coordinates are set by `$58`. This setting controls *how* the machine gets there.
- This is a **bitmask**: add together the values of the options you want to enable.
:::

| Bit | Value | Option |
|:---:|:-----:|:-------|
| 0   | 1     | Enable Parking Motion |
| 1   | 2     | Retract First |
| 2   | 4     | Move XY Axes First |
| 3   | 8     | On Hold |

#### Common Examples
*   **Simple Parking Enabled:**
    *   Moves all axes directly to the park position.
    *   `1` → `$41=1`
*   **Safe Parking (Retract Z First):**
    *   The Z-axis (or parking axis `$42`) first retracts, then the other axes move. This prevents dragging the tool across the workpiece.
    *   `1` (Enable) + `2` (Retract First) → `$41=3`

##### Tips & Tricks
- The "Retract First" option is the safest and most common way to use the parking motion.
- "Move XY Axes First" is an alternative for specialized machine kinematics.

---

## `$42` – Parking Axis
Selects the axis to be used for the initial "retract" move in a parking cycle.

:::info Context
- This setting only has an effect if the "Retract First" option (Bit 1) is enabled in `$41`.
- It defines which axis should be moved to its park position before the other axes begin to move.
:::

| Value | Axis to Retract First |
|:-----:|:----------------------|
| 0     | X-Axis |
| 1     | Y-Axis |
| 2     | Z-Axis |
| 3     | A-Axis |
| 4     | B-Axis |
| 5     | C-Axis |

#### Common Examples
*   **Standard CNC (Retract Z-axis up):**
    *   This lifts the tool clear of the workpiece before moving to the parking location.
    *   `$42=2`

##### Tips & Tricks
- For virtually all standard CNC mills and routers, this should be set to `2` to retract the Z-axis.
- Ensure the parking position for this axis in `$58` is a safe retract position.

---

## `$43` – Homing Passes
Defines how many distinct, sequential homing sequences (passes) to run during a full homing cycle (`$H`).

:::info Context
- This powerful grblHAL feature allows you to home different groups of axes in a specific order.
- It works with `$44` through `$49`, where each of those settings defines which axes move in a given pass.
- For example, you can ensure the Z-axis is fully retracted before the X and Y axes begin to home.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 1     | Single Pass | All axes defined in `$44` will home simultaneously. |
| 2     | Two Passes | Axes in `$44` home first, then axes in `$45` home second. |
| ...   | ...     | Up to 6 passes can be defined. |

#### Common Examples
*   **Simple 3-Axis (All at Once):**
    *   X, Y, and Z will all start moving at the same time.
    *   `$43=1` (and `$44=7` for X,Y,Z)
*   **Safe 3-Axis (Z First, then XY):**
    *   The Z-axis will home first. After it finishes, the X and Y axes will home together.
    *   `$43=2` (and `$44=4` for Z, `$45=3` for XY)

##### Tips & Tricks
- Homing Z first is the safest configuration for most machines, as it prevents the tool from dragging across clamps or the workpiece.
- When squaring a gantry with two switches, you might home both motors in one pass, then use a second pass to "back off" and re-approach the switches slowly for higher precision.

---

---

## `$44` – Axes Homing - Pass 1 (mask)
Defines which axes will move during the **first pass** of the homing cycle.

:::info Context
- This setting is used in conjunction with `$43` (Homing Passes).
- This is a **bitmask**: add together the values of the axes you want to home simultaneously in this pass.
- If `$43=1`, this is the only pass that will be executed.
:::

| Bit | Value | Axis to Home in Pass 1 |
|:---:|:-----:|:-----------------------|
| 0   | 1     | X-Axis |
| 1   | 2     | Y-Axis |
| 2   | 4     | Z-Axis |
| 3   | 8     | A-Axis |
| 4   | 16    | B-Axis |
| 5   | 32    | C-Axis |

#### Common Examples
*   **Simple 3-Axis (All at Once):**
    *   Set `$43=1`.
    *   `1` (X) + `2` (Y) + `4` (Z) → `$44=7`
*   **Safe 3-Axis (Z First, then XY):**
    *   Set `$43=2`. This pass will only home the Z-axis.
    *   `4` → `$44=4` (The XY axes will be defined in `$45`).

##### Tips & Tricks
- Plan your entire homing sequence before setting these values. Decide the safest order for your machine to find its home position.
- For a gantry with two motors and two switches (auto-squaring), you would typically home both at the same time. For a dual-Y setup, this would be `$44=2` (if Y is the only axis in this pass).

---

## `$45` – `$49` – Axes Homing - Pass 2 to 6 (mask)
Defines which axes will move during subsequent passes of the homing cycle.

:::info Context
- These settings work exactly like `$44`, but for the second, third, fourth, fifth, and sixth homing passes.
- A pass will only be executed if `$43` is set to a high enough number. For example, `$46` is only used if `$43` is `3` or greater.
:::

| Bit | Value | Axis to Home in this Pass |
|:---:|:-----:|:--------------------------|
| 0   | 1     | X-Axis |
| 1   | 2     | Y-Axis |
| 2   | 4     | Z-Axis |
| 3   | 8     | A-Axis |
| 4   | 16    | B-Axis |
| 5   | 32    | C-Axis |

#### Common Examples
*   **Safe 3-Axis (Z First, then XY):**
    *   Set `$43=2`, `$44=4`.
    *   This setting defines the second pass, where X and Y move together.
    *   `1` (X) + `2` (Y) → `$45=3`
*   **Three Separate Passes for X, Y, Z:**
    *   Set `$43=3`.
    *   `$44=1` (Home X first)
    *   `$45=2` (Home Y second)
    *   `$46=4` (Home Z third)

##### Tips & Tricks
- Using multiple passes is the key to creating a safe and reliable homing sequence for complex machines.
- You can use later passes to re-home an axis slowly for higher precision after the initial fast homing is complete.

---

## `$56` – Parking Pull-out Distance (mm)
Sets the distance for the initial pull-out move of a parking cycle.

:::info Context
- This setting is not commonly used. It provides an optional initial move before the main parking motion begins.
- Its behavior depends on the options configured in `$41`.
:::

| Value (mm) | Meaning |
|:----------:|:--------|
| 0.0 - N    | The distance for the pull-out move. |

#### Common Examples
*   **Default (Disabled):**
    *   `$56=0.0`

##### Tips & Tricks
- For most users, leaving this at `0` is recommended. The standard "Retract First" behavior configured in `$41` is more intuitive.

---

## `$57` – Parking Pull-out Rate (mm/min)
Sets the feed rate for the initial parking pull-out move (`$56`).

:::info Context
- This feed rate applies only to the initial pull-out move defined by `$56`.
- The main parking move uses the rates defined in `$58` and `$59`.
:::

| Value (mm/min) | Meaning |
|:--------------:|:--------|
| 1 - N          | The feed rate for the pull-out move. |

#### Common Examples
*   **Default:**
    *   `$57=600.0`

---

## `$58` – Parking Target
Sets the absolute machine coordinates for the parking position.

:::info Context
- This is the destination for the `G28.1` parking command.
- The coordinates are in **machine position** (G53), not work position.
- You must enter the coordinates for all axes supported by your controller, typically in `X,Y,Z,A,B,C` order.
:::

| Value Format | Description |
|:-------------|:------------|
| `X,Y,Z...`   | A comma-separated list of the target coordinates for each axis. |

#### Common Examples
*   **Park at Front-Left, Z-Axis Up on a 300x300x80 machine:**
    *   Assumes homing is at the back-right-top (X:300, Y:300, Z:0).
    *   Target is a safe position just inside the machine zero corner.
    *   `$58=-2.000,-2.000,-2.000` (assuming `$27` pull-off is 2mm, machine zero is at X=-2, Y=-2, Z=-2)
*   **Park at a Tool Change Position:**
    *   Move to the middle of the X-axis and all the way to the front for easy access.
    *   `$58=150.000,-2.000,-10.000`

##### Tips & Tricks
- To find the right coordinates, home the machine (`$H`), then manually jog to the position where you want it to park.
- Send a `?` command to see the `MPos` (Machine Position) values. Use those values for this setting.

---

## `$59` – Parking Fast Rate (mm/min)
Sets the feed rate for the main parking motion.

:::info Context
- This is the speed at which the machine moves to the parking target coordinates defined in `$58`.
- It acts like a G1 feed rate for the parking cycle.
:::

| Value (mm/min) | Meaning |
|:--------------:|:--------|
| 1 - N          | The feed rate for the main parking move. |

#### Common Examples
*   **A Safe, Moderate Speed:**
    *   `$59=1200.0`
*   **A Faster Speed for a Large Machine:**
    *   `$59=3000.0`

##### Tips & Tricks
- This value should not exceed the maximum rate of your slowest axis (`$110`+).
- This setting does **not** control the rapid (`G0`) rate for the parking cycle; some parking moves may use the machine's default rapid rate.

---

---

## `$60` – Restore Overrides (boolean)
Controls whether feed, rapid, and spindle overrides are restored to their previous values when a G-code program ends.

:::info Context
- Overrides allow you to adjust speeds and feeds in real-time (e.g., with a pendant or GUI slider).
- If this setting is enabled, the override values you set during a job will be remembered for the next job.
- If disabled, all overrides are reset to 100% (`M50 P0`) after a program (`M2`/`M30`) finishes.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Overrides are reset to 100% after each job. (Safer) |
| 1     | Enabled | Override values persist between jobs. (Convenient) |

#### Common Examples
*   **Safety First (Default):**
    *   Ensures every new job starts at the programmed feed and speed.
    *   `$60=0`
*   **Production Use with Consistent Setups:**
    *   Useful if you always run a certain material at 80% feed, for example.
    *   `$60=1`

##### Tips & Tricks
- For beginners, it is highly recommended to leave this disabled (`$60=0`) to avoid surprise-fast or surprise-slow movements at the start of a new job.
- If you find your jobs are always starting slower or faster than programmed, check if this setting has been enabled.

---

## `$61` – Safety Door Options (mask)
Configures the behavior of the safety door input pin.

:::info Context
- This is a safety feature that monitors a switch on the machine's enclosure door.
- It can be configured to either pause the job (Feed Hold) or immediately halt and retract (Door Open).
- This is a **bitmask**: add together the values of the options you want.
:::

| Bit | Value | Option | Description |
|:---:|:-----:|:-------|:------------|
| 0   | 1     | Enable Safety Door | Master switch to enable the feature. |
| 1   | 2     | Door Open Retract | When the door is opened, retract the Z-axis by the `$28` distance. |
| 2   | 4     | Abort on Open | Aborts the job completely instead of pausing. |
| 3   | 8     | On Hold | An additional option for behavior when in a hold state. |

#### Common Examples
*   **Pause Job When Door Opens (Default Safe Behavior):**
    *   When the door opens, the machine will decelerate to a stop (Feed Hold). It will resume when the door is closed and Cycle Start is pressed.
    *   `1` (Enable) → `$61=1`
*   **Pause and Retract Z-Axis:**
    *   When the door opens, the machine will stop and retract the Z-axis to prevent the tool from damaging the workpiece.
    *   `1` (Enable) + `2` (Retract) → `$61=3`

##### Tips & Tricks
- The "Pause and Retract" option (`$61=3`) is the most useful and safest configuration for most CNC machines.
- The door input pin must be configured in your board's compile-time options for this feature to be available.

---

## `$62` – Sleep Enable (boolean)
Enables the `SLP` command, which allows the controller to enter a low-power sleep state.

:::info Context
- This is an advanced power-saving feature.
- When the `SLP` command is received, grblHAL will shut down most peripherals and disable stepper motors.
- A reset or a specific wake-up signal is required to bring the controller back online.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| The `SLP` command is ignored. |
| 1     | Enabled | The `SLP` command will put the controller to sleep. |

#### Common Examples
*   **Default for most machines:**
    *   `$62=0`

##### Tips & Tricks
- This setting is rarely used in typical CNC applications.
- It is more relevant for custom machines or battery-powered applications where minimizing power consumption is critical.

---

## `$63` – Feed Hold Actions (mask)
Configures additional actions to be taken when a Feed Hold is initiated.

:::info Context
- A standard Feed Hold (`!`) smoothly decelerates motion and pauses the G-code program.
- This setting allows you to add extra actions, such as retracting the Z-axis or turning off the spindle, when a hold occurs.
- This is a **bitmask**: add together the values of the options you want.
:::

| Bit | Value | Action on Feed Hold |
|:---:|:-----:|:--------------------|
| 0   | 1     | Spindle Stop |
| 1   | 2     | Coolant Off |
| 2   | 4     | Z-Axis Retract |
| 3   | 8     | Park |

#### Common Examples
*   **Default (Pause Motion Only):**
    *   `$63=0`
*   **Pause and Stop Spindle:**
    *   A useful safety feature to stop the cutter from spinning while paused.
    *   `1` → `$63=1`
*   **Pause, Stop Spindle, and Retract Z:**
    *   Stops the spindle and lifts the tool away from the workpiece.
    *   `1` (Spindle) + `4` (Retract) → `$63=5`

##### Tips & Tricks
- The "Pause, Stop Spindle, and Retract Z" (`$63=5`) option is a very powerful feature for preventing the spinning tool from burning the material during a pause.
- When Cycle Start is pressed to resume, the spindle will be turned back on and the Z-axis will be lowered before motion continues.

---

## `$64` – Force Init Alarm (boolean)
Forces the controller to start up in an ALARM state.

:::info Context
- This is a safety feature that ensures the machine cannot be moved until the user explicitly clears the alarm.
- It is useful for machines where an immediate, uncommanded motion on startup could be dangerous.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Controller starts in an IDLE state, ready for commands. |
| 1     | Enabled | Controller starts in an ALARM state. An unlock command (`$X`) is required before any motion. |

#### Common Examples
*   **Default:**
    *   `$64=0`
*   **Safety-Critical Machine:**
    *   `$64=1`

##### Tips & Tricks
- This adds an extra layer of safety, requiring deliberate action from the operator before the machine can be moved.
- It is often used in combination with `$22` (Homing on Startup Required) to enforce a strict "unlock then home" workflow.

---

## `$65` – Probing Options (mask)
Configures advanced options for probing cycles (`G38.x`).

:::info Context
- This setting fine-tunes the behavior of probing operations.
- This is a **bitmask**: add together the values of the options you want.
:::

| Bit | Value | Option | Description |
|:---:|:-----:|:-------|:------------|
| 0   | 1     | Latch backoff | On G38.3, the retract move will be the same distance as the initial probing move. |
| 1   | 2     | On error | Determines the behavior when the probe fails to make contact. |
| 2   | 4     | Fast probe | Allows for a faster initial probing move. |

#### Common Examples
*   **Default Behavior:**
    *   `$65=0`

##### Tips & Tricks
- These are advanced settings for users who need to customize probing cycles for specific applications, such as high-speed probing or custom tool setters.
- For most users, the default setting is sufficient.

---


## `$65` – Probing Options (mask)
Configures advanced options for probing cycles (`G38.x`).

:::info Context
- This setting fine-tunes the behavior of probing operations.
- This is a **bitmask**: add together the values of the options you want.
:::

| Bit | Value | Option | Description |
|:---:|:-----:|:-------|:------------|
| 0   | 1     | Latch backoff | On G38.3, the retract move will be the same distance as the initial probing move. |
| 1   | 2     | On error | Determines the behavior when the probe fails to make contact. |
| 2   | 4     | Fast probe | Allows for a faster initial probing move. |

#### Common Examples
*   **Default Behavior:**
    *   `$65=0`

##### Tips & Tricks
- These are advanced settings for users who need to customize probing cycles for specific applications, such as high-speed probing or custom tool setters.
- For most users, the default setting is sufficient.

---

---

## `$100` – X-Axis Travel Resolution (steps/mm)
Defines the number of motor steps required to move the **X-axis** by exactly 1 millimeter.

:::info Context
- This is the most important setting for the dimensional accuracy of the X-axis.
- The value is calculated based on your specific motor, driver, and mechanical setup.
- It is related to `$110` (Max Rate) and `$120` (Acceleration), which control the motion dynamics of the axis.
:::

#### Calculation Formula
`steps_per_mm = (Motor Steps Per Revolution * Driver Microsteps) / Millimeters Per Revolution`

| Drive Type | `Millimeters Per Revolution` |
|:-----------|:-----------------------------|
| **Lead Screw** | Screw Pitch (e.g., 2mm pitch = 2) |
| **Multi-Start Screw** | Screw Pitch * Number of Starts (e.g., 2mm pitch, 4 starts = 8) |
| **Belt Drive** | Pulley Teeth * Belt Pitch (e.g., 20 teeth * 2mm GT2 pitch = 40) |

#### Common Examples
*   **Lead Screw (2mm pitch, 1.8° motor, 1/8 microstepping):**
    *   `steps_per_mm = (200 * 8) / 2` → `$100=800`
*   **Belt Drive (20T GT2 pulley, 1.8° motor, 1/16 microstepping):**
    *   `steps_per_mm = (200 * 16) / (20 * 2)` → `$100=80`

#### Tips & Tricks
- Always perform a calibration test after setting this value: command a long move (e.g., `G91 G1 X100 F500`), measure the actual distance moved, and adjust `$100` proportionally.
- See our detailed guide: [**Calibrating Steps per mm**](../Machine-Calibration/calibrating-steps).

---

## `$101` – Y-Axis Travel Resolution (steps/mm)
Defines the number of motor steps required to move the **Y-axis** by exactly 1 millimeter.

:::info Context
- This is the most important setting for the dimensional accuracy of the Y-axis.
- The value is calculated based on your specific motor, driver, and mechanical setup.
- It is related to `$111` (Max Rate) and `$121` (Acceleration), which control the motion dynamics of the axis.
:::

#### Calculation Formula
`steps_per_mm = (Motor Steps Per Revolution * Driver Microsteps) / Millimeters Per Revolution`

| Drive Type | `Millimeters Per Revolution` |
|:-----------|:-----------------------------|
| **Lead Screw** | Screw Pitch (e.g., 2mm pitch = 2) |
| **Multi-Start Screw** | Screw Pitch * Number of Starts (e.g., 2mm pitch, 4 starts = 8) |
| **Belt Drive** | Pulley Teeth * Belt Pitch (e.g., 20 teeth * 2mm GT2 pitch = 40) |

#### Common Examples
*   **Lead Screw (2mm pitch, 1.8° motor, 1/8 microstepping):**
    *   `steps_per_mm = (200 * 8) / 2` → `$101=800`
*   **Belt Drive (20T GT2 pulley, 1.8° motor, 1/16 microstepping):**
    *   `steps_per_mm = (200 * 16) / (20 * 2)` → `$101=80`

#### Tips & Tricks
- On many machines, the Y-axis mechanics are identical to the X-axis, so `$101` will be the same as `$100`.
- For gantry machines with dual Y-axis motors, this setting applies to both motors.

---

## `$102` – Z-Axis Travel Resolution (steps/mm)
Defines the number of motor steps required to move the **Z-axis** by exactly 1 millimeter.

:::info Context
- This is the most important setting for the dimensional accuracy of the Z-axis, affecting depth of cut and surface finish.
- The Z-axis often has different mechanical components (like a finer-pitch lead screw) than the X and Y axes.
- It is related to `$112` (Max Rate) and `$122` (Acceleration).
:::

#### Calculation Formula
`steps_per_mm = (Motor Steps Per Revolution * Driver Microsteps) / Millimeters Per Revolution`

| Drive Type | `Millimeters Per Revolution` |
|:-----------|:-----------------------------|
| **Lead Screw** | Screw Pitch (e.g., 2mm pitch = 2) |
| **Multi-Start Screw** | Screw Pitch * Number of Starts (e.g., 2mm pitch, 4 starts = 8) |

#### Common Examples
*   **T8 Lead Screw (4-start, 2mm pitch, 8mm lead):**
    *   `Millimeters Per Revolution` = 8mm
    *   With a 1.8° motor and 1/8 microstepping: `(200 * 8) / 8` → `$102=200`
*   **Fine-Pitch ACME Screw (2.5mm pitch, single-start):**
    *   `Millimeters Per Revolution` = 2.5mm
    *   With a 1.8° motor and 1/8 microstepping: `(200 * 8) / 2.5` → `$102=640`

#### Tips & Tricks
- The Z-axis is often the most critical for precision. Take extra care when calibrating this value.
- Because Z-axis screws are often finer, this value is frequently different from `$100` and `$101`.

---

## `$103` – A-Axis Travel Resolution (steps/deg)
Defines the number of motor steps required to move the **A-axis** (rotary) by exactly 1 degree.

:::info Context
- This setting is for a 4th or 5th axis.
- The calculation depends on the motor, microstepping, and any gear reduction between the motor and the rotary chuck.
- This axis must be enabled as "rotary" in `$376`.
:::

#### Calculation Formula
`steps_per_degree = (Motor Steps Per Revolution * Driver Microsteps * Gear Ratio) / 360`

#### Common Examples
*   **Direct Drive (1.8° motor, 1/8 microstepping):**
    *   `steps_per_degree = (200 * 8 * 1) / 360` → `$103=4.444`
*   **6:1 Gear Reduction (1.8° motor, 1/8 microstepping):**
    *   `steps_per_degree = (200 * 8 * 6) / 360` → `$103=26.667`

#### Tips & Tricks
- The `Gear Ratio` is `(driven_gear_teeth / drive_gear_teeth)`. For a 36-tooth gear on the chuck and a 6-tooth gear on the motor, the ratio is `36 / 6 = 6`.
- High-precision rotary axes often have high gear ratios (e.g., 90:1 harmonic drives).

---

---

## `$104` – B-Axis Travel Resolution (steps/deg)
Defines the number of motor steps required to move the **B-axis** (rotary) by exactly 1 degree.

:::info Context
- This setting is for a 5th axis that rotates around the Y-axis.
- The calculation depends on the motor, microstepping, and any gear reduction between the motor and the rotary table.
- This axis must be enabled as "rotary" in `$376`.
:::

#### Calculation Formula
`steps_per_degree = (Motor Steps Per Revolution * Driver Microsteps * Gear Ratio) / 360`

#### Common Examples
*   **Direct Drive (1.8° motor, 1/16 microstepping):**
    *   `steps_per_degree = (200 * 16 * 1) / 360` → `$104=8.889`
*   **10:1 Gear Reduction (1.8° motor, 1/16 microstepping):**
    *   `steps_per_degree = (200 * 16 * 10) / 360` → `$104=88.889`

#### Tips & Tricks
- The B-axis is less common than A or C, but the calculation principles are identical.
- Ensure your machine's kinematics are correctly configured if you are using a B-axis in a trunnion table setup.

---

## `$105` – C-Axis Travel Resolution (steps/deg)
Defines the number of motor steps required to move the **C-axis** (rotary) by exactly 1 degree.

:::info Context
- This setting is for a rotary axis that rotates around the Z-axis (like a rotary platter on a mill bed).
- The calculation depends on the motor, microstepping, and any gear reduction.
- This axis must be enabled as "rotary" in `$376`.
:::

#### Calculation Formula
`steps_per_degree = (Motor Steps Per Revolution * Driver Microsteps * Gear Ratio) / 360`

#### Common Examples
*   **Direct Drive (0.9° motor, 1/8 microstepping):**
    *   `steps_per_degree = (400 * 8 * 1) / 360` → `$105=8.889`
*   **72:1 Gear Reduction (1.8° motor, 1/8 microstepping):**
    *   `steps_per_degree = (200 * 8 * 72) / 360` → `$105=320`

#### Tips & Tricks
- A C-axis is common on 5-axis machines and CNC lathes (where it represents the spindle's angular position).
- For lathe threading (`G33`), this value must be extremely accurate.

---

## `$110` – X-Axis Maximum Rate (mm/min)
Sets the maximum speed at which the **X-axis** is allowed to move during a rapid (`G0`) or feed (`G1`) move.

:::info Context
- This acts as a hard speed limit for the X-axis motor to prevent it from stalling.
- The value should be determined through testing to find the highest reliable speed.
- This is related to `$120` (X-Axis Acceleration). A motor can reach a higher max rate if the acceleration is not too aggressive.
:::

| Value (mm/min) | Meaning |
|:--------------:|:--------|
| 500 - 2000     | Safe starting values for many screw-driven hobby machines. |
| 2000 - 10000+  | Typical for belt-driven or high-performance machines. |

#### Common Examples
*   **Hobby CNC Router:**
    *   `$110=5000`
*   **Large, Heavy Gantry:**
    *   `$110=8000`

#### Tips & Tricks
- To find the true maximum, start low and incrementally increase the value, commanding long rapid moves (e.g., `G0 X100`). Listen for the motor stalling (a loud buzzing/grinding sound), then back the value off by 20-30% for a safety margin.
- See our detailed guide: [**Tuning Motion**](../Machine-Calibration/tuning-motion).

---

## `$111` – Y-Axis Maximum Rate (mm/min)
Sets the maximum speed at which the **Y-axis** is allowed to move.

:::info Context
- This acts as a hard speed limit for the Y-axis motor to prevent it from stalling.
- On many machines, the Y-axis carries the gantry and may be heavier than the X-axis, potentially requiring a lower max rate.
- This is related to `$121` (Y-Axis Acceleration).
:::

| Value (mm/min) | Meaning |
|:--------------:|:--------|
| 500 - 2000     | Safe starting values for many screw-driven hobby machines. |
| 2000 - 10000+  | Typical for belt-driven or high-performance machines. |

#### Common Examples
*   **Hobby CNC Router (Y-axis carries gantry):**
    *   May be slightly lower than X.
    *   `$111=4500`
*   **Machine with Identical X/Y Mechanics:**
    *   `$111=5000` (same as `$110`)

#### Tips & Tricks
- The effective speed of a diagonal (`XY`) move is limited by the lower of the `$110` and `$111` settings.
- Test the Y-axis independently to find its true maximum reliable speed.

---

## `$112` – Z-Axis Maximum Rate (mm/min)
Sets the maximum speed at which the **Z-axis** is allowed to move.

:::info Context
- This acts as a hard speed limit for the Z-axis motor.
- The Z-axis often has a finer-pitch screw and must lift the weight of the spindle, so its max rate is usually **much lower** than the X and Y axes.
- This is related to `$122` (Z-Axis Acceleration).
:::

| Value (mm/min) | Meaning |
|:--------------:|:--------|
| 500 - 1500     | Typical for many lead-screw driven Z-axes. |
| 1500 - 3000+   | Possible for machines with powerful motors or counterbalance systems. |

#### Common Examples
*   **Standard Hobby CNC:**
    *   `$112=1000`
*   **Heavy Spindle:**
    *   `$112=800`

#### Tips & Tricks
- Setting this value too high is a common cause of lost Z-steps, leading to incorrect cutting depths. Be conservative with this setting.
- Test this by commanding rapid up-and-down moves (`G0 Z-10`, `G0 Z0`) over a long distance.

---

## `$113` – A-Axis Maximum Rate (deg/min)
Sets the maximum rotational speed at which the **A-axis** is allowed to move.

:::info Context
- This is the speed limit for your 4th axis, measured in degrees per minute.
- Setting this too high can cause the rotary motor to stall, especially with a heavy workpiece.
- This is related to `$123` (A-Axis Acceleration).
:::

| Value (deg/min) | Meaning |
|:---------------:|:--------|
| 1000 - 5000     | Typical for hobby-grade rotary axes. |
| 5000 - 20000+   | For high-performance rotary axes with strong motors and drivers. |

#### Common Examples
*   **Small Rotary Table:**
    *   3600 deg/min = 10 RPM.
    *   `$113=3600`
*   **Fast, Geared Rotary Axis:**
    *   `$113=10800` (30 RPM)

#### Tips & Tricks
- Remember that the surface speed of your workpiece increases with its diameter. A high rotational speed on a large-diameter part can be very fast!
- The linear feed rate in G-code (`F` word) is combined with this rotational speed in coordinated moves.

---

## `$114` – B-Axis Maximum Rate (deg/min)
Sets the maximum rotational speed at which the **B-axis** is allowed to move.

:::info Context
- This is the speed limit for your 5th axis (rotating around Y), measured in degrees per minute.
- This is related to `$124` (B-Axis Acceleration).
:::

#### Common Examples
*   **Trunnion Table B-Axis:**
    *   `$114=5400` (15 RPM)

---

## `$115` – C-Axis Maximum Rate (deg/min)
Sets the maximum rotational speed at which the **C-axis** is allowed to move.

:::info Context
- This is the speed limit for a rotary axis around Z, measured in degrees per minute.
- This is related to `$125` (C-Axis Acceleration).
:::

#### Common Examples
*   **Rotary Platter on a Mill:**
    *   `$115=7200` (20 RPM)

---


---

## `$120` – X-Axis Acceleration (mm/s²)
Sets how quickly the **X-axis** can change its speed.

:::info Context
- This is a critical setting for performance and reliability.
- Low acceleration is "soft" and reliable. High acceleration is "snappy" but requires much more motor torque.
- If set too high, the motor will lose steps (lose position) on direction changes or short, fast moves.
- Works together with `$110` (X-Axis Maximum Rate).
:::

| Value (mm/s²) | Meaning |
|:-------------:|:--------|
| 50 - 250      | Safe, conservative values for most machines. |
| 250 - 1000+   | For well-tuned, rigid machines with strong motors. |

#### Common Examples
*   **Heavy Gantry Machine:**
    *   Requires lower acceleration to manage inertia.
    *   `$120=150`
*   **Light, Rigid Machine:**
    *   Can handle much faster direction changes.
    *   `$120=500`

#### Tips & Tricks
- A "jerk test" is the best way to tune this. Command many short, rapid, back-and-forth moves (e.g., `G0 X1`, `G0 X0` in a loop). Increase acceleration until the motor stalls, then back the value off by 20-30% for a safety margin.
- See our detailed guide: [**Tuning Motion**](../Machine-Calibration/tuning-motion).

---

## `$121` – Y-Axis Acceleration (mm/s²)
Sets how quickly the **Y-axis** can change its speed.

:::info Context
- Affects performance and reliability for the Y-axis.
- On many machines, the Y-axis carries the gantry and has more mass than the X-axis, often requiring a lower acceleration value.
- Works together with `$111` (Y-Axis Maximum Rate).
:::

| Value (mm/s²) | Meaning |
|:-------------:|:--------|
| 50 - 250      | Safe, conservative values for most machines. |
| 250 - 1000+   | For well-tuned, rigid machines with strong motors. |

#### Common Examples
*   **Heavy Gantry Machine:**
    *   `$121=120` (Potentially lower than `$120`)
*   **Machine with Identical X/Y Mechanics:**
    *   `$121=500` (Same as `$120`)

#### Tips & Tricks
- Tune acceleration for each axis independently to find the optimal values for your specific machine's mechanics.

---

## `$122` – Z-Axis Acceleration (mm/s²)
Sets how quickly the **Z-axis** can change its speed.

:::info Context
- The Z-axis is often fighting gravity and carrying the weight of the spindle.
- For this reason, Z-axis acceleration is almost always set more conservatively (lower) than X and Y.
- Works together with `$112` (Z-Axis Maximum Rate).
:::

| Value (mm/s²) | Meaning |
|:-------------:|:--------|
| 50 - 150      | Typical for many hobbyist machines. |
| 150 - 500+    | For machines with powerful motors, brakes, or counterbalance systems. |

#### Common Examples
*   **Standard Hobby CNC with a heavy spindle:**
    *   `$122=100`
*   **Lightweight Z-axis (e.g., for a laser):**
    *   `$122=250`

#### Tips & Tricks
- Setting Z-acceleration too high is a primary cause of lost steps, leading to the Z-axis "drifting" up or down during a job and ruining cuts. Be conservative here.

---

## `$123` – A-Axis Acceleration (deg/s²)
Sets how quickly the **A-axis** (rotary) can change its rotational speed.

:::info Context
- High acceleration on a rotary axis can be very demanding on the motor, especially with a heavy or large-diameter workpiece which has high inertia.
- Works together with `$113` (A-Axis Maximum Rate).
:::

| Value (deg/s²) | Meaning |
|:--------------:|:--------|
| 100 - 500      | Safe values for most rotary setups. |
| 500 - 2000+    | For high-performance rotary axes. |

#### Common Examples
*   **Standard 4th-Axis Add-on:**
    *   `$123=300`

#### Tips & Tricks
- If your rotary axis stalls when doing rapid indexing (fast direction changes), your acceleration is likely too high.

---

## `$124` – B-Axis Acceleration (deg/s²)
Sets how quickly the **B-axis** (rotary) can change its rotational speed.

:::info Context
- Acceleration limit for a rotary axis that pivots around the Y-axis.
- Works together with `$114` (B-Axis Maximum Rate).
:::

---

## `$125` – C-Axis Acceleration (deg/s²)
Sets how quickly the **C-axis** (rotary) can change its rotational speed.

:::info Context
- Acceleration limit for a rotary axis that pivots around the Z-axis.
- Works together with `$115` (C-Axis Maximum Rate).
:::

---

## `$130` – X-Axis Maximum Travel (mm)
Defines the total travel distance for the **X-axis**.

:::info Context
- This value is the size of your machine's work envelope in the X direction.
- It is measured from the point where the homing switch triggers (`MPos:0`) to the opposite end of physical travel.
- This setting is **essential** for the **Soft Limits (`$20`)** feature to work.
:::

| Value (mm) | Description |
|:----------:|:------------|
| 1 - N      | The maximum travel distance of the axis. |

#### Common Examples
*   **Shapeoko 3 XXL:**
    *   `$130=850`

#### Tips & Tricks
- To set this accurately, home the machine (`$H`). Then, jog the X-axis to its furthest physical limit. The machine position (`MPos`) displayed is the value to enter for this setting.
- Always set this value slightly less than the absolute maximum physical travel to provide a safety margin.

---

## `$131` – Y-Axis Maximum Travel (mm)
Defines the total travel distance for the **Y-axis**.

:::info Context
- The size of your machine's work envelope in the Y direction.
- Measured from the homing switch trigger point.
- Essential for **Soft Limits (`$20`)**.
:::

| Value (mm) | Description |
|:----------:|:------------|
| 1 - N      | The maximum travel distance of the axis. |

#### Common Examples
*   **Shapeoko 3 XXL:**
    *   `$131=850`

---

## `$132` – Z-Axis Maximum Travel (mm)
Defines the total travel distance for the **Z-axis**.

:::info Context
- The size of your machine's work envelope in the Z direction.
- Measured from the homing switch trigger point.
- Essential for **Soft Limits (`$20`)**.
:::

| Value (mm) | Description |
|:----------:|:------------|
| 1 - N      | The maximum travel distance of the axis. |

#### Common Examples
*   **Shapeoko 3 XXL:**
    *   `$132=80`

#### Tips & Tricks
- The value is typically negative if you home the Z-axis at the top, since all motion from there is in the negative direction. For example, `$132=-80.000`.

---

## `$133` – A-Axis Maximum Travel (deg)
Defines the total travel distance for the **A-axis**.

:::info Context
- For a rotary axis that can rotate continuously, this value can be set to a very large number.
- For a rotary axis with limited travel, set this to the actual limit.
- Essential for **Soft Limits (`$20`)** on the A-axis.
:::

| Value (deg) | Description |
|:-----------:|:------------|
| 1 - N       | The maximum travel of the axis. |

#### Common Examples
*   **Continuously Rotating 4th Axis:**
    *   `$133=3600000.0` (Ten thousand full rotations)

---

## `$134` – B-Axis Maximum Travel (deg)
Defines the total travel distance for the **B-axis**.

:::info Context
- The travel limit for a rotary axis around Y.
- For a trunnion table that can only tilt from 0 to 110 degrees, this value would be 110.
- Essential for **Soft Limits (`$20`)**.
:::

---

## `$135` – C-Axis Maximum Travel (deg)
Defines the total travel distance for the **C-axis**.

:::info Context
- The travel limit for a rotary axis around Z.
- Essential for **Soft Limits (`$20`)**.
:::

---

## `$140` - `$142` – X, Y, Z-axis Motor Current
A placeholder setting for motor current on some drivers.

:::info Context
- In many modern grblHAL drivers (especially Trinamic), motor current is set via other, more specific settings (e.g., in the `$2xx` range).
- This setting is often a legacy placeholder or used by simpler driver implementations.
- The units are driver-dependent and may not be amps.
:::

#### Tips & Tricks
- For most users, this setting will have no effect. Check your board's documentation to see how motor current is configured.

---

## `$150` - `$152` – X, Y, Z-axis Microsteps
A placeholder setting for microstepping on some drivers.

:::info Context
- On most modern controller boards, microstepping is set via physical jumpers or DIP switches on the stepper driver itself.
- This software setting is only used by drivers that support programmable microstepping (like Trinamic drivers).
- Even with Trinamic drivers, this setting may be superseded by other, more advanced configuration methods.
:::

#### Tips & Tricks
- Always set the physical jumpers on your drivers first. Only change this setting if your board's documentation explicitly states it is used.
- Your Travel Resolution (`$100`-`$102`) must be updated if you change your microstepping.

---

## `$160` - `$163` – X, Y, Z, A-axis Backlash Compensation
Applies a small, extra move when an axis changes direction to compensate for mechanical backlash.

:::info Context
- Backlash causes dimensional inaccuracy, making circles oval and squares have misaligned corners.
- This is a **software fix** for a **mechanical problem**. The best solution is always to reduce mechanical backlash first with anti-backlash nuts or tight belts.
:::

| Value (mm) | Description |
|:----------:|:------------|
| 0.0 - N    | The measured amount of backlash in the axis. |

#### Common Examples
*   **Well-tuned machine:**
    *   `$160=0.0`
*   **Hobby machine with some lead screw wear:**
    *   `$160=0.05`

#### Tips & Tricks
- To measure backlash, use a dial indicator. Command a small move in one direction (`G91 G1 X1 F100`), zero the indicator, then command a move in the opposite direction (`X-1`). The amount the indicator *doesn't* move is your backlash value.

---

## `$170` - `$173` – X, Y, Z, A-axis Dual-axis Offset
An advanced setting for adjusting the offset in a dual-motor (ganged) setup after homing.

:::info Context
- Used with auto-squaring gantries that use two homing switches.
- After the initial homing finds both switches, this value applies a tiny electronic offset to correct for minor physical misalignment of the switches, ensuring perfect squareness.
:::

| Value (mm) | Description |
|:----------:|:------------|
| -N to +N   | The small offset to apply to the slave motor after homing. |

#### Tips & Tricks
- This is an advanced setting. For most users, ensuring the homing switches are physically aligned is the primary method of squaring the gantry.

---


---

## `$200` – X StallGuard2 Fast Threshold (TMC)
Sets the sensitivity of StallGuard for the **X-axis** during the initial, fast-moving phase of a sensorless homing cycle.

:::info Context
- This is a core setting for **X-axis sensorless homing**, allowing the driver to detect a motor stall against a physical end-stop.
- This sensitivity value is used during the `$25` (Homing Search Rate) move.
- A **lower value is more sensitive**. A value of `0` disables stall detection.
- Works in conjunction with `$220` (slow threshold) and `$339` (enable mask).
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Stall detection is off for the fast move. |
| 1-127 | Sensitivity | A lower value makes the driver more sensitive to stalls. A higher value requires a harder stall to trigger. |

#### Common Examples
*   **Default Starting Point:**
    *   A moderately high value to prevent false triggers from normal acceleration.
    *   `$200=100`
*   **Lighter Machine / More Sensitive:**
    *   For a machine where the stall force is very light.
    *   `$200=40`

#### Tips & Tricks
- To tune this, start with a high value (e.g., 100) and lower it in steps of 10 until the axis reliably triggers on a stall but does not trigger during the initial acceleration phase of the homing move.
- This setting is highly dependent on the motor, voltage, and mechanics of your X-axis.

---

## `$201` – Y StallGuard2 Fast Threshold (TMC)
Sets the sensitivity of StallGuard for the **Y-axis** during the initial, fast-moving phase of a sensorless homing cycle.

:::info Context
- This is a core setting for **Y-axis sensorless homing**, allowing the driver to detect a motor stall against a physical end-stop.
- This sensitivity value is used during the `$25` (Homing Search Rate) move.
- A **lower value is more sensitive**. A value of `0` disables stall detection.
- Works in conjunction with `$221` (slow threshold) and `$339` (enable mask).
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Stall detection is off for the fast move. |
| 1-127 | Sensitivity | A lower value makes the driver more sensitive to stalls. A higher value requires a harder stall to trigger. |

#### Common Examples
*   **Heavy Gantry (less sensitive):**
    *   A gantry with high inertia may require a higher value to avoid false triggers.
    *   `$201=110`
*   **Light Gantry / More Sensitive:**
    *   `$201=50`

#### Tips & Tricks
- Since the Y-axis often carries more mass (the gantry), this value may need to be different from the X-axis (`$200`).
- Tune this by commanding Y-axis homing moves and observing the reliability of the stall trigger.

---

## `$202` – Z StallGuard2 Fast Threshold (TMC)
Sets the sensitivity of StallGuard for the **Z-axis** during the initial, fast-moving phase of a sensorless homing cycle.

:::info Context
- This is a core setting for **Z-axis sensorless homing**.
- This sensitivity value is used during the `$25` (Homing Search Rate) move.
- A **lower value is more sensitive**. A value of `0` disables stall detection.
- Works in conjunction with `$222` (slow threshold) and `$339` (enable mask).
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Stall detection is off for the fast move. |
| 1-127 | Sensitivity | A lower value makes the driver more sensitive to stalls. A higher value requires a harder stall to trigger. |

#### Common Examples
*   **Standard Z-Axis:**
    *   `$202=100`

#### Tips & Tricks
- Sensorless homing on a lead-screw-driven Z-axis can be less reliable than on a belt-driven X/Y axis due to screw friction. It may require careful tuning.
- Be cautious when testing to prevent a crash if the stall is not detected.

---

## `$210` – X Hold Current (TMC)
Sets the percentage of the full running current that the **X-axis** driver will supply to the motor when it is idle.

:::info Context
- This is a Trinamic-specific power-saving and heat-reduction feature. It works with the `$1` (Step Idle Delay).
- After the idle delay expires, the driver will reduce the motor current to this percentage.
- `0%` is the minimum, `100%` means no current reduction.
:::

| Value (%) | Meaning | Description |
|:---------:|:--------|:------------|
| 0 - 100   | Percent | The percentage of running current to use for holding torque. |

#### Common Examples
*   **Aggressive Power Saving:**
    *   Reduces heat significantly but has very low holding torque.
    *   `$210=25`
*   **Balanced Hold and Heat (Recommended Start):**
    *   A good compromise for most axes.
    *   `$210=50`

#### Tips & Tricks
- This is a fantastic feature for reducing motor temperature on long jobs.
- If you notice the X-axis drifting or being easily moved by hand when idle, increase this value.

---

## `$211` – Y Hold Current (TMC)
Sets the percentage of the full running current that the **Y-axis** driver will supply to the motor when it is idle.

:::info Context
- This is a Trinamic-specific power-saving and heat-reduction feature. It works with the `$1` (Step Idle Delay).
- After the idle delay expires, the driver will reduce the motor current to this percentage.
- `0%` is the minimum, `100%` means no current reduction.
:::

| Value (%) | Meaning | Description |
|:---------:|:--------|:------------|
| 0 - 100   | Percent | The percentage of running current to use for holding torque. |

#### Common Examples
*   **Balanced Hold and Heat (Recommended Start):**
    *   A good compromise for most axes.
    *   `$211=50`
*   **Heavy Gantry:**
    *   May require more holding torque to prevent shifting.
    *   `$211=65`

#### Tips & Tricks
- If your Y-gantry is heavy, you may want a slightly higher hold current than the X-axis to ensure it stays put.

---

## `$212` – Z Hold Current (TMC)
Sets the percentage of the full running current that the **Z-axis** driver will supply to the motor when it is idle.

:::info Context
- This is a Trinamic-specific power-saving and heat-reduction feature. It works with the `$1` (Step Idle Delay).
- Crucial for Z-axes that are subject to gravity.
:::

| Value (%) | Meaning | Description |
|:---------:|:--------|:------------|
| 0 - 100   | Percent | The percentage of running current to use for holding torque. |

#### Common Examples
*   **Strong Hold for a Heavy Spindle:**
    *   Keeps most of the holding torque to prevent the Z-axis from dropping.
    *   `$212=80`
*   **Using `$37` Instead:**
    *   An alternative is to set `$37=4` to keep the Z-axis always at 100% power, and leave `$212` at a lower value.

#### Tips & Tricks
- If your Z-axis drops when idle, the first thing to try is increasing this value. If that is not sufficient, use `$37=4` to keep it fully powered.

---

## `$220` – X StallGuard2 Slow Threshold (TMC)
Sets the sensitivity of StallGuard for the **X-axis** during the second, slower phase of a sensorless homing cycle.

:::info Context
- After the initial fast search, the machine backs off and re-approaches the end-stop at the `$24` (Homing Locate Rate).
- This setting defines the StallGuard sensitivity for that slow, precise move, allowing for more accurate homing.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Stall detection is off for this phase. |
| 1-127 | Sensitivity | A lower value makes the driver more sensitive to stalls. |

#### Common Examples
*   **Precise Homing:**
    *   Often set to be more sensitive (lower) than the fast threshold, as there is less risk of false triggers from acceleration.
    *   `$220=30`

#### Tips & Tricks
- Tuning this value is key to repeatable sensorless homing. It should be as sensitive as possible without triggering before the axis makes firm contact with the end-stop.
- This value is almost always different from the fast threshold (`$200`).

---

## `$221` – Y StallGuard2 Slow Threshold (TMC)
Sets the sensitivity of StallGuard for the **Y-axis** during the second, slower phase of a sensorless homing cycle.

:::info Context
- Defines the StallGuard sensitivity for the slow, precise move on the Y-axis.
- Used with `$24` (Homing Locate Rate).
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Stall detection is off for this phase. |
| 1-127 | Sensitivity | A lower value makes the driver more sensitive to stalls. |

#### Common Examples
*   **Precise Homing:**
    *   `$221=35` (May be different from X due to gantry mass)

#### Tips & Tricks
- The ideal sensitivity can be affected by the mass of the axis. Tune this independently from the X-axis for best results.

---

## `$222` – Z StallGuard2 Slow Threshold (TMC)
Sets the sensitivity of StallGuard for the **Z-axis** during the second, slower phase of a sensorless homing cycle.

:::info Context
- Defines the StallGuard sensitivity for the slow, precise move on the Z-axis.
- Used with `$24` (Homing Locate Rate).
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Stall detection is off for this phase. |
| 1-127 | Sensitivity | A lower value makes the driver more sensitive to stalls. |

#### Common Examples
*   **Precise Homing:**
    *   `$222=40`

#### Tips & Tricks
- Due to the nature of lead screws, finding a reliable slow stall sensitivity on the Z-axis may require more experimentation than for belt-driven axes.

---

---

## `$300` – Hostname
Sets the machine's name on the network.

:::info Context
- This is the name your controller will announce on the network.
- It can be used to connect via mDNS (e.g., `grblHAL.local`) if your network supports it.
- It also helps identify the device in your router's client list.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| A string of characters. |

#### Common Examples
*   **Default Hostname:**
    *   `$300=grblHAL`
*   **Custom Hostname for a specific machine:**
    *   `$300=MyMill`

#### Tips & Tricks
- For maximum compatibility, use a simple name without spaces or special characters.
- A reboot of the controller is often required for a new hostname to be broadcast on the network.

---

## `$301` – IP Mode
Selects the method the controller uses to obtain an IP address.

:::info Context
- This is the master switch for network configuration.
- **DHCP** is the standard for most networks, where your router automatically assigns an address.
- **Static** is for networks without a router or when you need a permanent, predictable address.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Static | You must manually set the IP (`$302`), Gateway (`$303`), and Netmask (`$304`). |
| -1    | DHCP   | The controller asks your router for an IP address. (Recommended) |
| -2    | AutoIP | A fallback where the controller picks a random address if DHCP fails. |

#### Common Examples
*   **Home/Office Network with a Router:**
    *   This is the easiest and most reliable option.
    *   `$301=-1`
*   **Direct Connection to a PC (no router):**
    *   You must assign a permanent, non-conflicting address.
    *   `$301=0`

#### Tips & Tricks
- Always use DHCP (`-1`) unless you have a specific reason not to.
- If you select Static mode, you are responsible for providing correct and non-conflicting network information in the following settings.

---

## `$302` – IP Address
Manually sets the static IP address for the controller.

:::info Context
- This setting is **only** used if `$301=0` (Static IP Mode).
- The IP address must be unique on your network.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| The IP address in dot-decimal notation, e.g., "192.168.1.200". |

#### Common Examples
*   **Typical Static IP on a Home Network:**
    *   Make sure this address is outside your router's DHCP assignment range.
    *   `$302=192.168.1.200`

#### Tips & Tricks
- If you set an IP that is already in use by another device, you will have an "IP conflict" and neither device may work correctly.
- The IP address must be in the same subnet as the Gateway and your computer (as defined by the Netmask).

---

## `$303` – Gateway
Manually sets the Gateway (router) IP address.

:::info Context
- This setting is **only** used if `$301=0` (Static IP Mode).
- The Gateway is the address of the device that connects your local network to the internet (usually your router).
- It is required for features like NTP time synchronization to work.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| Your router's IP address, e.g., "192.168.1.1". |

#### Common Examples
*   **Typical Home Router Address:**
    *   `$303=192.168.1.1`

#### Tips & Tricks
- If you can't connect to your controller from another network segment or if NTP fails, an incorrect Gateway address is a likely cause.

---

## `$304` – Netmask
Manually sets the Subnet Mask for the controller.

:::info Context
- This setting is **only** used if `$301=0` (Static IP Mode).
- The Netmask defines the size of your local network.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| The Subnet Mask, e.g., "255.255.255.0". |

#### Common Examples
*   **Standard Home/Office Network:**
    *   This value is correct for the vast majority of local networks.
    *   `$304=255.255.255.0`

#### Tips & Tricks
- An incorrect Netmask can prevent the controller from communicating with other devices, even on the local network. When in doubt, use DHCP (`$301=-1`).

---

## `$305` – Telnet Port
Configures the network port for the Telnet service.

:::info Context
- The Telnet service provides a raw, text-based data stream to and from the grblHAL controller.
- It is used by some G-code senders and for direct, low-level communication.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| Port #| A valid TCP port number. |

#### Common Examples
*   **Default Telnet Port:**
    *   `$305=23`

#### Tips & Tricks
- Do not change this port unless you have a specific reason, such as a port conflict on your network or a security requirement.
- You will need this port number to configure your G-code sender if it uses Telnet.

---

## `$306` – HTTP Port
Configures the network port for the HTTP service.

:::info Context
- This setting is largely historical/reserved.
- Modern web interfaces for grblHAL typically use the WebSocket service (`$307`) for communication.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| Port #| A valid TCP port number. |

#### Common Examples
*   **Default HTTP Port:**
    *   `$306=80`

---

## `$307` – WebSocket Port
Configures the network port for the WebSocket service.

:::info Context
- The WebSocket service provides a fast, modern, and efficient way for web-based user interfaces (like the ioSender WebUI) to communicate with the controller.
- This is the key service for most modern network-based G-code senders.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| Port #| A valid TCP port number. |

#### Common Examples
*   **Default WebSocket Port:**
    *   `$307=81`

#### Tips & Tricks
- This port is often used for the WebUI. For example, you might connect by typing `http://<your-ip>:81` into a browser.
- If you cannot connect with a web-based sender, ensure this port is not being blocked by a firewall.

---

## `$308` – FTP Port
Configures the network port for the FTP (File Transfer Protocol) service.

:::info Context
- The FTP service allows you to transfer G-code files to and from the controller's SD card over the network.
- This is extremely convenient for sending job files to the machine without needing to physically move the SD card.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| Port #| A valid TCP port number. |

#### Common Examples
*   **Default FTP Port:**
    *   `$308=21`

#### Tips & Tricks
- Use a standard FTP client application (like FileZilla or WinSCP) to connect to the controller's IP address on this port.
- You will need the `admin` or `user` credentials (`$330`, `$331`) to log in.

---

---

## `$330` – Admin Password
Sets the password for the `admin` account.

:::info Context
- The `admin` account has full privileges, including uploading/deleting files via FTP and changing settings.
- This password is required for secure network services.
- For security, the password is not displayed when you list settings with `$$`; it will show as `(masked)`.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| The password. |

#### Common Examples
*   **Set a new admin password:**
    *   `$330=MySecurePassword123`
*   **Clear the password:**
    *   `$330=` (with no value after the equals sign)

#### Tips & Tricks
- It is highly recommended to set a secure `admin` password if your machine is on a shared or untrusted network.
- The default password may be blank or a simple value like `admin`.

---

## `$331` – User Password
Sets the password for the `user` account.

:::info Context
- The `user` account may have restricted privileges compared to the `admin` account (e.g., read-only access).
- This is useful for providing limited access to the machine's network services.
- This password is also masked when listing settings.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| The password. |

#### Common Examples
*   **Set a new user password:**
    *   `$331=Guest123`

---

## `$332` – NTP Server URI 1
Sets the address of the primary Network Time Protocol (NTP) server.

:::info Context
- NTP is an internet protocol used to automatically synchronize the controller's internal clock.
- An accurate clock is useful for timestamping files on an SD card.
- This setting provides the address of the primary time server to contact.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| URI   | The address of an NTP server. |

#### Common Examples
*   **Use the public NTP pool (recommended):**
    *   This is a resilient, distributed time source.
    *   `$332=pool.ntp.org`

#### Tips & Tricks
- The controller must have a valid internet connection (Gateway `$303` and DNS) for NTP to work.
- `$333` and `$334` can be used to specify secondary and tertiary backup NTP servers.

---

## `$333` – NTP Server URI 2
Sets the address of the secondary (backup) Network Time Protocol (NTP) server.

:::info Context
- If the primary NTP server (`$332`) is unreachable, the controller will try to contact this server instead.
- This provides redundancy for the time-syncing feature.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| URI   | The address of an NTP server. |

#### Common Examples
*   **Use a government time server as a backup:**
    *   `$333=time.nist.gov`

---

## `$334` – NTP Server URI 3
Sets the address of the tertiary (backup) Network Time Protocol (NTP) server.

:::info Context
- If both the primary (`$332`) and secondary (`$333`) NTP servers are unreachable, the controller will try this server.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| URI   | The address of an NTP server. |

---

## `$335` – Timezone / Timezone ID
Sets the local timezone to correctly offset the UTC time received from NTP servers.

:::info Context
- NTP servers provide time in Coordinated Universal Time (UTC). This setting applies an offset to display the correct local time.
- This ensures that file timestamps on the SD card are accurate for your geographic location.
- The format is a POSIX TZ string, which can be complex.
:::

| Value | Meaning | Description |
|:------|:--------|:------------|
| String| The POSIX TZ string for your timezone. |

#### Common Examples
*   **USA Eastern Time (EST/EDT):**
    *   `$335=EST5EDT,M3.2.0,M11.1.0`
*   **Central European Time (CET/CEST):**
    *   `$335=CET-1CEST,M3.5.0,M10.5.0/3`

#### Tips & Tricks
- Searching online for "POSIX TZ string" for your specific location is the best way to find the correct value.

---

## `$336` – DST Active (boolean)
Indicates if Daylight Saving Time (DST) is currently active.

:::info Context
- This setting is often managed automatically by the system when a full POSIX timezone string is used in `$335`.
- In some simpler implementations, it may need to be set manually.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| Standard time is in effect. |
| 1     | Enabled | Daylight Saving Time is in effect. |

---

## `$337` – WiFi AP BSSID
Stores the BSSID (MAC address) of the WiFi access point.

:::info Context
- This is a technical setting for WiFi-enabled controllers.
- It can be used to force the controller to connect to a specific access point, even if multiple access points have the same network name (SSID).
:::

#### Tips & Tricks
- For most users on a simple home WiFi network, this setting can be left blank.

---

## `$339` – Sensorless Homing (Trinamic flag)
The master switch to enable sensorless homing for each axis.

:::info Context
- This setting tells grblHAL to use the Trinamic StallGuard feature for homing instead of physical limit switches.
- This is a **bitmask**: add together the values of the axes you want to home without switches.
- It requires the StallGuard thresholds (`$200`-`$222`) to be properly tuned.
:::

| Bit | Value | Axis |
|:---:|:-----:|:-----|
| 0   | 1     | X-Axis |
| 1   | 2     | Y-Axis |
| 2   | 4     | Z-Axis |

#### Common Examples
*   **Sensorless Homing on X and Y:**
    *   Common for CoreXY printers or CNCs where Z has a physical switch.
    *   `1` (X) + `2` (Y) → `$339=3`
*   **Sensorless on All Axes:**
    *   `1` (X) + `2` (Y) + `4` (Z) → `$339=7`

#### Tips & Tricks
- **Crucial:** Sensorless homing **only works for the homing cycle**. If you want Hard Limits (`$21`), you **must** still have physical switches installed.

---

## `$340` – Spindle at Speed Tolerance (%)
The tolerance used for the "spindle at speed" input signal.

:::info Context
- For advanced spindles with RPM feedback, this tells grblHAL how close the actual speed must be to the commanded speed before it considers the spindle "at speed" and continues.
- This is a percentage of the commanded `S` value.
:::

| Value (%) | Description |
|:---------:|:------------|
| 0 - 100   | The allowable percentage deviation. |

#### Common Examples
*   **A 5% Tolerance:**
    *   If you command `S10000`, the spindle is considered "at speed" between 9500 and 10500 RPM.
    *   `$340=5`

---

## `$341` – Tool Change Mode
Selects the procedure to be used for an `M6` tool change command.

:::info Context
- This setting is the master switch that defines what happens when your G-code calls for a tool change.
- It can range from a simple pause to a fully automated ATC sequence.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| `M6` commands are ignored. |
| 1     | Manual  | Pauses the machine and waits for the user to change the tool and press Cycle Start. |
| 2+    | Automatic| Initiates a predefined ATC macro or sequence. |

#### Common Examples
*   **Simple Manual Tool Change:**
    *   `$341=1`
*   **ATC Controlled by a Macro:**
    *   `$341=2`

---

## `$342` – Tool Change Probing Distance (mm)
Sets the maximum distance the Z-axis will travel when searching for the toolsetter during a tool change.

:::info Context
- When using an automated toolsetter, this is a safety setting to prevent a crash if the probe fails.
- The value should be large enough to account for the difference between your longest and shortest tools.
:::

| Value (mm)| Description |
|:---------:|:------------|
| 1 - N     | The maximum probing distance. Typically negative for a Z-axis moving down. |

#### Common Examples
*   **Typical Toolsetter Setup:**
    *   `$342=-50.0`

---

## `$343` – Tool Change Probe Feed (Locate Feed)
Sets the slower "locate" feed rate for the final, precise touch on the toolsetter.

:::info Context
- After the initial fast search, the machine will retract and re-approach slowly at this rate for maximum accuracy.
- This is analogous to the `$24` (Homing Locate Rate).
:::

| Value (mm/min)| Description |
|:-------------:|:------------|
| 10 - 100      | A slow, precise speed for accurate tool measurement. |

#### Common Examples
*   **High-Precision Toolsetter:**
    *   `$343=25`

---

## `$344` – Tool Change Seek Rate
Sets the faster feed rate for the initial search for the toolsetter.

:::info Context
- This is the speed the machine moves at the start of the tool measurement probe.
- This is analogous to the `$25` (Homing Search Rate).
:::

| Value (mm/min)| Description |
|:-------------:|:------------|
| 200 - 1000+   | A safe but efficient speed to find the toolsetter. |

#### Common Examples
*   **Standard Toolsetter Setup:**
    *   `$344=400`

---

## `$345` – Tool Change Probe Pull-off / Retract
Sets the distance the Z-axis retracts after the probe is complete.

:::info Context
- This moves the tool clear of the toolsetter after the measurement is complete.
- This is analogous to the `$27` (Homing Pull-off Distance).
:::

| Value (mm)| Description |
|:---------:|:------------|
| 1 - N     | The distance to retract after probing. |

#### Common Examples
*   **Standard Toolsetter Setup:**
    *   `$345=2.0`

---

## `$346` – Tool Change Options (mask)
Configures advanced options for the tool change process.

:::info Context
- This is a **bitmask** that enables or disables specific behaviors during an `M6` sequence.
- The available options are defined by the specific ATC plugin or driver being used.
:::

---

---

## `$350` – Plasma/THC Mode
Configures the operating mode for the Torch Height Control (THC) system.

:::info Context
- This is the master setting for the Plasma/THC plugin.
- It can enable or disable automatic THC, or put the system into different modes for testing or manual control.
- THC is a system that automatically adjusts the Z-axis (torch height) to maintain a constant distance from the material while cutting, based on the measured arc voltage.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| THC is completely off. Z-axis will not move based on arc voltage. |
| 1     | Automatic| THC is enabled and will control the Z-axis during a cut. |
| ...   | ...     | Other plugin-specific modes (e.g., Manual, Test) may be available. |

#### Common Examples
*   **Normal Plasma Cutting:**
    *   `$350=1`

#### Tips & Tricks
- This setting is only available when the Plasma/THC plugin is compiled and enabled in the firmware.
- You must have the required hardware (voltage divider, arc OK signal) connected to the controller.

---

## `$351` – Plasma/THC Sample / Filter / Delay
Configures timing and filtering parameters for the THC plugin.

:::info Context
- This is a plugin-specific setting, and its exact function is defined by the THC plugin being used.
- It often controls multiple parameters packed into a single value, such as:
  - **Sample Filter:** How much to smooth the incoming arc voltage signal to prevent jittery Z-axis motion.
  - **Delay:** A delay after the "Arc OK" signal is received before THC becomes active. This allows the pierce to complete before height control begins.
:::

#### Tips & Tricks
- Consult the documentation for your specific grblHAL THC plugin to understand how to configure this value.
- This is a critical tuning parameter for achieving good cut quality with a plasma torch.

---

## `$352` & `$353` – Plasma/THC Additional Params
Additional plugin-specific parameters for THC.

:::info Context
- These are generic slots for the THC plugin to store other important values.
- Common uses include setting the acceptable voltage band (deadband) or the Z-axis velocity for THC correction moves.
:::

---

## `$360` – Default Modbus VFD Address
Sets the default Modbus address for the spindle VFD.

:::info Context
- This setting is used by the Modbus VFD plugin.
- In a Modbus network, each device must have a unique address (typically from 1 to 247).
- This value must match the address that is configured in the VFD's own internal parameters.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 1-247 | Address | The unique address of the VFD on the Modbus serial line. |

#### Common Examples
*   **Controlling a Single VFD:**
    *   VFDs often ship with a default address of 1.
    *   `$360=1`

#### Tips & Tricks
- If grblHAL cannot communicate with your VFD, the most common causes are an incorrect Modbus address, incorrect serial wiring (A/B swapped), or incorrect communication parameters (`$362`, `$374`).

---

## `$362` – Modbus Flags / Parity / Baud Index
Configures the serial communication protocol for Modbus RTU.

:::info Context
- This is a packed setting that controls the low-level serial format.
- It must **exactly** match the serial configuration of the VFD.
- It typically includes:
  - **Parity:** (None, Even, or Odd)
  - **Data Bits:** (Usually 8)
  - **Stop Bits:** (Usually 1 or 2)
:::

#### Tips & Tricks
- Consult your VFD manual for the required serial settings (e.g., "9600, 8, N, 1" for 9600 baud, 8 data bits, None parity, 1 stop bit).
- This setting, along with the baud rate (`$374`), must be correct for communication to work.

---

## `$366` – Arc Voltage Analog Input Port
Maps the physical analog input pin for reading the torch voltage.

:::info Context
- This setting is used by the Plasma/THC plugin.
- It tells the plugin which analog-to-digital converter (ADC) pin on the controller is connected to the plasma torch's voltage divider output.
:::

| Value | Meaning |
|:-----:|:--------|
| Pin # | The hardware ADC pin number. |

#### Tips & Tricks
- This is a hardware-specific mapping. You **must** consult the documentation for your specific controller board to find the correct pin number.

---

## `$367` – Arc OK Digital Input Port
Maps the physical digital input pin for the "Arc OK" signal.

:::info Context
- This setting is used by the Plasma/THC plugin.
- The "Arc OK" (or "Arc Transfer") signal is a digital output from the plasma cutter that confirms a stable cutting arc has been established.
- grblHAL will not begin motion until this signal becomes active.
:::

| Value | Meaning |
|:-----:|:--------|
| Pin # | The hardware digital input pin number. |

#### Tips & Tricks
- This is a hardware-specific mapping. You **must** consult the documentation for your specific controller board to find the correct pin number.

---

## `$368` – Cutter Down Digital Output Port
Maps the physical digital output pin to an external "Torch Down" signal.

:::info Context
- This setting is used by some advanced THC systems.
- Instead of controlling the Z-axis motor directly, grblHAL can output simple "Up" and "Down" signals to an external, dedicated torch height controller.
- This setting defines the pin for the "Down" signal.
:::

| Value | Meaning |
|:-----:|:--------|
| Pin # | The hardware digital output pin number. |

---

## `$369` – Cutter Up Digital Output Port
Maps the physical digital output pin to an external "Torch Up" signal.

:::info Context
- This setting is used by some advanced THC systems.
- It defines the pin for the "Up" signal to be sent to an external THC controller.
- Works in conjunction with `$368`.
:::

| Value | Meaning |
|:-----:|:--------|
| Pin # | The hardware digital output pin number. |

---

## `$370` – Invert I/O Port Inputs (mask)
Inverts the logic for the generic digital input pins.

:::info Context
- This is a grblHAL-specific feature for advanced I/O control.
- It allows you to invert the signal for any of the general-purpose input pins that are not already assigned to a specific function like limits or controls.
- This is a **bitmask**: the value corresponds to the I/O port number, not a specific function.
:::

| Bit | Value | Input to Invert |
|:---:|:-----:|:----------------|
| 0   | 1     | I/O Port 0      |
| 1   | 2     | I/O Port 1      |
| 2   | 4     | I/O Port 2      |
| ... | ...   | And so on...    |

#### Tips & Tricks
- This is an advanced setting used when integrating custom hardware or macros that read digital inputs.
- You must know the I/O port number that corresponds to the physical pin on your controller.

---

## `$371` – IO Port Pull-up Disable (mask)
Disables the internal pull-up resistors on the generic digital input pins.

:::info Context
- This works exactly like `$17` (Control Inputs) and `$18` (Limit Inputs), but applies to the general-purpose I/O ports.
- Only disable this if your external hardware provides its own pull-up or is an "active" (push-pull) driver.
:::

| Bit | Value | Input Pull-up to Disable |
|:---:|:-----:|:-------------------------|
| 0   | 1     | I/O Port 0               |
| 1   | 2     | I/O Port 1               |
| 2   | 4     | I/O Port 2               |
| ... | ...   | And so on...             |

---

## `$372` – Invert I/O Port Outputs (mask)
Inverts the logic for the generic digital output pins.

:::info Context
- This allows you to flip the signal for general-purpose outputs, for example, to control a relay that requires an active-low signal to turn on.
- This is a **bitmask** corresponding to the I/O port number.
:::

| Bit | Value | Output to Invert |
|:---:|:-----:|:-----------------|
| 0   | 1     | I/O Port 0       |
| 1   | 2     | I/O Port 1       |
| 2   | 4     | I/O Port 2       |
| ... | ...   | And so on...     |

---

## `$373` – IO Open-Drain Enable
Configures generic output pins to operate in "open-drain" mode.

:::info Context
- This is an advanced electrical configuration. In open-drain mode, the pin can only pull the signal to Ground (low). It cannot drive it High. An external pull-up resistor is required.
- This is useful for interfacing with devices that operate at a different voltage level or for connecting multiple devices to a single signal line.
:::

---

## `$374` – ModBus Baud Rate (index)
Configures the serial communication speed for the built-in Modbus RTU interface.

:::info Context
- This setting must **exactly** match the baud rate configured in your VFD or other Modbus device.
- The value is an index, not the baud rate itself.
:::

| Index | Baud Rate |
|:-----:|:----------|
| 0     | 9600      |
| 1     | 19200     |
| 2     | 38400     |
| 3     | 57600     |
| 4     | 115200    |

#### Common Examples
*   **Many VFDs default to 9600 baud:**
    *   `$374=0`
*   **Faster communication:**
    *   `$374=1` (for 19200 baud)

---

## `$375` – ModBus RX Timeout (ms)
Sets the time grblHAL will wait for a response from a Modbus device before flagging an error.

:::info Context
- If a response from the VFD is not received within this time, grblHAL will report a communication error.
:::

| Value (ms) | Description |
|:----------:|:------------|
| 1 - N      | The timeout in milliseconds. |

#### Common Examples
*   **Default Timeout:**
    *   `$375=200`

#### Tips & Tricks
- If you are on a very slow or noisy serial line, you may need to increase this value slightly, but for most setups, the default is fine.

---

## `$376` – Rotary Axes Mask
Identifies which axes are rotary axes, as opposed to linear axes.

:::info Context
- This is a crucial setting for machines with a 4th or 5th axis. It tells the G-code interpreter that coordinates for these axes are in degrees.
- It also affects feed rate calculations when using Inverse Time Feed Mode (`G93`).
- This is a **bitmask**: add together the values of your rotary axes.
:::

| Bit | Value | Axis is Rotary |
|:---:|:-----:|:---------------|
| 3   | 8     | A-Axis |
| 4   | 16    | B-Axis |
| 5   | 32    | C-Axis |

#### Common Examples
*   **Standard 3-Axis Mill (No Rotary):**
    *   `$376=0`
*   **4-Axis Mill with a Rotary A-Axis:**
    *   `$376=8`
*   **5-Axis Mill with A and C Rotary Axes:**
    *   `8` (A) + `32` (C) → `$376=40`

#### Tips & Tricks
- The first three axes (X, Y, Z) are always assumed to be linear and cannot be set as rotary.

---

---

## `$384` – Disable G92 Persistence
Controls whether `G92` offsets are remembered after a reset.

:::info Context
- `G92` is a command that temporarily shifts the origin of the coordinate system without changing the Work Coordinate System (WCS).
- By default, grblHAL saves this offset to EEPROM so that your temporary zero point is not lost if the controller is reset.
- This setting allows you to disable that persistence, making `G92` behave more like it does in traditional CNC controllers.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Persistence Enabled | `G92` offsets are saved and will be active after a reset. (Default) |
| 1     | Persistence Disabled| `G92` offsets are cleared on reset. |

#### Tips & Tricks
- It is generally safer to work with standard Work Coordinate Systems (`G54`-`G59`) rather than `G92`.
- Disabling persistence (`$384=1`) can prevent confusion if you forget that a temporary `G92` offset is active after a reboot.

---

## `$393` – Coolant On Delay (sec)
Adds a mandatory delay after a coolant M-command is executed, before motion resumes.

:::info Context
- Some coolant systems, especially mist systems or those with long hoses, need time for the coolant to reach the cutting tool.
- This setting forces grblHAL to pause for a specified time after an `M7` or `M8` command is processed.
:::

| Value (sec) | Description |
|:-----------:|:------------|
| 0.0 - N     | The pause duration in seconds. |

#### Common Examples
*   **Machine with a Long Coolant Line:**
    *   It takes 2.5 seconds for coolant to start flowing at the tool.
    *   `$393=2.5`

#### Tips & Tricks
- This provides a more reliable way to ensure coolant is present than adding `G4` dwell commands to your G-code.
- If this is a non-zero value, there will be a noticeable pause after every `M7`/`M8`.

---

## `$394` – Spindle On Delay (sec)
Adds a mandatory delay after a spindle start command is executed, before motion resumes.

:::info Context
- This is a critical setting for machines with VFDs or large spindles that require time to accelerate to the commanded speed.
- It forces grblHAL to pause for a specified time after an `M3` or `M4` command.
:::

| Value (sec) | Description |
|:-----------:|:------------|
| 0.0 - N     | The pause duration in seconds. |

#### Common Examples
*   **CNC with a VFD-controlled Spindle:**
    *   It might take 3-4 seconds for the spindle to reach 18000 RPM.
    *   `$394=4.0`
*   **Simple router with instant-on:**
    *   `$394=0.5` (a small safety delay)

#### Tips & Tricks
- Using this setting is much safer than relying on `G4` dwell commands in G-code, as it prevents the tool from plunging into the material before the spindle is at full speed.
- Time how long it takes for your spindle to reach its typical operating speed and set this value accordingly, adding a small safety margin.

---

## `$395` – Default Spindle Index/Type
Selects the default spindle to be used if not otherwise specified by a command.

:::info Context
- grblHAL supports multiple spindle types (e.g., PWM, Modbus VFD, Relay) that can coexist.
- This setting determines which spindle is considered the "default" and will respond to standard `M3`/`M4`/`M5` commands.
:::

| Value | Meaning |
|:-----:|:--------|
| 0     | Spindle 0 (Primary PWM) |
| 1     | Spindle 1 |
| ...   | ... |

#### Tips & Tricks
- This is an advanced setting for machines with multiple or complex spindle configurations. For most users with a single spindle or laser, the default value (`0`) is correct.

---

## `$398` – Planner Buffer Blocks
Configures the size of the motion planner buffer.

:::info Context
- The planner buffer is where grblHAL stores upcoming motion blocks. This allows it to "look ahead" to calculate smooth accelerations and manage cornering speeds.
- A larger buffer allows for smoother motion on complex paths with many small line segments (like 3D carving or raster engraving).
- The maximum size is limited by the available RAM on your controller.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 16-N  | The number of motion blocks to buffer. |

#### Common Examples
*   **Standard Controller (e.g., STM32F4xx):**
    *   `$398=32`
*   **High-Performance Controller (e.g., iMXRT1062 / Teensy 4.1):**
    *   `$398=64`

#### Tips & Tricks
- If you notice your machine "stuttering" on complex 3D toolpaths or fast laser engraving jobs, increasing this value can often solve the problem by preventing the buffer from running empty.
- Do not set this higher than the maximum supported by your board, as it can cause instability or a crash.

---

## `$400` – Encoder 0 - Index (Base)
Selects the primary function for the first encoder (Encoder 0).

:::info Context
- This is the master setting for the first encoder block (`$400`-`$409`). It determines what the encoder will control.
- Encoders are typically used for Manual Pulse Generators (MPGs) or digital control knobs.
- A value of `0` disables this encoder.
:::

| Index | Function | Description |
|:-----:|:---------|:------------|
| 0     | Disabled | This encoder is not used. |
| 1-6   | Jog Axis X-C | Use the encoder to jog the specified axis. |
| 7     | Feed Rate Override | Use the encoder to adjust the feed rate override. |
| 8     | Rapid Rate Override | Use the encoder to adjust the rapid rate override. |
| 9     | Spindle Speed Override | Use the encoder to adjust the spindle speed override. |

#### Common Examples
*   **Jog Z-Axis with an MPG:**
    *   `$400=3`
*   **Control Feed Rate with a Knob:**
    *   `$400=7`

---

## `$401` – Encoder 0 - CPR / Resolution
Sets the Counts Per Revolution (CPR) of the Encoder 0 hardware.

:::info Context
- This tells grblHAL how many signals the encoder generates for one full 360° turn.
- For a quadrature encoder, CPR is typically 4 times its PPR (Pulses Per Revolution).
- This value is usually found in the encoder's datasheet.
:::

| Value | Meaning |
|:-----:|:--------|
| 1-N   | The CPR value of the encoder. |

#### Common Examples
*   **Standard 100-PPR MPG Pendant:**
    *   100 Pulses Per Revolution = 400 Counts Per Revolution.
    *   `$401=400`

---

## `$450` – User Defined Slot 0
The first of ten general-purpose "slots" that are not used by the core grblHAL firmware.

:::info Context
- These settings (`$450`-`$459`) are provided as persistent storage for your own custom data.
- The most common use is to store values that are then read or used by NGC macros.
:::

| Value | Meaning |
|:-----:|:--------|
| Any   | Can store floating-point numbers or integers for use in macros. |

#### Common Examples
*   **Store a Safe Z-Height for a Macro:**
    *   A macro for a tool change might need to know a safe height to retract to.
    *   `$450=25.0` (Store 25.0mm)
*   **Store a Probing Feed Rate:**
    *   A custom probing macro could use this value for its feed rate.
    *   `$450=150.0` (Store 150mm/min)

#### Tips & Tricks
- This is a powerful feature for creating flexible macros without hard-coding values. Keep a personal record of what you are using each slot for.

---

## `$462` – VFD Register: Run/Stop
The Modbus register address that controls starting and stopping the spindle.

:::info Context
- This is an advanced feature for controlling a spindle via a direct digital connection (Modbus RTU).
- This value **must** match the specific register address defined in your VFD's manual for run control.
- Used by the Spindle VFD plugin.
:::

| Value | Meaning |
|:------|:--------|
| 0-N   | The Modbus register address. |

#### Common Examples
*   **Typical Huanyang VFD:**
    *   The run control command is often at address `0x2000`.
    *   `$462=8192` (which is 2000 in hexadecimal)

#### Tips & Tricks
- This is one of the key settings for VFD integration. An incorrect address here will mean the spindle will not start or stop.
- The rest of the `$46x` block defines the other registers and command words needed for full VFD control.

---

---

## `$463` – VFD Register: Set Frequency
The Modbus register address for setting the target spindle speed (as a frequency).

:::info Context
- Used by the VFD plugin to control spindle RPM.
- When you send an `S` command, grblHAL calculates the required frequency and writes it to this register in the VFD.
- This value **must** match the address specified in your VFD's manual for "Frequency Setting" or "Target Frequency".
:::

| Value | Meaning |
|:------|:--------|
| 0-N   | The Modbus register address. |

#### Common Examples
*   **Typical Huanyang VFD:**
    *   The frequency setting command is often at address `0x2001`.
    *   `$463=8193`

#### Tips & Tricks
- If your spindle turns on but always runs at the same speed regardless of the `S` command, this register address is likely incorrect.

---

## `$464` – VFD Register: Get Frequency
The Modbus register address for reading the *actual* spindle speed (as a frequency) from the VFD.

:::info Context
- Used by the VFD plugin for monitoring and for features like "spindle at speed" checking.
- This allows grblHAL to read back the real speed from the VFD.
:::

| Value | Meaning |
|:------|:--------|
| 0-N   | The Modbus register address. |

#### Common Examples
*   **Typical Huanyang VFD:**
    *   The output frequency is often readable from address `0x2103`.
    *   `$464=8451`

---

## `$465` – VFD Command Word for CW
The value to write to the Run/Stop register (`$462`) to start the spindle clockwise (`M3`).

:::info Context
- VFDs use specific numerical codes ("command words") to tell them what to do.
- This value is the code for "Run Forward". It must match your VFD's manual.
:::

| Value | Meaning |
|:------|:--------|
| 0-N   | The command word for clockwise rotation. |

#### Common Examples
*   **Typical Huanyang VFD:**
    *   The "Run Forward" command is often `18`.
    *   `$465=18`

---

## `$466` – VFD Command Word for CCW
The value to write to the Run/Stop register (`$462`) to start the spindle counter-clockwise (`M4`).

:::info Context
- This is the command word for "Run Reverse". It must match your VFD's manual.
- Not all spindles/VFDs support reverse operation.
:::

| Value | Meaning |
|:------|:--------|
| 0-N   | The command word for counter-clockwise rotation. |

#### Common Examples
*   **Typical Huanyang VFD:**
    *   The "Run Reverse" command is often `34`.
    *   `$466=34`

---

## `$467` – VFD Command Word for STOP
The value to write to the Run/Stop register (`$462`) to stop the spindle (`M5`).

:::info Context
- This is the command word for "Stop". It must match your VFD's manual.
:::

| Value | Meaning |
|:------|:--------|
| 0-N   | The command word for stop. |

#### Common Examples
*   **Typical Huanyang VFD:**
    *   The "Stop" command is often `1`.
    *   `$467=1`

---

## `$468` – RPM Value Multiplier
A multiplier used in the formula to convert RPM to the frequency value the VFD expects.

:::info Context
- The formula is: `VFD_Frequency = (RPM * Multiplier) / Divider`.
- VFDs often expect frequency in units of 0.01Hz or 0.1Hz. These settings allow you to scale the RPM value correctly.
:::

| Value | Meaning |
|:------|:--------|
| 1-N   | The multiplier for the scaling formula. |

#### Common Examples
*   **Typical Huanyang VFD (expects frequency in 0.01Hz):**
    *   To convert RPM (rev/min) to 0.01Hz, the formula is `(RPM * 100) / 60`.
    *   `$468=100` (or sometimes `50` depending on pole count)

---

## `$469` – RPM Value Divider
A divider used in the formula to convert RPM to the frequency value the VFD expects.

:::info Context
- The formula is: `VFD_Frequency = (RPM * Multiplier) / Divider`.
:::

| Value | Meaning |
|:------|:--------|
| 1-N   | The divider for the scaling formula. |

#### Common Examples
*   **Typical Huanyang VFD (expects frequency in 0.01Hz):**
    *   To convert RPM (rev/min) to 0.01Hz, the formula is `(RPM * 100) / 60`.
    *   `$469=60`

---

## `$470` & `$471` – VFD Register: Additional Mapping
Reserved slots for mapping additional Modbus registers.

:::info Context
- Some plugins may need to read or write other VFD parameters, such as motor current, faults, or temperature.
- These slots provide a place to map those extra register addresses.
:::

---

## `$484` – Unlock Required After E-Stop
A safety feature that requires an explicit unlock command after an E-stop has been cleared by a reset.

:::info Context
- This prevents the machine from becoming immediately active after a reset that follows an alarm condition.
- It forces the operator to deliberately unlock the machine (`$X`) before any motion is possible.
:::

| Value | Meaning | Description |
|:-----:|:--------|:------------|
| 0     | Disabled| The machine is IDLE and ready for commands immediately after reset. |
| 1     | Enabled | The machine enters an ALARM state after reset, requiring `$X` to unlock. (Safer) |

#### Common Examples
*   **For Enhanced Safety:**
    *   `$484=1`

---

## `$534` – Output NGC Debug Messages
Enables or disables verbose debugging messages from the G-code interpreter.

:::info Context
- This is a diagnostic tool for developers and advanced users.
- When enabled, the interpreter will output detailed information about how it is parsing G-code lines.
- It should be left disabled during normal operation as it creates a large amount of serial traffic and can slow down execution.
:::

| Value | Meaning |
|:-----:|:--------|
| 0     | Disabled |
| 1     | Enabled |

---

## `$538` – Fast Rotary "Go to G28" Behaviour
Controls the behavior of rotary axes when a `G28` command is issued.

:::info Context
- `G28` sends axes to a pre-defined home position.
- This setting can modify how rotary axes handle this move, for example, by always taking the shortest path.
:::

---

## `$539` – Spindle Off Delay (sec)
Adds a mandatory delay after the spindle is turned off (`M5`).

:::info Context
- This complements `$394` (Spindle On Delay).
- It forces a pause to allow the spindle to fully spin down before the machine moves again.
- This is a critical safety feature to prevent tool crashes or workpiece damage if the machine moves while the spindle is still coasting to a stop.
:::

| Value (sec) | Description |
|:-----------:|:------------|
| 0.0 - N     | The pause duration in seconds after an `M5` command. |

#### Common Examples
*   **Heavy Spindle:**
    *   A large spindle might take 5-10 seconds to come to a complete stop.
    *   `$539=10.0`
*   **Small Spindle with a VFD Brake:**
    *   `$539=2.0`

---

## `$673` – Coolant On Delay (sec)
*This is a duplicate of `$393`. The `$393` setting is the standard one to use.*

---

## `$681` – ModBus Serial Format (RTU parity/format)
*This is a duplicate/alternative way to configure Modbus parameters, often superseded by `$362`.*

---
