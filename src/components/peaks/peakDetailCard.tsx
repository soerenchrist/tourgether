import { Peak } from "@prisma/client";
import { Avatar, Card } from "flowbite-react";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";

const PeakDetailCard: React.FC<{
  peak: Peak;
  wikidata?: {
    description?: string | null;
    dominance?: number | null;
    image?: string | null;
  } | null;
}> = ({ peak, wikidata }) => {
  return (
    <Card>
      <div className="h-full flex flex-col justify-start">
        <div className="w-full flex-1 flex justify-between">
          <div className="flex-1 mr-4">
            <CardTitle title={peak.name} />
            <p>{wikidata?.description}</p>

            <List className="pt-4">
              <ListItem title={`${peak.height} m` } subtitle="Height"/>
              {peak.cross && <ListItem title="Yes" subtitle="Has Cross"/>}
              {peak.register && <ListItem title="Yes" subtitle="Has Register"/>}
              {peak.prominence && <ListItem title={`${peak.prominence} m`} subtitle="Prominance"/>}
              {wikidata?.dominance && <ListItem title={`${wikidata?.dominance} km`} subtitle="Dominance"/>}
              {peak.massif && <ListItem title={peak.massif} subtitle="Massif"/>}

            </List>
          </div>
          {wikidata && wikidata.image && (
            <div className="">
            <Avatar
              img={wikidata.image}
              size="xl"
              alt="Peak image"
            />
            </div>
          )}
        </div>
        {(peak.osmId || wikidata) &&
        <div className="text-xs">
          Source: {peak.osmId && <a className="text-blue-600" href={`https://www.openstreetmap.org/node/${peak.osmId}`}>OpenStreetMap Data</a>},{" "}
          {wikidata && <a className="text-blue-600" href={`https://www.wikidata.org/wiki/${peak.wikidata}`}>Wikidata</a>}
        </div>}
      </div>
    </Card>
  );
};

export default PeakDetailCard;
