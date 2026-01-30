import {
    ApplicationCommandType,
    type Guild,
    REST,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationGuildCommandsJSONBody,
    Routes,
} from 'discord.js';

import type { Command } from '../classes/Command';
import { join } from 'path';
import { readdirSync } from 'fs';

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

async function loadCommands(
    directory: string,
): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
    const items = readdirSync(directory, { withFileTypes: true });
    const loadedCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    for (const item of items) {
        const fullPath = join(directory, item.name);

        if (item.isDirectory()) {
            const subCommands = await loadCommands(fullPath);
            loadedCommands.push(...subCommands);
            continue;
        }

        if (!item.name.endsWith('.ts') && !item.name.endsWith('.js'))
            continue;

        try {
            const commandModule = await import(fullPath);
            const CommandClass = commandModule.default;

            if (!CommandClass) continue;

            const command: Command = new CommandClass();

            const baseCommand = {
                name: command.data.name,
                contexts: command.data.contexts,
                integration_types: command.data.integration,
            };

            switch (command.data.type) {
                case ApplicationCommandType.ChatInput:
                    loadedCommands.push({
                        ...baseCommand,
                        type: ApplicationCommandType.ChatInput,
                        description: command.data.description,
                        // @ts-expect-error minimumPermissionLevel shouldnt be sent, but will be stripped by discord anyway.
                        options: command.data.options ?? [],
                    });
                    break;

                case ApplicationCommandType.User:
                    loadedCommands.push({
                        ...baseCommand,
                        type: ApplicationCommandType.User,
                    });
                    break;

                case ApplicationCommandType.Message:
                    loadedCommands.push({
                        ...baseCommand,
                        type: ApplicationCommandType.Message,
                    });
                    break;
            }
        } catch (error) {
            console.error(`Failed to load command ${fullPath}:`, error);
        }
    }

    return loadedCommands;
}

const commandFolderPath = join(import.meta.dir, '../commands');
commands.push(...(await loadCommands(commandFolderPath)));

const applicationToken = process.env.TOKEN;
const applicationId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!applicationToken || !applicationId) {
    console.error('Missing TOKEN or CLIENT_ID environment variables');
    process.exit(1);
}

const rest = new REST().setToken(applicationToken);

try {
    let data:
        | RESTPutAPIApplicationCommandsJSONBody[]
        | RESTPutAPIApplicationGuildCommandsJSONBody[] = [];

    if (guildId) {
        const guild = (await rest
            .get(Routes.guild(guildId))
            .catch(() => {
                console.log(
                    `A guild was unable to be found with the provided guild ID: ${guildId}. Check the ID and try again.`,
                );
                process.exit(1);
            })) as Guild;

        console.log(
            `Started refreshing ${commands.length} application commands in ${guild.name} (${guild.id}).`,
        );

        data = (await rest.put(
            Routes.applicationGuildCommands(applicationId, guild.id),
            {
                body: commands,
            },
        )) as RESTPutAPIApplicationGuildCommandsJSONBody[];

        console.log(
            `Successfully refreshed ${data.length} application commands in ${guild.name} (${guild.id}).`,
        );

        process.exit(0);
    }

    console.log(
        `Started refreshing ${commands.length} application commands globally.`,
    );

    data = (await rest.put(Routes.applicationCommands(applicationId), {
        body: commands,
    })) as RESTPutAPIApplicationCommandsJSONBody[];

    console.log(
        `Successfully reloaded ${data.length} application commands globally.`,
    );

    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}
