import {
    ApplicationCommandType,
    MessageContextMenuCommandInteraction,
} from 'discord.js';

import { Command } from '../../classes/Command';
import type { ExtendedClient } from '../../classes/Client';

// MAKE SURE COMMAND IS EXPORTED AS DEFAULT.
export class CommandName extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            type: ApplicationCommandType.Message, // For message context commands.
            name: '', // the name of the command
        });
    }

    async execute(interaction: MessageContextMenuCommandInteraction) {}
}
