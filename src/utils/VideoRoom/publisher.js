import Janus from '../janus.utils';

export const attachVideoRoom = (janus, opaqueId, room, secret, pin, username, isPublisher, callback) => {
    let pubPlugin = null;
    let myStream = null;

    if (!janus) {
        return;
    }

    janus.attach(
        {
            plugin: "janus.plugin.videoroom",
            opaqueId: opaqueId,
            success: (pluginHandle) => {
                pubPlugin = pluginHandle;
                // window.Janus.log("  -- This is a publisher/manager ss");
                callback(pubPlugin, "success", true);
            },
            error: (error) => {
                // window.Janus.log("  -- Error attaching plugin...", error);
                callback(pubPlugin, "error", error);
            },
            consentDialog: (on) => {
                // window.Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
            },
            mediaState: (medium, on) => {
                // window.Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                callback(pubPlugin, "mediaState", on);
            },
            webrtcState: (on) => {
                // window.Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                callback(pubPlugin, "webrtcState", on);
            },
            onmessage: (msg, jsep) => {
                // window.Janus.debug(" ::: Got a message (publisher) :::");
                // window.Janus.debug(msg);
                //
                // window.Janus.log("Got message", msg);

                const event = msg.videoroom;
                if (event) {
                    if (event === "joined") {
                        // window.Janus.log("Successfully joined room " + msg["room"] + " with ID " + msg["id"]);
                        callback(pubPlugin, "joined", msg)
                    } else if (event === "joining") {
                        callback(pubPlugin, "joining", msg)
                    } else if (event === "destroyed") {
                        // window.Janus.warn("The room has been destroyed!");
                        callback(pubPlugin, "destroyed", event);
                    } else if (event === "event") {
                        if (msg.error) {
                            callback(pubPlugin, "error event", msg);
                        } else if (msg.publishers) {
                            callback(pubPlugin, "publishers", msg);
                        } else if (msg["joining"]) {
                            callback(pubPlugin, "joining", msg);
                        } else if (msg["leaving"]) {
                            callback(pubPlugin, "leaving", msg);
                        } else if (msg["unpublished"]) {
                            if (msg["unpublished"] === "ok") {
                                pubPlugin.hangup();
                            }
                            callback(pubPlugin, "unpublished", msg)
                        }
                    }
                }

                if (jsep) {
                    // window.Janus.debug("Handling SDP as well...");
                    // window.Janus.debug(jsep);
                    pubPlugin.handleRemoteJsep({jsep: jsep});
                    // Check if any of the media we wanted to publish has
                    // been rejected (e.g., wrong or unsupported codec)
                    let audio = msg["audio_codec"];
                    if (myStream && myStream.getAudioTracks() && myStream.getAudioTracks().length > 0 && !audio) {
                        // Audio has been rejected
                        // window.Janus.log("Our audio stream has been rejected, viewers won't hear us");
                    }
                    let video = msg["video_codec"];
                    if (myStream && myStream.getVideoTracks() && myStream.getVideoTracks().length > 0 && !video) {
                        // window.Janus.log("Our video stream has been rejected, viewers won't see us");
                    }
                }
            },
            onlocalstream: (stream) => {
                // window.Janus.debug(" ::: Got a local stream :::");
                myStream = stream;
                callback(pubPlugin, "onlocalstream", stream);
            },
            onremotestream: (stream) => {
                // The publisher stream is sendonly, we don't expect anything here
            },
            ondata: function (data) {
                // window.Janus.debug("We got data from the DataChannel!");
                callback(pubPlugin, "ondata", data);
            },
            ondataopen: function (data) {
                // window.Janus.log("The DataChannel is available!");
                callback(pubPlugin, "ondataopen", data);
            },
            oncleanup: function () {
                // window.Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
                callback(pubPlugin, "oncleanup");
            }
        }
    );

    return pubPlugin;
}

