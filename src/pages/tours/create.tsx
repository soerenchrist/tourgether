import Button from "@/components/common/button";
import Card from "@/components/common/card";
import FileInput from "@/components/common/fileInput";
import Input from "@/components/common/input";
import NumericInput from "@/components/common/numericInput";
import TextArea from "@/components/common/textarea";
import LayoutBase from "@/components/layout/layoutBase";
import { useFormField } from "@/hooks/useFormField";
import { trpc } from "@/utils/trpc";
import axios from "axios";
import { useRouter } from "next/router";
import { ChangeEventHandler, FormEventHandler, useState } from "react";

const CreateTour = () => {
  const navigate = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { mutate } = trpc.useMutation("tours.create-tour", {
    onSuccess: () => {
      setLoading(false);
      navigate.push("/tours");
    },
    onError: () => {
      setLoading(false);
    },
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

  const uploadTracks = async () => {
    const tracks: { file_url: string; name: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const content = await getContents(file);
      if (!content) continue;

      const config = {
        headers: {
          "Content-Type": "application/gpx+xml",
        },
      };
      const result = await axios.post("/api/files/upload", content, config);
      if (result.status === 200) {
        tracks.push({ file_url: result.data.filename, name: file.name });
      }
    }
    return tracks;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (
      registerName.error ||
      registerElevationDown.error ||
      registerElevationUp.error ||
      registerDistance.error ||
      registerDate.error
    ) {
      return;
    }

    setLoading(true);
    const tracks = await uploadTracks();

    mutate({
      tour: {
        name: registerName.value!,
        description: registerDescription.value!,
        date: new Date(registerDate.value!),
        distance: registerDistance.value!,
        elevationUp: registerElevationUp.value!,
        elevationDown: registerElevationDown.value!,
        startTime: registerStartTime.value
          ? new Date(registerStartTime.value)
          : null,
        endTime: registerEndTime.value ? new Date(registerEndTime.value) : null,
      },
      tracks: tracks,
    });
  };

  const getContents = (file: File): Promise<string> => {
    return new Promise((res, rej) => {
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        if (typeof reader.result === "string") res(reader.result);
        else rej();
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
        rej();
      };
    });
  };

  const handleFilesChanged: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files) {
      const newFiles = [];
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        if (!file) continue;
        newFiles.push(file);
      }
      setFiles(newFiles);
    }
  };

  return (
    <LayoutBase>
      <Card title="Create a new tour">
        <form onSubmit={handleSubmit}>
          <div className="pt-4 flex flex-col gap-2">
            <FileInput
              files={files}
              label="Upload your GPX tracks or drag and drop"
              onChange={handleFilesChanged}
              accept=".gpx"
              multiple
            />

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
            <div className="flex justify-end">
              <Button disabled={isLoading} type="submit">
                Create your Tour
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </LayoutBase>
  );
};

export default CreateTour;