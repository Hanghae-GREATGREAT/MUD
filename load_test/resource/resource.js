const SERVER_URL = 'http://0.0.0.0:3333/api/resource'

/**
 * 
 * @param {string} URL 백엔드 서버 주소
 * @returns {Promise<object>} { totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent }
 * 
 * - totalMemory: Node 프로세스의 메모리 사용량
 * - availableMemory: Node 프로세스의 가용 메모리
 * - userCpuSeconds: 초당 cpu 활성화 시간(ms/sec)
 * - cpuConsumptionPercent: cpu 사용량 백분률
 * 
 */
async function getResourceUsage(URL) {
    const res = await fetch(URL);
    const {
        // OS_CPUS,
        // PROCESS_CPU_USAGE,
        // PROCESS_MEMORY_USAGE,
        // PROCESS_RESOURCE_USAGE,
        PROCESS_REPORT,
    } = await res.json();
    const { javascriptHeap: HEAP_STATUS, resourceUsage: RESOURCE_USAGE} = PROCESS_REPORT;
    const { totalMemory, availableMemory } = HEAP_STATUS;
    const { userCpuSeconds, cpuConsumptionPercent } = RESOURCE_USAGE;

    // console.log(`
    // totalMemory: ${(totalMemory / 1024 / 1024).toFixed(4)}mb
    // userCpuSeconds: ${userCpuSeconds}/sec
    // cpuConsumptionPercent: ${cpuConsumptionPercent}%
    // `);
    return { totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent };
}

(async() => {
  const { totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent } = await getResourceUsage(`${SERVER_URL}`);
  const totalMemoryMb = (totalMemory/1024/1024).toFixed(2);
  const availableMemoryMb = (availableMemory/1024/1024).toFixed(2);
  console.log(
      'SERVER CURRENT STATUS\n'+
      `total memory: ${totalMemoryMb}/${availableMemoryMb}mb, cpu usuage: ${userCpuSeconds}ms/sec, cpu occupied: ${cpuConsumptionPercent}%
  `);
})();

module.exports = { getResourceUsage }

/**

테스트에 사용할 수 있는 지표?
totlaMemory: 프로세스의 메모리 총 사용량
availableMemory: 프로세스의 가용 메모리
userCpuSeconds: cpu 활성화 시간/초
cpuConsumptionPercent: cpu 사용량 백분율
maxRss: node 프로세스 실행과 관련된 모든 메모리 총 사용량



# 10 loginTest

HEAP_STATUS: {
  totalMemory: 252_313_600,             >> 298_450_944
  executableMemory: 7_340_032,          >> 9_175_040
  totalCommittedMemory: 252_313_600,    >> 298_450_944
  availableMemory: 4_095_943_280,       >> 4_077_326_688
  totalGlobalHandlesMemory: 90_112,     >> 90_112
  usedGlobalHandlesMemory: 83_392,      >> 83_392
  usedMemory: 246_116_704,              >> 262_805_824
  memoryLimit: 4_345_298_944,           >> 4_345_298_944
  mallocedMemory: 1_073_200,            >> 1_073_200
  externalMemory: 3_469_762,            >> 3_625_018
  peakMallocedMemory: 25_457_600,       >> 25_457_600
  nativeContextCount: 2,
  detachedContextCount: 0,
  doesZapGarbage: 0,
  heapSpaces: {
    read_only_space: {
      memorySize: 0,
      committedMemory: 0,
      capacity: 0,
      used: 0,
      available: 0
    },
    old_space: {
      memorySize: 201_449_472,          >> 211_935_232
      committedMemory: 201_449_472,     >> 211_935_232
      capacity: 197_815_840,            >> 208_087_392
      used: 196_776_792,                >> 206_604_416
      available: 1_039_048              >> 1_482_976
    },
    code_space: {
      memorySize: 7_286_784,            >> 9_121_792
      committedMemory: 7_286_784,       >> 9_121_792
      capacity: 6_828_032,              >> 8_548_352
      used: 6_551_360,                  >> 8_248_512
      available: 276_672                >> 299_840
    },
    map_space: {
      memorySize: 2_105_344,            >> 3_416_064
      committedMemory: 2_105_344,       >> 3_416_064
      capacity: 2_065_744,              >> 3_354_464
      used: 1_489_968,                  >> 3_353_744
      available: 575_776                >> 720
    },
    large_object_space: {
      memorySize: 40_423_424,           >> 40_423_424
      committedMemory: 40_423_424,      >> 40_423_424
      capacity: 40_303_072,             >> 40_303_072
      used: 40_303_072,                 >> 40_303_072
      available: 0
    },
    code_large_object_space: {
      memorySize: 0,
      committedMemory: 0,
      capacity: 0,
      used: 0,
      available: 0
    },
    new_large_object_space: {
      memorySize: 0,
      committedMemory: 0,
      capacity: 1_030_976,              >> 16_495_616
      used: 0,
      available: 1_030_976              >> 16_495_616
    },
    new_space: {
      memorySize: 1_048_576,            >> 33_554_432
      committedMemory: 1_048_576,       >> 33_554_432
      capacity: 1_030_976,              >> 16_495_616
      used: 995_512,                    >> 4_296_080
      available: 35_464                 >> 12_199_536
    }
  }
}
RESOURCE_USAGE: {
  userCpuSeconds: 13.187,               >> 71.578
  kernelCpuSeconds: 1.609,              >> 2.687
  cpuConsumptionPercent: 16.0826,       >> 54.208
  maxRss: 366_813_184,                  >> 367_747_072
  pageFaults: { IORequired: 282_747, IONotRequired: 0 },     >> IORequire: 329_540
  fsActivity: { reads: 2255, writes: 0 }
}

 */