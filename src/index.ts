import { createVisual } from "./visual";
import { createLayer, createMarker } from "./api";
import { store } from "./store";

export function main() {
	const tileLayer = createLayer("tile");
	const tileLayer2 = createLayer("tile");
	const storeState = store.getState();

	storeState.layerSetTileUrl(tileLayer, "https://mapserver.mapy.dev.dszn.cz/turist-m/");
	storeState.layerSetTileUrl(tileLayer2, "https://mapserver.mapy.dev.dszn.cz/bing/");
	storeState.addShowLayer(tileLayer);
	storeState.addShowLayer(tileLayer2);
	storeState.layerEnable(tileLayer, true);
	storeState.layerEnable(tileLayer2, true);
	storeState.removeShowLayer(tileLayer2);

	const markerLayer = createLayer("marker");
	const marker = createMarker("big", {
		img: "https://api.mapy.cz/poiimg/icon/509",
		lon: 14.41790,
		lat: 50.12655,
	});
	const marker2 = createMarker("middle", {
		img: "https://d34-a.sdn.cz/d_34/c_img_QQ_k/H3SNOV.jpeg?fl=res,400,225,3",
		lon: 14.40,
		lat: 50.13,
	});

	storeState.addShowLayer(markerLayer);
	storeState.layerEnable(markerLayer, true);
	storeState.addMarkerToLayer(markerLayer, [marker, marker2]);

	return {
		setTileUrl: (url: string) => {
			storeState.layerSetTileUrl(tileLayer, url);
		},
		/* eslint-disable id-length */
		setPosition: (x: number, y: number, z: number) => {
			storeState.updatePos(x, y, z);
		},
		createMarker: () => {
			const pos = store.getState().data.pos;
			const newMarker = createMarker("middle", {
				img: "https://d34-a.sdn.cz/d_34/c_img_QQ_k/H3SNOV.jpeg?fl=res,400,225,3",
				lon: pos.x,
				lat: pos.y,
			});

			storeState.addMarkerToLayer(markerLayer, [newMarker]);
		},
		create: () => {
			createVisual();
		},
	};
}
