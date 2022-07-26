import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import HeightDistanceChart from "@/components/plan/heightDistanceChart";
import { createGpx } from "@/lib/gpxLib";
import { PageProps, protectedServersideProps } from "@/server/common/protectedServersideProps";
import { FeatureProperties } from "@/server/router/routing";
import { trpc } from "@/utils/trpc";
import { mdiDownload, mdiUndo } from "@mdi/js";
import Icon from "@mdi/react";
import { Alert, Card } from "flowbite-react";
import { LatLng } from "leaflet";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
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
};

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
    filteredAscend: props
      .map((x) => x.filteredAscend)
      .reduce((a, x) => a + x, 0),
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
  const [error, setError] = useState<string>();
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

  const undo = () => {
    setFragments(fragments.slice(0, fragments.length - 1));
    setStats(stats.slice(0, stats.length - 1));
    setLastPos(undefined);
  };
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
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: currentPos !== undefined && prevPos !== undefined,
      onSuccess: (data) => {
        const feature = data.features[0];
        if (!feature) return;
        const coords = feature.geometry.coordinates;
        setFragments([...fragments, coords]);
        const fragStats = parseStats(feature.properties);
        setStats([...stats, fragStats]);
      },
      onError: (error) => {
        setTimeout(() => {
          setError(undefined);
        }, 2000);
        setError(error.message);
        setCurrentPos(prevPos);
        setLastPos(undefined);
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

  const download = () => {
    if (line.length === 0) return;

    const gpx = createGpx(line);

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([gpx]));
    a.download = "planned-tour.gpx";
    a.click();
  };
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex gap-2">
          <span onClick={undo}>
            <Icon path={mdiUndo} className="w-6 h-6 cursor-pointer" />
          </span>
          <span onClick={download}>
            <Icon path={mdiDownload} className="w-6 h-6 cursor-pointer" />
          </span>
        </div>
        {error && <Alert color="failure">{error}</Alert>}
        <div style={{ height: "40vh" }}>
          <Map
            onClick={handleClick}
            line={line}
            startPosition={firstPos}
            endPosition={lastPos}
          />
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-2">
        <Card>
          <CardTitle title={format(combinedStats.trackLength)}></CardTitle>
          Distance
        </Card>

        <Card>
          <CardTitle
            title={`${format(combinedStats.plainAscend)} / ${format(
              combinedStats.filteredAscend
            )}`}
          ></CardTitle>
          Height diff / Ascend
        </Card>
        <Card>
          <CardTitle title={formatTime(combinedStats.totalTime)}></CardTitle>
          Estimated time
        </Card>
      </div>
      {line.length > 0 && (
        <Card>
          <CardTitle title="Height profile"></CardTitle>
          <HeightDistanceChart points={line} />
        </Card>
      )}
    </div>
  );
};

const PlanPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>Plan your Tour</title>
      </Head>
      <LayoutBase session={data.session}>
        <PlanPageContent />
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default PlanPage;
