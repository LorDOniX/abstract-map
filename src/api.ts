import { ILayer, IMarker } from "./interfaces";
import { getId } from "./utils";
import { store } from "./store";

export function createLayer(type: ILayer["type"]): string {
	const newLayer: ILayer = {
		id: getId(),
		enabled: false,
		geometries: [],
		markers: [],
		tileUrl: "",
		type,
	};

	store.getState().addLayer(newLayer);

	return newLayer.id;
}

export function createMarker(type: IMarker["type"], opts?: Partial<Omit<IMarker, "id" | "type">>): string {
	const newMarker: IMarker = {
		id: getId(),
		type,
		...opts,
	};

	store.getState().addMarker(newMarker);

	return newMarker.id;
}
