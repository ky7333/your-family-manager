import { BACKEND_BASE_URL } from '../config';

const defaultHeaders: Record<string, string> = {
  Accept: 'application/json',
};

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let isNotifyingUnauthorized = false;
let unauthorizedHandlerOwner: symbol | null = null;

export class UnauthorizedError extends Error {
  constructor(message = 'Session expired. Please sign in again.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null, owner?: symbol) {
  if (handler === null) {
    if (!owner || unauthorizedHandlerOwner === owner) {
      unauthorizedHandler = null;
      unauthorizedHandlerOwner = null;
    }
    return;
  }

  unauthorizedHandler = handler;
  unauthorizedHandlerOwner = owner ?? null;
}

type FetchInit = RequestInit & {
  skipJsonContentType?: boolean;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  const text = await response.text();
  if (text.trim().length > 0) {
    return text;
  }
  return `Request failed: ${response.status}`;
};

export async function request(path: string, init?: FetchInit): Promise<Response> {
  const mergedHeaders = new Headers(defaultHeaders);
  const providedHeaders = new Headers(init?.headers);
  providedHeaders.forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  if (!init?.skipJsonContentType && init?.body && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    ...init,
    headers: mergedHeaders,
    credentials: 'include',
  });

  if (response.status === 401) {
    if (!isNotifyingUnauthorized) {
      isNotifyingUnauthorized = true;
      try {
        unauthorizedHandler?.();
      } finally {
        isNotifyingUnauthorized = false;
      }
    }
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  return response;
}

export const parseJson = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Expected JSON response from server');
  }
  return response.json() as Promise<T>;
};
