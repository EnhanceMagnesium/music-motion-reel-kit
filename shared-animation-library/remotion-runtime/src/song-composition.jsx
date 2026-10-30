import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from 'remotion';
import { audioDurationInFrames, projectCompositionMetadata, wholeProjectFrameCount } from '../../export/export-plan.mjs';

const EPS = 1e-9;
export const roundFrame = (seconds, fps) => Math.round(seconds * fps + EPS);

export function metadataFromProject(project) {
  if (!project || project.normalized !== true) throw new Error('Remotion inputProps.project must be the normalized shared PROJECT config');
  const metadata = projectCompositionMetadata(project);
  if (metadata.durationInFrames < 1) throw new Error('PROJECT.duration must resolve to at least one frame');
  return metadata;
}

function ResourceReadiness({ imageAssets, fontSpecs }) {
  const { delayRender: makeDelay, continueRender: resume, cancelRender: abort } = useDelayRender();
  const shouldWait = imageAssets.length > 0 || fontSpecs.length > 0;
  const [handle] = useState(() => shouldWait ? makeDelay('Loading declared production images and fonts') : null);

  useEffect(() => {
    if (handle === null) return undefined;
    let cancelled = false;
    const jobs = [
      ...imageAssets.map(async (asset) => {
        const image = new Image();
        image.src = staticFile(asset.path);
        await image.decode();
      }),
      ...fontSpecs.map(async (spec) => {
        const descriptors = {
          style: spec.style || 'normal',
          weight: String(spec.weight ?? 'normal'),
          ...(spec.unicodeRange ? { unicodeRange: spec.unicodeRange } : {}),
        };
        const face = new FontFace(spec.family, `url("${staticFile(spec.path)}")`, descriptors);
        await face.load();
        document.fonts.add(face);
      }),
    ];
    Promise.all(jobs)
      .then(() => { if (!cancelled) resume(handle); })
      .catch((error) => { if (!cancelled) abort(error); });
    return () => { cancelled = true; };
  }, [abort, fontSpecs, handle, imageAssets, resume]);

  return null;
}

function TimedLayer({ project, entry, Scene, cueEntries, assetPaths, fontPaths, role }) {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = roundFrame(entry.start, fps);
  const productionFrame = startFrame + localFrame;
  const productionSeconds = productionFrame / fps;
  const time = Object.freeze({
    frame: productionFrame,
    localFrame,
    fps,
    localSeconds: localFrame / fps,
    productionSeconds,
    sourceSeconds: project.sourceAudioOffsetSeconds + productionSeconds,
    sceneDurationSeconds: entry.end - entry.start,
  });
  return <Scene project={project} scene={entry} time={time} cues={cueEntries} assets={assetPaths} fonts={fontPaths} role={role} />;
}

function renderLayer(project, entry, registry, extras, role) {
  const implementation = entry.impl ?? entry.id;
  const Scene = registry?.[implementation];
  if (typeof Scene !== 'function') throw new Error(`Remotion scene registry has no component "${implementation}" for ${role} "${entry.id}"`);
  const from = roundFrame(entry.start, project.fps);
  const end = Math.abs(entry.end - project.duration) <= EPS
    ? wholeProjectFrameCount(project)
    : roundFrame(entry.end, project.fps);
  if (end <= from) throw new Error(`${role} "${entry.id}" has no frames after timebase rounding`);
  return (
    <Sequence key={`${role}:${entry.id}`} from={from} durationInFrames={end - from}>
      <TimedLayer project={project} entry={entry} Scene={Scene} {...extras} role={role} />
    </Sequence>
  );
}

export function SongComposition({ project, sceneRegistry, cueEntries = [], assetPaths = {}, fontPaths = {}, imageAssets = [], fontSpecs = [], audioPublicPath = null }) {
  const { durationInFrames } = useVideoConfig();
  const overlays = Array.isArray(project.overlays) ? project.overlays : [];
  const publicAssets = Object.fromEntries(Object.entries(assetPaths).map(([key, file]) => [key, staticFile(file)]));
  const publicFonts = Object.fromEntries(Object.entries(fontPaths).map(([key, file]) => [key, staticFile(file)]));
  return (
    <AbsoluteFill>
      <ResourceReadiness imageAssets={imageAssets} fontSpecs={fontSpecs} />
      {audioPublicPath ? (
        <Html5Audio
          src={staticFile(audioPublicPath)}
          trimBefore={roundFrame(project.sourceAudioOffsetSeconds, project.fps)}
          durationInFrames={audioDurationInFrames(project, durationInFrames)}
        />
      ) : null}
      {project.scenes.map((entry) => renderLayer(project, entry, sceneRegistry, { cueEntries, assetPaths: publicAssets, fontPaths: publicFonts }, 'scene'))}
      {overlays.map((entry) => renderLayer(project, entry, sceneRegistry, { cueEntries, assetPaths: publicAssets, fontPaths: publicFonts }, 'overlay'))}
    </AbsoluteFill>
  );
}