// export const attachVideoRoomMultiStream = (janus, opaqueId, room, secret, pin, username, isPublisher, callback) => {
//     let pubPlugin = null;
//     let myStream = null;
//     let feedStreams = {};
//     let localTracks = {};
//     let localVideos = 0;
//
//     if (!janus) {
//         return;
//     }
//
//     janus.attach(
//         {
//             plugin: "janus.plugin.videoroom",
//             opaqueId: opaqueId,
//             success: function (pluginHandle) {
//                 // $('#details').remove();
//                 pubPlugin = pluginHandle;
//                 Janus.log("Plugin attached! (" + pubPlugin.getPlugin() + ", id=" + pubPlugin.getId() + ")");
//                 Janus.log("  -- This is a publisher/manager");
//                 // Prepare the username registration
//                 // $('#videojoin').removeClass('hide').show();
//                 // $('#registernow').removeClass('hide').show();
//                 // $('#register').click(registerUsername);
//                 // $('#username').focus();
//                 // $('#start').removeAttr('disabled').html("Stop")
//                 //     .click(function () {
//                 //         $(this).attr('disabled', true);
//                 //         janus.destroy();
//                 //     });
//                 callback(pubPlugin, "success", true)
//             },
//             error: function (error) {
//                 Janus.error("  -- Error attaching plugin...", error);
//                 callback(pubPlugin, "error", error)
//             },
//             consentDialog: function (on) {
//                 Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
//                 // if (on) {
//                 //     // Darken screen and show hint
//                 //     $.blockUI({
//                 //         message: '<div><img src="up_arrow.png"/></div>',
//                 //         css: {
//                 //             border: 'none',
//                 //             padding: '15px',
//                 //             backgroundColor: 'transparent',
//                 //             color: '#aaa',
//                 //             top: '10px',
//                 //             left: (navigator.mozGetUserMedia ? '-100px' : '300px')
//                 //         }
//                 //     });
//                 // } else {
//                 //     // Restore screen
//                 //     $.unblockUI();
//                 // }
//                 callback(pubPlugin, "consentDialog", on);
//             },
//             iceState: function (state) {
//                 Janus.log("ICE state changed to " + state);
//                 callback(pubPlugin, "iceState", state);
//             },
//             mediaState: function (medium, on, mid) {
//                 Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium + " (mid=" + mid + ")");
//                 callback(pubPlugin, "mediaState", {medium, on, mid});
//             },
//             webrtcState: function (on) {
//                 Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
//                 // $("#videolocal").parent().parent().unblock();
//                 // if (!on)
//                 //     return;
//                 // $('#publish').remove();
//                 // // This controls allows us to override the global room bitrate cap
//                 // $('#bitrate').parent().parent().removeClass('hide').show();
//                 // $('#bitrate a').click(function () {
//                 //     var id = $(this).attr("id");
//                 //     var bitrate = parseInt(id) * 1000;
//                 //     if (bitrate === 0) {
//                 //         Janus.log("Not limiting bandwidth via REMB");
//                 //     } else {
//                 //         Janus.log("Capping bandwidth to " + bitrate + " via REMB");
//                 //     }
//                 //     $('#bitrateset').html($(this).html() + '<span class="caret"></span>').parent().removeClass('open');
//                 //     sfutest.send({message: {request: "configure", bitrate: bitrate}});
//                 //     return false;
//                 // });
//                 callback(pubPlugin, "webrtcState", on);
//             },
//             slowLink: function (uplink, lost, mid) {
//                 Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") + " packets on mid " + mid + " (" + lost + " lost packets)");
//                 callback(pubPlugin, "slowLink", {uplink, lost, mid});
//             },
//             onmessage: function (msg, jsep) {
//                 Janus.debug(" ::: Got a message (publisher) :::", msg);
//                 let event = msg["videoroom"];
//                 Janus.debug("Event: " + event);
//                 if (event) {
//                     if (event === "joined") {
//                         // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
//                         // myid = msg["id"];
//                         // mypvtid = msg["private_id"];
//                         // Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
//                         // if (subscriber_mode) {
//                         //     $('#videojoin').hide();
//                         //     $('#videos').removeClass('hide').show();
//                         // } else {
//                         //     publishOwnFeed(true);
//                         // }
//                         // // Any new feed to attach to?
//                         // if (msg["publishers"]) {
//                         //     var list = msg["publishers"];
//                         //     Janus.debug("Got a list of available publishers/feeds:", list);
//                         //     var sources = null;
//                         //     for (var f in list) {
//                         //         var id = list[f]["id"];
//                         //         var display = list[f]["display"];
//                         //         var streams = list[f]["streams"];
//                         //         for (var i in streams) {
//                         //             var stream = streams[i];
//                         //             stream["id"] = id;
//                         //             stream["display"] = display;
//                         //         }
//                         //         feedStreams[id] = {
//                         //             id: id,
//                         //             display: display,
//                         //             streams: streams
//                         //         }
//                         //         Janus.debug("  >> [" + id + "] " + display + ":", streams);
//                         //         if (!sources)
//                         //             sources = [];
//                         //         sources.push(streams);
//                         //     }
//                         //     if (sources)
//                         //         subscribeTo(sources);
//                         // }
//                         callback(pubPlugin, "joined", msg)
//                     } else if (event === "destroyed") {
//                         // The room has been destroyed
//                         Janus.warn("The room has been destroyed!");
//                         callback(pubPlugin, "destroyed", msg)
//                     } else if (event === "event") {
//                         // Any info on our streams or a new feed to attach to?
//                         if (msg["streams"]) {
//                             let streams = msg["streams"];
//                             for (let i in streams) {
//                                 let stream = streams[i];
//                                 stream["id"] = myid;
//                                 stream["display"] = myusername;
//                             }
//                             feedStreams[myid] = {
//                                 id: myid,
//                                 display: myusername,
//                                 streams: streams
//                             }
//                             callback(pubPlugin, "streams", msg)
//                         } else if (msg["publishers"]) {
//                             let list = msg["publishers"];
//                             Janus.debug("Got a list of available publishers/feeds:", list);
//                             // let sources = null;
//                             // for (var f in list) {
//                             //     let id = list[f]["id"];
//                             //     let display = list[f]["display"];
//                             //     let streams = list[f]["streams"];
//                             //     for (let i in streams) {
//                             //         let stream = streams[i];
//                             //         stream["id"] = id;
//                             //         stream["display"] = display;
//                             //     }
//                             //     feedStreams[id] = {
//                             //         id: id,
//                             //         display: display,
//                             //         streams: streams
//                             //     }
//                             //     Janus.debug("  >> [" + id + "] " + display + ":", streams);
//                             //     if (!sources)
//                             //         sources = [];
//                             //     sources.push(streams);
//                             // }
//                             // if (sources)
//                             //     subscribeTo(sources);
//                         } else if (msg["leaving"]) {
//                             // One of the publishers has gone away?
//                             let leaving = msg["leaving"];
//                             Janus.log("Publisher left: " + leaving);
//                             // unsubscribeFrom(leaving);
//                         } else if (msg["unpublished"]) {
//                             // One of the publishers has unpublished?
//                             // let unpublished = msg["unpublished"];
//                             // Janus.log("Publisher left: " + unpublished);
//                             // if (unpublished === 'ok') {
//                             //     // That's us
//                             //     sfutest.hangup();
//                             //     return;
//                             // }
//                             // unsubscribeFrom(unpublished);
//                         } else if (msg["error"]) {
//                             if (msg["error_code"] === 426) {
//                                 // This is a "no such room" error: give a more meaningful description
//                                 // bootbox.alert(
//                                 //     "<p>Apparently room <code>" + myroom + "</code> (the one this demo uses as a test room) " +
//                                 //     "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.cfg</code> " +
//                                 //     "configuration file? If not, make sure you copy the details of room <code>" + myroom + "</code> " +
//                                 //     "from that sample in your current configuration file, then restart Janus and try again."
//                                 // );
//                             } else {
//                                 // bootbox.alert(msg["error"]);
//                             }
//                         }
//                     }
//                 }
//                 if (jsep) {
//                     Janus.debug("Handling SDP as well...", jsep);
//                     pubPlugin.handleRemoteJsep({jsep: jsep});
//                     // Check if any of the media we wanted to publish has
//                     // been rejected (e.g., wrong or unsupported codec)
//                     let audio = msg["audio_codec"];
//                     if (myStream && myStream.getAudioTracks() && myStream.getAudioTracks().length > 0 && !audio) {
//                         // Audio has been rejected
//                         window.Janus.log("Our audio stream has been rejected, viewers won't hear us");
//                     }
//                     let video = msg["video_codec"];
//                     if (myStream && myStream.getVideoTracks() && myStream.getVideoTracks().length > 0 && !video) {
//                         // Video has been rejected
//                         window.Janus.log("Our video stream has been rejected, viewers won't see us");
//                         // Hide the webcam video
//                         // $('#myvideo').hide();
//                         // $('#videolocal').append(
//                         //     '<div class="no-video-container">' +
//                         //     '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
//                         //     '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
//                         //     '</div>');
//                     }
//                 }
//             },
//             onlocaltrack: function (track, on) {
//                 Janus.debug(" ::: Got a local track event :::");
//                 Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);
//                 // We use the track ID as name of the element, but it may contain invalid characters
//                 let trackId = track.id.replace(/[{}]/g, "");
//                 if (!on) {
//                     // Track removed, get rid of the stream and the rendering
//                     let stream = localTracks[trackId];
//                     if (stream) {
//                         try {
//                             let tracks = stream.getTracks();
//                             for (let i in tracks) {
//                                 let mst = tracks[i];
//                                 if (mst)
//                                     mst.stop();
//                             }
//                         } catch (e) {
//                         }
//                     }
//                     if (track.kind === "video") {
//                         $('#myvideo' + trackId).remove();
//                         localVideos--;
//                         if (localVideos === 0) {
//                             // No video, at least for now: show a placeholder
//                             if ($('#videolocal .no-video-container').length === 0) {
//                                 $('#videolocal').append(
//                                     '<div class="no-video-container">' +
//                                     '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
//                                     '<span class="no-video-text">No webcam available</span>' +
//                                     '</div>');
//                             }
//                         }
//                     }
//                     delete localTracks[trackId];
//                     return;
//                 }
//                 // If we're here, a new track was added
//                 let stream = localTracks[trackId];
//                 if (stream) {
//                     // We've been here already
//                     return;
//                 }
//                 // $('#videos').removeClass('hide').show();
//                 // if ($('#mute').length === 0) {
//                 //     // Add a 'mute' button
//                 //     $('#videolocal').append('<button class="btn btn-warning btn-xs" id="mute" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">Mute</button>');
//                 //     $('#mute').click(toggleMute);
//                 //     // Add an 'unpublish' button
//                 //     $('#videolocal').append('<button class="btn btn-warning btn-xs" id="unpublish" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;">Unpublish</button>');
//                 //     $('#unpublish').click(unpublishOwnFeed);
//                 // }
//                 if (track.kind === "audio") {
//                     // We ignore local audio tracks, they'd generate echo anyway
//                     if (localVideos === 0) {
//                         // No video, at least for now: show a placeholder
//                         if ($('#videolocal .no-video-container').length === 0) {
//                             $('#videolocal').append(
//                                 '<div class="no-video-container">' +
//                                 '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
//                                 '<span class="no-video-text">No webcam available</span>' +
//                                 '</div>');
//                         }
//                     }
//                 } else {
//                     // New video track: create a stream out of it
//                     localVideos++;
//                     // $('#videolocal .no-video-container').remove();
//                     stream = new MediaStream();
//                     stream.addTrack(track.clone());
//                     localTracks[trackId] = stream;
//                     Janus.log("Created local stream:", stream);
//                     Janus.log(stream.getTracks());
//                     Janus.log(stream.getVideoTracks());
//                     // $('#videolocal').append('<video class="rounded centered" id="myvideo' + trackId + '" width=100% autoplay playsinline muted="muted"/>');
//                     // Janus.attachMediaStream($('#myvideo' + trackId).get(0), stream);
//                 }
//                 if (pubPlugin.webrtcStuff.pc.iceConnectionState !== "completed" &&
//                     pubPlugin.webrtcStuff.pc.iceConnectionState !== "connected") {
//                     // $("#videolocal").parent().parent().block({
//                     //     message: '<b>Publishing...</b>',
//                     //     css: {
//                     //         border: 'none',
//                     //         backgroundColor: 'transparent',
//                     //         color: 'white'
//                     //     }
//                     // });
//                 }
//             },
//             onremotetrack: function (track, mid, on) {
//                 // The publisher stream is sendonly, we don't expect anything here
//             },
//             oncleanup: function () {
//                 Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
//                 myStream = null;
//                 delete feedStreams[myid];
//                 // $('#videolocal').html('<button id="publish" class="btn btn-primary">Publish</button>');
//                 // $('#publish').click(function () {
//                 //     publishOwnFeed(true);
//                 // });
//                 // $("#videolocal").parent().parent().unblock();
//                 // $('#bitrate').parent().parent().addClass('hide');
//                 // $('#bitrate a').unbind('click');
//                 localTracks = {};
//                 localVideos = 0;
//             }
//         }
//     );
//     return pubPlugin;
// }

