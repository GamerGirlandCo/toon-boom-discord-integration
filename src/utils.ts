import { DiscordConnector } from "./connector";

export function rand() {
	return Math.floor(Math.random() ** 10e7);
}
export function pad(original: string, char: string, minLen: number) {
	let padded = "";
	if (original.length < minLen) {
		for (let i = 0; i < minLen - original.length; i++) {
			padded += char;
		}
	}
	return padded + original;
}
export function trimDir(dir: QDir) {
	if (dir.entryList.length > 1) {
		for (let i = 1; i < dir.entryList.length; i++) {
			new QFile(
				`${dir.path()}/${dir.entryList()[i]}`
			).remove();
		}
	}
}

// console.log(encodeURIComponent(header))
// console.log(header)
// console.log(toByteArray(-65535))
// console.log(fromByteArray(toByteArray(1234)))
