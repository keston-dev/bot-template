import {
    ApplicationCommandType,
    MessageContextMenuCommandInteraction,
} from 'discord.js';

import { Command } from '../../classes/Command';
import type { ExtendedClient } from '../../classes/Client';

export default class CodeblockCommand extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            type: ApplicationCommandType.Message,
            name: 'Convert to Codeblock',
        });
    }

    async execute(interaction: MessageContextMenuCommandInteraction) {
        let content = interaction.targetMessage.content.trim();
        let begin;
        for (begin = 0; begin < content.length; begin++) {
            if (content[begin] != '`') {
                break;
            }
        }
        let end;
        for (end = content.length - 1; end >= begin; end--) {
            if (content[end] != '`') {
                break;
            }
        }

        content = '```\n' + content.substring(begin, end + 1) + '```';

        return interaction.reply(content);
    }
}
