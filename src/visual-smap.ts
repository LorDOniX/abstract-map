import { ILayer, IStore } from "./interfaces";
import { store, getStoreState } from "./store";

let mapRef = null;

interface ILayerItem {
	visual: any;
	layer: ILayer;
}

// nastaveni vsech veci na vrstve
function updateLayer(layer: ILayer) {
	const prev = LAYERS_CACHE[layer.id].layer;
	const visual = LAYERS_CACHE[layer.id].visual;

	// povoleni
	if (prev === null || (layer.enabled !== prev.enabled)) {
		if (layer.enabled) {
			visual.enable();
		} else {
			visual.disable();
		}
	}

	if (prev === null || (layer.tileUrl !== prev.tileUrl)) {
		visual.setURL(layer.tileUrl);
	}

	// ulozime
	LAYERS_CACHE[layer.id] = {
		layer,
		visual,
	};
}

// vytvoreni vrstvy
function createLayer(layer: ILayer) {
	let visual = null;

	if (layer.type === "tile") {
		visual = new SMap.Layer.Tile(layer.id, layer.tileUrl, {});
	}

	// ulozime bez dat
	LAYERS_CACHE[layer.id] = {
		layer: null,
		visual,
	};
}

// smazani vrstvy
function deleteLayer(layer: ILayer) {
	console.log(["delete layer", layer]);
}

function removeShowLayer(layer: ILayer) {
	console.log(["remove show layer", layer]);
}

// ind nebo na konec
function addShowLayer(layer: ILayer, ind?: number) {
	const visual = LAYERS_CACHE[layer.id].visual;

	console.log(ind);
	mapRef.addLayer(visual);
}

const { SMap } = window;

function createMap(state: IStore["data"]) {
	const center = SMap.Coords.fromWGS84(state.pos.x, state.pos.y);

	mapRef = new SMap(document.getElementById("map"), center, state.pos.z);
	mapRef.addDefaultControls();
	/* eslint-disable-next-line */
	mapRef.getSignals().addListener(this, "map-redraw", () => {
		const newCenter = mapRef.getCenter().toWGS84();
		const zoom = mapRef.getZoom();

		POS.x = newCenter[0];
		POS.y = newCenter[1];
		POS.z = zoom;
		POS.lock = true;
		store.getState().updatePos(newCenter[0], newCenter[1], zoom);
		POS.lock = false;
	});

	POS.x = state.pos.x;
	POS.y = state.pos.y;
	POS.z = state.pos.z;

	SHOW_LAYERS.length = 0;
	initState.showLayers.forEach(layer => SHOW_LAYERS.push(layer));
}

export function createSMapVisual(state: IStore["data"]) {
	// vytvorime mapu
	createMap(state);
}
