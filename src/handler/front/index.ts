import home from "./home";
import signinHandler from "./signinHandler";
import signupHandler from "./signupHandler";


export default {
    ...home,
    ...signinHandler,
    ...signupHandler,
}