export const attachEchoTest = (janus, opaqueId, callback) => {
    let echotest = null;
    let myStream = null;

    if (!janus) {
        return;
    }

    janus.attach(
        {
            plugin: "janus.plugin.echotest",
            opaqueId: opaqueId,
            success: function(pluginHandle) {
                echotest = pluginHandle;
                window.Janus.log("Plugin attached! (" + echotest.getPlugin() + ", id=" + echotest.getId() + ")");
                // // Negotiate WebRTC
                // let body = { audio: true, video: true };
                // // We can try and force a specific codec, by telling the plugin what we'd prefer
                // // For simplicity, you can set it via a query string (e.g., ?vcodec=vp9)
                // // if(acodec)
                // //     body["audiocodec"] = acodec;
                // // if(vcodec)
                // //     body["videocodec"] = vcodec;
                // // For the codecs that support them (VP9 and H.264) you can specify a codec
                // // profile as well (e.g., ?vprofile=2 for VP9, or ?vprofile=42e01f for H.264)
                // // if(vprofile)
                // //     body["videoprofile"] = vprofile;
                // window.Janus.debug("Sending message:", body);
                // echotest.send({ message: body });
                // window.Janus.debug("Trying a createOffer too (audio/video sendrecv)");
                // echotest.createOffer(
                //     {
                //         // No media provided: by default, it's sendrecv for audio and video
                //         media: { data: true },	// Let's negotiate data channels as well
                //         // If you want to test simulcasting (Chrome and Firefox only), then
                //         // pass a ?simulcast=true when opening this demo page: it will turn
                //         // the following 'simulcast' property to pass to janus.js to true
                //         // simulcast: doSimulcast,
                //         // simulcast2: doSimulcast2,
                //         success: function(jsep) {
                //             window.Janus.debug("Got SDP!", jsep);
                //             echotest.send({ message: body, jsep: jsep });
                //         },
                //         error: function(error) {
                //             window.Janus.error("WebRTC error:", error);
                //             // bootbox.alert("WebRTC error... " + error.message);
                //         }
                //     });
                callback(echotest, "success", pluginHandle);
            },
            error: function(error) {
                console.error("  -- Error attaching plugin...", error);
                callback(echotest, "error", error);
                // bootbox.alert("Error attaching plugin... " + error);
            },
            consentDialog: function(on) {
                window.Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                callback(echotest, "consentDialog", on);
                // if(on) {
                //     // Darken screen and show hint
                //     $.blockUI({
                //         message: '<div><img src="up_arrow.png"/></div>',
                //         css: {
                //             border: 'none',
                //             padding: '15px',
                //             backgroundColor: 'transparent',
                //             color: '#aaa',
                //             top: '10px',
                //             left: (navigator.mozGetUserMedia ? '-100px' : '300px')
                //         } });
                // } else {
                //     // Restore screen
                //     $.unblockUI();
                // }
            },
            iceState: function(state) {
                window.Janus.log("ICE state changed to " + state);
                callback(echotest, "iceState", state);
            },
            mediaState: function(medium, mid, on) {
                window.Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium + " (mid=" + mid + ")");
                callback(echotest, "mediaState", {medium, mid, on});
            },
            webrtcState: function(on) {
                window.Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                callback(echotest, "webrtcState", on);
                // $("#videoleft").parent().unblock();
            },
            slowLink: function(uplink, lost, mid) {
                window.Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
                    " packets on mid " + mid + " (" + lost + " lost packets)");
                callback(echotest, "slowLink", {uplink, lost, mid});
            },
            onmessage: function(msg, jsep) {
                window.Janus.debug(" ::: Got a message :::", msg);
                if(jsep) {
                    window.Janus.debug("Handling SDP as well...", jsep);
                    echotest.handleRemoteJsep({ jsep: jsep });
                }
                let result = msg["result"];
                if(result) {
                    if(result === "done") {
                        // The plugin closed the echo test
                        // bootbox.alert("The Echo Test is over");
                        // if(spinner)
                        //     spinner.stop();
                        // spinner = null;
                        // $('video').remove();
                        // $('#waitingvideo').remove();
                        // $('#toggleaudio').attr('disabled', true);
                        // $('#togglevideo').attr('disabled', true);
                        // $('#bitrate').attr('disabled', true);
                        // $('#curbitrate').hide();
                        // $('#curres').hide();
                        return;
                    }
                    // Any loss?
                    let status = result["status"];
                    if(status === "slow_link") {
                        // toastr.warning("Janus apparently missed many packets we sent, maybe we should reduce the bitrate", "Packet loss?", {timeOut: 2000});
                    }
                }
                // Is simulcast in place?
                let substream = msg["substream"];
                let temporal = msg["temporal"];
                if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
                    // if(!simulcastStarted) {
                    //     simulcastStarted = true;
                    //     addSimulcastButtons(msg["videocodec"] === "vp8" || msg["videocodec"] === "h264");
                    // }
                    // We just received notice that there's been a switch, update the buttons
                    // updateSimulcastButtons(substream, temporal);
                }
                callback(echotest, "onmessage", {msg, jsep});
            },
            onlocalstream: (stream) => {
                window.Janus.debug(" ::: Got a local stream :::");
                myStream = stream;
                callback(echotest, "onlocalstream", stream);
            },
            onremotestream: (stream) => {
                callback(echotest, "onremotestream", stream);
            },
            ondataopen: function(data) {
                window.Janus.log("The DataChannel is available!");
                callback(echotest, "ondataopen", data);
                // $('#videos').removeClass('hide').show();
                // $('#datasend').removeAttr('disabled');
            },
            ondata: function(data) {
                window.Janus.debug("We got data from the DataChannel!", data);
                callback(echotest, "ondataopen", data);
                // $('#datarecv').val(data);
            },
            oncleanup: function() {
                window.Janus.log(" ::: Got a cleanup notification :::");
                callback(echotest, "ondataopen", null);
                // if(spinner)
                //     spinner.stop();
                // spinner = null;
                // if(bitrateTimer)
                //     clearInterval(bitrateTimer);
                // bitrateTimer = null;
                // $('video').remove();
                // $('#waitingvideo').remove();
                // $("#videoleft").empty().parent().unblock();
                // $('#videoright').empty();
                // $('#toggleaudio').attr('disabled', true);
                // $('#togglevideo').attr('disabled', true);
                // $('#bitrate').attr('disabled', true);
                // $('#curbitrate').hide();
                // $('#curres').hide();
                // $('#datasend').attr('disabled', true);
                // simulcastStarted = false;
                // $('#simulcast').remove();
                // localTracks = {};
                // localVideos = 0;
                // remoteTracks = {};
                // remoteVideos = 0;
            }
        });

    return echotest;
}
export const publishEcho = (echotest, callback) => {

    let body = { audio: true, video: true };

    window.Janus.debug("Sending message:", body);
    echotest.send({ message: body });
    window.Janus.debug("Trying a createOffer too (audio/video sendrecv)");
    echotest.createOffer(
        {
            // No media provided: by default, it's sendrecv for audio and video
            media: { data: true },	// Let's negotiate data channels as well
            // If you want to test simulcasting (Chrome and Firefox only), then
            // pass a ?simulcast=true when opening this demo page: it will turn
            // the following 'simulcast' property to pass to janus.js to true
            // simulcast: doSimulcast,
            // simulcast2: doSimulcast2,
            success: function(jsep) {
                window.Janus.debug("Got SDP!", jsep);
                echotest.send({ message: body, jsep: jsep });
                callback("success", jsep)
            },
            error: function(error) {
                window.Janus.error("WebRTC error:", error);
                callback("error", error)
                // bootbox.alert("WebRTC error... " + error.message);
            }
        });
};