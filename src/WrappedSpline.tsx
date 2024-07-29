"use client";

import Spline from "@splinetool/react-spline";

const WrappedSpline = ({ scene }: { scene: string }) => {
  return <Spline scene={scene} />;
};

export default WrappedSpline;
