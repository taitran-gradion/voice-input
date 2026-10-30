# voice-input

A Margince extension unit that lets a member dictate into any text field in the app.

Click into a text field or text area, then press the microphone at its right edge (or **Alt+V**) and speak. The words are typed at the cursor, in the app's language (English, German or Vietnamese), while a caption under the field shows what is being heard. Press the microphone again, Alt+V or Esc to stop; leaving the field stops it too.

- Works on plain text inputs, search fields, text areas and rich-text editors. Password, number, date, email and URL fields get no microphone.
- The screen that owns the field hears an ordinary input event, so its own state (React's `onChange`) keeps the dictated words.
- Uses the browser's own speech recognition: Chrome, Edge and Safari. Firefox has none, and shows no microphone. Chrome and Edge send the audio to their speech service to turn it into text; Margince stores nothing.

## How it works

The unit's frontend mounts one microphone beside the app and moves it onto whichever text field has focus, so no core screen changes. `#/ext/voice-input` explains it, with a field to try.

## Install

In an installation's `extensions.mod`:

```
require github.com/taitran-gradion/voice-input v0.0.0
replace github.com/taitran-gradion/voice-input => ./addons/voice-input
```
