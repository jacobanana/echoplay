# echoplay-server
EchoPlay Node.js web messaging server

## What is echo*play*?
EchoPlay is a simple application to help children learn music and play together. 
The server provides access to a "pad" like interface which can be set to a specific scale.
Notes can be triggered by pressing on the colored pads (using a mouse or on a touchscreen), by using the computer keyboard or with a MIDI controller.
When another player joins the jam, his notes will be displayed in real time on the other jammers' interface.

## Keyboard shortcuts

### Set root note
| Shortcut | Action |
| -------- | ------ |
| `alt` + `a`  | set to A | 
| `alt` + `b`  | set to B | 
| `alt` + `c`  | set to C | 
| `alt` + `d`  | set to D | 
| `alt` + `e`  | set to E | 
| `alt` + `f`  | set to F | 
| `alt` + `g`  | set to G | 
| `alt` + `left` | set 1 semitone lower |
| `alt` + `right` | set 1 semitone higher |
| `alt` + `r` -> `k` | set random root note |

### Set scale
| Shortcut | Action |
| -------- | ------ |
| `alt` + `0` | Set to *chromatic* scale |
| `alt` + `1` | Set to *major* scale |
| `alt` + `2` | Set to *minor* scale |
| `alt` + `3` | Set to *harmonic minor* scale |
| `alt` + `4` | Set to *gipsy* scale |
| `alt` + `5` | Set to *pentatonic* scale |
| `alt` + `6` | Set to *melodic minor (ascending)* scale |
| `alt` + `7` | Set to *melodic minor (descending)* scale |
| `alt` + `8` | Set to *octatonic* scale |
| `alt` + `r` -> `s` | Set to a random scale |


### Octave Ranges
| Shortcut | Action |
| -------- | ------ |
| `cmd` + `up` | shift octave up (applies locally) |
| `cmd` + `down` | shift octave down (applies locally) |
| `alt` + `up` | shift octave up (applies globally) |
| `alt` + `down` | shift octave down (applies globally) |


### Interface / Display
| Shortcut | Action |
| -------- | ------ |
| `alt` + `n` | display note names |
| `alt` + `shift` + `n` | hide note names |
| `cmd` + `shift` + `up` | add 1 octave to the range of the interface |
| `cmd` + `shift` + `down` | remove 1 octave to the range of the interface |
| `alt` + `shift` + `up` | add 1 octave to the range of the interface (applies globally) |
| `alt` + `shift` + `down` | remove 1 octave to the range of the interface (applies globally) |
| `F1` | show full screen |


### Instrument & Sound
| Shortcut | Action |
| -------- | ------ |
| `cmd` + `.` | Volume up |
| `cmd` + `,` | Volume down |

