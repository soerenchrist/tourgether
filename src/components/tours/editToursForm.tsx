import { AnalysisResult } from "@/lib/gpxLib";
import { useZodForm } from "@/utils/formHelpers";
import { trpc } from "@/utils/trpc";
import { Peak, Point, Tour, TourPeak } from "@prisma/client";
import { Button, Card } from "flowbite-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";
import CardTitle from "../common/cardTitle";
import Input from "../common/input";
import TextArea from "../common/textarea";
import PeakSelector from "../peaks/peakSelector";
import GPXUpload from "../tracks/gpxUpload";

export const createTourValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  distance: z.number().min(0, "Distance must be greater than 0"),
  elevationUp: z.number().min(0, "Ascent must be greater than 0"),
  elevationDown: z.number().min(0, "Descent must be greater than 0"),
  date: z.string(),
  description: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});
type FormData = z.infer<typeof createTourValidationSchema>;

type ExtendedTourPeak = TourPeak & {
  peak: Peak;
};

type ExtendedTour = Tour & {
  tourPeaks: ExtendedTourPeak[];
  points: Point[];
};

const EditToursForm: React.FC<{ editTour?: ExtendedTour }> = ({ editTour }) => {
  const navigate = useRouter();

  const [points, setPoints] = useState<
    { latitude: number; longitude: number; elevation: number; time: Date }[]
  >([]);
  const [selectedPeaks, setSelectedPeaks] = useState<
    { name: string; height: number; id: string }[]
  >([]);
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useZodForm({
    schema: createTourValidationSchema,
    defaultValues: {
      description: editTour?.description,
      distance: editTour?.distance,
      elevationDown: editTour?.elevationDown,
      elevationUp: editTour?.elevationUp,
      endTime: editTour?.endTime,
      name: editTour?.name,
      startTime: editTour?.startTime,
      date:
        editTour?.date.toISOString().substring(0, 10) ||
        new Date().toISOString().substring(0, 10),
    },
  });

  useEffect(() => {
    setSelectedPeaks(editTour?.tourPeaks.map((p) => p.peak) || []);
    setPoints(editTour?.points || []);
  }, [editTour]);

  const { mutate: create } = trpc.useMutation("tours.create-tour", {
    onSuccess: () => {
      setLoading(false);
      navigate.push("/tours");
    },
    onError: () => {
      setLoading(false);
    },
  });
  const { mutate: update } = trpc.useMutation("tours.update-tour", {
    onSuccess: () => {
      setLoading(false);
      navigate.push("/tours");
    },
    onError: () => {
      setLoading(false);
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    if (editTour) {
      update({
        id: editTour.id,
        ...data,
      });
    } else {
      create({
        tour: data,
        peaks: selectedPeaks,
        points,
      });
    }
  };

  const handleGpxFileUpload = async (data: AnalysisResult) => {
    setValue("name", data.name);
    setValue("distance", Math.floor(data.distance));
    setValue("date", data.date.toISOString().substring(0, 10));
    setValue("elevationDown", Math.floor(data.elevationDown));
    setValue("elevationUp", Math.floor(data.elevationUp));
    setValue("startTime", data.start);
    setValue("endTime", data.end);

    setPoints(data.points);
  };

  const handleSelectedPeaksChanged = (
    peaks: { name: string; height: number; id: string }[]
  ) => {
    setSelectedPeaks(peaks);
  };

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
      <Card>
        <div className="flex flex-col justify-start h-full gap-4">
          <CardTitle
            title={editTour ? "Update your tour" : "Create a new tour"}
          />
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
                label="Total ascent in meters"
                {...register("elevationUp", {
                  valueAsNumber: true,
                })}
                error={errors.elevationUp?.message}
                placeholder="Ascent"
              />
              <Input
                type="number"
                id="elevationDown"
                label="Total descent in meters"
                error={errors.elevationDown?.message}
                {...register("elevationDown", {
                  valueAsNumber: true,
                })}
                placeholder="Descent"
              />
              <Input
                type="date"
                id="date"
                error={errors.date?.message}
                label="Hiking date"
                {...register("date")}
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
              <div className="lg:flex justify-end hidden">
                <Button disabled={isLoading} type="submit">
                  {editTour ? "Update your tour" : "Create your tour"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col justify-start h-full gap-4">
          <CardTitle title={editTour ? "Your added peaks" : "Select peaks"} />
          <PeakSelector
            disabled={editTour !== undefined}
            peaks={editTour?.tourPeaks.map((p) => p.peak)}
            onPeaksChanged={handleSelectedPeaksChanged}
          />

          <div className="mt-4">
            <CardTitle title="Upload a GPX Track" />
            <GPXUpload onChange={handleGpxFileUpload} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditToursForm;
