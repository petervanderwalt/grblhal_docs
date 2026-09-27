# O-code

grblHAL supports [parameters](https://linuxcnc.org/docs/html/gcode/overview.html#_parameters), [expressions](https://linuxcnc.org/docs/html/gcode/overview.html#gcode:expressions) and
[flow control](http://www.linuxcnc.org/docs/html/gcode/o-code.html#ocode:looping), LinuxCNC style \(with some limitations\), if enabled
in the [config file](https://github.com/grblHAL/core/blob/ce7c3592b45fe9b5b1909f22cced15201bc72da6/config.h#L481-L497)
or in builds made with the [Web Builder](http://svn.io-engineering.com:8080/) when _RS274 NGC expression support_ is enabled in the _Advanced features_ tab.

The `O`-word serves as a label for [flow control statements](flow-control-statements). It is important that the `O`-numbers match at the beginning and end of a control segment and that they are unique within a file.

> ℹ️ **Info**
> - Subprograms and `O`-words can only be used in files stored in a local file system with the exception of `CALL` to named subprograms and the forward branching [flow control statements](flow-control-statements) `IF`, `ELSE`, `ELSEIF`, `ENDIF` in data streamed from a sender (if the sender permits them).

# Subprograms

There are five kinds of subprograms available in grblHAL, callable via `G65`, `G66`, `M98`, `O<number> CALL` and `O<name> CALL`.

> ℹ️ **Info**
> - External subprograms are stored in files located by searching the following directories in order `/` (root), `/littlefs` and finally `/embedded`.

### G65 and G66

#### Numbered parameters passed as arguments to G65 and G66 subprograms

| Word | Parameter | Word | Parameter | Word | Parameter |
|------|-----------|------|-----------|------|-----------|
|  A   | #1        |  I   | #4        |  T   | #20       |
|  B   | #2        |  J   | #5        |  U   | #21       |
|  C   | #3        |  K   | #6        |  V   | #22       |
|  D   | #7        |  M   | #13       |  W   | #23       |
|  E   | #8        |  Q   | #17       |  X   | #24       |
|  F   | #9        |  R   | #18       |  Y   | #25       |
|  H   | #11       |  S   | #19       |  Z   | #26       |

> ℹ️ **Info**
> Parameters not set by the caller are set to 0 by the parser prior to the call.

### G65

Syntax: `G65 P- L- [A- B- C- ...]`

| Parameter | Description |
|-----------|-------------|
| **P** | The number of the subprogram (e.g., `P100` runs the `P100.macro`). |
| **L** | **Optional:** Repeat count, default `1`. The macro will be run `L` times. (Available from build 20260125). |
| **A, B, C, X, Y, Z...** | Values to be passed to the subprogram. These become local variables inside the macro. |

`G65` is non-modal and is executed by running the external subprogram `P<number>.macro` `L` number of times.

### G66

`G66 P- [A- B- C- ...]`

| Parameter | Description |
|-----------|-------------|
| **P** | The number of the subprogram (e.g., `P100` runs the `P100.macro`). |
| **A, B, C, X, Y, Z...** | Values to be passed to the subprogram. These become local variables inside the macro. |

`G66` is modal, it will run `P<number>.macro` for each block _following_ the `G66` block until a `G67` block is encountered. The initial `G66` will only set the local parameters from the arguments passed, and each subsequent execution will run the actual code with the supplied parameter values even if they are changed within the subprogram.

### M98

Syntax: `M98 P- [L-]` 

| Parameter | Description |
|-----------|-------------|
| **P** | The number of the internal subprogram. |
| **L** | **Optional:** Repeat count, default `1`. The macro will be run `L` times. (Available from build 20260125). |

`M98` will run a subprogram embedded in the main program or an external program depending on the `$700` setting. When configured for running an embedded routine the whole program is scanned for subprograms which are to be delimited by `O<number>` and `M99`. Embedded subprograms may be placed anywhere in the program but normal practice is to embed them after the main program code. If not configured for running an embedded routine it will run the external program `P<number>.macro`.

> ℹ️ **Info**
> - When configured for running an embedded routine `M98` can only be used in programs stored in a local file system.

<sup>1</sup> In check mode non-inbuilt `G65` macros will not be run, only file availability will be checked.

## O CALL

Subprogram code must be delimited by `O- SUB` and `O- ENDSUB`. To exit a subprogram early, or return a value, use the `RETURN[]` statement. Do **not** terminate a subprogram with `M2` or `M30` as this will likely cause issues.  
If a value is returned the parameter `_value_returned` is set to `1` and `_value` to the returned value, if not `_value_returned` is set to `0`.  
`[arguments]` must be expressions, to pass constant values enclose them in square brackets, e.g. `o100 call [1] [2] [#<_xpos>]`. Up to 30 arguments can be passed and they will be assigned to the local parameters in ascending order (`#1, #2, #3, ...`). The values of remaining local parameters will be assigned from the callers context and all will be restored to their original values on return.

### Numbered O CALL

**Syntax** `O- call [arguments]`

| Parameter | Description |
|-----------|-------------|
| **O** | The number of the internal subprogram. |
| **arguments** | **Optional:** Values to pass to the called subprogram, assigned as local parameters `#1`, `#2`, ... |

Numbered subprograms must be embedded in the same program as the call is made from and they must located prior to any `CALL` statements.

**Simple example:**

```gcode
o123 sub
  ( Code for a specific operation, e.g., )
  G1 X10 Y10 F500
  G1 Z-2 F100
o123 endsub

; Main program

G53 G0 Z0
O123 call
M2
```

**Advanced example, with parameter passing, expressions and recursion:**

```gcode
(Program to mill a flowsnake)
(K. Lerman)

o1000 sub
  #<level> = #1
  #<startX> = #2
  #<startY> = #3
  #<endX> = #4
  #<endY> = #5

  o1001 if [#<level> EQ 0]
    g1 f10 x#<endX> y#<endY>
  o1001 else
    #<p1X> = [[#<startX> * 2 + #<endX>]/3]
    #<p1Y> = [[#<startY> * 2 + #<endY>]/3]

    #<p2X> = [[#<startX> + #<endX>]/2 + [#<endY> - #<startY>]/[SQRT[12.0]]]
    #<p2Y> = [[#<startY> + #<endY>]/2 - [#<endX> - #<startX>]/[SQRT[12.0]]]

    #<p3X> = [[#<startX> + 2 * #<endX>]/3]
    #<p3Y> = [[#<startY> + 2 * #<endY>]/3]

    o1000 call [#<level>-1] [#<startX>] [#<startY>] [#<p1X>] [#<p1Y>]
    o1000 call [#<level>-1] [#<p1X>] [#<p1Y>] [#<p2X>] [#<p2Y>]
    o1000 call [#<level>-1] [#<p2X>] [#<p2Y>] [#<p3X>] [#<p3Y>]
    o1000 call [#<level>-1] [#<p3X>] [#<p3Y>] [#<endX>] [#<endY>]
  o1001 endif
o1000 endsub

; Main program

S100M3
g0 z1
g0 x.25 y1.0
g1 f10 z0
#<level> = 5
o1000 call [#<level>] [.25] [1.0] [3.75] [1.0]
o1000 call [#<level>] [3.75] [1.0] [2.0] [3.95]
o1000 call [#<level>] [2.0] [3.95] [.25] [1.0]
g0 z1
M30
```

### Named O CALL

**Syntax:** `O<-> call [arguments]`  

| Parameter | Description |
|-----------|-------------|
| **O** | The name of the external subprogram enclosed in angle brackets. It will run the named file with a `.macro` extension. |
| **arguments** | **Optional:** Values to pass to the called subprogram, assigned as local parameters `#1`, `#2`, ... |


> ℹ️ **Info**
> - The name is converted to lowercase, be sure to save the file with a lower case file name to ensure it can be found.
> - The subprogram file must contain a single subprogram definition, enclosed by `o<name> sub` and `o<name> endsub` with the name matching the file name (excluding the extension).

**Example**:

A file named `namedsub.macro` in a local file system containing:

```gcode
o<namedsub> sub
(print, Hi, I am namedsub)
X1
Y1
Z1
X0Y0Z0
G4P.1
(print, Done!)
o<namedsub> endsub
```

Call from the senders MDI or gcode program:

`o<namedsub> call`

## Operators, functions and flow control

### Operators and precedence

| Operators                 | Precedence |
|---------------------------|------------|
| \*\*                      | Highest    |
| \*, / and MOD             |            |
| + and -                   |            |
| EQ, NE, GT, GE, LT and LE |            |
| AND, OR and XOR           | Lowest     |

### Functions

| Name            | Result                                       | Comment                        |
|-----------------|----------------------------------------------|--------------------------------|
| ABS[arg]        | Absolute value.                              |                                |
| ACOS[arg]       | Inverse cosine.                              |                                |
| ASIN[arg]       | Inverse sine.                                |                                |
| ATAN[arg]/[arg] | Four quadrant inverse tangent.               |                                |
| COS[arg]        | Cosine.                                      |                                |
| EXISTS[arg]     | Named parameter exists.                      |                                |
| EXP[arg]        | e raised to the given power.                 |                                |
| FIX[arg]        | Round down to integer.                       |                                |
| FUP[arg]        | Round up to integer.                         |                                |
| LN[arg]         | Base-e logarithm.                            |                                |
| ROUND[arg]      | Round to nearest integer.                    |                                |
| SIN[arg]        | Sine.                                        |                                |
| SQRT[arg]       | Square root.                                 |                                |
| TAN[arg]        | Tanget.                                      |                                |
| PRM[arg]        | Value of numeric setting.<sup>1</sup>        | Available from build 20241025. |
| PRM[arg,bit]    | Value of bit in integer setting.<sup>1</sup> | Available from build 20241025. |

### Flow control statements

| Statement         | Local file | Streamed G-Code | Comment                                                  |
|-------------------|------------|-----------------|----------------------------------------------------------|
| if \<expr\>       | yes        | yes             |                                                          |
| elseif \<expr\>   | yes        | yes             |                                                          |
| else              | yes        | yes             |                                                          |
| endif             | yes        | yes             |                                                          |
| do                | yes        | no              |                                                          |
| continue          | yes        | no              |                                                          |
| break             | yes        | no              |                                                          |
| while \<expr\>    | yes        | no              |                                                          |
| endwhile          | yes        | no              |                                                          |
| repeat \<expr\>   | yes        | no              |                                                          |
| sub               | yes        | no              |                                                          |
| endsub            | yes        | no              |                                                          |
| call (numbered)   | yes        | no              |                                                          |
| call (named)      | yes        | yes             |                                                          |
| return \[<expr\>] | yes        | no              |                                                          |
| alarm  \<expr\>   | yes        | no              | \<expr\> must evaluate to a valid alarm code<sup>1</sup> |
| error  \<expr\>   | yes        | no              | \<expr\> must evaluate to a valid error code<sup>1</sup> |

<sup>1</sup> grblHAL specific extension.

## Inbuilt G65 macros

### G65P1

**Syntax:** `G65P1Q-`

Read numeric setting value. Alternatively the `PRM[]` function can be used.

| Parameter | Description         |
|-----------|---------------------|
| **Q**     | The setting number. |

If the setting exists and is numerical `_value_returned` is set to `1` and `_value` to the setting value, if not `_value_returned` is set to `0`.  

**Syntax:** `G65P1Q-S-`

Set numeric setting value. Available from build 20251028.

| Parameter | Description         |
|-----------|---------------------|
| **Q**     | The setting number. |
| **S**     | The new value.      |

If the setting exists, is numerical, and the value is allowed `_value_returned` is set to `1` and `_value` to the new setting value, if not `_value_returned` is set to `0`.  

### G65P2

**Syntax:** `G65P2Q-R-`

Read tool offset from tool table.

| Parameter | Description                    |
|-----------|--------------------------------|
| **Q**     | The tool number.               |
| **R**     | Axis number. 0 = X, 1 = Y, ... |

If a tool table is present and the tool is available `_value_returned` is set to `1` and `_value` to the axis offset, if not `_value_returned` is set to `0`.  

### G65P4

**Syntax:** `G65P4`

 Get current machine state, available from build 20250107.

| State | Description              |
|-------|--------------------------|
| 0     | Idle                     |
| 2     | Check mode<sup>1</sup>   |
| 4     | Cycle \(motion ongoing\) |
| 10    | Tool change              |

On return `_value_returned` is set to `1` and `_value` to the current state as listed above.  

### G65P5

**Syntax:** `G65P5Q-`

Select probe input, available from build 20250514.

| Parameter | Description   |
|-----------|---------------|
| **Q**     | The probe id. |

| Probe id | Description     |
|----------|-----------------|
| 0        | Primary probe   |
| 1        | Toolsetter      |
| 2        | Secondary probe |

> ℹ️ **Info**
> Selecting a probe input that is not available will raise an error.

### G65P6

**Syntax:** `G65P6`

Disable spindle on/off delays for the next `M3`, `M4` or `M5` command, available from build 20250922.

### G65P7

**Syntax:**  
`G65P7 S- F- R- <X->` for function codes 1-4.  
`G65P7 S- F- R- A-` for function code 5 and 6.  
`G65P7 S- F-` for function code 7.  
`G65P7 S- F- R- A- <B-> <C->` for function codes 16 and 17.  

Send Modbus message, available from build 20260215.

| Parameter | Description                    |
|-----------|--------------------------------|
| **S**     | Modbus server address              |
| **F**     | Modbus function code, 1-7, 16 and 17 are supported  |
| **R**     | Register base address  |
| **X**     | Nnumber of registers or bits to read or write |
| **A**     | First value |
| **B**     | Second value |
| **C**     | Third value |

Allowed range the X parameter is for 1 - 3 for function codes 3 and 4 and 1 - 16 for function codes 1, 2 and 15. Defaults to 1.  

On exceptions `_value_returned` is set to `0` and `_value` to the exception code.  
On success `_value_returned` is set to the number of values received and `_value`, `_value2` and `_value3` is set accordingly.
