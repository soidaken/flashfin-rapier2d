
function padStart(value: string | number, length: number, padChar: string): string {
    let result = String(value);
    while (result.length < length) {
        result = padChar + result;
    }
    return result;
}

class Clogger   {
    private prefix: string;

    constructor(prefix: string = '') {
        this.prefix = prefix;
    }

    // 将参数转换为字符串并输出到控制台
    private formatAndLog(...args: any[]): void {
        const now = new Date();
        const hours = padStart(now.getHours(), 2, '0');
        const minutes = padStart(now.getMinutes(), 2, '0');
        const seconds = padStart(now.getSeconds(), 2, '0');
        const milliseconds = padStart(now.getMilliseconds(), 3, '0');

        const timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`;

        console.log(
            this.prefix +'|'+ timestamp +'|'+
            args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')
        );
    }
    debug(...args: any[]): void {
        this.formatAndLog('DEBUG', ...args);
    }

    log(...args: any[]): void {
        this.formatAndLog('LOG', ...args);
    }

    warn(...args: any[]): void {
        this.formatAndLog('WARN', ...args);
    }

    error(...args: any[]): void {
        this.formatAndLog('ERROR', ...args);
    }
}

export const logger = new Clogger('SOIDA');