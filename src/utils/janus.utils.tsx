// import styles from "../VideoConference.module.scss";
// import styles2 from '../VideoConferenceV2.module.scss';
import {useEffect, useState} from "react";

export enum Sidebar {
    None,
    Chat,
    Member,
    Background,
}

export const Breakpoints = {
    mobile: 320,
    mobileLandscape: 480,
    tablet: 768,
    tabletLandscape: 1024,
    desktop: 1200,
    desktopLarge: 1500,
    desktopWide: 1920,
}

export const FPS_CAPTURE = 25;
// export const getGridArea = (num: number) => {
//     let gridArea: string;
//     switch (num) {
//         case 0:
//             gridArea = styles.first;
//             break;
//         case 1:
//             gridArea = styles.second;
//             break;
//         case 2:
//             gridArea = styles.third;
//             break;
//         case 3:
//             gridArea = styles.forth;
//             break;
//         case 4:
//             gridArea = styles.fifth;
//             break;
//         case 5:
//             gridArea = styles.sixth;
//             break;
//         case 6:
//             gridArea = styles.seventh;
//             break;
//         case 7:
//             gridArea = styles.eighth;
//             break;
//         case 8:
//             gridArea = styles.ninth;
//             break;
//         default:
//             gridArea = styles.first;
//     }
//     return gridArea;
// }
//
// export const getScreen = (feedSize: number) => {
//     let remoteContainer: string;
//     if (feedSize > 9) {
//         return styles.ConferenceContainer9;
//     }
//     switch (feedSize) {
//         case 1:
//             remoteContainer = styles.ConferenceContainer1;
//             break;
//         case 2:
//             remoteContainer = styles.ConferenceContainer2;
//             break;
//         case 3:
//             remoteContainer = styles.ConferenceContainer3;
//             break;
//         case 4:
//             remoteContainer = styles.ConferenceContainer4;
//             break;
//         case 5:
//             remoteContainer = styles.ConferenceContainer5;
//             break;
//         case 6:
//             remoteContainer = styles.ConferenceContainer6;
//             break;
//         case 7:
//             remoteContainer = styles.ConferenceContainer7;
//             break;
//         case 8:
//             remoteContainer = styles.ConferenceContainer8;
//             break;
//         case 9:
//             remoteContainer = styles.ConferenceContainer9;
//             break;
//         default:
//             remoteContainer = styles.ConferenceContainer1;
//     }
//     return remoteContainer;
// }
//
// export const getScreenV2 = (feedSize: number, shareFeed: any) => {
//     if (shareFeed) {
//         return styles2.ConferenceContainer1;
//     }
//     let remoteContainer: string;
//     if (feedSize > 8) {
//         return styles2.ConferenceContainer9;
//     }
//     switch (feedSize) {
//         case 1:
//             remoteContainer = styles2.ConferenceContainer2;
//             break;
//         case 2:
//             remoteContainer = styles2.ConferenceContainer3;
//             break;
//         case 3:
//             remoteContainer = styles2.ConferenceContainer4;
//             break;
//         case 4:
//             remoteContainer = styles2.ConferenceContainer5;
//             break;
//         case 5:
//             remoteContainer = styles2.ConferenceContainer6;
//             break;
//         case 6:
//             remoteContainer = styles2.ConferenceContainer7;
//             break;
//         case 7:
//             remoteContainer = styles2.ConferenceContainer8;
//             break;
//         case 8:
//             remoteContainer = styles2.ConferenceContainer9;
//             break;
//         default:
//             remoteContainer = styles2.ConferenceContainer1;
//     }
//     return remoteContainer;
// }
//
// export const getMyScreen = (feedSize: number) => {
//     let remoteContainer: string;
//     if (feedSize > 8) {
//         return styles2.ninth;
//     }
//     switch (feedSize) {
//         case 1:
//             remoteContainer = styles2.second;
//             break;
//         case 2:
//             remoteContainer = styles2.third;
//             break;
//         case 3:
//             remoteContainer = styles2.forth;
//             break;
//         case 4:
//             remoteContainer = styles2.fifth;
//             break;
//         case 5:
//             remoteContainer = styles2.sixth;
//             break;
//         case 6:
//             remoteContainer = styles2.seventh;
//             break;
//         case 7:
//             remoteContainer = styles2.eighth;
//             break;
//         case 8:
//             remoteContainer = styles2.ninth;
//             break;
//         default:
//             remoteContainer = styles2.first;
//     }
//     return remoteContainer;
// }
//
// export const getGridAreaV2 = (num: number) => {
//     let gridArea: string;
//     switch (num) {
//         case 0:
//             gridArea = styles.first;
//             break;
//         case 1:
//             gridArea = styles.second;
//             break;
//         case 2:
//             gridArea = styles.third;
//             break;
//         case 3:
//             gridArea = styles.forth;
//             break;
//         case 4:
//             gridArea = styles.fifth;
//             break;
//         case 5:
//             gridArea = styles.sixth;
//             break;
//         case 6:
//             gridArea = styles.seventh;
//             break;
//         case 7:
//             gridArea = styles.eighth;
//             break;
//         case 8:
//             gridArea = styles.ninth;
//             break;
//         default:
//             gridArea = styles.first;
//     }
//     return gridArea;
// }

export const getDisplayName = (display: string) => {
    if (display != null) {
        let names = display.trim().split(":");
        return names[0];
    }
    return display;
}

export const isShareFeed = (display: string) => {
    if (!display) return false;
    let displayArr = display.trim().split(":");
    return displayArr[1] === "share";
}

export const useViewport = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleWindowResize = () => {
            setWidth(window.innerWidth)
            setHeight(window.innerHeight);
        };
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);

    // Return the width so we can use it in our components
    return { width, height };
}

export const checkEmpty = (val: any) => {
    if (val === undefined || val === null || val === "undefined") return true;
    if (val.length === 0) return true;
    return false;
};

export const isTrue = (val: any) => {
    if (val == true || val == "true") return true;
    else return false;
};
