import { Router } from 'express';
import { io } from './app';
import { battleCache } from './db/cache';
import { CharacterService } from './services';


const router = Router();

router.get('/', async (req, res, next) => {


    res.status(200).json({
        message: 'API INDEX',
    });
});


router.get('/battleCache', (req, res) => {
    const cache = battleCache.getAll();

    console.log(cache);
    res.status(200).json({ cache });
});


import os from 'os';
import process from 'process';
import perfHooks from 'perf_hooks'

router.get('/resource', (req, res) => {
    // const { CPU: PREV_CPU } = req.body;
    // console.log(PREV_CPU);
    // const OS_CPUS = os.cpus();
    // const PROCESS_CPU_USAGE = PREV_CPU ? process.cpuUsage(PREV_CPU) : process.cpuUsage();
    // const PROCESS_MEMORY_USAGE = process.memoryUsage();
    // const PROCESS_RESOURCE_USAGE = process.resourceUsage();
    const PROCESS_REPORT = process.report?.getReport();
    // const { HEAP_STATUS, RESOURCE_USAGE} = PROCESS_REPORT;

    // UNIX SPECIFIC
    // console.log(os.loadavg())

    res.status(200).json({
        // OS_CPUS,
        // PROCESS_CPU_USAGE,
        // PROCESS_MEMORY_USAGE,
        // PROCESS_RESOURCE_USAGE,
        PROCESS_REPORT,
        // HEAP_STATUS,
        // RESOURCE_USAGE
    });
});

export default router;
