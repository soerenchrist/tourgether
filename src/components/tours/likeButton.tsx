import { trpc } from "@/utils/trpc";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/solid";
import { HeartIcon as OutlinedHeartIcon } from "@heroicons/react/outline";
import { Tour } from "@prisma/client";
import { Spinner, Tooltip } from "flowbite-react";

const LikeButton: React.FC<{ tour: Tour, onLiked?: () => void, onRemovedLike?: () => void }> = ({ tour, onLiked, onRemovedLike }) => {
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
      if (onLiked)
        onLiked();
    },
  });
  const { mutate: removeLike } = trpc.useMutation("likes.remove-like", {
    onSuccess: () => {
      util.invalidateQueries("likes.get-like");
      if (onRemovedLike)
        onRemovedLike();
    },
  });

  if (isLoading) return <Spinner />;

  if (like)
    return (
      <Tooltip content="You already like this tour!">
        <SolidHeartIcon
          onClick={() => removeLike({ likeId: like.id })}
          className="w-7 h-7 text-red-600 cursor-pointer"
        ></SolidHeartIcon>
      </Tooltip>
    );

  return (
    <Tooltip content="Give this tour a like!">
      <OutlinedHeartIcon
        onClick={() => addLike({ tourId: tour.id })}
        className="w-7 h-7 text-red-600 cursor-pointer"
      >
      </OutlinedHeartIcon>

    </Tooltip>
  );
};

export default LikeButton;
