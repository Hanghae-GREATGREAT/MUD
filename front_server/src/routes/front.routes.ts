import { Router } from 'express';
import { frontController, globalController, signinController, signupController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

// start script
router.post('/loadHome', frontController.loadHome);

// signin
router.post('/signinUsername', auth.loginUserValidation, signinController.signinUsername);
router.post('/signinPassword', signinController.signinPassword);
router.post('/signinCheck', signinController.signinCheck);

// signup
router.post('/signupUsername', auth.loginUserValidation, signupController.signupUsername);
router.post('/signupPassword', signupController.signupPassword);
router.post('/createUser', signupController.createUser);
router.post('/createCharacter', signupController.createCharacter);

// signout
router.post('/signout', frontController.signout);

// to field
router.post('/toDungeon', auth.loginValidation, frontController.toDungeon);
router.post('/toVillage', auth.loginValidation, frontController.toVillage);

// etc
router.post('/deleteAccount', frontController.deleteAccount);
router.post('/emptyCommand', frontController.emptyCommand);

// global
router.post('/toHome', globalController.toHome);
router.post('/globalHelp', globalController.help);
router.post('/disconnect', globalController.disconnect);

export default router;
