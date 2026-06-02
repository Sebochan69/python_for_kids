# Accessibility Notes

Python for Kids should be usable by keyboard and screen-reader users from the
start, even while the UI is still small.

## Current Support

- Skip link to jump to the code area.
- Visible focus styles for buttons, selects, textareas, and story cards.
- Story cards can be selected with mouse, focus, Enter, or Space.
- Running, output, validation, helper, and error areas use status or alert
  semantics where useful.
- Text uses simple labels and avoids raw trace JSON in the child-facing view.
- Forced-colors mode keeps card boundaries visible.

## Current Boundaries

- The editor is still a plain textarea.
- There is no screen-reader-specific walkthrough yet.
- There is no audio narration yet.
- There is no reduced-reading mode for younger children yet.

Future changes should preserve keyboard access and avoid relying on color alone
to communicate mission state.
