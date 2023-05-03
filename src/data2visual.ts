import { ILayer, IStore } from "./interfaces";
import { store } from "./store";

const visualisers = [];

interface ILayerItem {
	layer: ILayer;
}

interface ILayersCache { [key: string]: ILayerItem };

type TShowLayers = Array<ILayer>;

interface IPosition {
	x: number;
	y: number;
	z: number;
	lock: boolean;
}

function makeChanges<T extends keyof IMethods>(type: T, data: IMethods[T]) {
	visualisers.forEach(visualiser => {
		visualiser.makeChange(type, data);
	});
}

function applyDataChanges(newState: IStore["data"], layerCache: ILayersCache, showLayers: TShowLayers, position: IPosition) {
	// projdeme vrstvy
	const layersIds = [];

	// vytvorime
	newState.layers.forEach(item => {
		if (!(item.id in layerCache)) {
			makeChanges("create-layer", { item });
			layerCache[item.id] = { layer: item };
		}

		layersIds.push(item.id);
	});

	// poresime zobrazene vrstvy
	const newShowLayers = new Array(newState.showLayers.length);

	for (let ind = 0, max = Math.max(newState.showLayers.length, showLayers.length); ind < max; ind++) {
		// existuji oba
		const curLayer = showLayers[ind];
		const newLayer = newState.showLayers[ind];

		if (curLayer && newLayer) {
			if (curLayer.id === newLayer.id) {
				newShowLayers[ind] = curLayer;
			} else {
				makeChanges("remove-show-layer", { item: curLayer });
				makeChanges("add-show-layer", { item: newLayer, pos: ind });
				newShowLayers[ind] = newLayer;
			}
		// pridavame
		} else if (!curLayer && newLayer) {
			makeChanges("add-show-layer", { item: newLayer });
			newShowLayers[ind] = newLayer;
		} else if (!newLayer && curLayer) {
			makeChanges("remove-show-layer", { item: curLayer });
		}
	}

	if (newState.pos.x !== position.x || newState.pos.y !== position.y || newState.pos.z !== position.z) {
		position.x = newState.pos.x;
		position.y = newState.pos.y;
		position.z = newState.pos.z;

		if (position.lock) {
			position.lock = false;
		} else {
			makeChanges("set-center-zoom", { x: position.x, y: position.y, z: position.z });
		}
	}

	newState.layers.forEach(item => {
		if (item.id in layerCache) {
			makeChanges("update-layer", { item });
			layerCache[item.id].layer = item;
		}
	});

	// smazeme stare
	Object.keys(layerCache).forEach(layerId => {
		const item = layerCache[layerId];

		if (layersIds.indexOf(layerId) === -1) {
			makeChanges("delete-layer", { item: item.layer });
			delete layerCache[layerId];
		}
	});

	return newShowLayers;
}

export function createData2Visual() {
	const layersCache: ILayersCache = {};
	//const MARKERS_CACHE = {};
	//const GEOMETRIES_CACHE = {};
	const position: IPosition = {
		x: 0,
		y: 0,
		z: 0,
		lock: false,
	};
	let showLayersCache: TShowLayers = [];

	// zmeny stavu - (state, prevState)
	store.subscribe(state => {
		showLayersCache = applyDataChanges(JSON.parse(JSON.stringify(state.data)), layersCache, showLayersCache, position);
	});

	return {
		addVisualiser: (newVisualiser: any) => {
			visualisers.push(newVisualiser);
		},
	}
}
