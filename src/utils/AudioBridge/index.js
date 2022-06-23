export const attachAudioBridge = (janus, opaqueId, room, secret,
                              pin, username, isPublisher, callback) => {
    let mixerPlugin = null;

    if (!janus) {
        return;
    }

    janus.attach(
        {
            plugin: "janus.plugin.audiobridge",
            opaqueId: opaqueId,
            success: function(pluginHandle) {
                mixerPlugin = pluginHandle;
                window.Janus.log("Plugin attached! (" + mixerPlugin.getPlugin() + ", id=" + mixerPlugin.getId() + ")");
                callback(mixerPlugin, "success", true);
            },
            error: function(error) {
                window.Janus.error("  -- Error attaching plugin...", error);
                callback(mixerPlugin, "error", error);
            },
            consentDialog: function(on) {
                window.Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                callback(mixerPlugin, "consentDialog", on);
            },
            onmessage: function(msg, jsep) {
                window.Janus.debug(" ::: Got a message :::");
                window.Janus.debug(msg);
                let event = msg["audiobridge"];
                window.Janus.debug("Event: " + event);
                if(event) {
                    if(event === "joined") {
                        if (msg["id"]) {
                            window.Janus.log("Successfully joined room " + msg["room"] + " with ID " + msg["id"]);
                        }
                        callback(mixerPlugin, "joined", msg)
                        
                        // Any room participant?
                        if(msg["participants"]) {
                            let list = msg["participants"];
                            window.Janus.debug("Got a list of participants:");
                            window.Janus.debug(list);

                            // for(let f in list) {
                            //     let id = list[f]["id"];
                            //     let display = list[f]["display"];
                            //     let setup = list[f]["setup"];
                            //     let muted = list[f]["muted"];
                            //     window.Janus.debug("  >> [" + id + "] " + display + " (setup=" + setup + ", muted=" + muted + ")");
                            //     if($('#rp'+id).length === 0) {
                            //         // Add to the participants list
                            //         $('#list').append('<li id="rp'+id+'" class="list-group-item">'+display+
                            //             ' <i class="absetup fa fa-chain-broken"></i>' +
                            //             ' <i class="abmuted fa fa-microphone-slash"></i></li>');
                            //         $('#rp'+id + ' > i').hide();
                            //     }
                            //     if(muted === true || muted === "true")
                            //         $('#rp'+id + ' > i.abmuted').removeClass('hide').show();
                            //     else
                            //         $('#rp'+id + ' > i.abmuted').hide();
                            //     if(setup === true || setup === "true")
                            //         $('#rp'+id + ' > i.absetup').hide();
                            //     else
                            //         $('#rp'+id + ' > i.absetup').removeClass('hide').show();
                            // }
                        }
                    } else if(event === "roomchanged") {
                        // The user switched to a different room
                        // myid = msg["id"];
                        window.Janus.log("Moved to room " + msg["room"] + ", new ID: " + msg["id"]);
                        callback(mixerPlugin, "roomchanged", event);
                        // Any room participant?
                        // $('#list').empty();
                        // if(msg["participants"] !== undefined && msg["participants"] !== null) {
                        //     var list = msg["participants"];
                        //     window.Janus.debug("Got a list of participants:");
                        //     window.Janus.debug(list);
                        //     for(var f in list) {
                        //         var id = list[f]["id"];
                        //         var display = list[f]["display"];
                        //         var setup = list[f]["setup"];
                        //         var muted = list[f]["muted"];
                        //         window.Janus.debug("  >> [" + id + "] " + display + " (setup=" + setup + ", muted=" + muted + ")");
                        //         if($('#rp'+id).length === 0) {
                        //             // Add to the participants list
                        //             $('#list').append('<li id="rp'+id+'" class="list-group-item">'+display+
                        //                 ' <i class="absetup fa fa-chain-broken"></i>' +
                        //                 ' <i class="abmuted fa fa-microphone-slash"></i></li>');
                        //             $('#rp'+id + ' > i').hide();
                        //         }
                        //         if(muted === true || muted === "true")
                        //             $('#rp'+id + ' > i.abmuted').removeClass('hide').show();
                        //         else
                        //             $('#rp'+id + ' > i.abmuted').hide();
                        //         if(setup === true || setup === "true")
                        //             $('#rp'+id + ' > i.absetup').hide();
                        //         else
                        //             $('#rp'+id + ' > i.absetup').removeClass('hide').show();
                        //     }
                        // }
                    } else if(event === "destroyed") {
                        window.Janus.warn("The room has been destroyed!");
                        callback(mixerPlugin, "destroyed", msg)
                    } else if(event === "event") {
                        if(msg["participants"]) {
                            let list = msg["participants"];
                            window.Janus.debug("Got a list of participants:");
                            window.Janus.debug(list);
                            callback(mixerPlugin, "participants", msg);
                        } else if(msg["error"]) {
                            callback(mixerPlugin, "event error", msg);
                            return;
                        }
                        // Any new feed to attach to?
                        if(msg["leaving"]) {
                            // One of the participants has gone away?
                            let leaving = msg["leaving"];
                            window.Janus.log("Participant left: " + leaving + " (we have " + ('#rp'+leaving).length + " elements with ID #rp" +leaving + ")");
                            callback(mixerPlugin, "leaving", msg);
                            // $('#rp'+leaving).remove();
                        }
                    } else if(event === "talking") {
                        // window.Janus.log("Participant talking", msg);
                        callback(mixerPlugin, "talking", msg);
                    } else if(event === "stopped-talking") {
                        // window.Janus.log("Participant stopped talking", msg);
                        callback(mixerPlugin, "stopped-talking", msg);
                    }
                }
                if (jsep) {
                    window.Janus.debug("Handling SDP as well...");
                    window.Janus.debug(jsep);
                    mixerPlugin.handleRemoteJsep({jsep: jsep});
                }
            },
            onlocalstream: function(stream) {
                window.Janus.debug(" ::: Got a local stream :::");
                window.Janus.debug(stream);
                callback(mixerPlugin, "onlocalstream", stream);
            },
            onremotestream: function(stream) {
                callback(mixerPlugin, "onremotestream", stream);
                // TODO
                // var addButtons = false;

                // $('#room').removeClass('hide').show();
                // if($('#roomaudio').length === 0) {
                //     addButtons = true;
                //     $('#mixedaudio').append('<audio class="rounded centered" id="roomaudio" width="100%" height="100%" autoplay playsinline/>');
                // }
                // window.Janus.attachMediaStream($('#roomaudio').get(0), stream);
                // if(!addButtons)
                //     return;
                // Mute button
                // audioenabled = true;
                // $('#toggleaudio').click(
                //     function() {
                //         audioenabled = !audioenabled;
                //         if(audioenabled)
                //             $('#toggleaudio').html("Mute").removeClass("btn-success").addClass("btn-danger");
                //         else
                //             $('#toggleaudio').html("Unmute").removeClass("btn-danger").addClass("btn-success");
                //         mixertest.send({message: { "request": "configure", "muted": !audioenabled }});
                //     }).removeClass('hide').show();

            },
            oncleanup: function() {
                // TODO
                // webrtcUp = false;
                window.Janus.log(" ::: [AudioBridge] Got a cleanup notification :::");
                callback(mixerPlugin, "oncleanup");
            }
        });

    return mixerPlugin;
}

export const joinAudioRoom = (mixerPlugin, roomId, display, muted = false, volume = 100) => {
    let requestJoinMsg = {
        request: "join",
        room: roomId,
        display: display,
        muted: muted,
        volume: volume
    };
    mixerPlugin.send({ message: requestJoinMsg });
}

export const publishAudio = (mixerPlugin, muted = false, callback) => {
    mixerPlugin.createOffer(
        {
            media: { video: false },	// This is an audio only room
            success: function(jsep) {
                window.Janus.debug("Got SDP!");
                window.Janus.debug(jsep);
                let publish = { "request": "configure", "muted": muted };
                mixerPlugin.send({"message": publish, "jsep": jsep});
                callback("success", muted);
            },
            error: function(error) {
                window.Janus.error("WebRTC error:", error);
                callback("error", error);
            }
        });
};