import { useZodForm } from "@/utils/formHelpers";
import { trpc } from "@/utils/trpc";
import { Button } from "flowbite-react";
import { useRouter } from "next/router";
import { z } from "zod";
import Input from "../common/input";
import TextArea from "../common/textarea";
import { CompleteProfile } from "./profileOverview";

export const updateProfileValidationSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be less than 20 characters long"),
  status: z.string().max(150),
  location: z.string().max(50),
  name: z.string().max(50),
  favoritePeak: z.string(),
});

type UpdateProfile = z.infer<typeof updateProfileValidationSchema>;

const ProfileForm: React.FC<{
  profile: CompleteProfile;
  buttonText?: string;
  callbackUrl?: string;
}> = ({ profile, buttonText, callbackUrl }) => {
  const {
    register,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useZodForm({
    schema: updateProfileValidationSchema,
    defaultValues: {
      username: profile.username,
      status: profile.status ?? "",
      location: profile.location ?? "",
      favoritePeak: profile.favoritePeak ?? "",
      name: profile.name ?? "",
    },
  });
  const username = watch("username");

  trpc.useQuery(
    [
      "profile.check-username",
      {
        username,
      },
    ],
    {
      enabled: username.length > 0,
      onSuccess: (result) => {
        if (result.taken) {
          setError("username", { message: "This username is already taken." });
        } else {
          clearErrors("username");
        }
      },
    }
  );

  const router = useRouter();
  const { mutate: updateProfile, isLoading } = trpc.useMutation(
    "profile.update-profile",
    {
      onSuccess: () => {
        router.push(callbackUrl || "/profile");
      },
    }
  );

  const onSubmit = (data: UpdateProfile) => {
    updateProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="false">
      <div className="pt-4 flex flex-col gap-2">
        <Input
          id="username"
          label="Username"
          {...register("username")}
          error={errors.username?.message}
          placeholder="Username"
        />
        <Input
          id="name"
          label="Name"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Name"
        />
        <Input
          id="location"
          label="Location"
          {...register("location")}
          error={errors.location?.message}
          placeholder="Location"
        />
        <Input
          id="favoritePeak"
          label="Your Favorite Peak"
          {...register("favoritePeak")}
          error={errors.favoritePeak?.message}
          placeholder="Your Favorite Peak"
        />
        <TextArea
          id="status"
          label="Status"
          {...register("status")}
          error={errors.status?.message}
          placeholder="Write something about you"
        />
        <div className="flex justify-end">
          <Button disabled={isLoading} type="submit">
            {buttonText || "Update Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
