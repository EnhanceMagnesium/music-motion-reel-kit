// React bridge for the woodcut printer inside the shared Remotion runtime. Written with React.createElement (no JSX) so it can be loaded and
// server-render-checked in plain Node as well as bundled by Remotion.
//
// Lifecycle (all in the browser; nothing is created at import or during server rendering):
//   1. layout effect "session": create the woodcut session for this (width, height, seed, geometry version/params), prepare it (build/borrow geometry,
//      create the printer) and mount its canvas; cleanup disposes the printer and removes the canvas.
//   2. layout effect "draw", keyed by frame: raise a Remotion delay handle synchronously in the commit, draw the requested frame, then release the handle
//      only after that draw completed (or failed). A frame change, config change or unmount releases the previous handle in cleanup, and a draw that was
//      superseded by a newer frame never prints.
// Errors are never swallowed: errorMode 'cancel' (default) calls Remotion's cancelRender; 'report' releases the handle, calls onError and shows the
// error in the DOM (data-woodcut-status="error") so a harness can observe it.
import React from 'react';
import { useDelayRender } from 'remotion';
import { createWoodcutSession } from './session.mjs';
import { geometryKey } from './determinism.mjs';

const { createElement: h, useLayoutEffect, useRef, useState } = React;

export function WoodcutCanvas(props) {
  const { width, height, seed, geometryVersion = 1, geometryParams = {}, buildGeometry, drawMask, drawColor = null, printerOptions = {}, maskBackground = '#000',
    inkStepsPerSecond = 12, time, frame: frameProp, fps: fpsProp, onEvent = null, onDrawn = null, onError = null, errorMode = 'cancel',
    timeoutInMilliseconds = 30000, label = 'WoodcutCanvas', style = null, cache } = props;
  const frame = frameProp ?? time?.frame;
  const fps = fpsProp ?? time?.fps;
  if (!Number.isInteger(frame) || frame < 0 || !(fps > 0)) throw new TypeError('WoodcutCanvas needs an integer frame >= 0 and a positive fps (pass `time` from the scene props, or frame and fps)');
  if (errorMode !== 'cancel' && errorMode !== 'report') throw new TypeError('errorMode must be "cancel" or "report"');
  const configKey = geometryKey({ width, height, seed, version: geometryVersion, params: geometryParams }) + `|ink${inkStepsPerSecond}|bg${maskBackground}`;

  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const container = useRef(null);
  const sessionRef = useRef(null);
  const prepareErrorRef = useRef(null);
  const latest = useRef(null);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [doneFrame, setDoneFrame] = useState(-1);

  // callbacks and non-key options are read through a ref so the effects depend only on frame and configuration identity
  useLayoutEffect(() => { latest.current = { buildGeometry, drawMask, drawColor, printerOptions, onEvent, onDrawn, onError, errorMode, cache, seconds: time?.productionSeconds }; });

  useLayoutEffect(() => {
    const l = latest.current;
    prepareErrorRef.current = null;
    const session = createWoodcutSession({
      width, height, seed, geometryVersion, geometryParams, maskBackground, inkStepsPerSecond,
      buildGeometry: (a) => latest.current.buildGeometry(a),
      drawMask: (g, c) => latest.current.drawMask(g, c),
      drawColor: l.drawColor ? (g, c) => latest.current.drawColor(g, c) : null,
      printerOptions: (c) => (typeof latest.current.printerOptions === 'function' ? latest.current.printerOptions(c) : latest.current.printerOptions),
      onEvent: (e) => latest.current.onEvent && latest.current.onEvent(e),
      ...(l.cache ? { cache: l.cache } : {}),
    });
    try {
      session.prepare();
      if (container.current && session.canvas) {
        const cv = session.canvas;
        cv.style.cssText = 'display:block;width:100%;height:100%';
        container.current.appendChild(cv);
      }
    } catch (error) {
      prepareErrorRef.current = error;
    }
    sessionRef.current = session;
    return () => { session.dispose(); if (sessionRef.current === session) sessionRef.current = null; };
  }, [configKey]);

  useLayoutEffect(() => {
    const session = sessionRef.current;
    let live = true, released = false;
    const handle = delayRender(`${label}: draw frame ${frame}`, { timeoutInMilliseconds });
    const emit = (e) => { const f = latest.current.onEvent; if (f) f({ ...e, frame, width, height, seed }); };
    emit({ type: 'ready-raise', handle });
    const release = (reason) => { if (released) return; released = true; continueRender(handle); emit({ type: 'ready-release', handle, reason }); };
    const fail = (error) => {
      if (!live) return;
      setStatus('error'); setMessage(String(error && error.message || error));
      const l = latest.current;
      if (l.onError) { try { l.onError(error, { frame }); } catch (e) { /* caller error handler failed; still surface the original */ } }
      release('error');
      if (l.errorMode === 'cancel') { try { cancelRender(error); } catch (e) { /* cancelRender throws by design after recording the error */ } }
    };
    (async () => {
      try {
        if (prepareErrorRef.current) throw prepareErrorRef.current;
        if (!session) throw new Error('woodcut session missing');
        const result = await session.draw({ frame, fps, seconds: latest.current.seconds ?? frame / fps });
        if (!live) return;
        if (result.status === 'drawn') {
          setStatus('drawn'); setDoneFrame(frame); setMessage('');
          if (latest.current.onDrawn) latest.current.onDrawn(result);
        }
        release(result.status);
      } catch (error) { fail(error); }
    })();
    return () => { live = false; release('cleanup'); };
  }, [frame, configKey]);

  return h('div', {
    ref: container,
    'data-woodcut-status': status, 'data-woodcut-frame': String(frame), 'data-woodcut-drawn-frame': String(doneFrame),
    style: { position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden', ...(style || {}) },
  }, status === 'error' ? h('pre', { style: { position: 'absolute', margin: 0, padding: 12, left: 0, top: 0, right: 0, color: '#b00020', background: '#fff', font: '14px monospace', whiteSpace: 'pre-wrap', zIndex: 2 } }, `WOODCUT ERROR (frame ${frame}): ${message}`) : null);
}
