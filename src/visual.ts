import { ILayer, IMarker, IStore } from "./interfaces";
import { store, getStoreState } from "./store";
import { compareArray } from "./utils";

const { SMap } = window;

let mapRef = null;

interface ILayerItem {
	visual: any;
	layer: ILayer;
}

interface IMarkerItem {
	visual: any;
	marker: IMarker;
}

const LAYERS_CACHE: { [key: string]: ILayerItem } = {};
const MARKERS_CACHE: { [key: string]: IMarkerItem } = {};
//const GEOMETRIES_CACHE = {};
const SHOW_LAYERS: Array<ILayer> = [];
const POS = {
	x: 0,
	y: 0,
	z: 0,
	lock: false,
};

// nastaveni vsech veci na vrstve
function updateLayer(layer: ILayer) {
	const prev = LAYERS_CACHE[layer.id].layer;
	const visual = LAYERS_CACHE[layer.id].visual;

	// povoleni - spolecne
	if (prev === null || (layer.enabled !== prev.enabled)) {
		if (layer.enabled) {
			if (SHOW_LAYERS.findIndex(showLayer => showLayer.id === layer.id) !== -1) {
				visual.enable();
			}
		} else {
			visual.disable();
		}
	}

	if (layer.type === "tile") {
		if (prev === null || (layer.tileUrl !== prev.tileUrl)) {
			visual.setURL(layer.tileUrl);
		}
	} else if (layer.type === "marker") {
		if (prev === null || !compareArray(layer.markers, prev.markers)) {
			visual.removeAll();

			const markers = [];

			layer.markers.forEach(marker => {
				if (marker.id in MARKERS_CACHE && MARKERS_CACHE[marker.id].visual) {
					markers.push(MARKERS_CACHE[marker.id].visual);
				}
			});
			visual.addMarker(markers);
		}
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
	} else if (layer.type === "marker") {
		visual = new SMap.Layer.Marker();
	}

	// ulozime bez dat
	LAYERS_CACHE[layer.id] = {
		layer: null,
		visual,
	};
}

function createMarker(marker: IMarker) {
	let visual = null;

	if (marker.type === "big") {
		visual = new SMap.Marker.POI(SMap.Coords.fromWGS84(marker.lon ?? 0, marker.lat ?? 0), null, {
			visual: SMap.Marker.POI.VISUAL.BIG,
			url: marker.img || "",
		});
	} else if (marker.type === "middle") {
		visual = new SMap.Marker.POI(SMap.Coords.fromWGS84(marker.lon ?? 0, marker.lat ?? 0), null, {
			visual: SMap.Marker.POI.VISUAL.MIDDLE,
			url: marker.img || "",
		});
	}

	// ulozime bez dat
	MARKERS_CACHE[marker.id] = {
		marker: null,
		visual,
	};
}

// smazani vrstvy
function deleteLayer(layer: ILayer) {
	console.log(["delete layer", layer]);
}

// smazani vrstvy
function deleteMarker(marker: IMarker) {
	console.log(["delete marker", marker]);
}

function removeShowLayer(layer: ILayer) {
	console.log(["remove show layer", layer]);
}

// ind nebo na konec
function addShowLayer(layer: ILayer, ind?: number) {
	const visual = LAYERS_CACHE[layer.id].visual;

	console.log(["add show layer", layer, ind]);
	mapRef.addLayer(visual);
}

function applyLayerChanges(newState: IStore["data"]) {
	// projdeme vrstvy
	const layersIds = [];

	// vytvorime
	newState.layers.forEach(item => {
		if (!(item.id in LAYERS_CACHE)) {
			createLayer(item);
		}

		layersIds.push(item.id);
	});

	// smazeme stare
	Object.keys(LAYERS_CACHE).forEach(layerId => {
		const item = LAYERS_CACHE[layerId];

		if (layersIds.indexOf(layerId) === -1) {
			deleteLayer(item.layer);
		}
	});

	// poresime zobrazene vrstvy
	const curShowLayers = [
		...SHOW_LAYERS,
	];

	SHOW_LAYERS.length = newState.showLayers.length;

	for (let ind = 0, max = Math.max(newState.showLayers.length, curShowLayers.length); ind < max; ind++) {
		// existuji oba
		const curLayer = curShowLayers[ind];
		const newLayer = newState.showLayers[ind];

		if (curLayer && newLayer) {
			if (curLayer.id === newLayer.id) {
				SHOW_LAYERS[ind] = curLayer;
			} else {
				removeShowLayer(curLayer);
				addShowLayer(newLayer, ind);
				SHOW_LAYERS[ind] = newLayer;
			}
		// pridavame
		} else if (!curLayer && newLayer) {
			addShowLayer(newLayer);
			SHOW_LAYERS[ind] = newLayer;
		} else if (!newLayer && curLayer) {
			removeShowLayer(curLayer);
		}
	}

	// aktualizace
	newState.layers.forEach(item => {
		updateLayer(item);
	});
}

function applyMarkerChanges(newState: IStore["data"]) {
	// projdeme vrstvy
	const markerIds = [];

	// vytvorime
	newState.markers.forEach(item => {
		if (!(item.id in MARKERS_CACHE)) {
			createMarker(item);
		}

		markerIds.push(item.id);
	});

	// smazeme stare
	Object.keys(MARKERS_CACHE).forEach(layerId => {
		const item = MARKERS_CACHE[layerId];

		if (markerIds.indexOf(layerId) === -1) {
			deleteMarker(item.marker);
		}
	});
}

function applyDataChanges(newState: IStore["data"]) {
	applyMarkerChanges(newState);
	applyLayerChanges(newState);
	// pozice
	if (newState.pos.x !== POS.x || newState.pos.y !== POS.y || newState.pos.z !== POS.z) {
		POS.x = newState.pos.x;
		POS.y = newState.pos.y;
		POS.z = newState.pos.z;

		if (POS.lock) {
			POS.lock = false;
		} else {
			mapRef.setCenterZoom(SMap.Coords.fromWGS84(POS.x, POS.y), POS.z, false);
		}
	}
}

export function createVisual() {
	// vytvorime mapu
	const initState = getStoreState();
	const center = SMap.Coords.fromWGS84(initState.pos.x, initState.pos.y);

	mapRef = new SMap(document.getElementById("map"), center, initState.pos.z);
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

	POS.x = initState.pos.x;
	POS.y = initState.pos.y;
	POS.z = initState.pos.z;

	// nastavime data ze storu
	applyDataChanges(initState);

	// zmeny stavu - (state, prevState)
	store.subscribe(state => {
		const newState = JSON.parse(JSON.stringify(state.data));

		applyDataChanges(newState);
	});
}
