import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { SongComposition, metadataFromProject } from './song-composition.jsx';
import { scenes } from '@song-scenes';

const RegisteredSong = (props) => <SongComposition {...props} sceneRegistry={scenes} />;

const RemotionRoot = () => (
  <Composition
    id="song-reel"
    component={RegisteredSong}
    width={1080}
    height={1920}
    fps={24}
    durationInFrames={1}
    defaultProps={{ project: {}, cueEntries: [], assetPaths: {}, fontPaths: {}, imageAssets: [], fontSpecs: [], audioPublicPath: null }}
    calculateMetadata={({ props }) => metadataFromProject(props.project)}
  />
);

registerRoot(RemotionRoot);
