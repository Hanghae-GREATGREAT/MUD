import storyHandler from './story';
import healHandler from './heal';
import enhanceHandler from './enhance';
import gambleHandler from './gamble';

export default {
    ...storyHandler,
    ...healHandler,
    ...enhanceHandler,
    ...gambleHandler,
};
