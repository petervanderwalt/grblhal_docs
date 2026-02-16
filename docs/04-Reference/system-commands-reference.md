---
title: "System Commands Reference"
description: "A comprehensive reference for all grblHAL system ($) and realtime commands."
---

# System Commands Reference

This page details the system commands available in grblHAL. These commands are distinct from G-code and are used to configure the controller, control machine state, and request real-time information.

They are divided into two categories:
1.  **`$` System Commands**: Text-based commands starting with `$` and terminated by a newline. These interact with settings, memory, and high-level control.
2.  **Realtime Commands**: Single ASCII characters (or byte values) that execute immediately, even while the machine is moving.

---

# `$` System Commands

System commands allow you to view and change settings, control machine modes (like sleep or homing), and read non-volatile data.

:::info Note
Most `$` commands are processed by the main protocol loop. Some commands (like `$H` for homing) may block other operations until they complete.
:::

## Configuration & Settings

### `$$` – View All Settings
Outputs the current value of all numbered settings.

**Syntax:** `$$`

:::info Context
-   Useful for backing up your configuration.
-   See the [Complete Settings Reference](complete-settings-reference.md) for details on each setting ID.
:::

---

### `$$=<id>` – View Setting Help
Outputs the description, units, and range for a specific setting.

**Syntax:** `$$=<id>`

**Example:**
-   `$$=100` returns `Travel resolution in steps per millimeter.`
-   `$$=10` Breakdown:
    ```text
    0 - Position in machine coordinate (1)
    1 - Buffer state (2)
    2 - Line numbers (4)
    3 - Feed & speed (8)
    4 - Pin state (16)
    5 - Work coordinate offset (32)
    6 - Overrides (64)
    7 - Probe coordinates (128)
    8 - Buffer sync on WCO change (256)
    9 - Parser state (512)
    10 - Alarm substatus (1024)
    11 - Run substatus (2048)
    12 - Enable when homing (4096)
    13 - Distance-to-go (8192)
    Specifies optional data included in status reports and if report is sent when homing.
    If Run substatus is enabled it may be used for simple probe protection.
    NOTE: Parser state will be sent separately after the status report and only on changes.
    ```

---

### `$x=<val>` – Write Setting
Sets the value of a specific setting.

**Syntax:** `$<id>=<val>`

**Example:**
-   `$100=250.5` (Set X-axis steps/mm to 250.5)
-   `$1=255` (Set step idle delay to 255/always on)

:::warning
Settings are stored in non-volatile memory (EEPROM/Flash) and persist after power cycles. Avoid writing settings inside high-frequency loops to prevent wearing out the memory.
:::

---

### `$I` – View Build Info
Outputs the build info string and version.

**Syntax:** `$I`

**Output Example:** `[VER:1.1f.20210101.GRBLHAL]`

### `$I+` – Extended Build Info
Outputs extended build information, including axis configuration, firmware options, and driver details.

**Syntax:** `$I+`

**Output Details:**
-   `[AXS:<number>:<letters>]`: Number of axes and their letter designations (e.g., `XYZ`, `XYZABC`).
-   `[NEWOPT:...]`: Comma-separated list of enabled compile-time options (e.g., `ATC`, `WIFI`, `SD`, `ETH`).
-   `[FIRMWARE:grblHAL]`
-   `[SIGNALS:<signals>]`: List of enabled input signals (same codes as realtime report).
-   `[AUX IO:...]`: Counts of digital/analog inputs/outputs.
-   `[DRIVER:...]` and `[PLUGIN:...]`: Driver and plugin specific info.

---

### `$I=<string>` – Set Build Info
Sets a custom string in the build info. This can be used to store machine specific versioning or dates.

**Syntax:** `$I=MyMachine_v1.0`

:::info
This feature might be disabled in some builds (`DISABLE_BUILD_INFO_WRITE_COMMAND`).
:::

---

### `$N` – View Startup Lines
Outputs the currently stored startup G-code blocks. These lines run automatically every time grblHAL powers up or resets.

**Syntax:** `$N`

---

### `$N<x>=<gcode>` – Set Startup Line
Saves a G-code block to one of the startup lines (typically `$N0` and `$N1`).

