declare module 'gpx-parser-builder' {
  export interface LatLng {
    lat: string;
    lon: string;
  }

  export interface Waypoint {
    $: LatLng;
    ele: string;
    time: Date;
  }

  export interface TrackSegment {
    trkpt: Waypoint[];
  }

  export interface Track {
    name: string;
    type: string;
    trkseg: TrackSegment[] 
  }

  export interface Gpx {
    trk: Track[]
  }

  export type ParseFunc = (content: string) => Gpx;
  
  export const parse: ParseFunc;
  const defaultExport = {parse};
  export default defaultExport;
}