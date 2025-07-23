import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Button,
  Stack,
} from "@chakra-ui/react";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/trainingsplan", label: "📋 Trainingsplan" },
    { path: "/live-workout", label: "🏃‍♂️ Live Workout" },
    { path: "/statistiken", label: "📊 Statistiken" },
  ];

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="bg.secondary"
      borderBottom="1px solid"
      borderColor="border"
      backdropFilter="blur(10px)"
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          <Link
            as={RouterLink}
            to="/"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Heading size="lg" color="accent.primary" fontWeight="bold">
              💪 Planetic Gym
            </Heading>
          </Link>

          <Stack direction="row" gap={2}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  as={RouterLink}
                  to={item.path}
                  variant={isActive ? "solid" : "ghost"}
                  bg={isActive ? "accent.primary" : "transparent"}
                  color={isActive ? "white" : "text.primary"}
                  _hover={{
                    bg: isActive ? "accent.secondary" : "bg.tertiary",
                    color: isActive ? "white" : "accent.primary",
                  }}
                  size="md"
                  fontWeight={isActive ? "bold" : "medium"}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
