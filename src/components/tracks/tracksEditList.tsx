import { ChangeEventHandler, useEffect, useState } from "react";
import FileInput from "../common/fileInput";
import Input from "../common/input";
import Table, { TableCell, TableHeaderCell, TableRow } from "../common/table";

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

const TrackItem = ({ track, onChange, onRemove }: {
  track: Track,
  onChange: (track: Track) => void,
  onRemove: (track: Track) => void
}) => {
  const [value, setValue] = useState("");

  useEffect(() => setValue(track.name), []);

  const handleChange = () => {
    track.name = value;
    onChange(track);
  }

  return (
    <TableRow key={track.name}>
      <TableCell>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleChange}
          id={`${track.number}`}
        />
      </TableCell>
      <TableCell>
        <div
          className="w-8 h-8 rounded-2xl"
          style={{ backgroundColor: track.color }}
        ></div>
      </TableCell>
      <TableCell className="flex justify-end mt-3 h-full items-center">
        <span
          onClick={() => onRemove(track)}
          className="font-medium text-blue-500 cursor-pointer dark:text-blue-500 hover:underline">
          Remove
        </span>
      </TableCell>
    </TableRow>
  );
};



const TracksEditList: React.FC<{ onChange: (tracks: Track[]) => void }> = ({ onChange }) => {
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
  }

  const handleTrackChange = (track: Track) => {
    const index = tracks.indexOf(track);
    if (index < 0) return;
    const prev = tracks.slice(0, index);
    const next = tracks.slice(index + 1);

    setTracks([...prev, track, ...next]);
    onChange(tracks);
  }

  const tableHeader = (
    <tr>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell className="justify-start flex">Color</TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </tr>
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
        <Table headerContent={tableHeader}>
          {tracks.map((track) => (
            <TrackItem key={track.number}
              onRemove={handleRemove}  
            onChange={handleTrackChange} track={track} />
          ))}
        </Table>
      )}
    </div>
  );
};

export default TracksEditList;
