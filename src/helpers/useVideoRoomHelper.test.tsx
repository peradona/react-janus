import { renderHook } from '@testing-library/react-hooks'
// import { render, screen } from '@testing-library/react';
import {ConnectionState, JanusStatus} from "../constants";
import useJanusHelper from "./useJanusHelper";

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
        useJanusHelper({ server, useSocket: false, socketState: ConnectionState.Connected, JanusModule: Janus })
    )
    expect(result.current.janusStatus).toBe(JanusStatus.Success);
    expect(result.current.isWebrtcSupported).toBe(true);
});