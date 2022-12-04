import { Router } from 'express';
import { frontController, signinController, signupController } from '../controllers';

const router = Router();

// start script
router.post('/loadHome', frontController.loadHome);

// signin
router.post('/signinUsername', signinController.signinUsername);
router.post('/signinPassword', signinController.signinPassword);
router.post('/signinCheck', signinController.signinCheck);

// signup
router.post('/signupUsername', signupController.signupUsername);
router.post('/signupPassword', signupController.signupPassword);
router.post('/createUser', signupController.createUser);
router.post('/createCharacter', signupController.createCharacter);

// signout
router.post('/signout', frontController.signout);

// to field
router.post('/toDungeon', frontController.toDungeon);
router.post('/toVillage', frontController.toVillage);

// etc
router.post('/deleteAccount', frontController.deleteAccount);
router.post('/emptyCommand', frontController.emptyCommand);

export default router;