**Syntax:**
-   `$N0=G54 G20 G17` (Set first startup line)
-   `$N1=` (Clear second startup line)

**Common Uses:**
-   Setting default modes (Absolute `G90`, Metric `G21`, Plane `G17`).
-   Resetting work offsets (careful!).

:::danger
Do not place motion commands (`G0`, `G1`, `G2`, `G3`) or tool changes (`M6`) in startup lines. This can be dangerous if the machine moves unexpectedly upon connection.
:::

---

### `$RST` – Restore Settings
Restores groups of settings to their firmware defaults.

**Syntax:** `$RST=<flag>`

| Flag | Effect |
| :--- | :--- |
| **`$`** | Restores all `$$` numbered settings to defaults. |
| **`#`** | Restores all G-code parameters (`G54`-`G59`, `G28`, `G30`) to zero. |
| **`*`** | Restores **ALL** settings and parameters to defaults. |

---

## Machine Control

### `$J` – Jogging
Commands the machine to move freely. Jog commands are independent of the G-code parser state and can be canceled immediately by a Feed Hold or Jog Cancel command.

**Syntax:** `$J=X<val> Y<val> ... F<rate>`

**Requirements:**
-   Must include at least one axis coordinate.
-   Must include a Feed Rate (`F`).
-   can include `G20`/`G21` (units) and `G90`/`G91` (distance mode).

**Examples:**
-   `$J=G91 X10 F500` (Move X +10mm relative at 500mm/min)
-   `$J=G90 Z5 F100` (Move Z to absolute 5mm at 100mm/min)

:::info Context
-   Jogging is "safer" than `G0`/`G1` because it checks soft limits (if enabled) *before* moving and can be smoothly aborted by the user.
-   If soft limits (`$20`) are enabled, `G53` (Machine Coordinates) is implied unless `G54`..`G59` is explicitly used (though usually ignored for safety).
:::

---

### `$H` – Homing Cycle
Initiates the homing sequence to find the machine origin.

**Syntax:** `$H` (Homes all configured axes in standard sequence)

**Extended Syntax (Single Axis):**
-   `$HX` (Home X only)
-   `$HY` (Home Y only)
-   `$HZ` (Home Z only)
-   `$HA` ... `$HW` (Home rotary/secondary axes)

:::warning
Requires limit switches to be installed and configured.
:::

---

### `$SLP` – Sleep Mode
Puts the machine into a low-power sleep state.

**Syntax:** `$SLP`

**Behavior:**
-   Disables spindle and coolant.
-   Disables stepper motors (they lose holding torque!).
-   Requires a Reset (`ctrl-x`) to wake up.

---

### `$C` – Check Mode
Toggles "Check Mode". In this mode, grblHAL parses and validates G-code but **does not move** the machine or turn on the spindle.

**Syntax:** `$C`

**Usage:**
-   Send `$C` to enable.
-   Stream your G-code file. grblHAL will report verifying lines or errors (`error:xx`).
-   Send `ctrl-x` (Reset) to exit Check Mode.

---

### `$X` – Unlock / Kill Alarm
Disables the alarm lock state.

**Syntax:** `$X`

**Usage:**
-   If the machine is in an Alarm state (e.g., hard limit hit, or unhomed with `$22=1`), it often locks motion.
-   `$X` overrides this lock, allowing you to jog away from a switch or move the machine.
-   **Caution:** This does not fix the underlying issue (e.g., machine position may be lost).

---

### `$RW` – Rewind (if supported)
Rewinds the input stream or program (SD card) context.

---

## File System (SD Card)

Commands for managing files on the SD card (if supported).

### `$F` – List Files
Lists files in the current working directory.

**Syntax:** `$F`

### `$F=<path>` – Change Directory
Sets the current working directory (CWD) for file operations.
-   `$F=/`: Go to root.
-   `$F=..`: Go up one level.
-   `$F=subfolder`: Go to `subfolder`.

**Syntax:** `$F=/my_folder`

### `$FF` – Format SD Card
Formats the SD card. **All data will be lost.**

**Syntax:** `$FF=yes`

---

## Diagnostics & Reporting

### `$G` – View G-code Parser State
Outputs the currently active G-code modal states.

**Syntax:** `$G`

