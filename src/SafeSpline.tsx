import React, { Component, ComponentProps, ErrorInfo, ReactNode } from "react";
import Spline from "@splinetool/react-spline";

type SplineProps = ComponentProps<typeof Spline>;

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

class SplineErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Spline scene failed to render, skipping it.", error, info);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Spline throws when WebGL is unavailable (headless crawlers, old devices, disabled GPU),
// which used to take the whole page down. Skip the 3D scene instead and release the loader.
export default function SafeSpline(props: SplineProps) {
  const [supported, setSupported] = React.useState<boolean | null>(null);
  const onLoadRef = React.useRef(props.onLoad);
  onLoadRef.current = props.onLoad;

  const skip = React.useCallback(() => onLoadRef.current?.(undefined as never), []);

  React.useEffect(() => {
    const ok = hasWebGL();
    setSupported(ok);
    if (!ok) skip();
  }, [skip]);

  if (!supported) return null;

  return (
    <SplineErrorBoundary onError={skip}>
      <Spline {...props} />
    </SplineErrorBoundary>
  );
}
