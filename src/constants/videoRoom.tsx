import {MediaDeviceStatus} from "./index";

export type VideoPublisher = {
    id: string
    display: string
    audio_codec: any
    video_codec: any
}

export type VideoUserMedia = {
    userMediaStatus: MediaDeviceStatus;
    errorEvent: any;
    errorMsg: string;
}

export type RemoteFeed = {
    remoteFeed: any
    id: any;
    rfid: any;
    videoTracks: boolean;
}