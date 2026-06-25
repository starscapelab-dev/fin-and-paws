'use client';
import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, CameraOff, SwitchCamera } from 'lucide-react';

/**
 * Full-screen camera barcode scanner (modal). Calls `onResult` with the decoded
 * text and closes. Handles permission denial, missing camera, and the HTTPS
 * requirement (getUserMedia only works on https:// or localhost). The camera
 * stream is always stopped on unmount so it never stays on in the background.
 */
export default function BarcodeScanner({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [deviceIndex, setDeviceIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    async function start() {
      // getUserMedia needs a secure context (HTTPS or localhost).
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setError('Camera needs a secure (https) connection. Open the site over https.');
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser does not support camera access.');
        return;
      }

      try {
        // Enumerate cameras so we can offer front/back switching.
        const cams = await BrowserMultiFormatReader.listVideoInputDevices();
        if (cancelled) return;
        const ids = cams.map((c) => c.deviceId);
        setDeviceIds(ids);

        // Prefer the back camera on first open.
        const backIdx = cams.findIndex((c) => /back|rear|environment/i.test(c.label));
        const chosen = backIdx >= 0 ? backIdx : deviceIndex;
        setDeviceIndex(chosen);

        const controls = await reader.decodeFromVideoDevice(
          ids[chosen] || undefined,
          videoRef.current!,
          (result, err) => {
            if (result && !cancelled) {
              onResult(result.getText());
            }
            // Ignore per-frame "not found" errors — they're expected until a hit.
          }
        );
        controlsRef.current = controls;
      } catch (e: any) {
        if (cancelled) return;
        if (e?.name === 'NotAllowedError') {
          setError('Camera permission was denied. Allow camera access and try again.');
        } else if (e?.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Could not start the camera.');
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // Re-run when switching camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceIndex]);

  function switchCamera() {
    controlsRef.current?.stop();
    setDeviceIndex((i) => (deviceIds.length ? (i + 1) % deviceIds.length : i));
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 text-white">
        <p className="font-semibold">Scan barcode</p>
        <div className="flex items-center gap-2">
          {deviceIds.length > 1 && (
            <button onClick={switchCamera} className="p-2 rounded-xl bg-white/15" aria-label="Switch camera">
              <SwitchCamera size={20} />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl bg-white/15" aria-label="Close scanner">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center text-white/80 px-8">
            <CameraOff size={40} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm">{error}</p>
            <button onClick={onClose} className="mt-5 bg-white text-ink font-semibold px-5 py-2.5 rounded-xl text-sm">
              Enter barcode manually
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {/* Scan frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>
            <p className="absolute bottom-10 text-white/80 text-sm">Point the camera at a barcode</p>
          </>
        )}
      </div>
    </div>
  );
}
