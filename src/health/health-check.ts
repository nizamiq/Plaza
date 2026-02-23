import type { HealthStatus, ServiceHealth } from '../shared/types.js';

export class HealthChecker {
  private version: string;
  private checks: Map<string, () => Promise<ServiceHealth>> = new Map();

  constructor(version: string = '1.0.0') {
    this.version = version;
  }

  registerCheck(name: string, checkFn: () => Promise<ServiceHealth>): void {
    this.checks.set(name, checkFn);
  }

  async check(): Promise<HealthStatus> {
    const services: Record<string, ServiceHealth> = {};
    let overallStatus: HealthStatus['status'] = 'healthy';

    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        const startTime = Date.now();
        try {
          const result = await Promise.race([
            checkFn(),
            new Promise<ServiceHealth>((_, reject) =>
              setTimeout(() => reject(new Error('Health check timeout')), 5000)
            ),
          ]);
          services[name] = {
            ...result,
            latency: Date.now() - startTime,
            lastChecked: new Date().toISOString(),
          };

          if (result.status === 'unhealthy') {
            overallStatus = 'unhealthy';
          } else if (result.status === 'degraded' && overallStatus === 'healthy') {
            overallStatus = 'degraded';
          }
        } catch (error) {
          services[name] = {
            status: 'unhealthy',
            message: (error as Error).message,
            latency: Date.now() - startTime,
            lastChecked: new Date().toISOString(),
          };
          overallStatus = 'unhealthy';
        }
      }
    );

    await Promise.all(checkPromises);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: this.version,
      services,
    };
  }

  async checkSimple(): Promise<{ healthy: boolean; message: string }> {
    try {
      const status = await this.check();
      return {
        healthy: status.status === 'healthy',
        message: `Status: ${status.status}`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: (error as Error).message,
      };
    }
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker();
