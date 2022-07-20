import { trpc } from "@/utils/trpc";
import { Peak, WishlistItem } from "@prisma/client";
import { Button, Modal } from "flowbite-react";
import { useMemo, useState } from "react";
import { List, ListItem } from "../common/list";

const WishlistItemsModal: React.FC<{
  show: boolean;
  onClose: () => void;
  wishlistItems?: (WishlistItem & { peak: Peak })[];
}> = ({ show, onClose, wishlistItems }) => {
  const [isLoading, setLoading] = useState(false);
  const { mutate: finish } = trpc.useMutation("wishlist.complete-items", {
    onSuccess: () => {
      setLoading(false);
      onClose();
    },
  });

  const itemIds = useMemo(
    () => wishlistItems?.map((w) => w.id) ?? [],
    [wishlistItems]
  );
  const completeEntries = () => {
    setLoading(true);
    finish({ itemIds });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>There are wish list items for these peaks!</Modal.Header>
      <Modal.Body>
        <p>Would you like to mark these items as completed?</p>
        <List>
          {wishlistItems?.map((item) => (
            <ListItem
              title={item.peak.name}
              key={item.id}
              subtitle={`Added on: ${item.addDate.toLocaleDateString()}`}
            />
          ))}
        </List>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={completeEntries} disabled={isLoading}>
          Complete
        </Button>
        <Button onClick={onClose} outline color="light" disabled={isLoading}>
          Leave
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WishlistItemsModal;
