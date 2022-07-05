import Card from "@/components/common/card";
import Input from "@/components/common/input";
import LayoutBase from "@/components/layout/layoutBase";
import { useFormField } from "@/hooks/useFormField";

const CreateTour = () => {
  const registerName = useFormField("", {
    validator: {
      method: (x) => x.length > 0,
      message: "Name is required"
    }
  });

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
        </div>
      </Card>
    </LayoutBase>
  );
};

export default CreateTour;
