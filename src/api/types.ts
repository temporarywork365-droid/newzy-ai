export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  params?: QueryParams;
  timeoutMs?: number;
  signal?: AbortSignal;
}
