import {useEffect, useState} from 'react';
import Janus from "../utils/janus";
import {JanusStatus, ConnectionState} from "../constants";

type JanusHelperProps = {
    server: string,
    useSocket: boolean,
    socketState: ConnectionState,
    Janus?: any
}

const useJanusHelper = (props: JanusHelperProps) => {

    const [janusInstance, setJanusInstance] = useState<any>();
    const [janusStatus, setJanusStatus] = useState<JanusStatus>(JanusStatus.None);
    const [janusErrorMsg, setJanusErrorMsg] = useState<string>();

    const [isWebrtcSupported, setIsWebrtcSupported] = useState<boolean>();

    //Initial janus
    useEffect(() => {
        if (!props.server || (props.socketState !== ConnectionState.Connected && props.useSocket)) return;

        setJanusStatus(JanusStatus.Connecting);

        let janus: any;
        let JanusJS: any = Janus;

        if (props.Janus) {
            JanusJS = props.Janus
        }

        JanusJS.init({debug: "all", callback: function() {
                //@ts-ignore
                JanusJS.unifiedPlan = false;

                if(!JanusJS.isWebrtcSupported()) {
                    // console.log("No WebRTC support... ");
                    setIsWebrtcSupported(false);
                } else {
                    setIsWebrtcSupported(true);
                }

                janus = new JanusJS(
                    {
                        server: props.server,
                        success: function() {
                            setJanusInstance(janus);
                            setJanusStatus(JanusStatus.Success);
                        },
                        error: function(error: string) {
                            setJanusErrorMsg(error);
                            setJanusInstance(null);
                            setJanusStatus(JanusStatus.Error)
                        },
                        destroyed: function() {
                            setJanusInstance(null);
                            setJanusStatus(JanusStatus.Destroyed)
                        }
                    });
            }});

        return () => {
            try {
                janus.destroy();
            } catch (e) {

            }
        }
    }, [props.server, props.socketState])

    return {
        janusInstance,
        janusStatus,
        janusErrorMsg,
        isWebrtcSupported
    }
}

export default useJanusHelper;