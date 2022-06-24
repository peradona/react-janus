// import React, {useState} from 'react';
import { renderHook } from '@testing-library/react-hooks'
// import { render, screen } from '@testing-library/react';
import {ConnectionState, JanusStatus} from "../constants";
import useJanusHelper from "./useJanusHelper";

// const TestUseJanusHelper = () => {
//     const [socketState, setSocketState] = useState<ConnectionState>(ConnectionState.Connected);
//     const [server, setServer] = useState<string>("https://stm.centerapp.io:808/stream");
//     const { janusInstance, janusStatus, isWebrtcSupported } = useJanusHelper({ server, useSocket: false, socketState })
//
//     return (
//         <div>
//             <div>
//                 {janusInstance !== null && <a
//                     className="App-link"
//                     href="https://reactjs.org"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                 >
//                     Learn React
//                 </a>}
//             </div>
//         </div>
//     )
// }

test('should use janus', () => {
    let server = "https://stm.centerapp.io:8089/stream";
    const { result } = renderHook(() =>
        useJanusHelper({ server, useSocket: false, socketState: ConnectionState.Connected })
    )

    expect(result.current.janusStatus).toBe(JanusStatus.Error);
    expect(result.current.isWebrtcSupported).toBe(false);
});

test("janus initial success", () => {
    function Janus (options: any) {
        options.success()
    }
    Janus.init = function (op: any) {
        op.callback();
    }
    Janus.isWebrtcSupported = () => {
        return true;
    }

    let server = "https://stm.centerapp.io:8089/stream";
    const { result } = renderHook(() =>
        useJanusHelper({ server, useSocket: false, socketState: ConnectionState.Connected, Janus })
    )
    expect(result.current.janusStatus).toBe(JanusStatus.Success);
    expect(result.current.isWebrtcSupported).toBe(true);
});