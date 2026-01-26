import { ExtendedClient } from './classes/Client';
import { clientConfig } from './types/clientConfig';

const client = new ExtendedClient({
    intents: clientConfig.intents,
    presence: clientConfig.presence,
});

await client.initalize();

client.login(process.env.TOKEN);
