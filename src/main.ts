import { DiscordConnector } from "./connector";
function doMain(): void {
	const clientId = about.productName().match(/storyboard/i)
		? "857353205762359318"
		: "1229238624982274069";

	let timer = new QTimer();
	timer.interval = 1000;
	timer.singleshot = false;

	this.connector = new DiscordConnector(clientId, about.productName(), timer);
	this.connector.timer.start()
}
doMain();
