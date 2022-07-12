import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import TextArea from "@/components/common/textarea";
import LayoutBase from "@/components/layout/layoutBase";
import PeakSelector from "@/components/peaks/peakSelector";
import TracksEditList from "@/components/tracks/tracksEditList";
import { getFileContents } from "@/utils/fileHelpers";
import { useZodForm } from "@/utils/formHelpers";
import { trpc } from "@/utils/trpc";
import { Peak } from "@prisma/client";
import axios from "axios";
import { Button, Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";

export const createTourValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  distance: z.number().min(0, "Distance must be greater than 0"),
  elevationUp: z.number().min(0, "Elevation up must be greater than 0"),
  elevationDown: z.number().min(0, "Elevation down must be greater than 0"),
  date: z.date(),
  description: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

type FormData = z.infer<typeof createTourValidationSchema>;

const CreateTourContent = () => {
  const navigate = useRouter();
  const [selectedPeaks, setSelectedPeaks] = useState<Peak[]>([]);
  const [tracks, setTracks] = useState<
    { name: string; color: string; file: File }[]
  >([]);
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: createTourValidationSchema,
    defaultValues: {
      date: new Date(),
    },
  });

  const { mutate } = trpc.useMutation("tours.create-tour", {
    onSuccess: () => {
      setLoading(false);
      navigate.push("/tours");
    },
    onError: () => {
      setLoading(false);
    },
  });

  const uploadTracks = async () => {
    const trackData: { file_url: string; name: string; color: string }[] = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (!track) continue;

      const content = await getFileContents(track.file);
      if (!content) continue;

      const config = {
        headers: {
          "Content-Type": "application/gpx+xml",
        },
      };
      const result = await axios.post("/api/files/upload", content, config);
      if (result.status === 200) {
        trackData.push({
          file_url: result.data.filename,
          name: track.name,
          color: track.color,
        });
      }
    }
    return trackData;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const tracks = await uploadTracks();
    mutate({
      tour: data,
      tracks: tracks,
      peaks: selectedPeaks
    });
  };

  const handleTracksChanged = async (
    tracks: { name: string; color: string; file: File }[]
  ) => {
    setTracks(tracks);
  };

  const handleSelectedPeaksChanged = (peaks: Peak[]) => {
    setSelectedPeaks(peaks);
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardTitle title="Create a new tour" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="pt-4 flex flex-col gap-2">
            <Input
              id="name"
              label="Name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Hiking tour to Zugspitze"
            />
            <Input
              type="number"
              id="distance"
              label="Distance in meters"
              {...register("distance", {
                valueAsNumber: true,
              })}
              error={errors.distance?.message}
              placeholder="Hiking distance"
            />
            <Input
              type="number"
              id="elevationUp"
              label="Elevation upwards in meters"
              {...register("elevationUp", {
                valueAsNumber: true,
              })}
              error={errors.elevationUp?.message}
              placeholder="Elevation upwards"
            />
            <Input
              type="number"
              id="elevationDown"
              label="Elevation downwards in meters"
              error={errors.elevationDown?.message}
              {...register("elevationDown", {
                valueAsNumber: true,
              })}
              placeholder="Elevation downwards"
            />
            <Input
              type="date"
              id="date"
              error={errors.date?.message}
              label="Hiking date"
              {...register("date", {
                valueAsDate: true
              })}
              placeholder="Hiking date"
            />

            <Input
              type="time"
              id="startTime"
              label="Start time (optional)"
              {...register("startTime")}
              placeholder="Start time"
            />
            <Input
              type="time"
              id="endTime"
              label="End time (optional)"
              {...register("endTime")}
              placeholder="End time"
            />

            <TextArea
              id="description"
              label="Description (optional)"
              {...register("description")}
              placeholder="Hiking trip to the zugspitze over the Höllentalklamm"
            />
            <div className="flex justify-end">
              <Button disabled={isLoading} type="submit">
                Create your Tour
              </Button>
            </div>
          </div>
        </form>
      </Card>
      <Card>
        <div className="flex flex-col justify-start h-full gap-4">
          <CardTitle title="Select peaks" />
          <PeakSelector onPeaksChanged={handleSelectedPeaksChanged} />
          <CardTitle title="Add Tracks" />
          <TracksEditList onChange={handleTracksChanged} />
        </div>
      </Card>
    </div>
  );
};

const CreateTourPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreateTourContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default CreateTourPage;
