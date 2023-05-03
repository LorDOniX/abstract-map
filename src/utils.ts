export function getId(): string {
	const number = Math.random() * 10e9 >>> 0;

	return number.toString(16);
}

export function compareArray<T>(array1: Array<T>, array2: Array<T>) {
	if (array1.length !== array2.length) {
		return false;
	}

	return JSON.stringify(array1) === JSON.stringify(array2);
}
