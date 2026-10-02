import { API_URL } from './site';

export type JobPublicStatus = 'queued' | 'active' | 'completed' | 'failed';

export interface JobStatus {
  id: string;
  toolId: string;
  status: JobPublicStatus;
  progress: number;
  result: {
    fileName: string;
    size: number;
    mime: string;
    downloadUrl: string;
  } | null;
  error: string | null;
  createdAt: string | null;
}

function parseApiError(body: string, fallback: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    if (parsed?.error?.message) return parsed.error.message;
  } catch {
    // not JSON — use fallback
  }
  return fallback;
}

/** Uploads one or more files for conversion. Uses XHR for upload progress. */
export function uploadForConversion(
  toolId: string,
  files: File[],
  onProgress: (pct: number) => void,
  options?: Record<string, unknown>,
): Promise<{ jobId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/convert/${encodeURIComponent(toolId)}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 202) {
        try {
          resolve(JSON.parse(xhr.responseText) as { jobId: string });
        } catch {
          reject(new Error('Unexpected server response. Please try again.'));
        }
      } else {
        reject(new Error(parseApiError(xhr.responseText, `Upload failed (HTTP ${xhr.status}).`)));
      }
    };
    xhr.onerror = () => reject(new Error('Network error — is the ConvertHub API running?'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller file.'));

    const form = new FormData();
    for (const file of files) form.append('files', file, file.name);
    if (options) form.append('options', JSON.stringify(options));
    xhr.send(form);
  });
}

/** Starts a conversion that needs no file (QR codes, counters, ...). */
export async function startJobWithoutFile(
  toolId: string,
  options?: Record<string, unknown>,
): Promise<{ jobId: string }> {
  const res = await fetch(`${API_URL}/api/convert/${encodeURIComponent(toolId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ options: options ?? {} }),
  });
  if (res.status !== 202) {
    const body = await res.text();
    throw new Error(parseApiError(body, `Request failed (HTTP ${res.status}).`));
  }
  return (await res.json()) as { jobId: string };
}

export async function getJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(parseApiError(body, `Could not read job status (HTTP ${res.status}).`));
  }
  return (await res.json()) as JobStatus;
}

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

/** Polls until the job completes or fails. Resolves with the final status. */
export async function pollJob(
  jobId: string,
  onUpdate: (job: JobStatus) => void,
  opts: PollOptions = {},
): Promise<JobStatus> {
  const intervalMs = opts.intervalMs ?? 1500;
  const timeoutMs = opts.timeoutMs ?? 10 * 60 * 1000;
  const start = Date.now();
  for (;;) {
    const job = await getJob(jobId);
    onUpdate(job);
    if (job.status === 'completed' || job.status === 'failed') return job;
    if (Date.now() - start > timeoutMs) throw new Error('Timed out waiting for the conversion.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export function downloadUrl(jobId: string): string {
  return `${API_URL}/api/download/${encodeURIComponent(jobId)}`;
}

/** Enqueues a pipeline smoke test (no file needed). Used by the API smoke test. */
export async function runSelfTest(): Promise<{ jobId: string }> {
  const res = await fetch(`${API_URL}/api/selftest`, { method: 'POST' });
  if (res.status !== 202) {
    const body = await res.text();
    throw new Error(parseApiError(body, `Self-test failed (HTTP ${res.status}).`));
  }
  return (await res.json()) as { jobId: string };
}
