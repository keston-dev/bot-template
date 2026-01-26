import {
    type Guild,
    REST,
    type RESTGetAPIApplicationCommandResult,
    type RESTGetAPIApplicationGuildCommandResult,
    Routes,
} from 'discord.js';

const applicationToken = process.env.TOKEN;
const applicationId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!applicationToken || !applicationId) {
    console.error('Missing TOKEN or CLIENT_ID environment variables');
    process.exit(1);
}

const rest = new REST().setToken(applicationToken);

try {
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
            `Started removing application commands in ${guild.name}.`,
        );

        const guildCommands = (await rest.get(
            Routes.applicationGuildCommands(applicationId, guildId),
        )) as RESTGetAPIApplicationGuildCommandResult[];

        if (!guildCommands.length) {
            throw new Error(
                `The guild ${guild.name} (${guild.id}) does not have any guild commands that can be removed.`,
            );
        }

        await rest.put(
            Routes.applicationGuildCommands(applicationId, guildId),
            {
                body: [],
            },
        );

        console.log(
            `Successfully removed ${guildCommands.length} application commands in ${guild.name}.`,
        );

        process.exit(0);
    }

    const globalCommands = (await rest
        .get(Routes.applicationCommands(applicationId))
        .catch(() => {
            throw new Error(
                `Cannot find app with id: ${applicationId}`,
            );
        })) as RESTGetAPIApplicationCommandResult[];

    if (!globalCommands.length) {
        throw new Error(
            'There are no global commands that can be removed.',
        );
    }

    await rest.put(Routes.applicationCommands(applicationId), {
        body: [],
    });

    console.log(
        `Successfully removed ${globalCommands.length} application commands globally.`,
    );

    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}
