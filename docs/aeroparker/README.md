# Aeroparker vendor documentation

The prompt for this project said the Aeroparker API documentation would live in
this directory. It was not present in the repository. The specification used for
`docs/AEROPARKER-AUDIT.md` was read from the owner's Google Drive:

- **Title:** AeroParker API Technical Specification v.1.42 Draft.pdf
- **Pages:** 210
- **Size:** 3,131,647 bytes
- **Modified:** 2026-09-10
- **Drive file id:** `1-4mWnG3xAlRf83vEGja38KFbrWuLu2vI`

The PDF itself is deliberately not committed here. Two reasons: it is a 3 MB
binary that git will store forever and diff badly, and it is a vendor draft that
Aeroparker may revise. A stale copy in the repository is worse than no copy.

If we want the repository to be self-contained, the right move is to commit the
PDF once per version under a versioned filename
(`aeroparker-api-v1.42-draft.pdf`) and update `docs/AEROPARKER-AUDIT.md`
alongside it. That is a decision for the repository owner, not one to make
silently.

The specification contains no credentials. Aeroparker usernames, passwords and
the `apiKey` used in booking URLs are not in this repository and must never be
committed; they belong in environment variables, documented by name only in
`.env.example`.
