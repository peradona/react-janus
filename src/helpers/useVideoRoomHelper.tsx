import {useEffect, useReducer} from 'react';
import {BITRATE, JanusStatus, MediaDeviceStatus, PluginStatus, PType} from "../constants";
import {attachVideoRoom, publishOwnFeed, publishStreamFeed} from "../utils/VideoRoom/publisher";
import {isShareFeed} from "../utils/janus.utils";
import {attachVideoRoomSubscriber, subscribeRemoteFeed} from "../utils/VideoRoom/subscriber";
import Janus from "../utils/janus";

type VideoRoomHelperProps = {
    readyToInitPlugin: boolean
    janusInstance: any
    janusStatus: JanusStatus
    janusRoom: number | string
    defaultCam: boolean
    myVideoRef?: any
    feedRef: any
    JanusModule?: any
    maxFeedSize?: number
    pType?: PType
}

type VideoPublisher = {
    id: string
    display: string
    audio_codec: any
    video_codec: any
}

type VideoUserMedia = {
    userMediaStatus: MediaDeviceStatus;
    errorEvent: any;
    errorMsg: string;
}

type RemoteFeed = {
    remoteFeed: any
    id: any;
    rfid: any;
    videoTracks: boolean;
}

let feedStreams: any = [];
let localStream: any = null;

enum VideoEventType {
    SUCCESS = 'success',
    ATTACHED = 'attached',
    JOINED = 'joined',
    PUBLISHERS = 'publishers',
    LEAVING = 'leaving',
    UNPUBLISHED = 'unpublished',
    WEBRTC_STATE = 'webrtcState',
    ERROR = 'error',
    ERROR_EVENT = 'error_event',
    // VIDEO_ERROR = 'error event',
    ON_DATA_OPEN = 'ondataopen',
    ON_DATA = 'ondata',
    JOINING = 'joining',
    ON_CLEAN_UP = 'oncleanup',
    DESTROYED = 'destroyed',

    SET = 'set',
    VIDEO_PUBLISHING = 'video_publishing',
    VIDEO_UNPUBLISHED = 'video_unpublished',
    VIDEO_SUCCESS = 'video_success',
    VIDEO_ERROR = 'video_error',

    UPDATE_FEED = 'update_feed_data',
    REMOVE_FEED = 'remove_feed'
}

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

