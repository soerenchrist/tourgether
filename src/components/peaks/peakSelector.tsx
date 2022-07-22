import { trpc } from "@/utils/trpc";
import { Badge, Checkbox, Spinner, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import Input from "../common/input";

type Peak = {
  name: string;
  height: number;
  id: string;
};

const PeakSelectorTable: React.FC<{
  peaks: Peak[] | undefined;
  isLoading: boolean;
  selectedPeaks: Peak[];
  setSelectedPeaks: (peaks: Peak[]) => void;
}> = ({ peaks, isLoading, setSelectedPeaks, selectedPeaks }) => {
  const selectPeak = (peak: Peak, checked: boolean) => {
    if (checked) {
      const newPeaks = [...selectedPeaks, peak];
      setSelectedPeaks(newPeaks);
    } else {
      const newPeaks = selectedPeaks.filter((p) => p.id !== peak.id);
      setSelectedPeaks(newPeaks);
    }
  };

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell className="w-8"></Table.HeadCell>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell className="hidden md:table-cell">Height</Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {isLoading && (
          <Table.Row>
            <Table.Cell>
              <Spinner className="pa-2" />
            </Table.Cell>
          </Table.Row>
        )}
        {selectedPeaks?.map((peak) => (
          <Table.Row key={peak.id}>
            <Table.Cell className="w-8">
              <Checkbox
                checked={true}
                onChange={(e) => selectPeak(peak, e.target.checked)}
              />
            </Table.Cell>
            <Table.Cell>{peak.name}</Table.Cell>
            <Table.Cell className="hidden md:table-cell">{peak.height} m</Table.Cell>
          </Table.Row>
        ))}

        {peaks
          ?.filter((x) => selectedPeaks.findIndex((p) => p.id === x.id) < 0)
          .map((peak) => (
            <Table.Row key={peak.id}>
              <Table.Cell className="!px-3 !py-2">
                <Checkbox
                  onChange={(e) => selectPeak(peak, e.target.checked)}
                />
              </Table.Cell>
              <Table.Cell>{peak.name}</Table.Cell>
              <Table.Cell className="hidden md:table-cell">{peak.height} m</Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  );
};

const PeakSelector: React.FC<{
  peaks?: Peak[];
  disabled?: boolean;
  onPeaksChanged: (peaks: Peak[]) => void;
}> = ({ peaks, onPeaksChanged, disabled }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeaks, setSelectedPeaks] = useState<Peak[]>([]);

  useEffect(() => {
    if (peaks) {
      setSelectedPeaks(peaks);
    }
  }, [peaks]);

  const handlePeaksChanged = (peaks: Peak[]) => {
    setSelectedPeaks(peaks);
    onPeaksChanged(peaks);
  };

  const { data, isLoading } = trpc.useQuery(
    [
      "peaks.get-peaks",
      {
        searchTerm,
        pagination: {
          page: 1,
          count: 5,
        },
      },
    ],
    {
      enabled: !disabled,
    }
  );

  return (
    <div className="flex flex-col justify-start gap-2">
      <Input
        id="search-peaks"
        disabled={disabled}
        placeholder={disabled ? "You can't add peaks when editing" : "Search"}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex justify-start py-4 gap-2">
        {selectedPeaks.map((peak) => (
          <Badge key={peak.id}>{peak.name}</Badge>
        ))}
      </div>
      {!disabled && (
        <PeakSelectorTable
          peaks={data?.peaks}
          isLoading={isLoading}
          selectedPeaks={selectedPeaks}
          setSelectedPeaks={handlePeaksChanged}
        />
      )}
    </div>
  );
};

export default PeakSelector;
