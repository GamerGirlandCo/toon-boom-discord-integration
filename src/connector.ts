import { Buffer } from "./modules/buffer";
import { trimDir } from "./utils";
import { DiscordMessage, HarmonyCache, StoryboardCache } from "./typings/types";
export class DiscordConnector {
	readonly scopes: string[] = ["rpc", "identify"];
	private startTime: number = Date.now();
	private blockingRead: number = 0;
	private processing: number = 0;
	private codec: QTextCodec = QTextCodec.codecForLocale();
	private connectedTS: number = -1;
	private lastUpdate: number = Date.now();
	private nam: QNetworkAccessManager = new QNetworkAccessManager();
	private isConnected: boolean = false;
	private delHash: string = "";
	constructor(
		public clientID: string,
		public appName: string,
		public timer: QTimer
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
		MessageLog.debug(msg);
	}
	private disconnect() {
		this.isConnected = false;
		this.timer.stop();
	}
	public connected(): boolean {
		return this.isConnected;
	}
	public connect(): boolean {
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
			DiscordConnector.log("warn", "expected dispatch", msg);
			return false;
		}
		this.connectedTS = Date.now();

		this.isConnected = true;
		this.timer.timeout.connect(this, this.updatePresence);
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
		ba.append(pkgBuffer);
		this.socket.write(ba);
	}
	readMsg(): DiscordMessage | unknown {
		let header = this.readBytes(8);
		if (header.isNull()) {
			DiscordConnector.log("debug", "empty JSON");
			return {};
		}
		let rawOp = this.codec.toUnicode(header.mid(0, 4).trimmed().toHex());
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
	private uploadFile(file: QFile): string {
		file.open(QIODevice.ReadOnly);
		let head = this.codec.fromUnicode("Client-ID 48dcd20d95ad070");
		if (this.delHash) {
			let dreq = new QNetworkRequest(
				new QUrl(`https://api.imgur.com/3/image/${this.delHash}`)
			);
			dreq.setRawHeader(this.codec.fromUnicode("Authorization"), head);
			let r = this.nam.deleteResource(dreq);
			let loop = new QEventLoop();
			r.finished.connect(loop.quit);
			loop.exec();
			r.deleteLater();
		}
		let url = new QUrl("https://api.imgur.com/3/image");
		let req = new QNetworkRequest(url);
		// req.setHeader(QNetworkRequest.ContentTypeHeader, "application/json");
		req.setRawHeader(this.codec.fromUnicode("Authorization"), head);
		let r = this.nam.post(req, file.readAll());
		let loop = new QEventLoop();
		r.finished.connect(loop.quit);
		loop.exec();
		r.deleteLater();
		let ba = r.readAll();
		let response = JSON.parse(this.codec.toUnicode(ba));
		if (!response.success) throw new Error("request failed");
		this.delHash = response.data.deleteHash;
		file.close();

		MessageLog.trace("URL " + JSON.stringify(response));
		return response.data.link;
	}

	private sCache: StoryboardCache;
	private update_sbp(): any {
		if (!this.sCache) {
			this.sCache = {
				exporter: new ExportManager(),
				frameFile: new QFile(`${project.currentProjectPath()}/.frame.png`),
			};
			this.lastUpdate = Date.now();
		}
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
		let activity: any = {
			// name: this.appName.replace(/\s\d+$/m, ""),
			type: 0,
			details: `${title} — ${subtitle}`,
			state: `Editing Scene “${scene}”, panel ${panel}`,
			// created_at: this.connectedTS,
			assets: {
				//todo: make this dynamic?
				large_image: "storyboardpro_4x",
			},
			timestamps: {},
		};

		if (scene != this.sCache.lastScene) {
			this.startTime = Date.now();
			this.sCache.lastScene = scene;
			this.sCache.exporter.setUseCurrentPanel(true);
			this.sCache.exporter.setBitmapRectifyStatic(true);
			this.sCache.exporter.setBitmapFitCameraPath(false)
			this.sCache.exporter.setExportResolution(
				project.currentResolutionX(),
				project.currentResolutionY()
			);
			this.sCache.exporter.exportToBitmap(
				project.currentProjectPath(),
				".frame.png",
				"png"
			);
			let dir = new QDir(project.currentProjectPath());
			dir.setNameFilters([".frame*"]);
			dir.setSorting(QDir.Time);
			
			let frameFile = new QFile(
				`${project.currentProjectPath()}/${dir.entryList()[0]}`
			);

			(new QFile(project.currentProjectPath() + "/.frame.png")).remove()
			frameFile.rename(project.currentProjectPath() + "/.frame.png");
			if (frameFile != this.sCache.frameFile && dir.entryList()[0] != undefined) {
				this.sCache.frameFile = frameFile;
				this.sCache.url = this.uploadFile(this.sCache.frameFile);
			}

			this.lastUpdate = Date.now();
		}
		activity.assets.large_image = `${this.sCache.url}`;
		activity.assets.small_image = "storyboardpro_4x";
		activity.timestamps.start = this.startTime;
		return activity;
	}

	private update_harmony(): any {
		if (!this.hCache) {
			this.hCache = {
				layoutExport: new LayoutExport(),
				frameFile: new QFile(
					[scene.currentProjectPath(), ".frame.png"].join("/")
				),
			};
			this.startTime = this.lastUpdate = Date.now();
		}
		let activity: any = {
			type: 0,
			details: `Animating ${scene.currentScene()}`,
			assets: {},
			timestamps: {},
		};
		if (Date.now() > this.lastUpdate + 30000 || !this.hCache.url) {
			let params = new LayoutExportParams();
			params.frame = frame.current();
			params.whiteBackground = true;
			params.fileDirectory = scene.currentProjectPath();
			params.zoomScale = 1;
			params.fileFormat = "png";
			params.filePattern = ".frame";
			params.renderStaticCameraAtSceneRes = true;
			params.exportAllCameraFrame = true;

			this.hCache.layoutExport.addRender(params);
			this.hCache.layoutExport.save(params);

			let frameFile = new QFile(
				[scene.currentProjectPath(), ".frame.png"].join("/")
			);
			if (this.hCache.frameFile != frameFile) {
				this.hCache.frameFile = frameFile;

				this.hCache.url = this.uploadFile(this.hCache.frameFile);
			}
			this.lastUpdate = Date.now();
		}

		activity.timestamps.start = this.startTime;
		activity.state = `Currently drawing on frame ${frame.current()}`;
		activity.assets.large_image = `${this.hCache.url}`;
		activity.assets.small_image = "harmony";

		return activity;
	}
	private hCache: HarmonyCache;
	updatePresence() {
		if (!this.isConnected) {
			return;
		}
		const isSBP = !!this.appName.match(/storyboard/i);
		const activity = isSBP ? this.update_sbp() : this.update_harmony();
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
		DiscordConnector.log("trace", JSON.stringify(msg));
		if (msg.evt == "ERROR") {
			throw new Error(`code ${msg.data.code} -> ${msg.data.message}`);
		}
		DiscordConnector.log("success", "presence updated successfully!");
	}
}
