import {useEffect} from "react";
import {useJanusHelper} from "./index";
import {ConnectionState, JanusStatus, maxPublishers, PType} from "../constants";
import Janus from "../utils/janus";
import useVideoRoomHelper from "./useVideoRoomHelper";

type JanusWithPluginsProps = {
    server: string,
    useVideoRoom: boolean,
    useAudioRoom: boolean,
    useVirtualBackground: boolean,
    useSocket: boolean,
    socketState: ConnectionState,

    videoRoom?: number | string,
    audioRoom?: number | string,
    videoPType?: PType,
    maxFeedSize?: number,
    audioRef?: any,
    feedRef?: any,
    myVideoRef?: any,
    JanusModule?: any
}

const useJanusWithPlugins = ({server, videoRoom, audioRoom, useVideoRoom, useAudioRoom, useSocket, socketState, feedRef, myVideoRef, videoPType, maxFeedSize = maxPublishers, JanusModule = Janus}: JanusWithPluginsProps) => {
    const { janusInstance, janusStatus, janusErrorMsg, isWebrtcSupported, readyToInitPlugin } = useJanusHelper({server, useSocket, socketState, JanusModule})
    const { videoOpaqueId, myPrivateVideoId, publishers, attachPublisherPlugin, attachSubscriberPlugin, joinVideoRoom, publishCam, subscribeFeed } = useVideoRoomHelper({ feedRef, maxFeedSize, myVideoRef, JanusModule})

    useEffect(() => {
        if (!useVideoRoom || !janusInstance || !videoOpaqueId || janusStatus !== JanusStatus.Success || !readyToInitPlugin || !videoPType) return;
        if (videoPType === PType.Publisher) {
            attachPublisherPlugin(janusInstance, videoOpaqueId);
        } else if (videoPType === PType.Subscriber) {
            attachSubscriberPlugin(janusInstance, videoOpaqueId);
        }
    }, [useVideoRoom, janusInstance, janusStatus, videoOpaqueId, readyToInitPlugin, videoPType])

    useEffect(() => {
        if (!janusInstance
            || janusStatus !== JanusStatus.Success
            || !videoRoom
            || !myPrivateVideoId
        ) return;

        publishers.forEach(function (publisher: any) {
            let id = publisher["id"];
            let display = publisher["display"];
            let audio = publisher["audio_codec"];
            let video = publisher["video_codec"];

            subscribeFeed(janusInstance, videoRoom, id, display, audio, video);
        });
    }, [janusInstance, publishers, videoRoom, myPrivateVideoId])

    // useEffect(() => {
    //     if (!room) return;
    //     if (!userData) return;
    //     if (!userData.id) return;
    //
    //     console.log(`[Join room] User ${userData.id} has join room ${janusRoomId}`);
    //     joinVideoRoom(videoPlugin, janusRoomId, userData?.id + ":" + confId);
    //     joinAudioRoom(audioPlugin, janusRoomId, userData?.id + ":" + confId);
    // }, [room, userData])

    const publishMyCam = (useAudio = false, useVideo = true, data = true) => {
        if (!useVideoRoom) return;
        publishCam(useAudio, useVideo, data);
    }

    const joinRoom = (display: string) => {
        if (videoRoom && useVideoRoom) {
            joinVideoRoom(videoRoom, display);
        }
        if (audioRoom && useAudioRoom) {

        }
    }

    return {
        janusInstance,
        janusStatus,
        janusErrorMsg,
        isWebrtcSupported,
        videoOpaqueId,
        useAudioRoom,
        publishMyCam,
        joinRoom,
    }
}

export default useJanusWithPlugins;