# Production Mirroring & Migration Guide 🚀
This guide outlines the recent high-performance, security, SEO, and structural updates implemented in **Katingin Bikes**. Use this list to mirror these changes in the clone site (**Jett Lau Done Deal**).

---

## 📦 1. Frontend Bundler Code Splitting (Vite)
* **Goal:** Reduce main bundle size, improve LCP/FCP, and enable modular browser caching.
* **File to modify/create:** `frontend/vite.config.js`
* **Changes:** Configure `manualChunks` in the Rollup build options:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('gsap')) return 'vendor-gsap';
              if (id.includes('react-bootstrap') || id.includes('bootstrap')) return 'vendor-bootstrap';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('react-icons')) return 'vendor-icons';
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
              return 'vendor-others';
            }
          }
        }
      }
    }
  })
  ```

---

## 🚦 2. React Dynamic Routing & Error Boundaries
* **Goal:** Load pages dynamically on-demand and prevent blank screens on network failures.
* **Files to create/modify:**
  * **`frontend/src/components/ErrorBoundary.jsx` [NEW]:** Standard class component to catch chunk-loading failures and show a themed reconnect banner with a retry trigger (`window.location.reload()`).
  * **`frontend/src/pages/NotFound.jsx` [NEW]:** Custom gold/dark themed 404 page.
  * **`frontend/src/App.jsx`:**
    * Convert static route imports to lazy loads:
      `const Home = lazy(() => import('./pages/Home'));`
    * Wrap `<Suspense>` inside the `<ErrorBoundary>` component.
    * Add a catch-all route at the bottom of `<Routes>`:
      `<Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />`

---

## ⚡ 3. Asset & CSS Optimization
* **Goal:** Maximize paint performance and meet accessibility guidelines.
* **Hero Image Load:**
  * In `frontend/index.html`, add a high-priority preload tag:
    `<link rel="preload" as="image" href="HERO_IMAGE_URL" fetchpriority="high" />`
  * In `frontend/src/components/SplashScreen.jsx`, add `fetchPriority="high"` to the rendered hero `<img>` tag and set `preload.fetchPriority = 'high';` in the `useEffect` preloading logic.
* **Tagline Lag Fix:**
  * Avoid animating CSS properties like `letter-spacing` in GSAP.
  * Define static spacing in `index.css`:
    ```css
    .splash-tagline {
      letter-spacing: 4px;
      will-change: transform, opacity;
    }
    ```
  * Only animate `opacity` and `y` (translateY) in the GSAP tagline timeline.
* **A11y (Accessibility) Contrast Checks:**
  * Ensure text color contrast ratio is greater than 4.5:1. 
  * Update `--text-muted` or secondary classes in `index.css` to a brighter shade.
  * Add descriptive `aria-label` tags to navbar buttons and social media icons in the footer.
* **Media Compression:**
  * Switch raw images to compressed WebP formats (`.webp`).
  * Add `loading="lazy"` to secondary/below-the-fold images (showroom lists, buyer avatars).

---

## 🧹 4. GSAP Memory Leak Prevention
* **Goal:** Ensure animations unmount cleanly without holding references.
* **File to modify:** `frontend/src/components/SplashScreen.jsx`
* **Changes:** Wrap splash timeline initializations within `gsap.context()` and return its `revert()` cleanup callback in `useEffect`:
  ```javascript
  useEffect(() => {
    const ctx = gsap.context(() => {
      // timeline animations here
    }, containerRef);

    return () => ctx.revert(); // clean up memory leaks
  }, []);
  ```

---

## 🛡️ 5. Admin Security & Token Expirations
* **Goal:** Terminate expired user sessions gracefully.
* **File to modify:** `frontend/src/pages/Admin.jsx`
* **Changes:** 
  * Add a helper to clear tokens and storage:
    ```javascript
    const handleUnauthorized = () => {
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      alert('Session expired. Please log in again.');
    };
    ```
  * Intercept API request responses. If the server returns a `401 Unauthorized` status on POST/PATCH/DELETE calls, trigger `handleUnauthorized()`.

---

## 📈 6. SEO Search Crawl Indexing
* **Goal:** Direct search engines to index legitimate public routes.
* **Files to create (in `frontend/public/`):**
  * **`robots.txt`:** Allow indexation of `/`, `/inventory`, etc. Disallow `/admin` routes.
  * **`sitemap.xml`:** Map key navigation endpoints with priority weighting.

---

## 🖼️ 7. Image Optimization Proxy & On-Demand Caching
* **Goal:** Use Cloudinary purely for file storage (0 dynamic transformation credits), minimize bandwidth, and achieve instant page loads without a first-load cold start.
* **Files to modify/create:**
  * **`backend/server.js`:**
    * Add global DNS resolution preference at the very top to prevent Happy Eyeballs IPv6 timeout bugs in cloud containers (like Render):
      ```javascript
      const dns = require('dns');
      dns.setDefaultResultOrder('ipv4first');
      ```
    * **Trigger Cache Warmer:** Trigger the cache warmer service in the MongoDB connection success callback. *Note: If hosting on a free ephemeral container (like Render Free tier), this is highly recommended only if you use a service like UptimeRobot to keep the website from sleeping. Since UptimeRobot keeps the container awake, the server only restarts once per day (during Render's automatic 24h recycling), meaning the cache warm-up runs only once daily. This secures instant image loading for all users at a minimal cost of ~1.8 credits/month.*
      ```javascript
      mongoose.connect(MONGO_URI).then(() => {
        console.log('Connected to MongoDB');
        const { warmImageCache } = require('./utils/cacheWarmer');
        warmImageCache().catch(err => console.error('[Startup] Cache warmer error:', err));
      });
      ```
  * **`backend/utils/download.js` [NEW]:**
    * Downloader utility using Node's native `https` module to download images. This respects the custom DNS setting and avoids the Undici IPv6 timeout bug.
  * **`backend/utils/cacheWarmer.js` [NEW/OPTIONAL]:**
    * Background script that queries the database for active listing images on startup, checks if they exist in `backend/cache/`, and optimizes any missing ones to WebP sequentially with a 500ms throttle delay. (Only run this if hosting on a platform with persistent disk storage).
  * **`backend/utils/imageStorage.js`:**
    * Import `sharp` and create an `optimizeImageBuffer(buffer)` helper (max dimensions 1200x1200px, WebP format, quality 80).
    * Optimize buffer in-memory inside `uploadBufferToCloudinary` and `writeBufferToDisk` before writing.
  * **`backend/routes/bikes.js`:**
    * Set up a `/image-proxy` GET endpoint.
    * Checks if the requested Cloudinary URL exists as an optimized `.webp` file inside `backend/cache/` (using an MD5 hash of the URL as filename).
    * If cached, streams it instantly using `res.sendFile()`.
    * If not cached, downloads it once using the `downloadImage` helper, optimizes it, caches it to disk, and serves it.
    * Sets cache headers: `Cache-Control: public, max-age=31536000, immutable`.
  * **`frontend/src/config/api.js`:**
    * Update `toAbsoluteUploadUrl(path)` to detect `res.cloudinary.com` URLs, strip out any legacy transformation segments (e.g. `/f_auto,q_auto/`), and return the proxied URL:
      ```javascript
      return apiUrl(`/api/bikes/image-proxy?url=${encodeURIComponent(cleanPath)}`);
      ```

---

## ✉️ 8. Resend Email Integration (Bypassing Render SMTP Block)
* **Goal:** Send inquiry emails from Render's free tier, which blocks all outbound SMTP ports (25, 465, 587).
* **Files to modify:**
  * **`backend/routes/inquiries.js`:**
    * Remove `nodemailer` import and SMTP transport setup.
    * Fetch Resend credentials from environment variables (`RESEND_API_KEY`, `INQUIRY_RECEIVER_EMAIL`, `RESEND_SENDER_EMAIL`).
    * Send the HTML email via a native `fetch()` POST request to Resend's HTTP API: `https://api.resend.com/emails` (operating over unblocked port 443).
  * **`backend/.env`:**
    * Add variables:
      ```env
      RESEND_API_KEY=re_your_api_key
      RESEND_SENDER_EMAIL=onboarding@resend.dev (or verified domain address)
      INQUIRY_RECEIVER_EMAIL=your_signup_email@gmail.com
      ```

