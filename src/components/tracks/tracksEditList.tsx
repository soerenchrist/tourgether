import { Table } from "flowbite-react";
import { ChangeEventHandler, useEffect, useState } from "react";
import FileInput from "../common/fileInput";
import Input from "../common/input";

type Track = {
  number: number;
  name: string;
  color: string;
  file: File;
};

const getColor = (index: number) => {
  const colors = ["#2196f3", "#4caf50", "#ffeb3b", "#ff5722", "#f44336"];
  const realIndex = index % colors.length;

  return colors[realIndex]!;
};

const TrackItem = ({
  track,
  onChange,
  onRemove,
}: {
  track: Track;
  onChange: (track: Track) => void;
  onRemove: (track: Track) => void;
}) => {
  const [value, setValue] = useState("");

  useEffect(() => setValue(track.name), []);

  const handleChange = () => {
    track.name = value;
    onChange(track);
  };

  return (
    <Table.Row key={track.name}>
      <Table.Cell>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleChange}
          id={`${track.number}`}
        />
      </Table.Cell>
      <Table.Cell>
        <div
          className="w-8 h-8 rounded-2xl"
          style={{ backgroundColor: track.color }}
        ></div>
      </Table.Cell>
      <Table.Cell className="flex justify-end mt-3 h-full items-center">
        <span
          onClick={() => onRemove(track)}
          className="font-medium text-blue-500 cursor-pointer dark:text-blue-500 hover:underline"
        >
          Remove
        </span>
      </Table.Cell>
    </Table.Row>
  );
};

const TracksEditList: React.FC<{ onChange: (tracks: Track[]) => void }> = ({
  onChange,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const handleTracksChanged: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files) {
      const newTracks: Track[] = [...tracks];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        if (newTracks.find((x) => x.name === file.name)) continue;

        const index = i + tracks.length;
        newTracks.push({
          number: index,
          color: getColor(index),
          name: file.name,
          file: file,
        });
      }
      setTracks(newTracks);
      onChange(newTracks);
    }
  };

  const handleRemove = (track: Track) => {
    const index = tracks.indexOf(track);
    if (index < 0) return;
    const prev = tracks.slice(0, index);
    const next = tracks.slice(index + 1);

    setTracks([...prev, ...next]);
    onChange(tracks);
  };

  const handleTrackChange = (track: Track) => {
    const index = tracks.indexOf(track);
    if (index < 0) return;
    const prev = tracks.slice(0, index);
    const next = tracks.slice(index + 1);

    setTracks([...prev, track, ...next]);
    onChange(tracks);
  };

  const tableHeader = (
    <Table.Head>
      <Table.HeadCell>Name</Table.HeadCell>
      <Table.HeadCell className="justify-start flex">Color</Table.HeadCell>
      <Table.HeadCell></Table.HeadCell>
    </Table.Head>
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="p-2"></div>
      <FileInput
        files={[]}
        accept=".gpx"
        multiple
        onChange={handleTracksChanged}
        label="Upload your GPX tracks or drag and drop"
      />
      <div className="p-2"></div>
      {tracks.length > 0 && (
        <Table>
          {tableHeader}
          <Table.Body>
            {tracks.map((track) => (
              <TrackItem
                key={track.number}
                onRemove={handleRemove}
                onChange={handleTrackChange}
                track={track}
              />
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default TracksEditList;
