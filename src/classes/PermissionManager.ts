import { Collection, GuildMember, type Message } from 'discord.js';

import type { ExtendedClient } from './Client';
import type { ISettings } from '../types/mongodb';

/**
 * Permissions in my case are setup like so:
 * 0 is no permissions,
 * 1-15 is configurable,
 * 16 is for server owners.
 *
 * You can add/remove to this system, especially if you dont need as many permissions (You could even remove permissions entirely, if you dont need them).
 */

/**
 * A class to manage permissions.
 */
export class PermissionManager {
    private client: ExtendedClient;
    private settingsCache: Collection<string, ISettings> =
        new Collection();

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    /**
     * A method to check the permissions of a user.
     * @param message The message for the user to have its permissions checked on
     * @param member The member to check the permissions of
     * @returns `number` based on their permission level.
     */
    public getPermissionLevel(message?: Message, member?: GuildMember) {
        if (!member && message?.member instanceof GuildMember) {
            member = message.member;
        }

        if (!member) return 0;

        if (member.id === this.client.config.ownerId) {
            return 20;
        }

        if (member.guild.ownerId === member.id) {
            return 16;
        }

        if (member.permissions.has('Administrator')) {
            return 11;
        }

        const settings = this.client.settings.get(member.guild.id);

        if (
            !settings?.permissions ||
            settings.permissions.length === 0
        ) {
            return 0;
        }

        const roleIds = member.roles.cache.map((role) => role.id);

        let highest = 0;
        for (const permission of settings.permissions) {
            if (
                !permission ||
                typeof permission === 'string' ||
                !('roleId' in permission)
            ) {
                continue;
            }

            if (roleIds.includes(permission.roleId)) {
                highest = Math.max(highest, permission.level);
            }
        }

        return highest;
    }
}
