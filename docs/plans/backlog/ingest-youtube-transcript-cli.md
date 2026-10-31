---
id: 12v3ljqo
priority: high
next_action: Wrap the installed yt-transcript-cli executable with one typed getTranscript function and a fixture test.
blocked_by: []
depends_on: ["io239qp2"]
related: []
reviewed_commit:
worktree:
---

# Use the existing YouTube CLI as a safe transcript tool

## Summary

Add a deterministic tool that runs the existing Python transcript CLI and returns a transcript to the application.

## Context

The published CLI already accepts a YouTube URL, writes `transcript_{VIDEO_ID}.txt` under `--output-dir`, and skips existing files. Its current documented text output has no timestamps. Do not extend or fork it in this milestone.

## Goals

- A single supported YouTube watch URL can be submitted and its transcript read back.
- The agent is not used to fetch or parse YouTube pages.
- Errors from missing executables, downloads, and invalid inputs are visible to the caller.

## Non-goals

- Playlists, timestamps, JSON export, transcription from audio, and agent analysis.

## Proposed design

Create `src/transcripts/get-transcript.ts` as a typed, single-purpose boundary. Accept a standard `https://www.youtube.com/watch?v=...` URL in the first version. Extract and validate the 11-character video ID only to locate the output file; delegate all transcript retrieval to the Python CLI.

```mermaid
flowchart LR
  A[YouTube URL] -->|validate video ID| B[Validated video ID]
  B -->|invoke yt-transcript-cli| C[Transcript CLI]
  C -->|write cached text| D[Cached transcript file]
  D -->|read text| E[Typed transcript result]
```

Execute the CLI with argument-array process spawning (no shell interpolation), a timeout, a controlled cache directory, and no arbitrary filesystem path input from the agent. Read cached output after a successful or skipped invocation. Treat transcript text as untrusted input.

## Implementation checklist

- [ ] Implement URL validation and the subprocess wrapper around `yt-transcript-cli`.
- [ ] Read the cached `.txt` file and return typed data; distinguish unavailable transcript from CLI failure.
- [ ] Add a fake-executable fixture test for success, cache reuse, invalid URL, and nonzero exit.
- [ ] Document the one-time macOS CLI installation and Python availability requirement.

## Validation

- The fake CLI test proves that the exact argument list is passed without shell execution.
- Two calls for the same video return the same cached text without creating duplicate files.
- A manually chosen public video returns non-empty text when networking and YouTube access permit.

## Risks

YouTube availability and rate limits can make live tests flaky. Keep tests offline with a fake CLI and treat a live download as an optional smoke test.

## Learning focus

Separate predictable tool execution from LLM reasoning and learn to enforce a tool trust boundary.

## Review checkpoint

Can you inspect the subprocess arguments, cached file, and clear error when download fails?

## Documentation impact

Extend `README.md` with `yt-transcript-cli` prerequisite, supported URL shape, and cache path.

## References

- <https://github.com/kirinmurphy/youtube-transcript-cli>
