import type { FC } from "react";
import Player from "lottie-react";
import runningAnimationData from "../assets/Run for Loading.json";

interface RunningAnimationProps {
  size?: number;
}

const RunningAnimation: FC<RunningAnimationProps> = ({ size = 24 }) => (
  <Player
    autoplay
    loop
    animationData={runningAnimationData}
    style={{ height: size, width: size }}
  />
);

export default RunningAnimation;
