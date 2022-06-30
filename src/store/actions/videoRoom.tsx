export enum VideoEventType {
    SUCCESS = 'success',
    ATTACHED = 'attached',
    JOINED = 'joined',
    PUBLISHERS = 'publishers',
    LEAVING = 'leaving',
    UNPUBLISHED = 'unpublished',
    WEBRTC_STATE = 'webrtcState',
    ERROR = 'error',
    ERROR_EVENT = 'error_event',
    // VIDEO_ERROR = 'error event',
    ON_DATA_OPEN = 'ondataopen',
    ON_DATA = 'ondata',
    JOINING = 'joining',
    ON_CLEAN_UP = 'oncleanup',
    DESTROYED = 'destroyed',

    SET = 'set',
    VIDEO_PUBLISHING = 'video_publishing',
    VIDEO_UNPUBLISHED = 'video_unpublished',
    VIDEO_SUCCESS = 'video_success',
    VIDEO_ERROR = 'video_error',

    UPDATE_FEED = 'update_feed_data',
    REMOVE_FEED = 'remove_feed'
}