**Output Example:** `[GC:G0 G54 G17 G21 G90 G94 M5 M9 T0 F0 S0]`
-   Shows: Motion mode, WCS, Plane, Units, Distance, Feed mode, Spindle/Coolant state, Tool, Feed rate, RPM.

**grblHAL Extensions:**
-   Can include extended G-codes: `G5`, `G7`, `G8`, `G43`/`G49` (TLO), `G96`/`G97` (Spindle Mode), `G98`/`G99` (Retract), `M50`/`M51`/`M53` (Overrides), `M56` (Parking), `M60` (Pallet).

---

### `$#` – View Parameters
Outputs the stored offsets for work coordinate systems, tool offsets, and pre-defined positions.

**Syntax:** `$#`

**Output Example:**
`[G54:0.000,0.000,0.000]`
`[G28:0.000,0.000,0.000]`
`[TLO:0.000]`
`[PRB:0.000,0.000,0.000:0]`

**grblHAL Extensions:**
-   `[G51:<scaling factors>]`: if scaling active.
-   `[HOME:<positions>:<bitmask>]`: Axis home positions.
-   `[T:<tool>,<offsets>]`: Tool table entry.
-   `[TLR:<offset>]`: Tool length reference.

---

### `$PINS` – Report Pin Status
Debug command to show the current hardware state of input/output pins.

**Syntax:** `$PINS`

**Output Example:**
```text
[PIN:PB12,Emergency stop]
[PIN:PC4,Probe]
[PIN:PA15,X motor fault]
...
[PIN:PE13,Spindle on]
[PIN:PB1,Spindle direction]
[PIN:PA8,Spindle PWM]
...
[PIN:PD6,RX,Modbus]
[PIN:PD5,TX,Modbus]
```

---

### `$PINSTATE` – Detailed Pin Enumeration
Enumerates auxiliary pins with type, description, mode (input/output, inverted, pull-up/down), and capabilities.

**Syntax:** `$PINSTATE`

**Output Format:**
```text
[PINSTATE:<type>|<desc>|<id>|<mode>|<caps>|<state>]
```

**Example:**
```text
$pinstate
[PINSTATE:DIN|P0|0|NU--|IB--|1]
[PINSTATE:DIN|P1|1|NU--|IB--|1]
[PINSTATE:DIN|P2|2|NU--|IBED|1]
[PINSTATE:DIN|Toolsetter|3|NU--|IBED|1]
[PINSTATE:DIN|Emergency stop|12|NUR-|IBED|0]
[PINSTATE:DOUT|P0 <- Spindle enable (M3/M4)|0|N|I|0]
[PINSTATE:AIN|E0|0|||3|4]
...
```

---

### `$PORTS` – Enumerate Serial Ports
Enumerates available UART ports with configuration.

**Syntax:** `$PORTS`

**Output Format:**
```text
[PORT:<port>|<desc>|<pin_rx>,RX|<pin_tx>,TX|...]
```

**Example:**
```text
$PORTS 
[PORT:0|UART1|PC5,RX|PD8,TX|115200,8,N,1|F]
[PORT:1|Modbus|PD6,RX|PD5,TX|19200,8,N,1|C]
```

---

### `$SPINDLES` / `$SPINDLESH` – Enumerate Spindles
Lists available spindles. 
-   `$SPINDLES`: Human readable format.
    ```text
    2 - H-100, enabled as spindle 0, active
    0 - PWM
    1 - PWM2
    ```
-   `$SPINDLESH`: Machine readable format:
    ```text
    [SPINDLE:<id>|<num>|<type>|<caps>|<name>|<min>,<max>]
    ```
    
    **Example:**
    ```text
    [SPINDLE:2|0|2|*SDVE|H-100|7500.0,24000.0]
    [SPINDLE:0|-|0|DIRV|PWM|7500.0,24000.0]
    [SPINDLE:1|-|0|IRV|PWM2|0.0,255.0]
    ```

---



## Help & Enumeration

System commands to discover capabilities.

