import { Router } from 'express';


const router = Router();


router.get('/', (req, res)=>{
    res.render('home.html');
});

router.get('/front', (_, res)=>{
    res.render('front.html');
});

router.get('/main', (req, res)=>{
    res.render('main.html');
});


export default router;