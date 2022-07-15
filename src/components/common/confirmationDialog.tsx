import { Button, Modal } from "flowbite-react";

const ConfirmationModal: React.FC<{
  show: boolean;
  text: string;
  acceptColor?: "success" | "failure" | "dark" | "light" | "warning" | "purple";
  acceptButton?: string;
  cancelButton?: string;
  accept: () => void;
  decline: () => void;
}> = ({ show, acceptButton, cancelButton, accept, decline, text, acceptColor }) => {
  return (
    <Modal show={show} onClose={decline}>
      <Modal.Header>Are you sure?</Modal.Header>
      <Modal.Body>
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          {text}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={accept} color={acceptColor}>
          {acceptButton || "Delete"}
        </Button>
        <Button onClick={decline} outline color="light">
          {cancelButton || "Cancel"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
