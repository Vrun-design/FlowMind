export type ShareModalStatus = 'realtime' | 'waiting' | 'fallback';

export const SHARE_MODAL_COPY = {
    title: 'Share live canvas',
    betaBadge: 'Beta',
    description: 'Invite people with a room link so they can open this canvas and collaborate in the same workspace.',
    roomLabel: 'Room',
    linkLabel: 'Invite link',
    copyLink: 'Copy invite link',
    copiedLink: 'Copied invite link',
    footerNote: 'Your diagram stays local unless you share this room. If copy is blocked, copy the link above manually.',
    close: 'Close',
    closeDialog: 'Close share dialog',
} as const;

const SHARE_STATUS_MESSAGE_DEFAULTS: Record<ShareModalStatus, string> = {
    realtime: 'Anyone with this link can join the live canvas right away.',
    waiting: 'The link is ready. Live sync is still connecting for this session.',
    fallback:
        'This browser is in local-only mode right now. You can still copy the room link, but others will not join live until realtime sync is available.',
};

export function getShareStatusDefaultMessage(status: ShareModalStatus): string {
    return SHARE_STATUS_MESSAGE_DEFAULTS[status];
}
