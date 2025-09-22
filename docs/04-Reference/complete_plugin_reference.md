---
title: "Complete Plugins Reference"
description: "A comprehensive list of all grblHAL Official Plugin settings, parameters and commands"
---

This guide lists plugin-specific **M-codes**, **G-codes**, and **$-settings** provided by grblHAL’s plugin ecosystem.  
Each section includes the original repository URL for reference.  

---

## Plugin: Plasma / Torch Height Control (THC)
Github Repository: https://github.com/grblHAL/Plugin_plasma

#### $-Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `$350` | Mode of operation | `1` → uses external arc voltage input |
| `$351` | Arc OK pin | `2` → input pin number |
| `$352` | Arc Voltage pin | `3` → input pin number |
| `$353` | Up/Down pin | `4` → output pin number |
| `$354` | Voltage scale | `1.0` → scaling factor |
| `$355` | Voltage threshold | `0.5` → threshold value |
| `$356` | Velocity Anti-Dive threshold (%) | `20` |

#### M-Codes

| M-Code | Syntax | Description |
|--------|--------|-------------|
| `M62` | `M62 P[port]` | Disable THC, synchronized with motion |
| `M63` | `M63 P[port]` | Enable THC, synchronized with motion |
| `M64` | `M64 P[port]` | Disable THC, immediate |
| `M65` | `M65 P[port]` | Enable THC, immediate |
| `M67` | `M67 E[port] Q[percent]` | Immediate velocity reduction |
| `M68` | `M68 E[port] Q[percent]` | Velocity reduction synchronized |

#### Example
```gcode
; Plasma THC example
$350=2          ; THC mode: arc ok + up/down
$356=20         ; VAD threshold 20%
$361=1.5        ; Voltage scaling factor
$682=80         ; Z feed factor

M190 P3         ; Select material #3
M63 P0          ; Enable THC synced
G1 X100 Y0 F2000
G1 X100 Y100 F2000
M67 E0 Q50      ; Immediate feed reduction to 50%
M64 P0          ; Disable THC after cut
```

---

## Plugin: Fan Control (`Plugin_fans`)
Github Repository: https://github.com/grblHAL/Plugin_fans

#### M-Codes

| M-Code | Syntax | Description |
|--------|--------|-------------|
| `M106` | `M106 P[fan] S[speed]` | Turn fan ON, set PWM speed (0–255) |
| `M107` | `M107 P[fan]` | Turn fan OFF |

#### $-Settings

| $-Setting | Description |
|-----------|-------------|
| `$386-$389` | Map aux port → fan 0..3 |
| `$480` | Auto-off delay (minutes) |
| `$483` | Bitmask: link fans to spindle enable |

#### Example
```gcode
; Turn on fan 0 at PWM 200
M106 P0 S200

; Turn off fan 0
M107 P0
```

---

## Plugin: RGB LED Strip (`M150`) - `Plugins_misc`
Github Repository: https://github.com/grblHAL/Plugins_misc

| Command | Syntax | Description |
|---------|--------|-------------|
| `M150` | `M150 [R[intensity]] [U[intensity]] [B[intensity]] [S[strip]]` | Set LED color/brightness for a strip |

#### Example
```gcode
; Set strip 1 to bright red
M150 R255 U0 B0 S1

; Set strip 1 to purple
M150 R128 B128 S1

; Turn LEDs off
M150 R0 U0 B0 S1
```

---

## Plugin: Feed Override (`M220`) - `Plugins_misc`
Github Repository: https://github.com/grblHAL/Plugins_misc

| Command | Syntax | Description |
|---------|--------|-------------|
| `M220` | `M220 [B] [R] [S[percent]]` | Feed override: B=backup, R=restore, S=set % |

#### Example
```gcode
; Set feed override to 80%
M220 S80

; Restore previous backup and set to 50%
M220 RS50
```

---

## Plugin: Servo Control (`M280`) - `Plugins_misc`
Github Repository: https://github.com/grblHAL/Plugins_misc

| Command | Syntax | Description |
|---------|--------|-------------|
| `M280` | `M280 P[servo] S[position]` | Control analog/PWM servo: P=index, S=angle 0–180° |

#### Example
```gcode
; Move servo 0 to 90 degrees
M280 P0 S90

; Query servo 1 current position
M280 P1
```

---

## Plugin: OpenPNP (`Plugin_OpenPNP`)
Github Repository: https://github.com/grblHAL/Plugin_OpenPNP

