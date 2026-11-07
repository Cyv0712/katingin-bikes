import { contactInfo } from '../data/contactInfo';

const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Contact deep links, shared by Home, Contact, the Footer and Bike detail.
 * Viber uses a different deep-link format on mobile vs desktop; email opens
 * the mail app on mobile and a Gmail compose window on desktop.
 */
export const getContactLinks = () => {
  const isMobile = isMobileDevice();
  const cleanNumber = contactInfo.viber.replace(/^0/, '63');

  return {
    isMobile,
    viber: isMobile
      ? `viber://chat/?number=%2B${cleanNumber}&draft=$hello`
      : `viber://chat/?number=+${cleanNumber}&draft=$hello`,
    email: isMobile
      ? `mailto:${contactInfo.email}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`,
    facebook: contactInfo.facebook,
  };
};

/** onClick for a Viber link: opens the app, or the download page if it isn't installed. */
export const openViber = (e) => {
  e.preventDefault();
  const { viber } = getContactLinks();

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
