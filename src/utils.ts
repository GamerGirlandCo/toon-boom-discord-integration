import { DiscordConnector } from "./connector";

export function m_toByteArray(rawInt: number): number[] {
	const ff = 0xff;
	let nums: number[] = []
	let intstr = rawInt.toString();

	let shiftBy = 8 * (intstr.length - 1);
	for(let i = 0; i < rawInt.toString().length; i++) {
		// console.log(shiftBy)
		nums.push((rawInt >> shiftBy) & ff)
		shiftBy -= 8
	}
	
	while (nums.length < 4) {
		nums.unshift(0)
	}
	return nums;
}
export function m_fromByteArray(rawArr: number[]): number {
	while(rawArr[rawArr.length - 1] == 0) {
			rawArr.pop()
	}
	var ret = 0;
	const ff = 0xff;
	let shiftBy = 8 * (rawArr.length - 1);
	for(let num of rawArr) {
		ret += (num & ff) << shiftBy;
		shiftBy -= 8;
	}
	return ret;
}
export function padHex(arg: number[]) {
	let fin = ""
	for(let a of arg) {
		let s = a.toString(16)
		if(s.length < 2)
			s = `0${s}`
		fin += s;
	}
	return fin;
}
export function stringToByteArray(s: string): number[] {
	DiscordConnector.log("trace", s)
	let match = s.match(/.{1,3}/g);
	return match?.map(x => parseInt(x, 16)) ?? [];
}
var hg = {hello: "goodbye"};
// console.log(JSON.stringify(hg).length)
var header = m_toByteArray(JSON.stringify(hg).length).map(x => x.toString(16))/* .map(x => String.fromCharCode(x)).join("") */;
export function rand() {
	return Math.floor(Math.random() ** 10e7)
}
// console.log(encodeURIComponent(header))
// console.log(header)
// console.log(toByteArray(-65535))
// console.log(fromByteArray(toByteArray(1234)))