| Command | Description |
| :--- | :--- |
| **`$HELP`** | List help topics. |
| **`$EA`** | Enumerate all alarms. Returns `[ALARMCODE:val|message|description]`. |
| **`$EAG`** | Enumerate alarms in Grbl CSV format (for senders). |
| **`$EE`** | Enumerate all error codes. Returns `[ERRORCODE:val|message|description]`. |
| **`$EEG`** | Enumerate errors in Grbl CSV format. |
| **`$ES`** | Enumerate settings. Returns `[SETTING:id|group|name|unit|type|format|min|max...]`. |
| **`$ESG`** | Enumerate settings in Grbl CSV format. |
| **`$ESH`** | Enumerate settings in grblHAL tab-separated format. |
| **`$EG`** | Enumerate setting groups. Returns `[SETTINGGROUP:id|parent|name]`. |

---

## Additional Commands

Extended functionality for machine control and debugging found in the source.

| Command | Description |
| :--- | :--- |
| **`$B`** | Toggle **Block Delete** switch. |
| **`$S`** | Toggle **Single Block** mode. |
| **`$O`** | Toggle **Optional Stop** switch. |
| **`$HX`..`$HW`** | Home individual axes (`X`, `Y`, `Z`, `A`, `B`, `C`, `U`, `V`, `W`). |
| **`$HSS`** | Report **Homing Switch Status**. |
| **`$TPW`** | **Tool Probe Workpiece**. Probes the tool plate. |
| **`$TLR`** | **Set Tool Length Reference**. Sets the current tool offset reference. |
| **`$LEV`** | Output **Last Signals Event**. Useful for debugging input glitches. |
| **`$LIM`** | Output **Current Limit State**. Shows which limit pins are currently active. |
| **`$SD`** | Report **Spindle Data**. |
| **`$SR`** | Reset **Spindle Data**. |
| **`$SDS`** | Report **Stepper Status**. |
| **`$REBOOT`** | **Reboot System**. Soft reboots the controller. |
| **`$RTC`** | **Real Time Clock** action. |
| **`$DWNGRD`** | Toggle **Downgrade** setting flags. |
| **`$TTLOAD`** | **Reload Tool Table**. Reloads tool data from `tooltable.tbl` (if file-based tool table is active). |
| **`$MODBUSSTATS`** | **Modbus Statistics**. Returns communication stats (sent/retries). Use `$MODBUSSTATS=R` to reset. |
| **`$BL`** | Enter **Bootloader**. Jumps to the bootloader (e.g., Teensy Loader) if supported by the driver. |

---

# Realtime Commands

Realtime commands are single control characters that can be sent to grblHAL at any time. They are intercepted by the serial receive interrupt and executed immediately, often within tens of milliseconds, bypassing the normal G-code planner buffer.

:::info Key Characteristics
-   **No Newline Needed:** These commands are single bytes. Do not send a `<CR>` or `<LF>` after them.
-   **Immediate Execution:** They work even if the planner buffer is full.
-   **State Dependent:** Some commands (like `!` Feed Hold) are only valid in certain states (e.g., Run, Jog).
-   **Ignored if Invalid:** If a command cannot be executed (e.g., toggling spindle stop while moving), it is silently ignored to prevent unsafe conditions.
:::

## Basic Control Commands

These are the standard Grbl control characters found in most senders.

| Char | Hex | Name | Description |
| :---: | :---: | :--- | :--- |
| **`?`** | `0x3F` | **Status Report** | Immediately generates and sends a runtime status report (see Realtime Report section below). <br /> - Can be sent at any time, except during critical system alarms.<br /> - The content of the report is configured by the `$10` setting. |
| **`~`** | `0x7E` | **Cycle Start / Resume** | - **In Hold:** Resumes the cycle after a Feed Hold (`!`) or Program Stop (`M0`).<br /> - **In Door:** Resumes from a safety door state (if closed).<br /> - **Otherwise:** Ignored. |
| **`!`** | `0x21` | **Feed Hold** | - **In Motion:** Decelerates the machine to a controlled stop and enters a `Hold` state. <br /> - **In Jog:** Cancels the jog and flushes the buffer.<br /> - **Spindle/Coolant:** Remain **ON** during a feed hold. <br /> - **Ignored:** In Idle or Alarm states. |
| **`^x`** | `0x18` | **Soft Reset** | (Ctrl-X) - **Immediate Halt:** Stops all pulse generation, turns off spindle/coolant, and flushes the planner buffer.<br /> - **State:** Resets grblHAL to the `Alarm` state (if in motion) or `Idle` state (if stopped).<br /> - **Position:** If reset during motion, position is considered lost (requires re-homing). If reset while idle, position is retained. |

