import home from "./home.handler";
import signinHandler from "./signin.handler";
import signupHandler from "./signup.handler";


export default {
    ...home,
    ...signinHandler,
    ...signupHandler,
}