const initialState = {
    videoPlugin: null,
    videoOpaqueId: "",
    vdoPluginStatus: PluginStatus.None,
    myVideoId: "",
    myPrivateVideoId: "string",
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

const videoRoomReducer = (state: VideoRoomState, {type, payload}: VideoRoomAction) => {
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

// const mediaDeviceReducer = (state: any, { type, payload }: any) => {
//     switch (type) {
//
//     }
// }

const useVideoRoomHelper = ({
                                readyToInitPlugin,
                                janusInstance,
                                janusStatus,
                                // maxFeedSize = MAX_FEED_SIZE,
                                janusRoom,
                                // defaultCam,
                                feedRef,
                                pType,
                                myVideoRef,
                                JanusModule = Janus
                            }: VideoRoomHelperProps) => {
    const [{
        videoPlugin,
        videoOpaqueId,
        vdoPluginStatus,
        myVideoId,
        myPrivateVideoId,
        videoUserMedia,
        // videoErrorEvent,
        // videoErrorMsg,
        webrtcState,
        mediaState,
        publishers,
        readyToPublish,
        remoteFeeds,
        // feedData,
        joined,
        // shareFeed,
        shareFeedId,
        joiningEvent,
        leavingEvent,
        dataEvent,
        errorEvent,
        dataChannel,
        isCleanUp,
    }, dispatch] = useReducer(videoRoomReducer, initialState);

    useEffect(() => {
        const videoOpaqueId: string = "videoroom-" + JanusModule.randomString(12);
        dispatch({type: VideoEventType.SET, payload: {key: videoOpaqueId, value: videoOpaqueId}});

        return () => {
            clearData();
        }
    }, [])

    // useEffect(() => {
    //     setReadyToPublish((videoUserMedia === MediaDeviceStatus.Unpublished || videoUserMedia === MediaDeviceStatus.Error) && !webrtcState && joined);
    // }, [videoUserMedia, webrtcState, joined])

    useEffect(() => {
        if (!janusInstance || !videoOpaqueId || janusStatus !== JanusStatus.Success || !readyToInitPlugin || !pType) return;
        if (pType === PType.Publisher) {
            attachPublisherPlugin(janusInstance, videoOpaqueId);
        } else if (pType === PType.Subscriber) {
            attachSubscriberPlugin(janusInstance, videoOpaqueId);
        }
    }, [janusInstance, janusStatus, videoOpaqueId, readyToInitPlugin, pType])

    const clearData = () => {
        feedStreams = [];
        localStream = null;
    }

    const publishCam = (useAudio = false, useVideo = true, data = true) => {
        dispatch({type: VideoEventType.VIDEO_PUBLISHING});
        publishOwnFeed(videoPlugin, useVideo, useAudio, data, BITRATE, false, publishOwnFeedCallback);
    }

    const publishStream = (stream: any) => {
        dispatch({type: VideoEventType.VIDEO_PUBLISHING});
        publishStreamFeed(videoPlugin, stream, true, false, true, BITRATE, false, publishOwnFeedCallback);
    }


    const publishOwnFeedCallback = (eventType: string, data: any) => {
        if (eventType === "success") {
            dispatch({type: VideoEventType.VIDEO_SUCCESS});
        } else if (eventType === "error") {
            dispatch({type: VideoEventType.VIDEO_ERROR, payload: {errorEvent: data, errorMsg: data.message}});
        }
    }

    const attachSubscriberPlugin = (janusInstance: any, videoOpaqueId: string) => {
        dispatch({ type: VideoEventType.SET, payload: { key: vdoPluginStatus, value: PluginStatus.Attaching }});
        attachVideoRoomSubscriber(janusInstance, videoOpaqueId, null, null, null, null, null, null,
            (videoPlugin: any, eventType: any, data: any) => {
                dispatch({ type: VideoEventType.SET, payload: { key: videoPlugin, value: videoPlugin}})
                if (eventType === "success") {
                    dispatch({ type: VideoEventType.SUCCESS })
                } else if (eventType === "attached") {
                    JanusModule.log("attach new video...", data);
                    dispatch({ type: VideoEventType.ATTACHED })
                } else if (eventType === "onremotestream") {
                    if (feedRef.current[(videoPlugin.id).toString()]) {
                        JanusModule.attachMediaStream(feedRef.current[(videoPlugin.id).toString()], data);

                        if (videoPlugin.webrtcStuff.pc.iceConnectionState !== "completed" &&
                            videoPlugin.webrtcStuff.pc.iceConnectionState !== "connected") {
                        }
                    }
                    let videoTracks = data.getVideoTracks();
                    dispatch({
                        type: VideoEventType.UPDATE_FEED, payload: {
                            id: videoPlugin.id,
                            rfid: videoPlugin.rfid,
                            videoTracks: !(!videoTracks || videoTracks.length === 0)
                        }
                    })
                    let newRemoteStream = feedStreams.filter((feed: any) => feed.id === videoPlugin.id)

                    //new streams?
                    if (newRemoteStream[0]) {
                        newRemoteStream = newRemoteStream[0];
                        feedStreams[feedStreams.indexOf(newRemoteStream)] = {id: videoPlugin.id, stream: data};
                    } else {
                        feedStreams.push({id: videoPlugin.id, stream: data});
                    }
                } else if (eventType === "webrtcState") {
                    dispatch({ type: VideoEventType.WEBRTC_STATE, payload: data });
                } else if (eventType === "error") {
                    dispatch({ type: VideoEventType.SET, payload: { key: errorEvent, value: data }});
                } else if (eventType === "error_event") {
                    //TODO
                    // setVideoErrorEvent(data);
                    dispatch({ type: VideoEventType.SET, payload: { key: errorEvent, value: data }});
                } else if (eventType === "ondataopen") {
                    dispatch({ type: VideoEventType.SET, payload: { key: dataChannel, value: data }});
                } else if (eventType === "ondata") {
                    dispatch({ type: VideoEventType.SET, payload: { key: dataEvent, value: data}});
                } else if (eventType === "joining") {
                    dispatch({ type: VideoEventType.SET, payload: { key: joiningEvent, value: data}});
                } else if (eventType === "leaving") {
                    const {leaving} = data;
                    dispatch({ type: VideoEventType.LEAVING, payload: data});

                    let removeFeed = feedStreams.filter((feed: any) => feed.id == leaving)

                    //Remove feed
                    if (removeFeed[0]) {
                        removeFeed = removeFeed[0]
                        removeFeed.plugin.detach()
                        feedStreams.splice(feedStreams.indexOf(removeFeed), 1)
                    }
                } else if (eventType === "oncleanup") {
                    dispatch({ type: VideoEventType.SET, payload: { key: isCleanUp, value: true}});
                } else if (eventType === "destroyed") {
                    videoPlugin.detach();
                    dispatch({ type: VideoEventType.DESTROYED})
                }
            }
        );
    }

    const attachPublisherPlugin = (janusInstance: any, videoOpaqueId: string) => {
        dispatch({ type: VideoEventType.SET, payload: { key: vdoPluginStatus, value: PluginStatus.Attaching }});
        attachVideoRoom(janusInstance, videoOpaqueId, null, null, null, null, true,
            (videoPlugin: any, eventType: any, data: any) => {
                dispatch({ type: VideoEventType.SET, payload: { key: videoPlugin, value: videoPlugin}})

                if (eventType === "success") {
                    dispatch({ type: VideoEventType.SUCCESS })
                } else if (eventType === "joined") {
                    dispatch({ type: VideoEventType.JOINED, payload: data})
                } else if (eventType === "publishers") {
                    const {publishers} = data;
                    dispatch({ type: VideoEventType.SET, payload: { key: publishers, value: publishers}})
                } else if (eventType === "leaving") {
                    const {leaving} = data;
                    dispatch({ type: VideoEventType.LEAVING, payload: data});
                    // One of the publishers has gone away?
                    let removeFeed = feedStreams.filter((feed: any) => feed.id == leaving)

                    //Remove feed
                    if (removeFeed[0]) {
                        removeFeed = removeFeed[0]
                        removeFeed.plugin.detach()
                        feedStreams.splice(feedStreams.indexOf(removeFeed), 1)
                    }
                } else if (eventType === "unpublished") {
                    const {unpublished} = data;

                    if (unpublished === "ok") {
                        videoPlugin.hangup();
                        dispatch({ type: VideoEventType.VIDEO_UNPUBLISHED});
                        return;
                    }

                    dispatch({ type: VideoEventType.UNPUBLISHED, payload: data })

                    let removeFeed = feedStreams.filter((feed: any) => feed.id == unpublished)
                    //Remove feed
                    if (removeFeed[0]) {
                        removeFeed = removeFeed[0]
                        feedStreams.splice(feedStreams.indexOf(removeFeed), 1)
                    }
                } else if (eventType === "webrtcState") {
                    dispatch({ type: VideoEventType.WEBRTC_STATE, payload: data });
                } else if (eventType === "onlocalstream") {
                    localStream = data;
                    if (myVideoRef.current) {
                        JanusModule.attachMediaStream(myVideoRef.current, data);
                        myVideoRef.current.muted = "muted";
                        myVideoRef.current.controls = false;
                    }
                } else if (eventType === "ondataopen") {
                    dispatch({ type: VideoEventType.SET, payload: { key: dataChannel, value: data }});
                } else if (eventType === "mediaState") {
                    dispatch({ type: VideoEventType.SET, payload: { key: mediaState, value: data }});
                } else if (eventType === "error") {
                    // setErrorEvent(data);
                    // dispatch({ type: VideoEventType.SET, payload: { key: errorEvent, value: data }});
                    dispatch({ type: VideoEventType.ERROR, payload: data})
                } else if (eventType === "error event") {
                    dispatch({type: VideoEventType.VIDEO_ERROR, payload: {errorEvent: data, errorMsg: data.error}});
                } else if (eventType === "joining") {
                    dispatch({ type: VideoEventType.SET, payload: { key: joiningEvent, value: data }});
                } else if (eventType === "destroyed") {
                    videoPlugin.detach();
                    dispatch({ type: VideoEventType.DESTROYED})
                } else if (eventType === "oncleanup") {
                    dispatch({ type: VideoEventType.SET, payload: { key: isCleanUp, value: true}});
                    dispatch({ type: VideoEventType.VIDEO_UNPUBLISHED});
                }
            }
        );
    }

    // useEffect(() => {
    //     if (!shareFeedId) return;
    //     setShareFeed(shareFeedId);
    // }, [shareFeedId])

    useEffect(() => {
        if (!janusInstance
            || janusStatus !== JanusStatus.Success
            || !janusRoom
            || !myPrivateVideoId
        ) return;

        publishers.forEach(function (publisher: any) {
            let id = publisher["id"];
            let display = publisher["display"];
            let audio = publisher["audio_codec"];
            let video = publisher["video_codec"];

            subscribeRemoteFeed(janusInstance, videoOpaqueId, janusRoom, id, myPrivateVideoId, display, audio, video, remoteFeedCallback);
        });
    }, [janusInstance, publishers, janusRoom, myPrivateVideoId])

    const subscribeFeed = (id: number | string, display: string, audio: any, video: any) => {
        subscribeRemoteFeed(janusInstance, videoOpaqueId, janusRoom, id, myPrivateVideoId, display, audio, video, remoteFeedCallback);
    }

    const remoteFeedCallback = (_remoteFeed: any, eventType: string, data: any) => {
        if (eventType === "attached") {
            //TODO
            // setRemoteFeeds(oldFeeds => [...oldFeeds, _remoteFeed]);
            dispatch({
                type: VideoEventType.UPDATE_FEED, payload: {
                    id: _remoteFeed.id,
                    rfid: _remoteFeed.rfid,
                    remoteFeed: _remoteFeed,
                }
            })

            if (isShareFeed(_remoteFeed.rfdisplay)) {
                dispatch({ type: VideoEventType.SET, payload: { key: shareFeedId, value: _remoteFeed.rfid}});
            }
        } else if (eventType === "onremotestream") {
            if (feedRef.current[(_remoteFeed.id).toString()]) {
                JanusModule.attachMediaStream(feedRef.current[(_remoteFeed.id).toString()], data);

                if (_remoteFeed.webrtcStuff.pc.iceConnectionState !== "completed" &&
                    _remoteFeed.webrtcStuff.pc.iceConnectionState !== "connected") {
                }

                let videoTracks = data.getVideoTracks();
                if (videoTracks || videoTracks.length === 0) {

                }
            }
            let newRemoteStream = feedStreams.filter((feed: any) => feed.id === _remoteFeed.id)

            //new streams?
            if (newRemoteStream[0]) {
                newRemoteStream = newRemoteStream[0];
                feedStreams[feedStreams.indexOf(newRemoteStream)] = {id: _remoteFeed.id, stream: data};
            } else {
                feedStreams.push({id: _remoteFeed.id, stream: data});
            }
        } else if (eventType === "oncleanup") {
            // setScreenPluginState(PluginStatus.Cleanup);
        } else if (eventType === "error") {

        } else if (eventType === "ondataopen") {

        } else if (eventType === "ondata") {

        }
    }

    const onCameraError = (err: any) => {
        dispatch({type: VideoEventType.VIDEO_ERROR, payload: {errorEvent: err, errorMsg: err}});

    }

    return {
        feedStreams,
        localStream,
        // state,
        videoPlugin,
        remoteFeeds,
        vdoPluginStatus,
        videoUserMedia,
        readyToPublish,
        webrtcState,
        myVideoId,
        joined,
        dataEvent,
        isDataOpen: dataChannel,
        myPrivateVideoId,
        // shareFeed,
        // videoErrorMsg,
        mediaState,
        // feedData,
        shareFeedId,
        joiningEvent,
        leavingEvent,
        isCleanUp,
        errorEvent,
        // videoErrorEvent,
        publishCam,
        publishStream,
        subscribeFeed,
        onCameraError,
    }
}

export default useVideoRoomHelper;