---

## Overrides

Overrides allow you to fine-tune the machine's operation in real-time.

### Feed Rate Overrides
Alters the programmed feed rate (`F`) for `G1`, `G2`, `G3` moves.
-   **Range:** 10% to 200%.
-   **Limits:** Commands that would push the value outside this range are ignored.
-   **Scope:** Does **not** affect Rapid (`G0`) or Jog motions.
-   **Latency:** Changes take effect immediately (within the current planner block).

| Hex | Command | Description |
| :---: | :--- | :--- |
| `0x90` | **Set 100%** | Restores feed rate to the programmed value. |
| `0x91` | **+10%** | Increases feed override by 10%. |
| `0x92` | **-10%** | Decreases feed override by 10%. |
| `0x93` | **+1%** | Increases feed override by 1%. |
| `0x94` | **-1%** | Decreases feed override by 1%. |

### Rapid Rate Overrides
Scales the speed of `G0`, `G28`, and `G30` rapid motions.
-   **Scope:** Affects rapid motions only. Does not affect cutting moves (`G1`, etc.).
-   **State:** Can be changed at any time.

| Hex | Command | Description |
| :---: | :--- | :--- |
| `0x95` | **100%** | Sets rapids to full speed (Max Rate). |
| `0x96` | **50%** | Sets rapids to 50% of max rate. |
| `0x97` | **25%** | Sets rapids to 25% of max rate. |

### Spindle Speed Overrides
Alters the programmed spindle speed (`S`).
-   **Range:** 10% to 200%.
-   **Limits:** Commands that would push the value outside this range are ignored.
-   **State:** Can be changed even if the spindle is currently stopped (will take effect when started).

| Hex | Command | Description |
| :---: | :--- | :--- |
| `0x99` | **Set 100%** | Restores spindle speed to the programmed value. |
| `0x9A` | **+10%** | Increases spindle override by 10%. |
| `0x9B` | **-10%** | Decreases spindle override by 10%. |
| `0x9C` | **+1%** | Increases spindle override by 1%. |
| `0x9D` | **-1%** | Decreases spindle override by 1%. |

### Spindle Stop Override
| Hex | Command | Description |
| :---: | :--- | :--- |
| `0x9E` | **Toggle Spindle Stop** | - **Only valid in HOLD state.**<br /> - Toggles the spindle On/Off while paused.<br /> - **Safety:** Ignored during motion to prevent crashing.<br /> - **Resume:** When Cycle Start (`~`) is issued, the spindle automatically restores its previous state. The system waits 4.0 seconds (configurable) for the spindle to spin up before resuming motion. |

### Coolant Overrides
Toggles coolant states directly.
-   **State:** Valid in standard states (Idle, Run, Hold).
-   **Parser Update:** These commands **update the modal state** of the G-code parser. A `$G` report will reflect the change.

| Hex | Command | Description |
| :---: | :--- | :--- |
| `0xA0` | **Toggle Flood** | Toggles M8 Flood Coolant on/off. |
| `0xA1` | **Toggle Mist** | Toggles M7 Mist Coolant on/off. |

---

## Extended Commands

These functionality codes are specific extensions or part of the extended ASCII set.

| Hex | Name | Description |
| :---: | :--- | :--- |
| `0x84` | **Safety Door** | - Simulates opening the safety door.<br /> - **Action:** Enters `Door:0` state. Retracts mode is optional (if enabled). Spindle/Coolant turn off.<br /> - **Resume:** Requires closing the door (or re-sending `0x84` in some sims) and sending Cycle Start (`~`). |
| `0x85` | **Jog Cancel** | - **Only valid in JOG state.**<br /> - Immediately keeps the feed hold and flushes the jog buffer.<br /> - Effectively brings the machine to a smooth stop during a jog command. |
| `0x87` | **Report All** | (grblHAL specific) Acts like `?` but ignores the `$10` status mask, returning **all** available data fields. Useful for GUIs to fully synchronize state. |

---

# Realtime Report

When you send `?`, status reports are streamed back. The format is a structured text string enclosed in `<` and `>`, with fields separated by pipe `|` characters.

