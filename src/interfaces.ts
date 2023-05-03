export interface IMarker {
	id: string;
	type: "big" | "middle";
	img?: string;
	lon?: number;
	lat?: number;
}

export interface IGeometry {
	id: string;
}

export interface ILayer {
	id: string;
	enabled: boolean;
	type: "tile" | "marker" | "geometry";
	markers: Array<IMarker>;
	geometries: Array<IGeometry>;
	tileUrl: string;
}

export interface IStore {
	data: {
		pos: {
			x: number;
			y: number;
			z: number;
		},
		showLayers: Array<ILayer>;
		layers: Array<ILayer>;
		markers: Array<IMarker>;
		geometries: Array<IGeometry>;
	},
	addLayer: (layer: ILayer) => void;
	addMarker: (marker: IMarker) => void;
	addMarkerToLayer: (layerId: string, markerId: Array<string>) => void;
	layerSetTileUrl: (layerId: string, url: string) => void;
	addShowLayer: (layerId: string) => void;
	removeShowLayer: (layerId: string) => void;
	layerEnable: (layerId: string, enableState: boolean) => void;
	updatePos: (x: number, y: number, z: number) => void;
}
