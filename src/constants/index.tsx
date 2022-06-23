export const mainFeedSize = 3;
export const maxPublishers = 10;
export const otherFeedSize = 1;
// export const otherFeedSize = 1;
// export const mainFeedSize = 1;

export enum ConnectionState {
    None,
    Connected,
    Connecting,
    Disconnected,
}

export enum EventState {
    StartCalling= "Start calling",
    Answer = "Answer",
    Decline = "Decline",
    Cancel = "Cancel",
    HangUP =  "Hang up",
    Connected =  "Connected",
    Disconnected =  "Disconnected",
}

export const EventType = {
    StartCalling: "Start calling",
    Answer: "Answer",
    Decline: "Decline",
    Reject: "Reject",
    Cancel: "Cancel",
    HangUP: "Hang up",
    Connected: "Connected",
    Disconnected: "Disconnected",
    OnCall: "On call",
    NoResponse: "No response",
    Joining: "joining",
    CallEnded: "Call ended"
}

export enum PType {
    Publisher = "publisher",
    Subscriber = "subscriber"
}

export enum Role {
    Callee = "callee",
    Caller = "caller",
}

export enum UserStatus {
    Available = "available",
    Busy = "busy"
}

export enum CameraStatus {
    Unknown,
    TurnOn,
    TurnOff,
    Mute,
}

export enum MicrophoneStatus {
    Unknown,
    Talking,
    NotTalking,
    Mute
}

export enum VideoCallType {
    VoiceCall,
    VideoCall,
}

export enum JanusStatus {
    None,
    Connecting,
    Success,
    Error,
    Destroyed,
}

export enum MediaDeviceStatus {
    Publishing = "publishing",
    Published = "published",
    Unpublished = "unpublished",
    Error = "error",
}

export enum PluginStatus {
    None,
    Attaching,
    Attached,
    Error,
    Cleanup,
    Destroyed,
}

export enum CurrentStatus {
    Idle = "idle",
    Joined = "joined",
    Leaving = "leaving",
    Unpublished = "unpublished",
    Error = "error",
}

export enum JanusRoomStatus {
    Unknown = "unknown",
    NotExist = "not exist",
    Exist = "exist",
}

export enum VideoCallState {
    Idle = "idle",
    Calling = "calling",
    Accepted = "accepted",
    OnCall = "onCall"
}

export enum ConferenceEvent {
    Join = "join",
    Participants = "participants",
    Leave = "leave"
}

export type Message = {
    id: string
    type: string
}

export type JoinEvent = {
    id: string
    duration: number
}

export type CallEvent = Message & {
    eventType: string
    data: any
}

export type CallBroadcast = Message & {
    body: any
}