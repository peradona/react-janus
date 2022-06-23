import {useEffect, useState} from 'react';
import {JanusStatus, ConnectionState} from "../utils/janus.utils";

type JanusHelperProps = {
    server: string,
    useSocket: boolean,
    socketState: ConnectionState,
}

const useJanusHelper = (props: JanusHelperProps) => {

    const [janusInstance, setJanusInstance] = useState<any>();
    const [janusState, setJanusState] = useState<JanusStatus>(JanusStatus.None);

    const [isWebrtcSupported, setIsWebrtcSupported] = useState<boolean>(true);

    //Initial janus
    useEffect(() => {
        if (!props.server || (props.socketState !== ConnectionState.Connected && props.useSocket)) return;

        setJanusState(JanusStatus.Connecting);

        let janus: any;

        //@ts-ignore
        window.Janus.init({debug: "all", callback: function() {
                //@ts-ignore
                window.Janus.unifiedPlan = false;
                //@ts-ignore
                if(!window.Janus.isWebrtcSupported()) {
                    console.log("No WebRTC support... ");
                    setIsWebrtcSupported(false);
                    return;
                }

                //@ts-ignore
                janus = new window.Janus(
                    {
                        server: props.server,
                        success: function() {
                            setJanusInstance(janus);
                            setJanusState(JanusStatus.Success);
                        },
                        error: function(error: any) {
                            //@ts-ignore
                            window.Janus.error(error);
                            console.log("Janus error");
                            setJanusInstance(null);
                            setJanusState(JanusStatus.Error)
                        },
                        destroyed: function() {
                            console.log("Janus destroyed");
                            setJanusInstance(null);
                            setJanusState(JanusStatus.Destroyed)
                        }
                    });
            }});

        return () => {
            try {
                //@ts-ignore
                window.Janus.log("[Destroy janus instance]")
                janus.destroy();
            } catch (e) {
                //@ts-ignore
                window.Janus.error('[Destroy janus instance Err]', e);
            }
        }
    }, [props.server, props.socketState])

    return { janusInstance, janusState, isWebrtcSupported }
}

export default useJanusHelper;