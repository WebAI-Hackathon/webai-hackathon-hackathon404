import type { FC } from "react";
import { Box } from "@chakra-ui/react";
import Player from "lottie-react";
import animationData from "../assets/Gym & Fitness Gold.json";

const LoadingAnimation: FC = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    h="100vh"
    bg="bg"
  >
    <Player
      autoplay
      loop
      animationData={animationData}
      style={{ height: 200, width: 200 }}
    />
  </Box>
);

export default LoadingAnimation;
