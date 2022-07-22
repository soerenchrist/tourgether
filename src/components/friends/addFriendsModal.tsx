import { trpc } from "@/utils/trpc";
import { mdiDelete } from "@mdi/js";
import Icon from "@mdi/react";
import { CompanionShip, User } from "@prisma/client";
import { Dropdown, Modal, Tooltip } from "flowbite-react";
import { useMemo } from "react";
import { List, ListItem } from "../common/list";

const useFriends = () => {
  return trpc.useQuery(["friends.get-my-friends"]);
};

const AddFriendsModal: React.FC<{
  show: boolean;
  onClose: () => void;
  companions?: (CompanionShip & {
    user: User;
  })[];
  tourId: string;
}> = ({ show, onClose, tourId, companions }) => {
  const { data: friends } = useFriends();
  const util = trpc.useContext();
  const { mutate: addCompanion } = trpc.useMutation("tours.add-companion", {
    onSuccess() {
      util.invalidateQueries("tours.get-companions");
    },
  });
  const { mutate: removeCompanion } = trpc.useMutation(
    "tours.remove-companion",
    {
      onSuccess() {
        util.invalidateQueries("tours.get-companions");
      },
    }
  );

  const alreadyAdded = useMemo(() => {
    if (!friends || !companions) return [];
    return friends.filter((x) =>
      companions.map((x) => x.userId).includes(x.id)
    );
  }, [friends, companions]);

  const notAdded = useMemo(() => {
    if (!friends || !companions) return [];
    return friends.filter(
      (x) => !companions.map((x) => x.userId).includes(x.id)
    );
  }, [friends, companions]);

  const handleAddCompanion = (
    userId: string,
    role: "MAINTAINER" | "VIEWER"
  ) => {
    addCompanion({
      tourId,
      userId,
      role,
    });
  };

  const handleRemoveCompanion = (userId: string) => {
    removeCompanion({
      tourId,
      userId,
    });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Add friends to your tour</Modal.Header>
      <Modal.Body>
        {alreadyAdded.length > 0 && (
          <>
            <h5 className="text-lg pb-2">Accompanied you:</h5>
            <List>
              {alreadyAdded.map((x) => (
                <div className="flex justify-between items-center" key={x.id}>
                  <ListItem
                    title={x.name}
                    image={x.image}
                    subtitle={x.email ?? ""}
                  ></ListItem>
                  <Tooltip content="Remove from Tour" placement="left">
                    <span onClick={() => handleRemoveCompanion(x.id)}>
                      <Icon
                        className="w-7 h-7 cursor-pointer text-gray-600"
                        path={mdiDelete}
                      />
                    </span>
                  </Tooltip>
                </div>
              ))}
            </List>
          </>
        )}
        {notAdded.length > 0 && (
          <>
            <h5 className="text-lg">Add more friends:</h5>
            <List>
              {notAdded.map((x) => (
                <div className="flex justify-between items-center" key={x.id}>
                  <ListItem
                    title={x.name}
                    image={x.image}
                    subtitle={x.email ?? ""}
                  ></ListItem>
                  <Dropdown label="Add" size="sm">
                    <Dropdown.Item
                      onClick={() => handleAddCompanion(x.id, "MAINTAINER")}
                    >
                      Maintainer
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleAddCompanion(x.id, "VIEWER")}
                    >
                      Viewer
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              ))}
            </List>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddFriendsModal;
