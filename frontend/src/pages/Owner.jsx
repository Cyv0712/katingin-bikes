import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Row, Col, Form, Table, Spinner } from 'react-bootstrap';
import {
  Lock, Eye, EyeOff, LogOut, TrendingUp, Copy, Check, RefreshCw, ArrowUp, ArrowDown, Info,
} from 'lucide-react';
import { apiUrl } from '../config/api';

// Hidden owner page. Not linked anywhere, noindex, and useless without the
// owner key, which is typed in here and kept only in sessionStorage (never in
// the bundle). The server returns 404 for anything that isn't the right key.

const KEY_STORAGE = 'kb-owner-key';
const readKey = () => {
  try { return sessionStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
};
const saveKey = (k) => {
  try { sessionStorage.setItem(KEY_STORAGE, k); } catch { /* storage unavailable */ }
};
const clearKey = () => {
  try { sessionStorage.removeItem(KEY_STORAGE); } catch { /* storage unavailable */ }
};

async function requestReport(key) {
  try {
    const headers = { 'x-owner-key': key };
    const res = await fetch(apiUrl('/api/internal/attribution'), { headers });
    if (res.ok) {
      const data = await res.json();
      // Only asked once the key is accepted, so a wrong key costs one failed
      // attempt, not two. A failure here just hides the section.
      let activity = null;
      try {
        const act = await fetch(apiUrl('/api/internal/activity?limit=50'), { headers });
        if (act.ok) activity = await act.json();
      } catch { /* section stays hidden */ }
      return { data, activity };
    }
    if (res.status === 404) return { error: 'That key did not work. After several wrong tries, wait 15 minutes.', badKey: true };
    return { error: 'Something went wrong. Please try again.' };
  } catch {
    return { error: 'Could not reach the server.' };
  }
}

const PERIODS = [
  { id: 'this-month', label: 'This month', offset: 0, span: 1 },
  { id: 'last-month', label: 'Last month', offset: -1, span: 1 },
  { id: 'last-3', label: 'Last 3 months', offset: -2, span: 3 },
  { id: 'year', label: 'This year', year: true },
  { id: 'all', label: 'All time' },
];

function windowFor(period, now) {
  if (period.id === 'all') return null;
  let start;
  let span;
  if (period.year) {
    start = new Date(now.getFullYear(), 0, 1);
    span = 12;
  } else {
    start = new Date(now.getFullYear(), now.getMonth() + period.offset, 1);
    span = period.span;
  }
  const end = new Date(start.getFullYear(), start.getMonth() + span, 1);
  const prevStart = new Date(start.getFullYear(), start.getMonth() - span, 1);
  let prevLabel;
  if (period.year) prevLabel = String(prevStart.getFullYear());
  else if (span === 1) prevLabel = prevStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  else prevLabel = `the previous ${span} months`;
  // A period still in progress is compared with the same elapsed stretch of the
  // previous one, not the whole thing, so a mid-month figure isn't shown as a drop.
  const inProgress = now >= start && now < end;
  const prevEnd = inProgress ? new Date(prevStart.getTime() + (now - start)) : start;
  if (inProgress) prevLabel += ' at this point';
  return { start, end, prevStart, prevEnd, prevLabel };
}

const inRange = (bikes, start, end) => bikes.filter((b) => b.t >= start && b.t < end);

function summarize(list) {
  const count = list.length;
  const revenue = list.reduce((sum, b) => sum + b.priceValue, 0);
  const days = list.map((b) => b.daysToClose).filter((d) => d != null);
  const inquiries = list.reduce((sum, b) => sum + (b.inquiryCount || 0), 0);
  return {
    count,
    revenue,
    avgDays: days.length ? days.reduce((a, b) => a + b, 0) / days.length : null,
    inquiriesPerSale: count ? inquiries / count : null,
  };
}

const peso = (n) => `₱${Math.round(n).toLocaleString('en-PH')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const fmtDateTime = (d) => new Date(d).toLocaleString('en-PH', {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
});
const fmtDays = (d) => (d == null ? '—' : d < 1 ? 'Under a day' : `${Math.round(d)} day${Math.round(d) === 1 ? '' : 's'}`);

function Delta({ diff, format = String, label }) {
  if (label == null) return null;
  if (diff === 0) return <span className="owner-delta owner-delta-flat">No change vs {label}</span>;
  const up = diff > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={`owner-delta ${up ? 'owner-delta-up' : 'owner-delta-down'}`}>
      <Icon size={12} strokeWidth={2.25} aria-hidden="true" />
      {up ? '+' : '−'}{format(Math.abs(diff))} vs {label}
    </span>
  );
}

function StatTile({ label, value, sub, delta }) {
  return (
    <div className="moto-card p-4 h-100">
      <div className="kb-label mb-1" style={{ color: 'var(--ink-muted)' }}>{label}</div>
      <div className="owner-tile-value">{value}</div>
      <div className="mt-2 d-flex flex-column gap-1">
        {delta}
        {sub && <span className="kb-caption">{sub}</span>}
      </div>
    </div>
  );
}

function niceScale(max) {
  const top = Math.max(1, max);
  const step = top <= 4 ? 1 : Math.ceil(top / 4);
  const axisMax = step * Math.ceil(top / step);
  const ticks = [];
  for (let t = 0; t <= axisMax; t += step) ticks.push(t);
  return { axisMax, ticks };
}

function MonthlyChart({ months }) {
  const peak = Math.max(0, ...months.map((m) => m.count));
  const { axisMax, ticks } = niceScale(peak);
  const labelledPeak = peak > 0 ? months.findIndex((m) => m.count === peak) : -1;
  const summary = months.map((m) => `${m.long}: ${plural(m.count, 'bike')}`).join('; ');

  return (
    <div className="owner-chart">
      <div className="owner-plot" role="group" aria-label={`Bikes helped sell per month. ${summary}`}>
        {ticks.map((t) => (
          <div key={t} className="owner-grid" style={{ bottom: `${(t / axisMax) * 100}%` }}>
            <span>{t}</span>
          </div>
        ))}
        <div className="owner-cols">
          {months.map((m, i) => {
            const pct = (m.count / axisMax) * 100;
            return (
              <button
                type="button"
                key={m.key}
                className="owner-col"
                style={{ '--h': `${pct}%` }}
                aria-label={`${m.long}: ${plural(m.count, 'bike')}, ${peso(m.revenue)}`}
              >
                {m.count > 0 && (
                  <span
                    className="owner-bar"
                    style={{ height: `${pct}%`, background: m.active ? 'var(--brass)' : 'var(--line-strong)' }}
                  />
                )}
                {i === labelledPeak && (
                  <span className="owner-bar-value" style={{ bottom: `calc(${pct}% + 4px)` }}>{m.count}</span>
                )}
                <span className="owner-tip" role="tooltip">
                  <strong>{m.long}</strong>
                  <span>{plural(m.count, 'bike')} · {peso(m.revenue)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="owner-xlabels" aria-hidden="true">
        {months.map((m) => <span key={m.key}>{m.short}</span>)}
      </div>
    </div>
  );
}

function Owner() {
  const [initialKey] = useState(readKey);
  const [ownerKey, setOwnerKey] = useState(initialKey);
  const [input, setInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialKey));
  const [error, setError] = useState('');
  const [periodId, setPeriodId] = useState('this-month');
  const [tableView, setTableView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now] = useState(() => new Date());

  // Resume a session in this tab without asking for the key again.
  useEffect(() => {
    if (!initialKey) return undefined;
    let live = true;
    requestReport(initialKey).then((r) => {
      if (!live) return;
      if (r.data) {
        setData(r.data);
        setActivity(r.activity);
      } else {
        // Only a rejected key is forgotten; a network blip keeps the session.
        if (r.badKey) {
          clearKey();
          setOwnerKey('');
        }
        setError(r.error);
      }
      setLoading(false);
    });
    return () => { live = false; };
  }, [initialKey]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const candidate = input.trim();
    if (!candidate || loading) return;
    setLoading(true);
    setError('');
    const r = await requestReport(candidate);
    if (r.data) {
      saveKey(candidate);
      setOwnerKey(candidate);
      setData(r.data);
      setActivity(r.activity);
      setInput('');
    } else {
      setError(r.error);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    if (loading) return;
    setLoading(true);
    const r = await requestReport(ownerKey);
    if (r.data) {
      setData(r.data);
      setActivity(r.activity);
      setError('');
    } else {
      setError(r.error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearKey();
    setOwnerKey('');
    setData(null);
    setActivity(null);
    setError('');
  };

  const period = PERIODS.find((p) => p.id === periodId);
  const win = useMemo(() => windowFor(period, now), [period, now]);

  const bikes = useMemo(
    () => (data?.bikes ?? []).map((b) => ({ ...b, t: new Date(b.removedAt) })),
    [data]
  );

  const current = useMemo(() => (win ? inRange(bikes, win.start, win.end) : bikes), [bikes, win]);
  const previous = useMemo(() => (win ? inRange(bikes, win.prevStart, win.prevEnd) : null), [bikes, win]);
  const cur = useMemo(() => summarize(current), [current]);
  const prev = useMemo(() => (previous ? summarize(previous) : null), [previous]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const list = inRange(bikes, start, end);
    return {
      key: `${start.getFullYear()}-${start.getMonth()}`,
      short: start.toLocaleDateString('en-US', { month: 'short' }),
      long: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      count: list.length,
      revenue: list.reduce((s, b) => s + b.priceValue, 0),
      active: !win || (start >= win.start && start < win.end),
    };
  }), [bikes, now, win]);

  const leadRate = data && data.totalLeads > 0 ? Math.round((data.helpedSold / data.totalLeads) * 100) : null;

  const summaryText = `Katingin Bikes website: ${plural(cur.count, 'inquiry-assisted sale')}, ${peso(cur.revenue)} in listed value (${period.label.toLowerCase()}).`;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const head = (
    <Helmet>
      <title>Katingin Bikes - Insights</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );

  // ── Key screen ──
  if (!data) {
    return (
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        {head}
        <div className="moto-card p-4 p-sm-5" style={{ width: '100%', maxWidth: '420px' }}>
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'var(--brass-soft)' }}>
              <TrendingUp size={36} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
            </div>
            <h1 className="kb-h3 mb-1">Insights</h1>
            <span className="kb-caption d-block">Katingin Bikes</span>
          </div>
          {loading && !error ? (
            <div className="d-flex justify-content-center py-3">
              <Spinner animation="border" size="sm" variant="accent" />
            </div>
          ) : (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="owner-key">
                <Form.Label className="visually-hidden">Owner key</Form.Label>
                <div className="position-relative">
                  <Lock size={18} strokeWidth={1.75} className="kb-input-icon" aria-hidden="true" />
                  <Form.Control
                    type={showKey ? 'text' : 'password'}
                    placeholder="Owner key"
                    autoComplete="off"
                    className="moto-input moto-input-with-icon moto-input-with-icon-right"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="kb-input-action"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.75} aria-hidden="true" />}
                  </button>
                </div>
              </Form.Group>
              {error && <p className="kb-label text-destructive mb-3" role="alert">{error}</p>}
              <button type="submit" className="moto-btn moto-btn-lg moto-btn-block" disabled={!input.trim() || loading}>
                Unlock
              </button>
            </Form>
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="owner-page" style={{ paddingBottom: '96px' }}>
      {head}
      <div className="container">
        <div className="kb-page-head d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <h1 className="kb-h1 m-0">Insights</h1>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Form.Select
              aria-label="Period"
              className="moto-input"
              style={{ width: 'auto', minHeight: '40px' }}
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
            >
              {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </Form.Select>
            <button onClick={handleRefresh} className="moto-btn moto-btn-outline moto-btn-sm" disabled={loading}>
              <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" /> Refresh
            </button>
            <button onClick={handleLogout} className="moto-btn moto-btn-outline moto-btn-sm">
              <LogOut size={16} strokeWidth={1.75} aria-hidden="true" /> Lock
            </button>
          </div>
        </div>
        {error && <p className="kb-label text-destructive mb-3" role="alert">{error}</p>}

        {/* Hero figure */}
        <div className="moto-card p-4 p-md-5 mb-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
            <div>
              <div className="kb-label mb-2" style={{ color: 'var(--ink-muted)' }}>Sales value influenced · {period.label.toLowerCase()}</div>
              <div className="owner-hero-value">{peso(cur.revenue)}</div>
              <div className="mt-3 d-flex flex-column gap-1">
                {prev && (
                  <Delta diff={cur.revenue - prev.revenue} format={peso} label={win.prevLabel} />
                )}
                <span className="kb-caption">Listed price of bikes that received a financing inquiry and were later removed from the site.</span>
              </div>
            </div>
            <button onClick={handleCopy} className="moto-btn moto-btn-outline moto-btn-sm align-self-md-start">
              {copied
                ? <><Check size={16} strokeWidth={1.75} aria-hidden="true" /> Copied</>
                : <><Copy size={16} strokeWidth={1.75} aria-hidden="true" /> Copy summary</>}
            </button>
          </div>
        </div>

        {/* KPI row */}
        <Row className="g-3 mb-3">
          <Col xs={6} lg={3}>
            <StatTile
              label="Bikes helped sell"
              value={cur.count}
              delta={prev && <Delta diff={cur.count - prev.count} label={win.prevLabel} />}
              sub={cur.count ? `${current.filter((b) => b.removalType === 'sold').length} marked sold · ${current.filter((b) => b.removalType === 'deleted').length} removed` : null}
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatTile
              label="Inquiry to removal"
              value={fmtDays(cur.avgDays)}
              sub="Average, first inquiry to bike gone"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatTile
              label="Inquiries per sale"
              value={cur.inquiriesPerSale == null ? '—' : cur.inquiriesPerSale.toFixed(1)}
              sub="Average on bikes that went"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatTile
              label="Lead-to-sale rate"
              value={leadRate == null ? '—' : `${leadRate}%`}
              sub={`All time · ${plural(data.openLeads, 'bike')} with inquiries still listed`}
            />
          </Col>
        </Row>

        {/* Monthly chart */}
        <div className="moto-card p-4 mb-3">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h2 className="kb-h4 m-0">Bikes helped sell per month</h2>
              <span className="kb-caption">Last 12 months · highlighted months are in the selected period</span>
            </div>
            <button
              className="moto-btn moto-btn-outline moto-btn-sm flex-shrink-0"
              onClick={() => setTableView(!tableView)}
              aria-pressed={tableView}
            >
              {tableView ? 'View chart' : 'View as table'}
            </button>
          </div>
          {tableView ? (
            <Table responsive className="mb-0 align-middle owner-table">
              <thead>
                <tr><th>Month</th><th className="text-end">Bikes</th><th className="text-end">Listed value</th></tr>
              </thead>
              <tbody>
                {[...months].reverse().map((m) => (
                  <tr key={m.key}>
                    <td>{m.long}</td>
                    <td className="text-end kb-num">{m.count}</td>
                    <td className="text-end kb-num">{peso(m.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <MonthlyChart months={months} />
          )}
        </div>

        {/* Bikes list */}
        <h2 className="kb-h4 mb-3">Bikes helped sell · {period.label.toLowerCase()}</h2>
        <div className="moto-card overflow-hidden p-0 mb-4">
          <Table responsive className="mb-0 align-middle">
            <thead>
              <tr>
                <th className="py-3 ps-4">Bike</th>
                <th className="py-3">Listed price</th>
                <th className="py-3 text-end">Inquiries</th>
                <th className="py-3">To removal</th>
                <th className="py-3">Removed</th>
                <th className="py-3 pe-4">How</th>
              </tr>
            </thead>
            <tbody>
              {current.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5" style={{ color: 'var(--ink-muted)' }}>
                    No bikes helped sell in this period yet.
                  </td>
                </tr>
              ) : (
                current.map((b) => (
                  <tr key={`${b.brand}-${b.model}-${b.removedAt}`}>
                    <td className="py-3 ps-4 fw-semibold">{[b.brand, b.model, b.engineSize].filter(Boolean).join(' ')}</td>
                    <td className="py-3 kb-num">{b.price || '—'}</td>
                    <td className="py-3 kb-num text-end">{b.inquiryCount}</td>
                    <td className="py-3 kb-num">{fmtDays(b.daysToClose)}</td>
                    <td className="py-3 kb-num">{fmtDate(b.removedAt)}</td>
                    <td className="py-3 pe-4"><span className="kb-tag">{b.removalType === 'sold' ? 'Marked sold' : 'Removed'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Recently added bikes */}
        {activity && (
          <>
            <h2 className="kb-h4 mb-3">Bikes added</h2>
            <Row className="g-3 mb-3">
              <Col xs={6} lg={3}><StatTile label="Last 24 hours" value={activity.last24h} /></Col>
              <Col xs={6} lg={3}><StatTile label="Last 7 days" value={activity.last7d} /></Col>
              <Col xs={6} lg={3}><StatTile label="Last 30 days" value={activity.last30d} /></Col>
              <Col xs={6} lg={3}><StatTile label="Since tracking began" value={activity.total} /></Col>
            </Row>
            <div className="moto-card overflow-hidden p-0 mb-4">
              <Table responsive className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="py-3 ps-4">Bike</th>
                    <th className="py-3">Listed price</th>
                    <th className="py-3 pe-4">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.events.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5" style={{ color: 'var(--ink-muted)' }}>
                        No bikes added since tracking began.
                      </td>
                    </tr>
                  ) : (
                    activity.events.map((e) => (
                      <tr key={`${e.brand}-${e.model}-${e.addedAt}`}>
                        <td className="py-3 ps-4 fw-semibold">{[e.brand, e.model, e.engineSize].filter(Boolean).join(' ')}</td>
                        <td className="py-3 kb-num">{e.price || '—'}</td>
                        <td className="py-3 pe-4 kb-num">
                          <time dateTime={new Date(e.addedAt).toISOString()}>{fmtDateTime(e.addedAt)}</time>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            <p className="kb-caption mb-4">Shows the 50 most recent. Only bikes added after tracking was switched on are logged.</p>
          </>
        )}

        {/* How it is measured */}
        <div className="moto-card p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Info size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
            <h2 className="kb-label m-0">How this is measured</h2>
          </div>
          <ul className="kb-caption mb-0 ps-3 d-flex flex-column gap-1">
            <li>A bike counts once it has received at least one financing-form inquiry and is later marked sold or removed.</li>
            <li>It is an estimate of inquiry-assisted sales, not confirmed sales: a removal can also be a mistaken listing or a sale made elsewhere.</li>
            <li>Value is the listed price when the bike was last inquired about. Viber, Facebook and email contacts are not tracked.</li>
            <li>Only inquiries made after tracking was switched on are counted.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Owner;
