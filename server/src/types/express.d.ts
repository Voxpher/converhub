// Adds per-request job state used by the upload middleware chain.
declare global {
  namespace Express {
    interface Request {
      jobId: string;
      /** Resolved tool definition for /api/convert/:toolId requests. */
      toolDef?: import('../services/toolRegistry').ToolDefinition;
    }
  }
}
export {};
