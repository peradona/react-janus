import {useEffect, useState} from 'react';
import Janus from "../utils/janus";
import {JanusStatus, ConnectionState} from "../constants";

type JanusHelperProps = {
    server: string,
    useSocket: boolean,
    socketState: ConnectionState,
    JanusModule?: any
}

const useJanusHelper = ({ server, useSocket, socketState, JanusModule = Janus}: JanusHelperProps) => {

    const [janusInstance, setJanusInstance] = useState<any>();
    const [janusStatus, setJanusStatus] = useState<JanusStatus>(JanusStatus.None);
    const [janusErrorMsg, setJanusErrorMsg] = useState<string>();

    const [isWebrtcSupported, setIsWebrtcSupported] = useState<boolean>();
    const [readyToInitPlugin, setReadyToInitPlugin] = useState<boolean>();

    //Initial janus
    useEffect(() => {
        if (!server || (socketState !== ConnectionState.Connected && useSocket)) return;

        setJanusStatus(JanusStatus.Connecting);

        let janus: any;

        JanusModule.init({
            debug: "all", callback: function () {

                JanusModule.unifiedPlan = false;

                if (!JanusModule.isWebrtcSupported()) {
                    setIsWebrtcSupported(false);
                } else {
                    setIsWebrtcSupported(true);
                }

                janus = new JanusModule(
                    {
                        server: server,
                        success: function () {
                            setJanusInstance(janus);
                            setReadyToInitPlugin(true);
                            setJanusStatus(JanusStatus.Success);
                        },
                        error: function (error: string) {
                            setJanusErrorMsg(error);
                            setJanusInstance(null);
                            setJanusStatus(JanusStatus.Error)
                            setReadyToInitPlugin(false);
                        },
                        destroyed: function () {
                            setJanusInstance(null);
                            setJanusStatus(JanusStatus.Destroyed)
                            setReadyToInitPlugin(false);
                        }
                    });
            }
        });

        return () => {
            try {
                janus.destroy();
            } catch (e) {

            }
        }
    }, [server, socketState])

    return {
        janusInstance,
        janusStatus,
        janusErrorMsg,
        isWebrtcSupported,
        readyToInitPlugin,
    }
}

export default useJanusHelper;