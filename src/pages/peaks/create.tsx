import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Button, Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ChangeEventHandler, useState } from "react";
import { useZodForm } from "@/utils/formHelpers";
import { z } from "zod";

export const createPeakValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  height: z.number().min(0, "Height must be positive number"),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
});

const Map = dynamic(() => import("../../components/maps/peakSelectionMap"), {
  ssr: false,
});

const CreatePeakPageContent: React.FC = () => {
  const [isLoading, setLoading] = useState(false);
  const [lat, setLat] = useState(47.42);
  const [lng, setLng] = useState(10.9853);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useZodForm({
    schema: createPeakValidationSchema,
  });
  const router = useRouter();

  const { mutate: createPeak } = trpc.useMutation("peaks.create-peak", {
    onSuccess: (peak) => {
      setLoading(false);
      router.push(`/peaks/${peak.id}`);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const onCoordinateChange = (coord: { lat: number; lng: number }) => {
    setValue("latitude", coord.lat);
    setValue("longitude", coord.lng);
    setLat(coord.lat);
    setLng(coord.lng);
  };

  const onChangeLatitude: ChangeEventHandler<HTMLInputElement> = (event) => {
    const lat = parseFloat(event.target.value);
    if (isNaN(lat)) return;

    setLat(lat);
  };

  const onChangeLongitude: ChangeEventHandler<HTMLInputElement> = (event) => {
    const lng = parseFloat(event.target.value);
    if (isNaN(lng)) return;

    setLng(lng);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardTitle title="Create a new Peak" />
        <form onSubmit={handleSubmit(async (values) => {
          setLoading(true);
          createPeak(values);
        })}>
          <div className="pt-4 flex flex-col gap-2">
            <Input
              id="name"
              label="Name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Zugspitze"
            />

            <Input
              id="height"
              type="number"
              label="Height in metres"
              {...register("height", {
                valueAsNumber: true
              })}
              error={errors.height?.message}
              placeholder="2963"
            />

            <Input
              id="latitude"
              type="text"
              label="Latitude"
              {...register("latitude", {
                valueAsNumber: true
              })}
              onChange={onChangeLatitude}
              error={errors.latitude?.message}
              placeholder="47.4210"
            />

            <Input
              id="longitude"
              type="text"
              label="Longitude"
              {...register("longitude", {
                valueAsNumber: true
              })}
              onChange={onChangeLongitude}
              error={errors.longitude?.message}
              placeholder="10.9853"
            />
            <div className="flex justify-end">
              <Button disabled={isLoading} type="submit">
                Create the Peak
              </Button>
            </div>
          </div>
        </form>
      </Card>
      <Card>
        <CardTitle title="Select location" />
        <Map
          latitude={lat}
          longitude={lng}
          onCoordinateChange={onCoordinateChange}
        />
      </Card>
    </div>
  );
};

const CreatePeakPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreatePeakPageContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default CreatePeakPage;
