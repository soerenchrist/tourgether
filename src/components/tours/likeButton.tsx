import { trpc } from "@/utils/trpc";
import { mdiHeart, mdiHeartOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Tour } from "@prisma/client";
import { Spinner, Tooltip } from "flowbite-react";

const LikeButton: React.FC<{
  tour: Tour;
  onLiked?: () => void;
  onRemovedLike?: () => void;
}> = ({ tour, onLiked, onRemovedLike }) => {
  const { data: like, isLoading } = trpc.useQuery([
    "likes.get-like",
    {
      tourId: tour.id,
    },
  ]);
  const util = trpc.useContext();
  const { mutate: addLike } = trpc.useMutation("likes.add-like", {
    onSuccess: () => {
      util.invalidateQueries("likes.get-like");
      if (onLiked) onLiked();
    },
  });
  const { mutate: removeLike } = trpc.useMutation("likes.remove-like", {
    onSuccess: () => {
      util.invalidateQueries("likes.get-like");
      if (onRemovedLike) onRemovedLike();
    },
  });

  if (isLoading) return <Spinner />;

  if (like)
    return (
      <Tooltip content="You already like this tour!">
        <span onClick={() => removeLike({ likeId: like.id })}>
          <Icon
            path={mdiHeart}
            className="w-5 h-5 text-red-600 cursor-pointer"
          ></Icon>
        </span>
      </Tooltip>
    );

  return (
    <Tooltip content="Give this tour a like!">
      <span onClick={() => addLike({ tourId: tour.id })}>
        <Icon
          path={mdiHeartOutline}
          className="w-5 h-5 text-red-600 cursor-pointer"
        ></Icon>
      </span>
    </Tooltip>
  );
};

export default LikeButton;
