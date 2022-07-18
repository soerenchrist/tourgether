import { Peak } from "@prisma/client";
import { Avatar, Card } from "flowbite-react";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";
import Skeleton from "../common/skeleton";

const PeakDetailCard: React.FC<{
  peak: Peak;
  wikidataLoading: boolean;
  wikidata?: {
    description?: string | null;
    dominance?: number | null;
    image?: string | null;
  } | null;
}> = ({ peak, wikidata, wikidataLoading }) => {
  return (
    <Card>
      <div className="h-full flex flex-col justify-start">
        <>
          <div className="w-full flex-1 flex justify-between">
            <div className="flex-1 mr-4">
              <CardTitle title={peak.name} />
              {wikidataLoading && <Skeleton className="h-5 w-11/12"></Skeleton>}
              {!wikidataLoading && wikidata && (
                <span className="text-sm text-gray-600">
                  {wikidata.description}
                </span>
              )}

              <List className="pt-4">
                <ListItem title={`${peak.height} m`} subtitle="Height" />
                {peak.cross && <ListItem title="Yes" subtitle="Has Cross" />}
                {peak.register && (
                  <ListItem title="Yes" subtitle="Has Register" />
                )}
                {peak.prominence && (
                  <ListItem
                    title={`${peak.prominence} m`}
                    subtitle="Prominance"
                  />
                )}
                {wikidata?.dominance && (
                  <ListItem
                    title={`${wikidata?.dominance} km`}
                    subtitle="Dominance"
                  />
                )}
                {peak.massif && (
                  <ListItem title={peak.massif} subtitle="Massif" />
                )}
              </List>
            </div>
            <div className="w-42">
              {wikidataLoading && <Skeleton className="w-36 h-36"></Skeleton>}

              {wikidata && wikidata.image && (
                <Avatar img={wikidata.image} size="xl" alt="Peak image" />
              )}
            </div>
          </div>
          {(peak.osmId || wikidata) && (
            <div className="text-xs">
              <>
                Source:{" "}
                {peak.osmId && (
                  <a
                    className="text-blue-600"
                    href={`https://www.openstreetmap.org/node/${peak.osmId}`}
                  >
                    OpenStreetMap Data
                  </a>
                )}
                ,{" "}
                {wikidata && (
                  <a
                    className="text-blue-600"
                    href={`https://www.wikidata.org/wiki/${peak.wikidata}`}
                  >
                    Wikidata
                  </a>
                )}
              </>
            </div>
          )}
        </>
      </div>
    </Card>
  );
};

export default PeakDetailCard;
