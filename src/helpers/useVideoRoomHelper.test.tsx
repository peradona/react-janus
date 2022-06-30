import {renderHook} from '@testing-library/react-hooks'
// import { render, screen } from '@testing-library/react';
// import {JanusStatus, PType} from "../constants";
import useVideoRoomHelper from "./useVideoRoomHelper"

const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (/Warning: ReactDOM.render is no longer supported in React 18./.test(args[0])) {
            return;
        }
        originalError.call(console, ...args);
    };
});

describe("janus attach videoroom plugin", () => {
    it("attach videoroom plugin", () => {
        function Janus(options: any) {
            options.success()
        }
        Janus.init = function (op: any) {
            op.callback();
        }
        Janus.isWebrtcSupported = () => {
            return true;
        }
        Janus.randomString = (digit: number) => {
            return digit.toString();
        }
        Janus.prototype.attach = function (params: any) {
            params.success({ plugin: "this is plugin"});
        }

        // let janusInstance = new (Janus as any)({server: "server", success: () => {}});

        const {result} = renderHook(() =>
            useVideoRoomHelper({
                feedRef: null,
                maxFeedSize: 10,
                myVideoRef: null,
                JanusModule: Janus,
            })
        )
        expect(result.current.videoOpaqueId).toBe("videoroom-12")
        // expect(result.current.videoPlugin.plugin).toBe("this is plugin")

    })

});