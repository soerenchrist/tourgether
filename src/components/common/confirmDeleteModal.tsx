import { Button, Modal } from "flowbite-react";

const ConfirmDeleteModal: React.FC<{
  show: boolean;
  text: string;
  accept: () => void;
  decline: () => void;
}> = ({ show, accept, decline, text }) => {
  return (
    <Modal show={show} onClose={decline}>
      <Modal.Header>Are you sure?</Modal.Header>
      <Modal.Body>
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          {text}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={accept} color="failure">
          Delete
        </Button>
        <Button onClick={decline} outline color="light">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;
