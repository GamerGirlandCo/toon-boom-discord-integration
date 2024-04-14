import { DiscordConnector } from "./connector";
function doMain():void {
	const clientId = about.productName().match(/storyboard/i) ? "857353205762359318" : ""
	let connector = new DiscordConnector(clientId, about.productName());
	let timer = new QTimer();
	timer.interval = 1000;
	timer.singleshot = false;
	timer.timeout.connect(connector, connector.updatePresence);
	timer.start()
}
doMain()