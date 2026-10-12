export interface RouteTarget {
  pathname: string;
  params: Record<string, string>;
}

/** Centralized deep-linkable route builders. */
export const routes = {
  article:  (id: string): RouteTarget => ({ pathname: '/article/[id]',  params: { id } }),
  model:    (id: string): RouteTarget => ({ pathname: '/model/[id]',    params: { id } }),
  tool:     (id: string): RouteTarget => ({ pathname: '/tool/[id]',     params: { id } }),
  concept:  (id: string): RouteTarget => ({ pathname: '/concept/[id]',  params: { id } }),
  prompt:   (id: string): RouteTarget => ({ pathname: '/prompt/[id]',   params: { id } }),
  workflow: (id: string): RouteTarget => ({ pathname: '/workflow/[id]', params: { id } }),
  agent:    (id: string): RouteTarget => ({ pathname: '/agent/[id]',    params: { id } }),
  lesson:   (id: string): RouteTarget => ({ pathname: '/lesson/[id]',   params: { id } }),
  research: (id: string): RouteTarget => ({ pathname: '/research/[id]', params: { id } }),
  company:  (id: string): RouteTarget => ({ pathname: '/company/[id]',  params: { id } }),
  topic:    (id: string): RouteTarget => ({ pathname: '/topic/[id]',    params: { id } }),
  compare:  (leftId?: string): RouteTarget => ({
    pathname: '/compare',
    params: leftId ? { left: leftId } : {},
  }),
  settings:  (): RouteTarget => ({ pathname: '/settings',  params: {} }),
  interests: (): RouteTarget => ({ pathname: '/interests', params: {} }),
};