---

## 🛠️ 9. Advanced Admin Operations (Edit, Sold, & Delete)
* **Goal:** Provide secure, full-lifecycle operations on inventory listings, ensuring automatic cleanup of media files on disk and Cloudinary to safeguard storage capacity and bandwidth limits.
* **Files to modify/create:**
  * **`backend/routes/bikes.js`:**
    * **`PUT /:id` (Edit Route):** Checks if the listing exists. If new files are uploaded, delete existing images using `deleteBikeImages` and upload new ones. If no files are uploaded, look for `req.body.existingImages` to retain the current image/thumbnail order:
      ```javascript
      if (req.files?.length) {
        await deleteBikeImages(existing.images);
        bikeData.images = await persistUploadedImages(req.files);
      } else if (req.body.existingImages) {
        bikeData.images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }
      ```
    * **`PATCH /:id/sold` (Sold Route):** To keep the database lightweight and comply with storage limits, mark the status as `'Sold'`, delete all associated listing images, and unset all detailed specification fields using MongoDB's `$unset` operator:
      ```javascript
      await deleteBikeImages(bike.images);
      const updatedBike = await Bike.findByIdAndUpdate(
        req.params.id,
        {
          $set: { status: 'Sold' },
          $unset: {
            edition: 1, type: 1, year: 1, mileage: 1, description: 1, issues: 1,
            engineSize: 1, engineConfig: 1, power: 1, transmission: 1, fuelCapacity: 1, images: 1
          }
        },
        { new: true }
      );
      ```
    * **`DELETE /:id` (Delete Route):** Delete all uploaded image files in storage and remove the listing document from the database.
  * **`frontend/src/pages/Admin.jsx`:**
    * **Combined Identity Parser:** Instead of filling brand, model, and engine size in separate inputs, parse them on submission from a single `combinedIdentity` string (e.g. `KAWASAKI Z 1000 1000cc`):
      * Brand: First word.
      * Engine Size: Numeric word or word ending in "cc" (converted to upper case `CC` and formatted as `X cc`).
      * Model: Remaining words joined together.
    * **Input Safeguards:** Validate on input change. If numeric fields (`year`, `mileage`, `price`) are less than `0`, reject. Limit text fields (excluding description) to a maximum of 50 characters.
    * **Thumbnail Manager:** Display preview cards of uploaded files (or current images). Clicking any card moves it to index `0` of the array to designate it as the primary thumbnail.
    * **Confirmation Modals:** Wrap delete and sold actions inside secure React-Bootstrap `<Modal>` prompts.