export const joinVideoRoom = (pubPlugin, roomId, display, ptype = "publisher", pid = null) => {
    console.log("JoinVideoRoom", pid)
    let requestJoinMsg = {
        request: "join",
        room: roomId,
        ptype: ptype,
        display: display,
    };
    if (pid) {
        requestJoinMsg.feed = pid;
    }
    pubPlugin.send({message: requestJoinMsg});
}

export const leaveVideoRoom = (pubPlugin) => {
    if (!pubPlugin) return;
    let leave = { request: "leave" };
    // console.log("leave: ", leave);
    pubPlugin.send({ message: leave });
}

export const destroyVideoRoom = (pubPlugin, roomId) => {
    if (!pubPlugin) return;
    const destroy = {
        request: 'destroy',
        room: roomId,
    }
    pubPlugin.send({ "message": destroy });
}

export const publishOwnFeed = (pubPlugin, useVideo = true, useAudio = true, data = true, bitrate = 256000, simulcast = false, callback) => {
    pubPlugin.createOffer(
        {
            // video: "lowres",
            media: {audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: useVideo, data: data},	// Publishers are sendonly
            simulcast: simulcast,

            success: function (jsep) {
                // window.Janus.debug("Got publisher SDP!");
                console.log("Publish own feed success");
                // window.Janus.debug(jsep);
                let publish = {request: "configure", audio: useAudio, video: true, bitrate: bitrate};

                pubPlugin.send({message: publish, jsep: jsep});
                callback("success", jsep);
            },
            error: function (error) {
                // window.Janus.debug("Publisher Error!", error);
                callback("error", error);
                // setTimeout(() => {
                //     publishOwnFeed(pubPlugin, true, false, data, bitrate, simulcast);
                // }, [2000])
            }
        }
    );
};

