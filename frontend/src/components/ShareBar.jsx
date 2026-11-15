import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle } from 'lucide-react';
import { FiFacebook } from 'react-icons/fi';
import { track } from '../utils/analytics';

// The shared link carries utm tags, so a visit (and an inquiry) that comes from a
// share shows up as such in the "Came from" line of the notification email and on
// the insights page. The page it lands on is unchanged: it ignores the tags and
// its canonical URL has none.
const tagged = (url, source, medium) => {
  const u = new URL(url);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  return u.toString();
};

const canNativeShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // clipboard API unavailable (insecure context, old browser): fall back to a hidden field
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
};

/**
 * "Share this bike". On phones the system share sheet (Messenger, Viber, Facebook,
 * and whatever else is installed); elsewhere direct Facebook and Viber links.
 * Copy link is always there.
 */
const ShareBar = ({ url, text, bikeName }) => {
  const [copied, setCopied] = useState(null); // null | 'ok' | 'failed'
  const native = canNativeShare();

  const onNative = async () => {
    track('share_click', { channel: 'native', bike: bikeName });
    try {
      await navigator.share({ title: bikeName, text, url: tagged(url, 'share', 'native') });
    } catch {
      // closed without sharing: nothing to do
    }
  };

  const onCopy = async () => {
    track('share_click', { channel: 'copy', bike: bikeName });
    setCopied((await copyText(tagged(url, 'copy', 'share'))) ? 'ok' : 'failed');
    setTimeout(() => setCopied(null), 2500);
  };

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tagged(url, 'facebook', 'share'))}`;
  const viber = `viber://forward?text=${encodeURIComponent(`${text} ${tagged(url, 'viber', 'share')}`)}`;

  return (
    <div className="d-flex flex-column align-items-start gap-2 w-100">
      <span className="kb-label">Share this bike</span>
      <div className="d-flex flex-wrap gap-2">
        {native ? (
          <button type="button" className="moto-btn moto-btn-outline moto-btn-sm" onClick={onNative}>
            <Share2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Share
          </button>
        ) : (
          <>
            <a
              href={facebook}
              target="_blank"
              rel="noreferrer"
              className="moto-btn moto-btn-outline moto-btn-sm"
              onClick={() => track('share_click', { channel: 'facebook', bike: bikeName })}
            >
              <FiFacebook size={16} strokeWidth={1.75} aria-hidden="true" />
              Facebook
            </a>
            <a
              href={viber}
              className="moto-btn moto-btn-outline moto-btn-sm"
              onClick={() => track('share_click', { channel: 'viber', bike: bikeName })}
            >
              <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
              Viber
            </a>
          </>
        )}
        <button type="button" className="moto-btn moto-btn-outline moto-btn-sm" onClick={onCopy} aria-live="polite">
          {copied === 'ok' ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <Link2 size={16} strokeWidth={1.75} aria-hidden="true" />}
          {copied === 'ok' ? 'Link copied' : copied === 'failed' ? "Couldn't copy" : 'Copy link'}
        </button>
      </div>
    </div>
  );
};

export default ShareBar;