---

## 📋 10. Financing Inquiry System & Privacy-Compliant Emails
* **Goal:** Collect user applications for financing options and dispatch them to one or more admin email addresses without storing sensitive user details in the database to satisfy the Data Privacy Act.
* **Files to modify/create:**
  * **`frontend/src/pages/Financing.jsx` [NEW]:**
    * Fetch active available units on mount (`status === 'Available'`) to populate a dynamic dropdown selector.
    * Read `?bikeName=` query parameter to auto-select a motorcycle model if the user clicked from a specific inventory profile.
    * Limit contact number inputs to a maximum of 20 characters and require confirmation of a privacy policy consent checkbox before enabling the submit button.
  * **`backend/routes/inquiries.js` [NEW]:**
    * **Multi-Recipient Email Support:** Parse a comma-separated list of recipient emails from environment variables:
      ```javascript
      const recipients = receiverEmail.split(',').map(email => email.trim()).filter(Boolean);
      ```
    * **Input Escaper:** Escape incoming strings to prevent HTML injection inside email layouts:
      ```javascript
      const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      ```
    * **Zero-Persistence Routing:** Do not write submission data to MongoDB. Only validate, sanitize, build the HTML email template, and transmit it via a POST fetch to Resend's API.

---

## 📲 11. Device-Aware Deep Links & App Detection Fallbacks
* **Goal:** Provide immediate, device-tailored contact channels that open native apps on mobile and fallback gracefully on desktop.
* **Files to modify/create:**
  * **`frontend/src/pages/Contact.jsx`:**
    * **Gmail Redirect:** Detect mobile users. On mobile, fire a standard `mailto:` link. On desktop, bypass external mail clients and redirect to the web-based Gmail composer in a new tab:
      ```javascript
      const emailLink = isMobile
        ? `mailto:${contactInfo.email}`
        : `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`;
      ```
    * **Viber Detection Fallback:** On mobile and desktop, trigger deep link schema `viber://chat/?number=...`. Open the link inside a new window (`about:blank`) first. If the page is still loading the app protocol after 2-seconds (meaning Viber is not installed), redirect the user to the official Viber installer page:
      ```javascript
      const handleViberClick = (e) => {
        e.preventDefault();
        const newTab = window.open('about:blank', '_blank');
        if (!newTab) return;
        newTab.location.href = viberLink;
        setTimeout(() => {
          try {
            if (!newTab.closed && (newTab.location.href === 'about:blank' || newTab.location.href.startsWith('viber://'))) {
              newTab.location.href = 'https://www.viber.com/en/download/';
            }
          } catch (err) {}
        }, 2000);
      };
      ```

---

## 🎭 12. Session-Aware Splash Screen & Scroll Control
* **Goal:** Render a cinematic entry animation on first landing while preventing unnecessary load lag on standard refreshes and cleaning up animation references to prevent memory leaks.
* **Files to modify/create:**
  * **`frontend/src/App.jsx`:**
    * **Bypass State Check:** Initialize the splash display state using a function that reads `sessionStorage` to verify if the user has already loaded the site in their current tab session:
      ```javascript
      const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('hasSeenSplash'));
      ```
    * **Scroll Lock:** Lock body scrolling while the splash is playing:
      ```javascript
      useEffect(() => {
        document.body.style.overflow = showSplash ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
      }, [showSplash]);
      ```
    * **Session Registry:** Set `sessionStorage.setItem('hasSeenSplash', 'true')` when the splash triggers its completion callback.
  * **`frontend/src/components/SplashScreen.jsx`:**
    * **Memory Leak Cleanup:** Wrap GSAP animations inside `gsap.context()` and return its `revert()` cleanup command in the unmount callback:
      ```javascript
      useEffect(() => {
        const ctx = gsap.context(() => {
          // GSAP timeline sequences
        }, containerRef);
        return () => ctx.revert();
      }, [onComplete]);
      ```


