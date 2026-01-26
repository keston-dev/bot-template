import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
} from 'discord.js';

import { Command } from '../../classes/Command';
import type { ExtendedClient } from '../../classes/Client';

//MAKE SURE THIS COMMAND IS EXPORTED AS DEFAULT
export class CommandName extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            type: ApplicationCommandType.ChatInput,
            name: '', // command name
            description: '', //description
            permissionLevel: 0, // the minimum permission required to use the command (0-16)
            options:
                [] /** @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure} */,
            // has additional property minimumPermissionLevel, which is the level to use the subcommand (ex: certain higher-level subcommands being limited to higher level staff.)
            contexts: [], // what context(s) (i.e. in a guild, in the dms with the bot, or in dms/group dms)
            integration: [], // what integration(s) the bot will use (either usable only in a guild, only on the user's profile when installed, or both)
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {}
}
