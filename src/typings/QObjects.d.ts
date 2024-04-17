import { StoryboardMetadata } from "./types";

declare global {
	const global: any;
	const QLocalSocket: {
		LocalSocketState: {
			UnconnectedState: unknown;
			ConnectingState: unknown;
			ConnectedState: unknown;
			ClosingState: unknown;
		};
		new (): any;
	};
	// type TCodec =
	class QTextCodec {
		constructor();
		public fromUnicode(uni: string): QByteArray;
		public toUnicode(ba: QByteArray): string;
		public static codecForLocale(): QTextCodec;
	}
	class QByteArray {
		constructor();
		public insertByte(b: number): void;
		public append(b: QByteArray): void;
		public resize(ns: number): void;
		public setInt(i: number, base: number): void;
		public left(i: number): QByteArray;
		public right(i: number): QByteArray;
		public mid(pos: number, size: number): QByteArray;
		public replace(index: number, len: number, arr: QByteArray): void;
		public isNull(): boolean;
		public toHex(): QByteArray;
		public trimmed(): QByteArray;
		public prependByte(arg: number): void;
		public appendByte(arg: number): void;
		public length(): number;
		public toBase64(): QByteArray;
		public static fromInt(int: number): QByteArray;
		public static fromHex(arr: QByteArray): QByteArray;
	}
	class QUrl {
		constructor(val: string);
	}
	class QEventLoop {
		public exec(): void;
		public quit(): void;
	}

	class QNetworkRequest {
		constructor(url: QUrl);
		public static name: unknown;
		public static length: unknown;
		public static prototype: unknown;
		public static __qt_data__: unknown;
		public static HighPriority: unknown;
		public static NormalPriority: unknown;
		public static LowPriority: unknown;
		public static Priority: unknown;
		public static Automatic: unknown;
		public static Manual: unknown;
		public static LoadControl: unknown;
		public static HttpStatusCodeAttribute: unknown;
		public static HttpReasonPhraseAttribute: unknown;
		public static RedirectionTargetAttribute: unknown;
		public static ConnectionEncryptedAttribute: unknown;
		public static CacheLoadControlAttribute: unknown;
		public static CacheSaveControlAttribute: unknown;
		public static SourceIsFromCacheAttribute: unknown;
		public static DoNotBufferUploadDataAttribute: unknown;
		public static HttpPipeliningAllowedAttribute: unknown;
		public static HttpPipeliningWasUsedAttribute: unknown;
		public static CustomVerbAttribute: unknown;
		public static CookieLoadControlAttribute: unknown;
		public static AuthenticationReuseAttribute: unknown;
		public static CookieSaveControlAttribute: unknown;
		public static MaximumDownloadBufferSizeAttribute: unknown;
		public static DownloadBufferAttribute: unknown;
		public static SynchronousRequestAttribute: unknown;
		public static BackgroundRequestAttribute: unknown;
		public static User: unknown;
		public static UserMax: unknown;
		public static Attribute: unknown;
		public static ContentTypeHeader: string;
		public static ContentLengthHeader: string;
		public static LocationHeader: string;
		public static LastModifiedHeader: string;
		public static CookieHeader: string;
		public static SetCookieHeader: string;
		public static ContentDispositionHeader: string;
		public static UserAgentHeader: string;
		public static ServerHeader: string;
		public static KnownHeaders(): string[];
		public static AlwaysNetwork: unknown;
		public static PreferNetwork: unknown;
		public static PreferCache: unknown;
		public static AlwaysCache: unknown;
		public static CacheLoadControl: unknown;
		public setHeader(header: string, value: unknown): void;
		public setRawHeader(header: QByteArray, value: QByteArray): void
	}
	class QNetworkReply {
		public finished: any;
		public deleteLater(): void;
		public error(): unknown;
		public errorString(): string;
		public readAll(): QByteArray;
		public static NoError: unknown;
	}
	class QNetworkAccessManager {
		public post(req: QNetworkRequest, body: QByteArray): QNetworkReply;
		public deleteResource(req: QNetworkRequest): QNetworkReply;
	}
	const about: {
		productName(): string;
	};
	class QUuid {
		public static createUuid(): string;
	}
	class QFile {
		constructor(name: string);
		public setFileName(name: string): void;
		public exists(): boolean;
		public atEnd(): boolean;
		public open(mode: unknown): void;
		public close(): void;
		public readAll(): QByteArray;
		public write(bytes: QByteArray): void;
		public rename(newName: string): boolean;
		public remove(): boolean;
		// copy,exists,fileName,link,remove,rename,resize,setFileName,symLinkTarget,atEnd,bytesAvailable,bytesToWrite,canReadLine,close,errorString,getChar,isOpen,isReadable,isSequential,isTextModeEnabled,isWritable,open,openMode,peek,pos,putChar,read,readAll,readLine,reset,seek,setTextModeEnabled,size,ungetChar,waitForBytesWritten,waitForReadyRead,write
	}
	class QDir {
		constructor(dirName: string);
		public entryList(): string[];
		public setNameFilters(filters: string[]): void;
		public setSorting(flags: number): void;
		public path(): string;
		public static readonly Time: number;
		public static readonly Reversed: number;
	}
	class QIODevice {
		public static readonly ReadOnly: unknown;
		public static readonly WriteOnly: unknown;
	}
	class QDataStream {
		public writeInt(int: number): void;
		public writeByte(byte: number): void;
	}
	const MessageLog: {
		trace(arg: string): void;
		debug(arg: string): void;
	};
	class QTimer {
		public interval: number;
		public singleshot: boolean;
		public timeout: {
			connect(obj: any, fn: Function): void;
		};
		public active: boolean;
		public stop(): void;
		public start(): void;
	}
	class Scene {}
	class Panel {}
	class SelectionManager {
		public getPanelSelection(): Panel[];
		public getSceneSelection(): Scene[];
	}
	class StoryboardManager {
		public nameOfScene(arg: Scene): string;
		public nameOfPanel(arg: Panel): string;
		public getTitle(): string;
		public getSubTitle(): string;
		public getProjectMetadata(name: string): StoryboardMetadata;
		public getProjectMetadatas(): StoryboardMetadata[];
	}
	const QCoreApplication: {
		applicationPid(): number;
	};
	class ExportManager {
		public exportLayout(dir: string, file: string, format: "jpg" | "png" | "tga" | "psd");
		public setSelectedPanels(pan: Panel[]): void;
		public setExportResolution(x: number, y: number): void
	}
	const project: {
		currentProjectPath(): string
		currentResolutionX(): number;
		currentResolutionY(): number;
	}
	/*  ,toString,constructor*/
	// harmony-specific //
	class LayoutExport {
		public save(params: LayoutExportParams): boolean;
		public addRender(params: LayoutExportParams): boolean;
	}
	class LayoutExportParams {
		frame: number
		fileFormat: string;
		filePattern:  string;
		whiteBackground: boolean
		fileDirectory: string;
		zoomScale: number;
		renderStaticCameraAtSceneRes: boolean;
		exportCameraFrame: boolean;
		exportAllCameraFrame: boolean;
	}
	const scene: {
		currentProjectPath(): string;
		currentScene(): string;
		currentResolutionX(): number;
		currentResolutionY(): number;
	}
	const preferences: {
		getInt(pref: string, def: number): number;
	}
	const frame: {
		current(): number;
	}
}
