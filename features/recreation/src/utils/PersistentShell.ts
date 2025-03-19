import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { getCwd, setCwd } from './file';

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * PersistentShell provides a singleton shell session that persists across commands
 */
export class PersistentShell {
  private static instance: PersistentShell | null = null;
  private shell: string;
  private shellArgs: string[];
  private cwd: string;
  private env: Record<string, string>;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Determine shell based on platform
    if (os.platform() === 'win32') {
      this.shell = 'cmd.exe';
      this.shellArgs = ['/c'];
    } else {
      this.shell = 'bash';
      this.shellArgs = ['-c'];
    }
    
    this.cwd = getCwd();
    this.env = { ...process.env };
  }
  
  /**
   * Get the shell instance (singleton pattern)
   */
  public static getInstance(): PersistentShell {
    if (!PersistentShell.instance) {
      PersistentShell.instance = new PersistentShell();
    }
    return PersistentShell.instance;
  }
  
  /**
   * Execute a command in the persistent shell
   */
  public async exec(
    command: string,
    abortSignal?: AbortSignal,
    timeout?: number
  ): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = timeout 
        ? setTimeout(() => {
            reject(new Error(`Command timed out after ${timeout}ms`));
          }, timeout)
        : null;
      
      // Handle abort signal
      const abortHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('Command execution aborted'));
      };
      
      if (abortSignal) {
        abortSignal.addEventListener('abort', abortHandler);
      }
      
      try {
        // Execute command
        const childProcess = spawn(
          this.shell,
          [...this.shellArgs, command],
          {
            cwd: this.cwd,
            env: this.env,
            shell: true
          }
        );
        
        let stdout = '';
        let stderr = '';
        
        childProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        childProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        childProcess.on('error', (err) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (abortSignal) abortSignal.removeEventListener('abort', abortHandler);
          reject(err);
        });
        
        childProcess.on('close', (code) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (abortSignal) abortSignal.removeEventListener('abort', abortHandler);
          resolve({
            stdout,
            stderr,
            exitCode: code || 0
          });
        });
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        if (abortSignal) abortSignal.removeEventListener('abort', abortHandler);
        reject(error);
      }
    });
  }
  
  /**
   * Set the current working directory
   */
  public async setCwd(cwd: string): Promise<void> {
    this.cwd = cwd;
    setCwd(cwd);
  }
  
  /**
   * Get the current working directory
   */
  public getCwd(): string {
    return this.cwd;
  }
  
  /**
   * Set an environment variable
   */
  public setEnv(key: string, value: string): void {
    this.env[key] = value;
  }
  
  /**
   * Get an environment variable
   */
  public getEnv(key: string): string | undefined {
    return this.env[key];
  }
}
