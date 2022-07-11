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
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  height: number;
  latitude: number;
  longitude: number;
};

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
    setError,
  } = useForm<FormData>();
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

  const onSubmit = async (data: FormData) => {
    const latitude = parseFloat("" + data.latitude);
    const longitude = parseFloat("" + data.longitude);
    if (isNaN(latitude)) {
      setError("latitude", { message: "Must be numeric" });
      return;
    }
    if (isNaN(longitude)) {
      setError("longitude", { message: "Must be numeric" });
      return;
    }
    const height = parseInt("" + data.height);
    if (isNaN(height)) {
      setError("height", { message: "Must be numeric" });
      return;
    }

    setLoading(true);
    createPeak({
      name: data.name,
      height,
      latitude,
      longitude,
    });
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="pt-4 flex flex-col gap-2">
            <Input
              id="name"
              label="Name"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
              placeholder="Zugspitze"
            />

            <Input
              id="height"
              type="number"
              label="Height in metres"
              {...register("height", {
                required: "Height is required",
                min: {
                  value: 0,
                  message: "Must be bigger than 0",
                },
              })}
              error={errors.height?.message}
              placeholder="2963"
            />

            <Input
              id="latitude"
              type="text"
              label="Latitude"
              {...register("latitude", {
                required: "Latitude is required",
                min: {
                  value: -90,
                  message: "Must be bigger than -90",
                },
                max: {
                  value: 90,
                  message: "Must be smaller than 90",
                },
                valueAsNumber: true,
                pattern: {
                  message: "Must be numeric",
                  value: /^[0-9]+$/,
                },
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
                required: "Longitude is required",
                min: {
                  value: -180,
                  message: "Must be bigger than -180",
                },
                max: {
                  value: 180,
                  message: "Must be smaller than 180",
                },
                valueAsNumber: true,
                pattern: {
                  message: "Must be numeric",
                  value: /^[0-9]+$/,
                },
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
