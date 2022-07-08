import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import TextArea from "@/components/common/textarea";
import LayoutBase from "@/components/layout/layoutBase";
import TracksEditList from "@/components/tracks/tracksEditList";
import { getFileContents } from "@/utils/fileHelpers";
import { trpc } from "@/utils/trpc";
import axios from "axios";
import { Button, Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  distance: number;
  elevationUp: number;
  elevationDown: number;
  date: string;
  description: string;
  start: string;
  end: string;
};

const CreateTourContent = () => {
  const navigate = useRouter();
  const [tracks, setTracks] = useState<
    { name: string; color: string; file: File }[]
  >([]);
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
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
      tour: {
        name: data.name,
        description: data.description,
        date: new Date(data.date),
        distance: parseInt("" + data.distance),
        elevationUp: parseInt("" + data.elevationUp),
        elevationDown: parseInt("" + data.elevationDown),
        startTime: data.start.length > 0 ? data.start : undefined,
        endTime: data.end.length > 0 ? data.end : undefined,
      },
      tracks: tracks,
    });
  };

  const handleTracksChanged = async (
    tracks: { name: string; color: string; file: File }[]
  ) => {
    setTracks(tracks);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardTitle title="Create a new tour" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="pt-4 flex flex-col gap-2">
            <Input
              id="name"
              label="Name"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
              placeholder="Hiking tour to Zugspitze"
            />
            <Input
              type="number"
              id="distance"
              label="Distance in meters"
              {...register("distance", {
                required: "Distance is required",
                min: {
                  message: "Distance should be greater than 0",
                  value: 0,
                },
              })}
              error={errors.distance?.message}
              placeholder="Hiking distance"
            />
            <Input
              type="number"
              id="elevationUp"
              label="Elevation upwards in meters"
              {...register("elevationUp", {
                required: "Elevation Down is required",
                min: {
                  message: "Elevation should be greater than 0",
                  value: 0,
                },
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
                required: "Elevation Down is required",
                min: {
                  message: "Elevation should be greater than 0",
                  value: 0,
                },
              })}
              placeholder="Elevation downwards"
            />
            <Input
              type="date"
              id="date"
              error={errors.date?.message}
              label="Hiking date"
              {...register("date", {
                required: "Date is required",
              })}
              placeholder="Hiking date"
            />

            <Input
              type="time"
              id="startTime"
              label="Start time (optional)"
              {...register("start")}
              placeholder="Start time"
            />
            <Input
              type="time"
              id="endTime"
              label="End time (optional)"
              {...register("end")}
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
        <div className="flex flex-col justify-start h-full">
          <CardTitle title="Add Tracks" />
          <TracksEditList onChange={handleTracksChanged} />
        </div>
      </Card>
    </div>
  );
};

const CreateTourPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreateTourPage />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default CreateTourPage;
