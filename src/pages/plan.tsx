import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import { FeatureProperties } from "@/server/router/routing";
import { trpc } from "@/utils/trpc";
import { ReplyIcon } from "@heroicons/react/solid";
import { Card } from "flowbite-react";
import { LatLng } from "leaflet";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const Map = dynamic(() => import("../components/maps/planMap"), {
  ssr: false,
});

type Stats = {
  trackLength: number;
  plainAscend: number;
  filteredAscend: number;
  totalTime: number;
  energy: number;
  cost: number;
  type?: string;
};

const getType = (props: FeatureProperties): string | undefined => {
  const messageValues = props.messages[1];
  if (!messageValues) return undefined;

  const value = messageValues[9];
  if (!value) return undefined;
  return value;
}

const parseStats = (props: FeatureProperties): Stats => {
  return {
    plainAscend: parseInt(props["plain-ascend"]),
    filteredAscend: parseInt(props["filtered ascend"]),
    cost: parseInt(props["cost"]),
    totalTime: parseInt(props["total-time"]),
    trackLength: parseInt(props["track-length"]),
    energy: parseInt(props["total-energy"]),
    type: getType(props),
  };
};

const combineStats = (props: Stats[]): Stats => {
  return {
    plainAscend: props.map((x) => x.plainAscend).reduce((a, x) => a + x, 0),
    filteredAscend: props.map((x) => x.filteredAscend).reduce((a, x) => a + x, 0),
    cost: props.map((x) => x.cost).reduce((a, x) => a + x, 0),
    totalTime: props.map((x) => x.totalTime).reduce((a, x) => a + x, 0),
    trackLength: props.map((x) => x.trackLength).reduce((a, x) => a + x, 0),
    energy: props.map((x) => x.energy).reduce((a, x) => a + x, 0),
  };
};

const format = (value: number | null | undefined) => {
  if (!value) return "0 m";
  if (value < 1000) return `${value} m`;
  const rounded = Math.round((value / 1000) * 100) / 100;
  return `${rounded} km`;
};

const formatTime = (value: number) => {
  const mins = Math.floor(value / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")} h`;
};

const PlanPageContent = () => {
  const [firstPos, setFirstPos] = useState<LatLng>();
  const [lastPos, setLastPos] = useState<LatLng>();
  const [prevPos, setPrevPos] = useState<LatLng>();
  const [currentPos, setCurrentPos] = useState<LatLng>();
  const [fragments, setFragments] = useState<[number, number, number][][]>([]);
  const [stats, setStats] = useState<Stats[]>([]);

  const combinedStats = useMemo(() => combineStats(stats), [stats]);

  const line = useMemo(() => fragments.flatMap((x) => x), [fragments]);
  const start = useMemo(
    () => ({ lon: prevPos?.lng ?? 0, lat: prevPos?.lat ?? 0 }),
    [prevPos]
  );
  const end = useMemo(
    () => ({ lon: currentPos?.lng ?? 0, lat: currentPos?.lat ?? 0 }),
    [currentPos]
  );

  trpc.useQuery(
    [
      "routing.check-route",
      {
        start,
        end,
      },
    ],
    {
      retry: false,
      enabled: currentPos !== undefined && prevPos !== undefined,
      onSuccess: (data) => {
        const feature = data.features[0];
        if (!feature) return;
        const coords = feature.geometry.coordinates;
        setFragments([...fragments, coords]);
        const fragStats = parseStats(feature.properties);
        setStats([...stats, fragStats]);
      },
    }
  );

  const handleClick = (pos: LatLng) => {
    if (!firstPos) setFirstPos(pos);
    else setLastPos(pos);

    if (!prevPos) {
      setPrevPos(pos);
    } else if (!currentPos) {
      setCurrentPos(pos);
    } else {
      setPrevPos(currentPos);
      setCurrentPos(pos);
    }
  };

  const undo = () => {
    setFragments(fragments.slice(0, fragments.length - 1));
    setStats(stats.slice(0, stats.length - 1));
    setLastPos(undefined);
  };

  return (
    <>
      <Card>
        <div className="flex">
          <ReplyIcon className="w-6 h-7 cursor-pointer" onClick={undo} />
        </div>
        <div style={{ height: "60vh" }}>
          <Map
            onClick={handleClick}
            line={line}
            startPosition={firstPos}
            endPosition={lastPos}
          />
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-2 pt-4">
        <Card>
          <CardTitle title={format(combinedStats.trackLength)}></CardTitle>
          Distance
        </Card>

        <Card>
          <CardTitle title={`${format(combinedStats.plainAscend)} / ${format(combinedStats.filteredAscend)}`}></CardTitle>
          Height diff / Ascend
        </Card>
        <Card>
          <CardTitle title={formatTime(combinedStats.totalTime)}></CardTitle>
          Estimated time
        </Card>
      </div>
    </>
  );
};

const PlanPage: NextPage = () => {
  const { status } = useSession();

  let content = <PlanPageContent></PlanPageContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return <LayoutBase>{content}</LayoutBase>;
};

export default PlanPage;
