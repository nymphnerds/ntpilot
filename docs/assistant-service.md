# NT Pilot Assistant service

The NT Pilot UI never reads a Codex CLI, VS Code account or provider credential
from the client device. It communicates only with the same-origin Assistant API.

Each browser or native wrapper receives an opaque, HTTP-only session cookie. The
service creates an isolated Codex account directory, conversation store and App
Server process for that session. Sign-in and sign-out therefore affect only that
NT Pilot session.

The container carries its own runtime. A persistent encrypted volume mounted at
`/data` preserves account tokens and conversations across service restarts. In a
remote deployment the service uses Codex device authorization, so the callback
does not depend on a desktop localhost address.

Build from the directory containing both `ntpilot` and the private
`ntpilot-knowledge` checkout:

```bash
docker build -f ntpilot/Containerfile -t ntpilot .
docker run --read-only --tmpfs /tmp -p 8766:8766 -v ntpilot-data:/data ntpilot
```

Production deployment requires HTTPS, a private persistent volume and normal
service-level rate limiting. Do not expose the local development host directly
to the internet.
