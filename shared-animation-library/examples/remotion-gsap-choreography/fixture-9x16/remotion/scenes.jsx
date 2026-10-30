// Song-neutral mechanism fixture only. The colors, labels, and graphic are test data.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useGsapTimeline } from '@remotion/gsap';

const PALETTE = {
  ground: '#101820',
  paper: '#F1F0E8',
  quiet: '#94A7B5',
  line: '#344957',
  mint: '#7DE0C3',
  violet: '#C39BFF',
};

export function ChoreographyStudy({ project }) {
  const { width, height } = project;
  const fieldSize = Math.min(width * 0.54, height * 0.36);
  const fieldTop = height * 0.405;
  const scope = useGsapTimeline(({ timeline, selector }) => {
    timeline.fromTo(selector('[data-kicker]'),
      { y: -22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out' }, 0);
    timeline.fromTo(selector('[data-orbit]'),
      { rotation: -42, scale: 0.76, opacity: 0 },
      { rotation: 38, scale: 1, opacity: 1, duration: 1.15, ease: 'power3.out' }, 0.18);
    timeline.fromTo(selector('[data-core]'),
      { scale: 0.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.38, ease: 'back.out(1.8)' }, 0.64);
    timeline.fromTo(selector('[data-node-a]'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.26, ease: 'back.out(2)' }, 0.76);
    timeline.fromTo(selector('[data-node-b]'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.26, ease: 'back.out(2)' }, 0.94);
    timeline.fromTo(selector('[data-node-c]'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.26, ease: 'back.out(2)' }, 1.12);
    timeline.fromTo(selector('[data-sequence]'),
      { y: 18, opacity: 0, letterSpacing: '0.24em' },
      { y: 0, opacity: 1, letterSpacing: '0.08em', duration: 0.42, ease: 'power2.out' }, 1.48);
    timeline.fromTo(selector('[data-progress]'),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.18, ease: 'none' }, 1.28);
    timeline.fromTo(selector('[data-pulse]'),
      { scale: 0.54, opacity: 0 },
      { scale: 1.24, opacity: 0.72, duration: 0.26, ease: 'power2.out' }, 2.28);
    timeline.to(selector('[data-pulse]'),
      { scale: 0.92, opacity: 0.18, duration: 0.48, ease: 'power2.inOut' }, 2.54);
    timeline.fromTo(selector('[data-hold]'),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.34, ease: 'power2.out' }, 3.08);
  }, { dependencies: [width, height] });

  return (
    <AbsoluteFill ref={scope} style={{
      background: PALETTE.ground,
      color: PALETTE.paper,
      overflow: 'hidden',
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      <div data-kicker style={{
        position: 'absolute', top: `${height * 0.09}px`, left: '8%', width: '84%',
        textAlign: 'center', color: PALETTE.quiet, fontSize: `${width * 0.018}px`,
        fontWeight: 700, letterSpacing: '0.2em',
      }}>MOTION STUDY&nbsp; / &nbsp;FRAME-SEEKABLE</div>

      <div style={{
        position: 'absolute', left: '50%', top: `${fieldTop}px`, width: `${fieldSize}px`,
        height: `${fieldSize}px`, transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          position: 'absolute', inset: '9%', border: `2px solid ${PALETTE.line}`,
          borderRadius: '50%', boxSizing: 'border-box',
        }} />
        <div style={{
          position: 'absolute', inset: '25%', border: `1px solid ${PALETTE.line}`,
          borderRadius: '50%', boxSizing: 'border-box',
        }} />
        <div data-orbit style={{
          position: 'absolute', inset: 0, border: `1px solid ${PALETTE.mint}`,
          borderRadius: '50%', boxSizing: 'border-box',
        }}>
          <div data-node-a style={{
            position: 'absolute', left: '50%', top: '-2.5%', width: '8%', aspectRatio: '1',
            borderRadius: '50%', background: PALETTE.mint, transform: 'translateX(-50%)',
            boxShadow: `0 0 ${width * 0.025}px ${PALETTE.mint}`,
          }} />
          <div data-node-b style={{
            position: 'absolute', right: '3%', top: '68%', width: '6%', aspectRatio: '1',
            borderRadius: '50%', background: PALETTE.violet,
          }} />
          <div data-node-c style={{
            position: 'absolute', left: '12%', top: '72%', width: '5%', aspectRatio: '1',
            borderRadius: '50%', background: PALETTE.paper,
          }} />
        </div>
        <div data-pulse style={{
          position: 'absolute', left: '50%', top: '50%', width: '31%', aspectRatio: '1',
          border: `1px solid ${PALETTE.violet}`, borderRadius: '50%',
          transform: 'translate(-50%, -50%)', boxSizing: 'border-box',
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: '50%', width: '16%', aspectRatio: '1',
          transform: 'translate(-50%, -50%)',
        }}>
          <div data-core style={{
            width: '100%', height: '100%', borderRadius: '50%', background: PALETTE.paper,
            boxShadow: `0 0 ${width * 0.03}px rgba(241,240,232,0.35)`,
          }} />
        </div>
      </div>

      <div data-sequence style={{
        position: 'absolute', top: `${height * 0.665}px`, left: '10%', width: '80%',
        textAlign: 'center', fontSize: `${width * 0.052}px`, fontWeight: 700,
        letterSpacing: '0.08em', opacity: 0,
      }}>SEQUENCE</div>
      <div style={{
        position: 'absolute', top: `${height * 0.755}px`, left: '14%', width: '72%',
        height: '2px', background: PALETTE.line, overflow: 'hidden',
      }}>
        <div data-progress style={{
          width: '100%', height: '100%', background: PALETTE.mint,
          transformOrigin: 'left center', transform: 'scaleX(0)',
        }} />
      </div>
      <div data-hold style={{
        position: 'absolute', top: `${height * 0.80}px`, left: '10%', width: '80%',
        textAlign: 'center', color: PALETTE.quiet, fontSize: `${width * 0.017}px`,
        fontWeight: 700, letterSpacing: '0.18em', opacity: 0,
      }}>HOLD&nbsp; / &nbsp;SEEK&nbsp; / &nbsp;REVISIT</div>
      <div style={{
        position: 'absolute', bottom: `${height * 0.055}px`, left: '8%', width: '84%',
        textAlign: 'center', color: PALETTE.quiet, fontSize: `${width * 0.014}px`,
        letterSpacing: '0.13em',
      }}>SYNTHETIC FIXTURE&nbsp; • &nbsp;NOT SONG ART</div>
    </AbsoluteFill>
  );
}

export const scenes = { ChoreographyStudy };
