import Card from "@/components/common/card";
import Input from "@/components/common/input";
import NumericInput from "@/components/common/numericInput";
import TextArea from "@/components/common/textarea";
import LayoutBase from "@/components/layout/layoutBase";
import { useFormField } from "@/hooks/useFormField";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { FormEventHandler } from "react";

const CreateTour = () => {
  const navigate = useRouter();
  const { mutate, isLoading } = trpc.useMutation("tours.create-tour",
  {
    onSuccess: () => {
      navigate.push("/tours");
    }
  });

  const registerName = useFormField("", {
    validator: {
      method: (x) => x !== undefined && x.length > 0,
      message: "Name is required",
    },
  });

  const registerDistance = useFormField(0, {
    validator: {
      method: (x) => x !== undefined && x > 0,
      message: "Should be greater than 0",
    },
  });

  const registerElevationUp = useFormField(0, {
    validator: {
      method: (x) => x !== undefined && x >= 0,
      message: "Should be greater or equal than 0",
    },
  });
  const registerElevationDown = useFormField(0, {
    validator: {
      method: (x) => x !== undefined && x >= 0,
      message: "Should be greater or equal than 0",
    },
  });
  const registerDate = useFormField(new Date().toISOString().split("T")[0], {
    validator: {
      method: (x) => x !== undefined,
      message: "Date is required",
    },
  });

  const registerStartTime = useFormField<string | undefined>(undefined);
  const registerEndTime = useFormField<string | undefined>(undefined);
  const registerDescription = useFormField("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (
      registerName.error ||
      registerElevationDown.error ||
      registerElevationUp.error ||
      registerDistance.error ||
      registerDate.error
    )
      return;

    mutate({
      name: registerName.value!,
      description: registerDescription.value!,
      date: new Date(registerDate.value!),
      distance: registerDistance.value!,
      elevationUp: registerElevationUp.value!,
      elevationDown: registerElevationDown.value!,
      startTime: registerStartTime.value ? new Date(registerStartTime.value) : null,
      endTime: registerEndTime.value ? new Date(registerEndTime.value) : null
    });
  };

  return (
    <LayoutBase>
      <Card title="Create a new tour">
        <div className="pt-4">
          <form onSubmit={handleSubmit}>
            <Input
              id="name"
              label="Name"
              {...registerName}
              placeholder="Hiking tour to Zugspitze"
            />
            <NumericInput
              id="distance"
              label="Distance in meters"
              {...registerDistance}
              placeholder="Hiking distance"
            />
            <NumericInput
              id="elevationUp"
              label="Elevation upwards in meters"
              {...registerElevationUp}
              placeholder="Elevation upwards"
            />
            <NumericInput
              id="elevationDown"
              label="Elevation downwards in meters"
              {...registerElevationDown}
              placeholder="Elevation downwards"
            />
            <Input
              type="date"
              id="date"
              label="Hiking date"
              {...registerDate}
              placeholder="Hiking date"
            />

            <Input
              type="time"
              id="startTime"
              label="Start time (optional)"
              {...registerStartTime}
              placeholder="Start time"
            />
            <Input
              type="time"
              id="endTime"
              label="End time (optional)"
              {...registerEndTime}
              placeholder="End time"
            />

            <TextArea
              id="description"
              label="Description (optional)"
              {...registerDescription}
              placeholder="Hiking trip to the zugspitze over the Höllentalklamm"
            />
            <button className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="submit" disabled={isLoading}>Create Tour</button>
          </form>
        </div>
      </Card>
    </LayoutBase>
  );
};

export default CreateTour;