export const publishStreamFeed = (pubPlugin, stream, useVideo = true, useAudio = true, data = true, bitrate = 256000, simulcast = false, callback) => {
    pubPlugin.createOffer(
        {
            // video: "lowres",
            // iceRestart: true,
            stream: stream,
            media: {audioRecv: false, videoRecv: false},	// Publishers are sendonly
            simulcast: simulcast,

            success: function (jsep) {
                // window.Janus.debug("Got publisher SDP!");
                console.log("Publish own feed success");
                // window.Janus.debug(jsep);
                let publish = {request: "configure", audio: useAudio, video: true, bitrate: bitrate};

                pubPlugin.send({message: publish, jsep: jsep});
                callback("success", jsep);
            },
            error: function (error) {
                // window.Janus.debug("Publisher Error!", error);
                callback("error", error);
                // setTimeout(() => {
                //     publishOwnFeed(pubPlugin, true, false, data, bitrate, simulcast);
                // }, [2000])
            }
        }
    );
};

export const replaceOwnFeed = (pubPlugin, stream, useVideo = true, useAudio = true, data = true, bitrate = 256000, simulcast = false, callback) => {
    pubPlugin.createOffer(
        {
            // video: "lowres",
            stream: stream,
            media: {audioRecv: false, videoRecv: false, data: data, replaceVideo: true},	// Publishers are sendonly
            simulcast: simulcast,

            success: function (jsep) {
                window.Janus.debug("Got publisher SDP!");
                console.log("Publish own feed success");
                window.Janus.debug(jsep);
                let publish = {request: "configure", audio: useAudio, video: true, bitrate: bitrate};

                pubPlugin.send({message: publish, jsep: jsep});
                callback("success", jsep);
            },
            error: function (error) {
                window.Janus.debug("Publisher Error!", error);
                callback("error", error);
                // setTimeout(() => {
                //     publishOwnFeed(pubPlugin, true, false, data, bitrate, simulcast);
                // }, [2000])
            }
        }
    );
};

export function unpublishOwnFeed(pubPlugin) {
    // Unpublish our stream
    // let unpublish = { "request": "unpublish" };
    // pubPlugin.send({"message": unpublish});
    pubPlugin.hangup();
}

export const leaveRoom = (pubPlugin) => {
    let leave = {request: "leave"};
    pubPlugin.send({message: leave});
}