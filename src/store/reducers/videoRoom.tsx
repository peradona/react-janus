import {VideoEventType} from "../actions/videoRoom";
import {MediaDeviceStatus, PluginStatus} from "../../constants";
import {RemoteFeed, VideoPublisher, VideoUserMedia} from "../../constants/videoRoom";

interface VideoRoomAction {
    type: VideoEventType;
    payload?: any;
}

interface VideoRoomState {
    videoPlugin: any;
    videoOpaqueId: string;
    vdoPluginStatus: PluginStatus;
    myVideoId: string;
    myPrivateVideoId: string;
    webrtcState: boolean;
    mediaState: boolean;
    publishers: VideoPublisher[];
    readyToPublish: boolean;
    remoteFeeds: RemoteFeed[];
    // feedData: any[];
    joined: boolean;
    // shareFeed: any;
    shareFeedId: any;
    joiningEvent: any;
    leavingEvent: any;
    dataEvent: any;
    errorEvent: any;
    videoUserMedia: VideoUserMedia
    // videoUserMedia: MediaDeviceStatus;
    // videoErrorEvent: any;
    // videoErrorMsg: string;
    dataChannel: boolean;
    isCleanUp: boolean;
}

export const initialVideoState = {
    videoPlugin: null,
    videoOpaqueId: "",
    vdoPluginStatus: PluginStatus.None,
    myVideoId: "",
    myPrivateVideoId: "",
    webrtcState: false,
    mediaState: false,
    publishers: [],
    readyToPublish: false,
    remoteFeeds: [],
    // feedData: [],
    joined: false,
    // shareFeed: null,
    shareFeedId: null,
    joiningEvent: null,
    leavingEvent: null,
    dataEvent: null,
    errorEvent: null,
    // videoUserMedia: MediaDeviceStatus.None,
    // videoErrorEvent: null,
    // videoErrorMsg: "",
    videoUserMedia: {userMediaStatus: MediaDeviceStatus.None, errorEvent: null, errorMsg: ""},
    dataChannel: false,
    isCleanUp: false,
};

export const videoRoomReducer = (state: VideoRoomState, {type, payload}: VideoRoomAction) => {
    switch (type) {
        //Video plugin event
        case VideoEventType.SUCCESS:
            return {
                ...state,
                vdoPluginStatus: PluginStatus.Attached
            };
        case VideoEventType.ATTACHED:
            return {
                ...state,
                vdoPluginStatus: PluginStatus.Attached
            };
        case VideoEventType.DESTROYED:
            return {
                ...state,
                vdoPluginStatus: PluginStatus.Destroyed
            }
        case VideoEventType.ERROR:
            return {
                ...state,
                vdoPluginStatus: PluginStatus.Error,
                errorEvent: payload
            }

        // Msg Event
        case VideoEventType.JOINED:
            return {
                ...state,
                myVideoId: payload.id,
                myPrivateVideoId: payload.private_id,
                joined: true,
                publishers: payload.publishers ? payload.publishers : state.publishers
            }
        case VideoEventType.WEBRTC_STATE:
            return {
                ...state,
                webrtcState: payload
            }

        //video user media
        case VideoEventType.VIDEO_PUBLISHING:
            return {
                ...state,
                videoUserMedia: {
                    userMediaStatus: MediaDeviceStatus.Publishing
                }
            }
        case VideoEventType.VIDEO_SUCCESS:
            return {
                ...state,
                videoUserMedia: {
                    userMediaStatus: MediaDeviceStatus.Published
                }
            }
        case VideoEventType.VIDEO_UNPUBLISHED:
            return {
                ...state,
                videoUserMedia: {
                    userMediaStatus: MediaDeviceStatus.Unpublished
                }
            }
        case VideoEventType.VIDEO_ERROR:
            return {
                ...state,
                videoUserMedia: {
                    userMediaStatus: MediaDeviceStatus.Error,
                    errorEvent: payload.errorEvent,
                    errorMsg: payload.errorMsg
                }
            }


        case VideoEventType.UPDATE_FEED:
            return {
                ...state,
                feedData: updateFeedData(state.remoteFeeds, payload)
            }
        case VideoEventType.REMOVE_FEED:
            return {
                ...state,
                feedData: state.remoteFeeds.filter(item => item.rfid !== payload)
            }
        case VideoEventType.LEAVING:
            return {
                ...state,
                feedData: state.remoteFeeds.filter(item => item.rfid !== payload.leaving),
                shareFeedId: ((sf: any) => sf && sf === payload.leaving ? null : sf),
                leavingEvent: payload
            }
        case VideoEventType.UNPUBLISHED:
            return {
                ...state,
                feedData: state.remoteFeeds.filter(item => item.rfid !== payload.unpublished),
                shareFeedId: ((sf: any) => sf && sf === payload.unpublished ? null : sf),
            }
        case VideoEventType.SET:
            return {
                ...state,
                [payload.key]: payload.value,
            };
        default:
            return state;
    }
};

const updateFeedData = (remoteFeeds: any[], data: any) => {
    let found = remoteFeeds.find((fs: any) => fs.id === data.id);

    if (found) {
        return remoteFeeds.map(obj => {
            if (obj.id === data.id) {
                return {...obj, ...data};
            }
            return obj;
        })
    } else {
        return [...remoteFeeds, data]
    }
};