```text
[<Idle|Run|Hold|Jog|Alarm|Door|Check|Home|Sleep|Tool>{:<substatus>}|<WPos:|MPos:><axis positions>{|Bf:<block buffers free>,<RX characters free>}{|Ln:<line number>}{|FS:<feed rate>,<programmed rpm>{,<actual rpm>}}{|Pn:<signals>}{|WCO:<axis offsets>}{|WCS:G<coordinate system>}{|Ov:<overrides>}{|A:<accessory status>}{|MPG:<0|1>}{|H:<0|1>{,<axis bitmask>}}{|D:<0|1>}{|Sc:<axisletters>}{|TLR:<0|1>}{|FW:<firmware>}{|In:<result>}]
```

:::info Formatting Note
In the definitions below:
- `{ }` indicates optional items.
- `< >` indicates variables or constants.
- `|` separates literal values.
:::

## Core States

`Idle`, `Run`, `Hold`, `Jog`, `Alarm`, `Door`, `Check`, `Home`, `Sleep`
-   **New in grblHAL:** `Tool` (for [Tool Change Protocol](https://github.com/grblHAL/core/wiki/Manual-tool-change-protocol)).
-   **Substatuses:**
    -   `Run:<1|2>`: `1`=Feed hold pending, `2`=Probing.
    -   `Alarm:<code>`: Current alarm code (always added for `0x87` report).

## Report Fields

| Field | Description | Format/Details |
| :--- | :--- | :--- |
| **Position** | Current axis positions. | `MPos:x,y,z...` (Machine) or `WPos:x,y,z...` (Work). |
| **Bf** | Buffer status. | `Bf:<planner_blocks>,<rx_bytes>` |
| **Ln** | Line Number. | `Ln:<n>` |
| **FS** | Feed and Speed. | `FS:<feed>,<rpm>{,<actual_rpm>}` |
| **Pn** | Input Signals. | `Pn:<letters>` <br /> **P**: Probe, **O**: Probe disconnected, **X/Y/Z/A/B/C/U/V/W**: Limits<br /> **D**: Door, **R**: Reset, **H**: Feed Hold, **S**: Cycle Start<br /> **E**: E-Stop, **L**: Block Delete, **T**: Optional Stop<br /> **M**: Motor Warning, **F**: Motor Fault, **Q**: Single Step |
| **WCO** | Work Coordinate Offset. | `WCO:x,y,z...` |
| **WCS** | Active Work System. | `WCS:G54`, `WCS:G59.3`, etc. (Sent on change) |
| **Ov** | Overrides. | `Ov:<feed%>,<rapid%>,<spindle%>` |
| **A** | Accessory State. | `A:<letters>`<br /> **S**: Spindle CW, **C**: Spindle CCW<br /> **M**: Mist (M7), **F**: Flood (M8)<br /> **T**: Tool Change Pending (M6) |
| **MPG** | Pendant Status. | `MPG:0` (Released), `MPG:1` (Taken). |
| **H** | Homing Status. | `H:0` (Not homed), `H:1` (Homed). Optional `,<bitmask>` for axis-specific. |
| **P** | Active Probe. | `P:<id>` (0=Primary, 1=Toolsetter, 2=Secondary). Reported when switching probes. |
| **D** | Diameter Mode. | `D:0` (Radius/G8), `D:1` (Diameter/G7). (Lathe only). |
| **Sc** | Scaling Status. | `Sc:<axisletters>` (e.g., `Sc:XY`). |
| **TLR** | Tool Length Reference. | `TLR:1` (Set), `TLR:0` (Not set). |
| **FW** | Firmware Identity. | `FW:grblHAL` (Full report `0x87` only). |
| **In** | Input Result (M66). | `In:0`/`In:1` (Digital state), `In:-1` (Error). |
| **SD** | SD Card Status. | `SD:0` (Unmounted)<br /> `SD:1` (Mounted)<br /> `SD:2` (Unmounted, auto-detect)<br /> `SD:3` (Mounted, auto-detect)<br /> `SD:<pct>,<filename>` (Streaming)<br /> `SD:Pending` (Suspended) |

:::note
The streaming status (`SD:<pct>...`) is reported for regular (`?`) requests, but **not** when a full status (`0x87`) is requested.
:::
