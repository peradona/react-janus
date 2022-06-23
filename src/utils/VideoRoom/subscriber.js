import Janus from '../janus.utils';
import {useCallback} from "react";

export const subscribeRemoteFeed = (janus, opaqueId, room, id, pvtId, display, audio, video, callback) => {
    let remoteFeed = null;

    janus.attach(
		{
			plugin: "janus.plugin.videoroom",
			opaqueId: opaqueId,
			success: (pluginHandle) => {
				remoteFeed = pluginHandle;
				remoteFeed.simulcastStarted = false;
				//@ts-ignore
				window.Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				//@ts-ignore
                window.Janus.log("  -- This is a subscriber");
                
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
				if(window.Janus.webRTCAdapter.browserDetails.browser === "safari" &&
						(video === "vp9" || (video === "vp8" && !window.Janus.safariVp8))) {
					if(video)
						video = video.toUpperCase()
					subscribe["offer_video"] = false;
				}
				remoteFeed.videoCodec = video;
				remoteFeed.send({"message": subscribe});
			},
			error: (error) => {
				//@ts-ignore
                window.Janus.error("  -- Error attaching plugin...", error);
                callback(remoteFeed, "error", error);
			},
			onmessage: (msg, jsep) =>  {
				window.Janus.debug(" ::: Got a message (subscriber) :::");
                window.Janus.debug(msg);

				const event = msg.videoroom;

				if (event === "attached") {
					console.log("attach new video...", remoteFeed);
					remoteFeed.rfid = msg["id"];
					remoteFeed.rfdisplay = msg["display"];

					callback(remoteFeed, "attached", msg)
				}

				if(jsep) {
					window.Janus.debug("SUBS: Handling SDP as well...");
                    window.Janus.debug(jsep);
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
							success: function(jsep) {
								window.Janus.debug("Got SDP!");
								window.Janus.debug(jsep);
								let body = { "request": "start", "room": room };
								remoteFeed.send({"message": body, "jsep": jsep});
							},
							error: function(error) {
								window.Janus.error("WebRTC error:", error);
							}
						});
				}
				
			},
			webrtcState: (on) => {
				window.Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfid + ") is " + (on ? "up" : "down") + " now");
				callback(remoteFeed, "webrtcState", on);
			},
			onlocalstream: (stream) => {
				// The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: (stream) => {
                callback(remoteFeed, "onremotestream", stream);
			},
			ondata: (data) => {
				window.Janus.debug("We got data from the DataChannel!");
				callback(remoteFeed, "ondata", data);
			},
			ondataopen: (data) => {
				window.Janus.log("The DataChannel is available!");
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
				//@ts-ignore
				window.Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				//@ts-ignore
				window.Janus.log("  -- This is a subscriber");

				callback(remoteFeed, "success", true)
			},
			error: (error) => {
				//@ts-ignore
				window.Janus.error("  -- Error attaching plugin...", error);
				callback(remoteFeed, "error", error);
			},
			onmessage: (msg, jsep) =>  {
				window.Janus.debug(" ::: Got a message (subscriber) :::");
				window.Janus.debug(msg);

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
					window.Janus.debug("SUBS: Handling SDP as well...");
					window.Janus.debug(jsep);
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
							success: function(jsep) {
								window.Janus.debug("Got SDP!");
								window.Janus.debug(jsep);
								let body = { "request": "start", "room": room };
								remoteFeed.send({"message": body, "jsep": jsep});
							},
							error: function(error) {
								window.Janus.error("WebRTC error:", error);
							}
						});
				}

			},
			webrtcState: (on) => {
				window.Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfid + ") is " + (on ? "up" : "down") + " now");
				callback(remoteFeed, "webrtcState", on);
			},
			onlocalstream: (stream) => {
				// The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: (stream) => {
				callback(remoteFeed, "onremotestream", stream);
			},
			ondata: (data) => {
				window.Janus.debug("We got data from the DataChannel!");
				callback(remoteFeed, "ondata", data);
			},
			ondataopen: (data) => {
				window.Janus.log("The DataChannel is available!");
				callback(remoteFeed, "ondataopen", data);
			},
			oncleanup: () => {
				window.Janus.log("Clean up!");
				callback(remoteFeed, "oncleanup");
			}
		});
	return remoteFeed;
}