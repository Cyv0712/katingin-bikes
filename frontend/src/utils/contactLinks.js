import { contactInfo } from '../data/contactInfo';
import { bikePath } from '../config/slug';
import { pageUrl } from '../seo/meta';
import { withPeso } from './price';

const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const GENERAL_MESSAGE = "Hi Katingin Bikes, I'd like to ask about your pre-owned bikes.";

/** Opening message for a chat about one unit, with a link back to its page. */
export const bikeInquiryMessage = (bike) => {
  const name = [bike.year, bike.brand, bike.model].filter(Boolean).join(' ');
  return `Hi Katingin Bikes, I'm interested in the ${name} (${withPeso(bike.price)}). ${pageUrl(bikePath(bike))}`;
};

// "https://www.facebook.com/katinginbikess/" -> "katinginbikess"
const messengerHandle = () => (contactInfo.facebook || '').replace(/\/+$/, '').split('/').pop();

/**
 * Contact deep links, shared by Home, Contact, the Footer and Bike detail.
 * Viber uses a different deep-link format on mobile vs desktop; email opens
 * the mail app on mobile and a Gmail compose window on desktop. `message` is
 * the text pre-filled in Viber and Messenger.
 */
export const getContactLinks = ({ message = GENERAL_MESSAGE } = {}) => {
  const isMobile = isMobileDevice();
  const cleanNumber = contactInfo.viber.replace(/^0/, '63');
  const text = encodeURIComponent(message);
  const handle = messengerHandle();

  return {
    isMobile,
    viber: isMobile
      ? `viber://chat/?number=%2B${cleanNumber}&draft=${text}`
      : `viber://chat/?number=+${cleanNumber}&draft=${text}`,
    // m.me opens a chat with the page. The text parameter pre-fills the message
    // where Messenger supports it, and is ignored otherwise.
    messenger: handle ? `https://m.me/${handle}?text=${text}` : contactInfo.facebook,
    call: `tel:+${contactInfo.phone.replace(/^0/, '63')}`,
    email: isMobile
      ? `mailto:${contactInfo.email}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`,
    facebook: contactInfo.facebook,
  };
};

/**
 * onClick for a Viber link: opens the app, or the download page if it isn't
 * installed. Uses the clicked link's own href, so a pre-filled message survives.
 */
export const openViber = (e) => {
  e.preventDefault();
  const viber = e.currentTarget?.getAttribute('href') || getContactLinks().viber;

  // Open a new tab in about:blank state first
  const newTab = window.open('about:blank', '_blank');
  if (!newTab) return;

  // Direct the new tab to the deep link scheme
  newTab.location.href = viber;

  // If the tab is still on about:blank after 2 seconds, Viber isn't installed.
  // Redirect the user to the official download page instead.
  setTimeout(() => {
    try {
      if (!newTab.closed) {
        if (newTab.location.href === 'about:blank' || newTab.location.href.startsWith('viber://')) {
          newTab.location.href = 'https://www.viber.com/en/download/';
        }
      }
    } catch {
      // Safe to ignore: a cross-origin error means it successfully navigated or launched
    }
  }, 2000);
};
