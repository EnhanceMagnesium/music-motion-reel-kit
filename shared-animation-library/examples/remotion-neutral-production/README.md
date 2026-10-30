# Remotion neutral production fixture

This is an eight-second synthetic wiring example for the Remotion engine. It demonstrates two React scene components using the shared `PROJECT` scene schedule and time props. It has no song recording, font or image assets, so it does not verify audio synchronization, real media loading, full-song duration handling, or creative quality.

From the kit root, inspect its resolved plan without opening Chrome or producing media:

```sh
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-neutral-production --plan
```

The plan command is a configuration/readiness view only. Still rendering and video rendering are separate authorized production stages.
