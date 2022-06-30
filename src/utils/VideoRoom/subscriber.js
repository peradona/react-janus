import Janus from '../janus.utils';
import {useCallback} from "react";

export const subscribeRemoteFeed = (janus, opaqueId, room, id, pvtId, display, audio, video, JanusModule, callback) => {
    let remoteFeed = null;

    janus.attach(
		{
			plugin: "janus.plugin.videoroom",
			opaqueId: opaqueId,
			success: (pluginHandle) => {
				remoteFeed = pluginHandle;
				remoteFeed.simulcastStarted = false;
				//@ts-ignore
				JanusModule.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				//@ts-ignore
				JanusModule.log("  -- This is a subscriber");
                
				let subscribe = {
                    "request": "join", 
                    "room": room, 
                    "ptype": "subscriber", 
                    "feed": id, 
					"private_id": pvtId ,
					"data": true,
					"offer_audio": true,
					"offer_video": true,
                };
				//@ts-ignore
				if(JanusModule.webRTCAdapter.browserDetails.browser === "safari" &&
						(video === "vp9" || (video === "vp8" && !JanusModule.safariVp8))) {
					if(video)
						video = video.toUpperCase()
					subscribe["offer_video"] = false;
				}
				remoteFeed.videoCodec = video;
				remoteFeed.send({"message": subscribe});
			},
			error: (error) => {
				//@ts-ignore
                JanusModule.error("  -- Error attaching plugin...", error);
                callback(remoteFeed, "error", error);
			},
			onmessage: (msg, jsep) =>  {
				JanusModule.debug(" ::: Got a message (subscriber) :::");
                JanusModule.debug(msg);

				const event = msg.videoroom;

				if (event === "attached") {
					console.log("attach new video...", remoteFeed);
					remoteFeed.rfid = msg["id"];
					remoteFeed.rfdisplay = msg["display"];

					callback(remoteFeed, "attached", msg)
				}

				if(jsep) {
					JanusModule.debug("SUBS: Handling SDP as well...");
                    JanusModule.debug(jsep);
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
							success: function(jsep) {
								JanusModule.debug("Got SDP!");
								JanusModule.debug(jsep);
								let body = { "request": "start", "room": room };
								remoteFeed.send({"message": body, "jsep": jsep});
							},
							error: function(error) {
								JanusModule.error("WebRTC error:", error);
							}
						});
				}
				
			},
			webrtcState: (on) => {
				JanusModule.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfid + ") is " + (on ? "up" : "down") + " now");
				callback(remoteFeed, "webrtcState", on);
			},
			onlocalstream: (stream) => {
				// The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: (stream) => {
                callback(remoteFeed, "onremotestream", stream);
			},
			ondata: (data) => {
				JanusModule.debug("We got data from the DataChannel!");
				callback(remoteFeed, "ondata", data);
			},
			ondataopen: (data) => {
				JanusModule.log("The DataChannel is available!");
				callback(remoteFeed, "ondataopen", data);
			},
			oncleanup: () => {
                callback(remoteFeed, "oncleanup");
			}
        });
    return remoteFeed;
}

export const attachVideoRoomSubscriber = (janus, opaqueId, room, id, pvtId, display, audio, video, callback) => {
	let remoteFeed = null;

	janus.attach(
		{
			plugin: "janus.plugin.videoroom",
			opaqueId: opaqueId,
			success: (pluginHandle) => {
				remoteFeed = pluginHandle;
				remoteFeed.simulcastStarted = false;

				callback(remoteFeed, "success", true)
			},
			error: (error) => {
				callback(remoteFeed, "error", error);
			},
			onmessage: (msg, jsep) =>  {

				const event = msg.videoroom;

				if (event === "attached") {
					console.log("attach new video...", remoteFeed);
					remoteFeed.rfid = msg["id"];
					remoteFeed.rfdisplay = msg["display"];

					callback(remoteFeed, "attached", msg)
				} else if (event === "event") {
					if (msg["joining"] !== undefined && msg["joining"] !== null) {
						callback(remoteFeed, "joining", msg);
					} else if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
						callback(remoteFeed, "leaving", msg);
					} else if (msg["error"]) {
						callback(remoteFeed, "error_event", msg);
					}
				}

				if(jsep) {
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
							success: function(jsep) {
								let body = { "request": "start", "room": room };
								remoteFeed.send({"message": body, "jsep": jsep});
							},
							error: function(error) {
								// JanusModule.error("WebRTC error:", error);
							}
						});
				}

			},
			webrtcState: (on) => {
				console.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfid + ") is " + (on ? "up" : "down") + " now");
				callback(remoteFeed, "webrtcState", on);
			},
			onlocalstream: (stream) => {
				// The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: (stream) => {
				callback(remoteFeed, "onremotestream", stream);
			},
			ondata: (data) => {
				// JanusModule.debug("We got data from the DataChannel!");
				callback(remoteFeed, "ondata", data);
			},
			ondataopen: (data) => {
				// JanusModule.log("The DataChannel is available!");
				callback(remoteFeed, "ondataopen", data);
			},
			oncleanup: () => {
				// JanusModule.log("Clean up!");
				callback(remoteFeed, "oncleanup");
			}
		});
	return remoteFeed;
}