| M-Code | Syntax | Description |
|--------|--------|-------------|
| `M42` | `M42 P[ioport] S[0|1]` | Set digital output |
| `M114` | `M114` | Report current position |
| `M115` | `M115` | Report firmware info |
| `M204` | `M204 P[axes] S[accel]` | Set axis acceleration |
| `M205` | `M205 [axes]` | Set jerk |
| `M400` | `M400` | Wait for motion buffer empty |

#### Example
```gcode
; Turn on digital output 2
M42 P2 S1

; Set acceleration for X/Y
M204 PXY S500
```

---

## Plugin: SD-Card / File System (`Plugin_SD_card`)
Github Repository: https://github.com/grblHAL/Plugin_SD_card

| Command | Syntax | Description |
|---------|--------|-------------|
| `$FM` | `$FM` | Mount SD card |
| `$F` | `$F` | List CNC-relevant files |
| `$F+` | `$F+` | List all files recursively |
| `$F=[filename]` | `$F=[filename]` | Run G-code file |
| `$FR` | `$FR` | Enable rewind mode |
| `$FD=[filename]` | `$FD=[filename]` | Delete file |

#### Example
```gcode
; Mount SD card
$FM

; List files
$F+

; Run a file
$F=myprogram.ngc

; Delete a file
$FD=old_program.ngc
```

---

## Plugin: Motor / Trinamic (`Plugins_motor`)
Github Repository: https://github.com/grblHAL/Plugins_motor

| M-Code | Syntax | Description |
|--------|--------|-------------|
| `M122` | `M122 [axes]` | Driver report/debug |
| `M569` | `M569 [axis] S[0|1]` | Set driver mode: StealthChop / SpreadCycle |
| `M906` | `M906 [axes] S[current]` | Set RMS current |
| `M911` | `M911` | Report prewarn flags |
| `M912` | `M912` | Clear prewarn flags |
| `M913` | `M913 [axes]` | Hybrid threshold |
| `M914` | `M914 [axes]` | Homing sensitivity |

#### Example
```gcode
; Check driver status on X/Y
M122 XY

; Set StealthChop mode for X axis
M569 X S1

; Set RMS current for all axes
M906 X100 Y100 Z100
```

---

## Plugin: Spindle (`Plugins_spindle`)
Github Repository: https://github.com/grblHAL/Plugins_spindle

| M-Code | Syntax | Description |
|--------|--------|-------------|
| `M3` | `M3 S[rpm]` | Spindle on clockwise |
| `M4` | `M4 S[rpm]` | Spindle on counterclockwise |
| `M5` | `M5` | Spindle off |
| `M104` | `M104 P[n]` | Select spindle |
| `M51` | `M51 [options]` | Enable spindle features |

#### Example
```gcode
; Turn on spindle clockwise at 1200 RPM
M3 S1200

; Select spindle 1
M104 P1

; Turn off spindle
M5
```

---

## Plugin: Laser (`Plugins_laser`)
Github Repository: https://github.com/grblHAL/Plugins_laser

| Command | Syntax | Description |
|---------|--------|-------------|
| `M3/M4` | `M3/M4 S[power]` | Laser on with PWM power |
| `M5` | `M5` | Laser off |

#### Example
```gcode
; Laser on at 50% power
M3 S128

; Laser off
M5
```

---

## Plugin: Encoder (`Plugin_encoder`)
Github Repository: https://github.com/grblHAL/Plugin_encoder

| $-Setting | Description |
|-----------|-------------|
| `$701-$704` | Encoder pins and scaling per axis |

#### Example
```gcode
; Read spindle encoder position
M114
```

---

## Plugin: EEPROM (`Plugin_EEPROM`)
Github Repository: https://github.com/grblHAL/Plugin_EEPROM

| Feature | Description |
|---------|-------------|
| Storage | Extended EEPROM for custom variables |

#### Example
```gcode
; Read/write custom EEPROM values (plugin-specific)
; Example depends on machine configuration
```

---

## Plugin: WebUI (`Plugin_WebUI`)
Github Repository: https://github.com/grblHAL/Plugin_WebUI

| Feature | Description |
|---------|-------------|
| HTTP / WebSocket API | Exposes existing M/G-codes via web interface |

#### Example
```gcode
; No new M-codes; use M3/M4/M5 via WebUI API
```
