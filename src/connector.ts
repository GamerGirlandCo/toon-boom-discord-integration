import { Buffer } from "./modules/buffer";
import formEncode from "./modules/form-encode";
import {
	rand,
	pad,
	trimDir,
} from "./utils";
import { DiscordMessage } from "./typings/types";
export class DiscordConnector {
	readonly scopes: string[] = ["rpc", "identify"];
	private startTime: number = Date.now();
	private blockingRead: number = 0;
	private processing: number = 0;
	private codec: QTextCodec = QTextCodec.codecForLocale();
	private oauthFile: QFile = new QFile(".discord-auth");
	private connectedTS: number = -1;
	constructor(
		public clientID: string,
		public appName: string
	) {
		this.connect();
	}
	public socket = new QLocalSocket();
	public static log(type: string, ...args: any[]): void {
		let msg = `[DISCORD::${type}] -> `;
		for (const a of args) {
			msg += JSON.stringify(a);
			msg += " ";
		}
		MessageLog.trace(msg);
	}
	private connect(): boolean {
		for (let i = 0; i < 10; i++) {
			this.socket.connectToServer("discord-ipc-" + i);
			DiscordConnector.log("info", "trying to connect to discord...");
			if (this.socket.waitForConnected(3000)) break;
		}
		if (this.socket.state() != QLocalSocket.LocalSocketState.ConnectedState) {
			DiscordConnector.log("error", "connection failed :(");
			return false;
		}
		DiscordConnector.log("info", "connected!");
		this.sendMsg(
			{
				v: 1,
				client_id: this.clientID,
				scopes: this.scopes,
			},
			0
		);
		let msg: DiscordMessage = this.readMsg() as DiscordMessage;
		if (Object.keys(msg).length == 0) {
			DiscordConnector.log("warn", "empty response");
			return false;
		}
		if (msg.cmd != "DISPATCH") {
			DiscordConnector.log("warn", "expected dispatch");
			return false;
		}
		this.connectedTS = Date.now();
		return true;
	}
	sendMsg(packet: unknown, opCode: number = 0) {
		let ba = new QByteArray();
		let strPacket = JSON.stringify(packet);
		let pkgBuffer = this.codec.fromUnicode(strPacket);
		let buf = Buffer.alloc(8);
		buf.writeInt32LE(opCode, 0);
		buf.writeInt32LE(pkgBuffer.length(), 4);
		buf.toJSON().data.forEach((x) => ba.appendByte(x));
		ba.append(pkgBuffer)
		this.socket.write(ba);
	}
	readMsg(): DiscordMessage | unknown {
		let header = this.readBytes(8);
		if (header.isNull()) {
			DiscordConnector.log("debug", "empty JSON");
			return {};
		}
		let rawOp = this.codec.toUnicode(header.mid(0, 4).trimmed().toHex())
		let bdata = this.readBytes(this.socket.bytesAvailable());
		let data = JSON.parse(this.codec.toUnicode(bdata));
		let mheader: DiscordMessage = {
			op: Buffer.fromHex(rawOp),
			...data,
		};
		return mheader;
	}
	private readBytes(bytes: number): QByteArray {
		this.blockingRead++;
		this.processing++;
		while (this.socket.bytesAvailable() < bytes) {
			if (!this.socket.waitForReadyRead(10000)) {
				DiscordConnector.log("warn", "read timeout exceeded");
				this.processing--;
				this.blockingRead--;
				return new QByteArray();
			}
		}
		this.processing--;
		this.blockingRead--;
		return this.socket.read(bytes);
	}


	private lastScene: string;
	updatePresence() {
		const isSBP = !!this.appName.match(/storyboard/i);
		let sbm = new StoryboardManager();
		let curSel = new SelectionManager();
		let [panel, scene] = [
			sbm.nameOfPanel(curSel.getPanelSelection()[0]),
			sbm.nameOfScene(curSel.getSceneSelection()[0]),
		];
		let titleAndSub;
		try {
			titleAndSub = [sbm.getTitle(), sbm.getSubTitle()];
		} catch (err) {
			titleAndSub = [
				sbm.getProjectMetadata("projectTitle").value,
				sbm.getProjectMetadata("projectSubTitle").value,
			];
		}
		let [title, subtitle] = titleAndSub;
		if (scene != this.lastScene) {
			this.startTime = Date.now();
			this.lastScene = scene;
		}
		let activity = {
			// name: this.appName.replace(/\s\d+$/m, ""),
			type: 0,
			details: `${title} — ${subtitle}`,
			state: `Editing Scene “${scene}”, panel “${panel}”`,
			// created_at: this.connectedTS,
			assets: {
				//todo: make this dynamic?
				large_image: isSBP ? "storyboardpro_4x" : "",
			},
			timestamps: {
				start: this.startTime,
			},
		};
		DiscordConnector.log("info", "Updating presence...");
		let pkt = {
			cmd: "SET_ACTIVITY",
			args: {
				pid: QCoreApplication.applicationPid(),
				activity,
			},
			nonce: QUuid.createUuid().toString().replace(/[{}]/gm, ""),
		};
		this.sendMsg(pkt, 1);
		let msg = this.readMsg() as DiscordMessage;
		DiscordConnector.log("trace", JSON.stringify(msg))
		if (msg.evt == "ERROR") {
			throw new Error(`code ${msg.data.code} -> ${msg.data.message}`);
		}
		DiscordConnector.log("success", "presence updated successfully!");
	}
}
