import storyHandler from './story.handler';
import healHandler from './heal.handler';
import enhanceHandler from './enhance.handler';
import gambleHandler from './gamble.handler';
import pvpHandler from './pvp.handler';

export default {
    ...storyHandler,
    ...healHandler,
    ...enhanceHandler,
    ...gambleHandler,
    ...pvpHandler,
};
