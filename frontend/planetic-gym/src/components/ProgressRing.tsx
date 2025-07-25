import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = "#3B82F6",
  backgroundColor = "#E5E7EB",
  label,
  value,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <VStack gap={2}>
      <Box position="relative" width={`${size}px`} height={`${size}px`}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        </svg>

        {/* Center text */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            {Math.round(percentage)}%
          </Text>
          {value && (
            <Text fontSize="sm" color="gray.600">
              {value}
            </Text>
          )}
        </Box>
      </Box>

      {label && (
        <Text fontSize="sm" textAlign="center" color="gray.700" maxW="120px">
          {label}
        </Text>
      )}
    </VStack>
  );
};

export default ProgressRing;
