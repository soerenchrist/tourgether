import { trpc } from "@/utils/trpc";
import { AnnotationIcon } from "@heroicons/react/outline";
import { Comment, Tour, User } from "@prisma/client";
import {
  Avatar,
  Button,
  Modal,
  Spinner,
  TextInput,
  Tooltip,
} from "flowbite-react";
import { useState } from "react";
import { List, ListItem } from "../common/list";

export const CommentItem: React.FC<{ comment: Comment & { user: User } }> = ({
  comment,
}) => {
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <Avatar
          alt="User avatar"
          img={comment.user.image ?? undefined}
          rounded={true}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
            {comment.content}
          </div>
          <p className="text-sm text-gray-500 truncat dark:text-gray-400">
            {comment.user.name}
          </p>
        </div>
        <div className="text-sm text-gray-500">{comment.date.toLocaleDateString()}</div>
      </div>
    </li>
  );
};

const CommentButton: React.FC<{ tour: Tour }> = ({ tour }) => {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const util = trpc.useContext();
  const { mutate: send } = trpc.useMutation("comments.add-comment", {
    onSuccess: () => {
      util.invalidateQueries("comments.get-comments");
    },
  });
  const { data: comments, isLoading } = trpc.useQuery(
    [
      "comments.get-comments",
      {
        tourId: tour.id,
      },
    ],
    {
      enabled: showModal,
    }
  );

  const handleSend = () => {
    send({
      content,
      tourId: tour.id,
    });
    setContent("");
  };

  return (
    <>
      <Tooltip content="Leave a comment">
        <AnnotationIcon
          onClick={() => setShowModal(true)}
          className="w-7 h-7 cursor-pointer"
        ></AnnotationIcon>
      </Tooltip>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Comments</Modal.Header>
        <Modal.Body>
          {isLoading && <Spinner />}
          <List>
            {comments?.map((comment) => (
              <CommentItem key={comment.id} comment={comment}></CommentItem>
            ))}
            {(comments?.length ?? 0) === 0 && (
              <ListItem title="There are no comments yet..." />
            )}
          </List>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-between w-full">
            <div className="grow flex-1 mr-2">
              <TextInput
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your comment"
              />
            </div>
            <div className="flex-none">

            <Button disabled={content.length === 0} onClick={handleSend}>
              Send
            </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommentButton;
