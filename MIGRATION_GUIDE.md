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
    * *(Optional/VPS Only)* Trigger the cache warmer service in the MongoDB connection success callback. Note: Keep this disabled on ephemeral cloud hosts (like Render Free tier) to prevent high-bandwidth credit usage when the container frequently restarts.
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

