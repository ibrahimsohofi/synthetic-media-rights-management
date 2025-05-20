import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { SystemMetrics } from '../monitoring/types';

const execAsync = promisify(exec);

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const [cpuUsage, memoryInfo, diskInfo, networkInfo] = await Promise.all([
    getCPUUsage(),
    getMemoryInfo(),
    getDiskInfo(),
    getNetworkInfo(),
  ]);

  return {
    timestamp: new Date(),
    cpu: {
      usage: cpuUsage,
      load: os.loadavg(),
    },
    memory: memoryInfo,
    disk: diskInfo,
    network: networkInfo,
  };
}

async function getCPUUsage(): Promise<number> {
  try {
    const { stdout } = await execAsync('wmic cpu get loadpercentage');
    const loadPercentage = parseInt(stdout.split('\n')[1], 10);
    return isNaN(loadPercentage) ? 0 : loadPercentage;
  } catch (error) {
    console.error('Failed to get CPU usage:', error);
    return 0;
  }
}

function getMemoryInfo(): { total: number; used: number; free: number } {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total,
    used,
    free,
  };
}

async function getDiskInfo(): Promise<{ total: number; used: number; free: number }> {
  try {
    const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
    const lines = stdout.trim().split('\n').slice(1);
    
    let total = 0;
    let free = 0;

    for (const line of lines) {
      const [caption, freeSpace, size] = line.trim().split(/\s+/);
      if (caption && freeSpace && size) {
        total += parseInt(size, 10);
        free += parseInt(freeSpace, 10);
      }
    }

    return {
      total,
      used: total - free,
      free,
    };
  } catch (error) {
    console.error('Failed to get disk info:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
    };
  }
}

async function getNetworkInfo(): Promise<{
  bytesIn: number;
  bytesOut: number;
  connections: number;
}> {
  try {
    const [netstat, netIO] = await Promise.all([
      execAsync('netstat -an | findstr ESTABLISHED'),
      execAsync('typeperf "\\Network Interface(*)\\Bytes Total/sec" -sc 1'),
    ]);

    const connections = netstat.stdout.split('\n').filter(Boolean).length;
    const bytesPerSec = parseFloat(netIO.stdout.split('\n')[2].split(',')[1].replace(/"/g, ''));

    return {
      bytesIn: bytesPerSec / 2, // Rough estimate
      bytesOut: bytesPerSec / 2, // Rough estimate
      connections,
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    return {
      bytesIn: 0,
      bytesOut: 0,
      connections: 0,
    };
  }
}

// Start periodic metrics collection
let metricsInterval: NodeJS.Timeout | null = null;

export function startMetricsCollection(intervalMs: number = 60000): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }

  metricsInterval = setInterval(async () => {
    try {
      const metrics = await getSystemMetrics();
      // Store metrics in Redis or database
      // This will be handled by the monitoring service
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }, intervalMs);
}

export function stopMetricsCollection(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }
} 