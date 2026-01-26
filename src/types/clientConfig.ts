import {
    ActivityType,
    GatewayIntentBits,
    type PresenceData,
    PresenceUpdateStatus,
} from 'discord.js';

export type ClientConfig = {
    intents: GatewayIntentBits[];
    presence: PresenceData;

    ownerId: string;

    branding?: {
        colors?: {
            primary: number;
            success: number;
            warning: number;
            error: number;
        };

        supportServerUrl?: string;
        repositoryUrl?: string;
    };
};

export const clientConfig = {
    intents: [GatewayIntentBits.Guilds],
    presence: {
        activities: [
            {
                type: ActivityType.Custom,
                name: '...',
            },
        ],
        status: PresenceUpdateStatus.Online,
    },
    ownerId: '',
} satisfies ClientConfig;
