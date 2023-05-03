import { create } from "zustand";

import { ILayer, IMarker, IStore } from "./interfaces";

function getLayer(layers: Array<ILayer>, layerId: string): ILayer | null {
	return layers.filter(item => item.id === layerId)[0];
}

function getMarker(markers: Array<IMarker>, markerId: string): IMarker | null {
	return markers.filter(item => item.id === markerId)[0];
}

export const store = create<IStore>(set => ({
	data: {
		pos: {
			x: 14.41790,
			y: 50.12655,
			z: 13,
		},
		showLayers: [],
		layers: [],
		markers: [],
		geometries: [],
	},
	addLayer: layer => set(state => ({
		data: {
			...state.data,
			layers: [
				...state.data.layers,
				layer,
			],
		},
	})),
	addMarker: marker => set(state => ({
		data: {
			...state.data,
			markers: [
				...state.data.markers,
				marker,
			],
		},
	})),
	addMarkerToLayer: (layerId, markerIds) => set(state => {
		const layers = state.data.layers.slice();
		const layer = getLayer(layers, layerId);
		const markers = markerIds.map(markerId => getMarker(state.data.markers, markerId));

		if (layer && markers.length) {
			layer.markers = [
				...layer.markers,
				...markers,
			];
		}

		return {
			data: {
				...state.data,
				layers,
			},
		};
	}),
	addShowLayer: layerId => set(state => {
		const layer: ILayer = getLayer(state.data.layers, layerId);

		return {
			data: {
				...state.data,
				...layer
					? {
						showLayers: [
							...state.data.showLayers,
							layer,
						],
					}
					: {},
			},
		};
	}),
	removeShowLayer: layerId => set(state => {
		const showLayers = state.data.showLayers;
		const ind = showLayers.findIndex(item => item.id === layerId);

		if (ind !== -1) {
			showLayers.splice(ind, 1);
		}

		return {
			data: {
				...state.data,
				showLayers,
			},
		};
	}),
	layerSetTileUrl: (layerId, url) => set(state => {
		const layers = state.data.layers;
		const layer: ILayer = getLayer(layers, layerId);

		if (layer && layer.type === "tile") {
			layer.tileUrl = url;
		}

		return {
			data: {
				...state.data,
				layers,
			},
		};
	}),
	layerEnable: (layerId, enableState) => set(state => {
		const layers = state.data.layers;
		const layer: ILayer = getLayer(layers, layerId);

		if (layer) {
			layer.enabled = enableState;
		}

		return {
			data: {
				...state.data,
				layers,
			},
		};
	}),
	/* eslint-disable id-length */
	updatePos: (x, y, z) => set(state => ({
		data: {
			...state.data,
			pos: {
				x,
				y,
				z,
			},
		},
	})),
}));

export function getStoreState(): IStore["data"] {
	return JSON.parse(JSON.stringify(store.getState().data));
}

/**
addShowLayer: layer => set(state => {
	return state;
}),
 */
