import { Event } from '../classes/Event';
import type { ExtendedClient } from '../classes/Client';

export default class ClientReady extends Event<'clientReady'> {
    constructor(client: ExtendedClient) {
        super(client, 'clientReady');
    }

    override async execute() {
        this.client.logger.info(
            'Logged in as ',
            this.client.user?.username,
        );

        // load when cache is populated
        if (this.client.isReady()) {
            this.client.registerCommands(
                process.env.NODE_ENV === 'development'
                    ? 'guild'
                    : 'global',
            );
        }
    }
}
