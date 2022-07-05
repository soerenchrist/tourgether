import Card from "@/components/common/card";
import Input from "@/components/common/input";
import NumericInput from "@/components/common/numericInput";
import TextArea from "@/components/common/textarea";
import LayoutBase from "@/components/layout/layoutBase";
import { useFormField } from "@/hooks/useFormField";

const CreateTour = () => {
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

  return (
    <LayoutBase>
      <Card title="Create a new tour">
        <div className="pt-4">
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
          
        </div>
      </Card>
    </LayoutBase>
  );
};

export default CreateTour;
