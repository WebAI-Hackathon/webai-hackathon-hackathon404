import { useEffect } from "react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  Button,
  Text,
  Stack,
} from "@chakra-ui/react";

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup = ({ onClose }: WelcomePopupProps) => {
  useEffect(() => {
    // Auto-close popup after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <DialogRoot open={true} onOpenChange={() => onClose()}>
      <DialogContent
        bg="bg.secondary"
        borderColor="border"
        borderWidth="1px"
        maxW="md"
        mx={4}
      >
        <DialogHeader textAlign="center">
          <DialogTitle color="text.primary" fontSize="2xl" fontWeight="bold">
            🎉 Welcome Back!
          </DialogTitle>
          <DialogCloseTrigger
            position="absolute"
            top={4}
            right={4}
            color="text.secondary"
          />
        </DialogHeader>

        <DialogBody>
          <Stack gap={4} textAlign="center">
            <Text color="text.primary" fontSize="lg">
              Bereit für dein nächstes Workout?
            </Text>
            <Text color="text.secondary">
              Lass uns gemeinsam deine Fitnessziele erreichen! 💪
            </Text>
          </Stack>
        </DialogBody>

        <DialogFooter justifyContent="center">
          <Button
            bg="accent.primary"
            color="white"
            _hover={{ bg: "accent.secondary" }}
            size="lg"
            fontWeight="bold"
            onClick={onClose}
          >
            Los geht's! 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default WelcomePopup;
