import type { FC } from "react";
import { Box } from "@chakra-ui/react";
import Lottie from "lottie-react";
import animationData from "../assets/LOADING.json";

const DotLoadingAnimation: FC = () => (
    <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="300px"
        bg="transparent"
    >
        <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 250, width: 250 }}
        />
    </Box>
);

export default DotLoadingAnimation;
