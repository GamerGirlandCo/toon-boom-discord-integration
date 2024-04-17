export enum EventType {
	unkonwn,
	ready,
	error,
	guildStatus,
	guildCreate,
	channelCreate,
	voiceChannelSelect,
	voiceStateCreate,
	voiceStateUpdate,
	voiceStateDelete,
	voiceSettingsUpdate,
	voiceConnectionStatus,
	speakingStart,
	speakingStop,
	messageCreate,
	messageUpdate,
	messageDelete,
	notificationCreate,
	activityJoin,
	activitySpectate,
	activityJoinRequest,
};

export interface DiscordMessage {
	op: number;
	cmd: string;
	evt: string;
	data: any;
}
interface BaseMetadata {
	name: string;
	value: string;
	version: string;
}
interface HiddenInfoField extends BaseMetadata {
	type: "hiddenInfoField"
}
interface Meta extends BaseMetadata {
	type: "string" | "int" | "bool" | string;
}
export type StoryboardMetadata = Meta | HiddenInfoField;

export interface HarmonyCache {
	layoutExport: LayoutExport;
	frameFile: QFile;
	url?: string;
}
export interface StoryboardCache {
	exporter: ExportManager;
	frameFile: QFile;
	lastScene?: string;
	url?: string;
}