export function debugClock(search: string, realNow = Date.now()) {
  const p = new URLSearchParams(search);
  const raw = Number(p.get('speed') || 1); const speed = Number.isFinite(raw) ? Math.max(1,Math.min(3600,raw)) : 1;
  const seed = new Date(realNow); const t=p.get('t');
  if (t && /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(t)) { const [h,m,s]=t.split(':').map(Number); seed.setHours(h,m,s,0); }
  return { speed, now: () => seed.getTime()+(Date.now()-realNow)*speed, fps: p.get('fps') === '1', reset: p.get('reset') === '1' };
}
