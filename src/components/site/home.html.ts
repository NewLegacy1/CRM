// Generated from docs/design/mocks; static, trusted markup for the marketing pages.
const html = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="arr" viewBox="0 0 16 16"><path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="left" viewBox="0 0 16 16"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="right" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>

<header class="site-header">
  <div class="wrap">
    <a class="wordmark display" href="/">New Legacy</a>
    <nav class="site-nav" aria-label="Main">
      <a href="#work">Work</a>
      <a href="#services">Services</a>
      <a href="#process">Process</a>
      <a class="btn" href="#contact">Start a project</a>
    </nav>
  </div>
</header>

<main>
<!-- 1. Entrance: two beats. Production keeps the Three.js galaxy; this mock stands it in with the captured plates. -->
<div class="entrance">
  <div class="scene">
    <canvas class="sky" aria-hidden="true"></canvas>
    <div class="space" aria-hidden="true"></div>
    <div class="ridge" aria-hidden="true"></div>
    <div class="veil" aria-hidden="true"></div>

    <div class="beat beat-one" aria-hidden="true">
      <div class="display">New Legacy</div>
      <p>Websites, software and AI.</p>
    </div>

    <div class="beat beat-two">
      <div class="wrap">
        <div>
          <h1 class="display">Software and websites, built around how your business works.</h1>
          <p class="lede">We design and build booking systems, storefronts, internal tools and practical AI. Every project on this page is running a real business today.</p>
          <div class="actions">
            <a class="btn" href="#contact">Start a project</a>
            <a class="btn ghost" href="#work">See the work</a>
          </div>
        </div>
        <nav class="apps" aria-label="Products we built">
          <a href="/work/detailops" data-preview="/site/do-today.webp"><img src="/site/detailops-brandmark.webp" alt=""><span>DetailOps</span></a>
          <a href="#ownlane" data-preview="/site/ol-dashboard.webp"><span class="ol-dot" aria-hidden="true"></span><span>Ownlane</span></a>
          <a href="#ecomops" data-preview="/site/eo-tests.webp"><svg viewBox="0 0 64 56" aria-hidden="true"><g fill="none" stroke-width="8"><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#C5E1F6" stroke-dasharray="15.24 200"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#8ADAE2" stroke-dasharray="15.24 200" stroke-dashoffset="-19.24"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#59E0CA" stroke-dasharray="15.24 200" stroke-dashoffset="-38.48"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#1FA99A" stroke-dasharray="15.24 200" stroke-dashoffset="-57.72"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#0B7F8C" stroke-dasharray="15.24 200" stroke-dashoffset="-76.96"/></g><path d="M32 36L41 20.4" stroke="#E6F4F6" stroke-width="5.5" stroke-linecap="round"/><circle cx="32" cy="36" r="5.5" fill="#E6F4F6"/></svg><span>EcomOps</span></a>
        </nav>
      </div>
    </div>
    <div class="index-preview" aria-hidden="true"><img alt="" src="/site/do-today.webp"></div>
  </div>
</div>

<!-- 2. Flagship work -->
<section id="work" class="section" style="padding-bottom:40px">
  <div class="wrap">
    <div class="section-head">
      <h2 class="display">Four products we designed and built.</h2>
      <p>These are the real screens. Switch between them, scroll the long ones, and try the parts that are public.</p>
    </div>

    <article class="chapter" id="detailops" style="--tone:#3b3157">
      <div class="ch-copy">
        <div class="ch-brand"><img src="/site/detailops-brandmark.webp" alt=""></div>
        <h3 class="ch-name display">DetailOps</h3>
        <p class="ch-line">From first booking to final invoice.</p>
        <p class="ch-body">Booking and operations software for auto detailers. Customers book and pay a deposit online, the shop plans the week, and the crew sees the next stop from a phone.</p>
        <dl class="facts">
          <div><dt>Type</dt><dd>Software product</dd></div>
          <div><dt>Built</dt><dd>Booking, deposits, scheduling, routes, invoicing</dd></div>
          <div><dt>Status</dt><dd>Live, used by 500+ detailers</dd></div>
        </dl>
        <a class="text-link" href="/work/detailops">Read the case study <svg><use href="#arr"/></svg></a>
      </div>
      <div class="stage has-phone" data-viewer>
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i><span class="url">app.detailops.ca</span></div>
          <div class="screen">
            <div class="shot fit"><img src="/site/do-today.webp" alt="DetailOps Today page for the Northline demo shop"></div>
            <div class="shot fit"><img src="/site/do-schedule-new.webp" alt="DetailOps week schedule"></div>
            <div class="shot fit"><img src="/site/do-customer.webp" alt="DetailOps customer record"></div>
            <span class="scroll-hint">Scroll inside</span>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="DetailOps screens">
          <button role="tab" data-url="app.detailops.ca/today" data-caption="The owner opens to today: money booked, jobs done and the crew’s route on a timeline. Northline demo shop.">Today</button>
          <button role="tab" data-url="app.detailops.ca/schedule" data-caption="The whole week, with each day’s jobs and takings at a glance.">Schedule</button>
          <button role="tab" data-url="app.detailops.ca/customers" data-caption="Every customer’s vehicles, visits, notes and preferences in one record.">Customer</button>
        </div>
        <p class="tab-caption"></p>
        <div class="phone" data-live>
          <div class="glass">
            <img src="/site/detailops-mobile.webp" alt="">
            <iframe title="DetailOps live demo booking page" data-src="https://www.detailops.ca/book/demo" loading="lazy"></iframe>
            <button class="shield" type="button"><span>Try the live booking page</span></button>
          </div>
          <div class="phone-label"><span class="live-dot">Live demo booking</span></div>
        </div>
      </div>
    </article>

    <article class="chapter flip" id="ownlane" style="--tone:#4a463d">
      <div class="ch-copy">
        <h3 class="ch-name display">Ownlane</h3>
        <p class="ch-line">An independent checkout, built in-house.</p>
        <p class="ch-body">A branded checkout and the merchant dashboard behind it. Stores set their own offers and upgrades instead of living with a platform's defaults.</p>
        <dl class="facts">
          <div><dt>Type</dt><dd>Software product</dd></div>
          <div><dt>Built</dt><dd>Shopper checkout, merchant dashboard, post-purchase offers</dd></div>
          <div><dt>Shown</dt><dd>Demo storefront, sample data</dd></div>
        </dl>
      </div>
      <div class="stage has-phone" data-viewer>
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i><span class="url">merchant.ownlane.app</span></div>
          <div class="screen">
            <div class="shot fit"><img src="/site/ol-dashboard.webp" alt="Ownlane merchant dashboard with revenue and bestsellers"></div>
            <div class="shot fit"><img src="/site/ol-analytics.webp" alt="Ownlane checkout analytics and funnel"></div>
            <div class="shot fit"><img src="/site/ol-checkout.webp" alt="Ownlane branded checkout"></div>
            <div class="shot fit"><img src="/site/ol-offer.webp" alt="Ownlane post-purchase subscription offer"></div>
            <span class="scroll-hint">Scroll inside</span>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="Ownlane screens">
          <button role="tab" data-url="glow.ownlane.app/dashboard" data-caption="Revenue, subscriptions and bestsellers for the last 30 days. Demo store, sample data.">Dashboard</button>
          <button role="tab" data-url="glow.ownlane.app/analytics" data-caption="Where shoppers drop off between opening checkout and paying, and when they buy.">Analytics</button>
          <button role="tab" data-url="checkout.ownlane.app" data-caption="The shopper’s checkout, in the store’s own branding.">Checkout</button>
          <button role="tab" data-url="checkout.ownlane.app/offer" data-caption="After paying, an optional switch to subscribe and save, refunded instantly.">Upgrade offer</button>
        </div>
        <p class="tab-caption"></p>
        <div class="phone">
          <div class="glass"><img src="/site/ol-checkout-phone.webp" alt="Ownlane checkout on a phone"></div>
          <div class="phone-label">Checkout on a phone</div>
        </div>
      </div>
    </article>

    <article class="chapter" id="ecomops" style="--tone:#1d4b49">
      <div class="ch-copy">
        <div class="ch-brand"><span class="eo-logo"><svg viewBox="0 0 64 56" width="40" height="35" role="img" aria-label="EcomOps"><g fill="none" stroke-width="8"><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#C5E1F6" stroke-dasharray="15.24 200"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#8ADAE2" stroke-dasharray="15.24 200" stroke-dashoffset="-19.24"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#59E0CA" stroke-dasharray="15.24 200" stroke-dashoffset="-38.48"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#1FA99A" stroke-dasharray="15.24 200" stroke-dashoffset="-57.72"/><path d="M12.95 47A22 22 0 1 1 51.05 47" stroke="#0B7F8C" stroke-dasharray="15.24 200" stroke-dashoffset="-76.96"/></g><path d="M32 36L41 20.4" stroke="#E6F4F6" stroke-width="5.5" stroke-linecap="round"/><circle cx="32" cy="36" r="5.5" fill="#E6F4F6"/></svg><span>ecomops</span></span></div>
        <h3 class="ch-name display">EcomOps</h3>
        <p class="ch-line">One place to see what needs attention.</p>
        <p class="ch-body">An operations console for running several online stores. Orders, ad tests and funnel data sit together, and the assistant, Cleo, prepares explanations for an operator to review.</p>
        <dl class="facts">
          <div><dt>Type</dt><dd>Internal software</dd></div>
          <div><dt>Built</dt><dd>Store console, ad testing, funnel tracing, AI assistant</dd></div>
          <div><dt>Shown</dt><dd>Sample data, generic store names</dd></div>
        </dl>
      </div>
      <div class="stage has-phone" data-viewer>
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i><span class="url">ops.newlegacy</span></div>
          <div class="screen">
            <div class="shot fit"><img src="/site/eo-tests.webp" alt="EcomOps ad tests in light mode for the Sable Home demo store"></div>
            <div class="shot fit"><img src="/site/eo-today.webp" alt="EcomOps Today view in light mode"></div>
            <span class="scroll-hint">Scroll inside</span>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="EcomOps screens">
          <button role="tab" data-url="ops.newlegacy/tests" data-caption="Each ad test against its target cost per order, with a clear call on what to carry forward. Sable Home demo store.">Ad tests</button>
          <button role="tab" data-url="ops.newlegacy/today" data-caption="Today’s spend, sales and the live order stream, with a plain-English read on how the day is going.">Today</button>
        </div>
        <p class="tab-caption"></p>
        <div class="phone">
          <div class="glass"><img src="/site/eo-live-phone.webp" alt="EcomOps live order stream on a phone, dark mode"></div>
          <div class="phone-label">Live orders, dark mode</div>
        </div>
      </div>
    </article>

    <article class="chapter flip" id="forge" style="--tone:#6c3822">
      <div class="ch-copy">
        <div class="ch-brand"><img src="/site/forge-brandmark.webp" alt=""></div>
        <h3 class="ch-name display">Forge</h3>
        <p class="ch-line">From brand context to finished creative.</p>
        <p class="ch-body">A workspace for making ad creative. Brand guidelines, references and briefs feed image and video generation, and the direction and estimated cost are shown before anything runs.</p>
        <dl class="facts">
          <div><dt>Type</dt><dd>Software product</dd></div>
          <div><dt>Built</dt><dd>Brand context, video briefs, generation with cost review</dd></div>
          <div><dt>Shown</dt><dd>Current rebuild</dd></div>
        </dl>
      </div>
      <div class="stage has-phone" data-viewer>
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i><span class="url">forge.app/create</span></div>
          <div class="screen">
            <div class="shot fit"><img src="/site/fg-create.webp" alt="Forge: start a new ad from a template"></div>
            <div class="shot fit"><img src="/site/fg-editor.webp" alt="Forge ad editor with an animated story ad and timeline"></div>
            <div class="shot fit"><img src="/site/fg-review.webp" alt="Forge shows the exact prompt and cost before generating"></div>
            <span class="scroll-hint">Scroll inside</span>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="Forge screens">
          <button role="tab" data-url="forge.app/create" data-caption="Pick the shape of the ad, write or draft the script, then approve it before anything is paid for.">Start an ad</button>
          <button role="tab" data-url="forge.app/ads/editor" data-caption="Edit the finished story ad scene by scene, with an assistant beside the timeline.">Ad editor</button>
          <button role="tab" data-url="forge.app/create/review" data-caption="Before generating, Forge shows exactly what it will send and what it will cost.">Cost check</button>
        </div>
        <p class="tab-caption"></p>
        <div class="phone">
          <div class="glass"><img src="/site/fg-create-phone.webp" alt="Forge: start a new ad from a template, on a phone"></div>
          <div class="phone-label">Start an ad on a phone</div>
        </div>
      </div>
    </article>
  </div>
</section>

<!-- 3. Live websites -->
<section id="sites" class="section sites">
  <div class="wrap">
    <div class="section-head" style="grid-template-columns:1fr auto">
      <div>
        <h2 class="display">Websites and storefronts.</h2>
        <p style="justify-self:start;margin-top:20px">Tap a phone and scroll. Most of these are the live sites running inside the page.</p>
      </div>
      <div class="track-controls">
        <button class="round" type="button" data-track="-1" aria-label="Previous sites"><svg><use href="#left"/></svg></button>
        <button class="round" type="button" data-track="1" aria-label="Next sites"><svg><use href="#right"/></svg></button>
      </div>
    </div>
  </div>
  <div class="site-track">
    <article class="site-card">
      <div class="phone"><div class="glass"><div class="tall"><img src="/site/detailops-site-mobile.webp" alt="The DetailOps marketing site on a phone, full length"></div></div></div>
      <h3 class="display">DetailOps</h3><p>Product site for auto detailers</p>
      <div class="row"><span class="muted" style="font-size:13px">Scroll the phone</span><a class="text-link" href="https://www.detailops.ca/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
    <article class="site-card">
      <div class="phone" data-live><div class="glass"><img src="/site/showroom-mobile.webp" alt=""><iframe title="ShowRoom AutoCare live site" data-src="https://www.showroomautocare.ca/"></iframe><button class="shield" type="button"><span>Scroll the live site</span></button></div></div>
      <h3 class="display">ShowRoom AutoCare</h3><p>Mobile detailing, Hamilton and the GTA</p>
      <div class="row"><span class="live-dot">Live</span><a class="text-link" href="https://www.showroomautocare.ca/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
    <article class="site-card">
      <div class="phone" data-live><div class="glass"><img src="/site/jay-mobile.webp" alt=""><iframe title="Jay That Drain Guy live site" data-src="https://www.jaythatdrainguy.ca/"></iframe><button class="shield" type="button"><span>Scroll the live site</span></button></div></div>
      <h3 class="display">Jay That Drain Guy</h3><p>Emergency drain service, Hamilton and the GTA</p>
      <div class="row"><span class="live-dot">Live</span><a class="text-link" href="https://www.jaythatdrainguy.ca/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
    <article class="site-card">
      <div class="phone" data-live><div class="glass"><img src="/site/dear-latte-mobile.webp" alt=""><iframe title="Dear Latte live storefront" data-src="https://dearlatte.shop/"></iframe><button class="shield" type="button"><span>Scroll the live site</span></button></div></div>
      <h3 class="display">Dear Latte</h3><p>Storefront for a latte stencil camera</p>
      <div class="row"><span class="live-dot">Live</span><a class="text-link" href="https://dearlatte.shop/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
    <article class="site-card">
      <div class="phone" data-live><div class="glass"><img src="/site/saha-buy.webp" alt=""><iframe title="Saha live shop page" data-src="https://mysaha.shop/shop"></iframe><button class="shield" type="button"><span>Scroll the live site</span></button></div></div>
      <h3 class="display">Saha</h3><p>Shop page and bundle builder</p>
      <div class="row"><span class="live-dot">Live</span><a class="text-link" href="https://mysaha.shop/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
    <article class="site-card">
      <div class="phone" data-live><div class="glass"><img src="/site/aerase-buy.webp" alt=""><iframe title="Aerase live shop page" data-src="https://aerase.shop/shop/her"></iframe><button class="shield" type="button"><span>Scroll the live site</span></button></div></div>
      <h3 class="display">Aerase</h3><p>Shop page and offer picker</p>
      <div class="row"><span class="live-dot">Live</span><a class="text-link" href="https://aerase.shop/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
    <article class="site-card">
      <div class="phone" data-live><div class="glass"><img src="/site/motordoc-mobile.webp" alt=""><iframe title="MotorDoc site preview" data-src="https://motordoc.vercel.app/"></iframe><button class="shield" type="button"><span>Scroll the site</span></button></div></div>
      <h3 class="display">MotorDoc</h3><p>Auto repair, Hamilton</p>
      <div class="row"><span class="muted" style="font-size:13px">Preview build</span><a class="text-link" href="https://motordoc.vercel.app/" target="_blank" rel="noreferrer">Visit <svg><use href="#arr"/></svg></a></div>
    </article>
  </div>
</section>

<!-- 4. Client voices -->
<section class="section" id="voices">
  <div class="wrap">
    <div class="voice-picker" role="tablist" aria-label="Clients">
      <button role="tab" aria-selected="true" aria-controls="v-nathan"><strong>Nathan</strong>ShowRoom AutoCare</button>
      <button role="tab" aria-selected="false" aria-controls="v-jay"><strong>Jay</strong>Jay That Drain Guy</button>
      <button role="tab" aria-selected="false" aria-controls="v-will"><strong>Will</strong>DetailOps</button>
    </div>
    <div class="voice-panel" id="v-nathan">
      <div class="voices-grid">
        <div>
          <blockquote class="voice display">“We needed a site that matched how we work in the field. Clear packages, strong local presence, and a booking path that doesn’t waste our time on the phone. It looks premium, ranks where we need it to, and feeds straight into DetailOps so the crew stays moving.”</blockquote>
          <div class="voice-by"><img src="https://showroomautocare.ca/logo.png" alt=""><div><strong>Nathan</strong>ShowRoom AutoCare, Hamilton</div></div>
        </div>
        <ul class="voice-facts">
          <li><b>135+</b><span>five-star Google reviews</span></li>
          <li><b>500+</b><span>vehicles detailed</span></li>
          <li><b>430+</b><span>clients</span></li>
        </ul>
      </div>
    </div>
    <div class="voice-panel" id="v-jay" hidden>
      <div class="voices-grid">
        <div>
          <blockquote class="voice display">“When someone’s drain is backing up at midnight, your site has one job: make them trust you enough to call. New Legacy built exactly that. Fast, mobile-first, emergency-first, and tuned for every city we cover. I’m proud to send people to it.”</blockquote>
          <div class="voice-by"><img src="https://www.jaythatdrainguy.ca/favicon.png" alt=""><div><strong>Jay</strong>Jay That Drain Guy, Hamilton and the GTA</div></div>
        </div>
        <ul class="voice-facts">
          <li><b>96+</b><span>five-star reviews</span></li>
          <li><b>19 years</b><span>in the trade</span></li>
          <li><b>24/7</b><span>emergency calls</span></li>
        </ul>
      </div>
    </div>
    <div class="voice-panel" id="v-will" hidden>
      <div class="voices-grid">
        <div>
          <blockquote class="voice display">“New Legacy helped us turn a messy idea into something detailers actually use every day. Booking, deposits, reminders, the whole loop. They built with us, not around us, and the product has scaled way past what I pictured when we started.”</blockquote>
          <div class="voice-by"><img src="/site/detailops-brandmark.webp" alt="" style="object-fit:contain;background:#141726;padding:6px"><div><strong>Will</strong>DetailOps</div></div>
        </div>
        <ul class="voice-facts">
          <li><b>500+</b><span>detailers on the platform</span></li>
          <li><b>10 min</b><span>typical time to go live</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- 5. Services -->
<section id="services" class="section" style="padding-top:40px">
  <div class="wrap">
    <div class="section-head">
      <h2 class="display">What we build.</h2>
      <p>Most projects cross more than one of these. A booking site needs the scheduling behind it; an AI assistant needs the data it reads from.</p>
    </div>

    <div class="service open">
      <button class="service-head" type="button" aria-expanded="true">
        <span class="display">Websites and commerce</span>
        <p>Sites and storefronts that make the next step obvious on a phone: call, book or buy.</p>
        <span class="fan" aria-hidden="true"><img src="/site/detailops-site-mobile.webp" alt=""><img src="/site/saha-buy.webp" alt=""><img src="/site/showroom-mobile.webp" alt=""></span>
      </button>
      <div class="service-body"><div><div class="service-inner">
        <div><h4>A good fit when</h4><ul><li>Your site doesn’t reflect the quality of your work</li><li>Customers can’t book or buy easily on a phone</li><li>Your platform fights the offer you want to run</li></ul></div>
        <div><h4>Usually includes</h4><ul><li>Design and page structure</li><li>Booking, quote or checkout flow</li><li>Local search setup</li><li>Analytics you can read</li></ul></div>
        <div><h4>Related work</h4><div class="related three">
          <a href="#sites"><img src="/site/showroom.webp" alt="">ShowRoom AutoCare</a>
          <a href="#sites"><img src="/site/saha.webp" alt="">Saha</a>
          <a href="https://www.detailops.ca/" target="_blank" rel="noreferrer"><img src="/site/detailops-site-desktop.webp" alt="">DetailOps</a>
        </div></div>
      </div></div></div>
    </div>

    <div class="service">
      <button class="service-head" type="button" aria-expanded="false">
        <span class="display">Custom software</span>
        <p>Tools shaped around how your team already works, replacing the spreadsheets and group texts.</p>
        <span class="fan" aria-hidden="true"><img src="/site/ownlane-mobile.webp" alt=""><img src="/site/ecomops-mobile.webp" alt=""><img src="/site/detailops-mobile.webp" alt=""></span>
      </button>
      <div class="service-body"><div><div class="service-inner">
        <div><h4>A good fit when</h4><ul><li>Spreadsheets and texts are running the business</li><li>Off-the-shelf tools almost fit, but not quite</li><li>Information lives in five different places</li></ul></div>
        <div><h4>Usually includes</h4><ul><li>Mapping the work as it happens today</li><li>Clickable designs before code</li><li>Web and phone app</li><li>Payments, calendars and messaging connected</li></ul></div>
        <div><h4>Related work</h4><div class="related">
          <a href="/work/detailops"><img src="/site/detailops.webp" alt="">DetailOps</a>
          <a href="#ownlane"><img src="/site/ownlane-offer.webp" alt="">Ownlane</a>
        </div></div>
      </div></div></div>
    </div>

    <div class="service">
      <button class="service-head" type="button" aria-expanded="false">
        <span class="display">AI and automation</span>
        <p>Assistants and workflows that take on repeated work, with a person reviewing what matters.</p>
        <span class="fan" aria-hidden="true"><img src="/site/forge-mobile.webp" alt=""><img src="/site/forge-compose-mobile.webp" alt=""><img src="/site/ecomops-mobile.webp" alt=""></span>
      </button>
      <div class="service-body"><div><div class="service-inner">
        <div><h4>A good fit when</h4><ul><li>Repetitive work eats your team’s week</li><li>You want AI help, with control over what it does</li><li>Reports take hours to put together</li></ul></div>
        <div><h4>Usually includes</h4><ul><li>An assistant that drafts, a person who approves</li><li>Automatic follow-up and reminders</li><li>Content and creative workflows</li><li>Spending limits and a record of what ran</li></ul></div>
        <div><h4>Related work</h4><div class="related">
          <a href="#forge"><img src="/site/forge.webp" alt="">Forge</a>
          <a href="#ecomops"><img src="/site/ecomops.webp" alt="">EcomOps and Cleo</a>
        </div></div>
      </div></div></div>
    </div>
  </div>
</section>

<!-- 6. Process along the ridge -->
<section id="process" class="section process" style="padding-top:40px">
  <div class="wrap">
    <div class="section-head">
      <h2 class="display">How a project runs.</h2>
      <p>Four stages. Each one ends with something you can see and use.</p>
    </div>
    <div class="climb">
      <svg class="ridge-line" viewBox="0 0 1216 170" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#9B87F5"/><stop offset="1" stop-color="#94A9FF"/></linearGradient>
        <linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9B87F5" stop-opacity=".16"/><stop offset="1" stop-color="#94A9FF" stop-opacity="0"/></linearGradient></defs>
        <path d="M0 160 L60 150 L152 112 L190 128 L250 140 L312 118 L362 98 L400 104 L460 112 L510 96 L560 66 L612 76 L660 84 L700 92 L770 66 L840 40 L880 58 L940 70 L1000 48 L1070 14 L1110 34 L1160 40 L1216 32 L1216 170 L0 170Z" fill="url(#rf)"/>
        <path class="draw" pathLength="1" d="M0 160 L60 150 L152 112 L190 128 L250 140 L312 118 L362 98 L400 104 L460 112 L510 96 L560 66 L612 76 L660 84 L700 92 L770 66 L840 40 L880 58 L940 70 L1000 48 L1070 14 L1110 34 L1160 40 L1216 32" fill="none" stroke="url(#rg)" stroke-width="1.6"/>
      </svg>
      <div class="peaks" role="tablist" aria-label="Project stages">
        <button role="tab" aria-selected="true" aria-controls="st-1" style="--x:12.5%;--y:65.9%"><i></i><span>Discover</span></button>
        <button role="tab" aria-selected="false" aria-controls="st-2" style="--x:46.05%;--y:38.8%"><i></i><span>Design</span></button>
        <button role="tab" aria-selected="false" aria-controls="st-3" style="--x:69.08%;--y:23.5%"><i></i><span>Build and launch</span></button>
        <button role="tab" aria-selected="false" aria-controls="st-4" style="--x:88%;--y:8.2%"><i></i><span>Care</span></button>
      </div>
    </div>

    <div class="stage-panel" id="st-1" role="tabpanel">
      <div class="sp-copy"><span class="step-n">Stage 1 of 4</span><h3 class="display">Discover</h3><p>We follow one real job through your business and find where it slows down.</p><p class="sp-get">You get a map of the work and a scoped proposal.</p></div>
      <div class="artifact flow-map" aria-label="Example workflow map">
        <div class="flow">
          <div class="node">Enquiry<small>Website form</small></div><b></b>
          <div class="node">Quote<small>Owner, by text</small></div><b class="broken"></b>
          <div class="node flag">Booking<small>Lost between texts</small></div><b></b>
          <div class="node">Invoice<small>Spreadsheet</small></div>
        </div>
        <p class="artifact-cap">Example: where a booking gets lost today</p>
      </div>
    </div>
    <div class="stage-panel" id="st-2" role="tabpanel" hidden>
      <div class="sp-copy"><span class="step-n">Stage 2 of 4</span><h3 class="display">Design</h3><p>The key screens, clickable on a phone and a computer, before any code is written.</p><p class="sp-get">You get a prototype your team can try.</p></div>
      <div class="artifact proto">
        <div class="minis">
          <div class="mini-phone"><img src="/site/do-dashboard-phone.webp" alt="Prototype screen: today's route"></div>
          <div class="mini-phone"><img src="/site/do-job-phone.webp" alt="Prototype screen: job detail"></div>
          <div class="mini-phone"><img src="/site/do-jobs-phone.webp" alt="Prototype screen: jobs list"></div>
        </div>
        <p class="artifact-cap">Screens from the DetailOps design rounds</p>
      </div>
    </div>
    <div class="stage-panel" id="st-3" role="tabpanel" hidden>
      <div class="sp-copy"><span class="step-n">Stage 3 of 4</span><h3 class="display">Build and launch</h3><p>Regular previews on a private link, then a launch planned around your quiet hours.</p><p class="sp-get">You get working software, your data moved over and a staff walkthrough.</p></div>
      <div class="artifact launch">
        <div class="url-pill"><span class="live-dot">Preview</span>preview.yourbusiness.ca</div>
        <ul><li class="ok">Bookings tested with real examples</li><li class="ok">Customer list moved over</li><li class="ok">Payments tested, then switched on</li><li class="todo">Staff walkthrough on Friday</li></ul>
        <p class="artifact-cap">Example launch checklist</p>
      </div>
    </div>
    <div class="stage-panel" id="st-4" role="tabpanel" hidden>
      <div class="sp-copy"><span class="step-n">Stage 4 of 4</span><h3 class="display">Care and improve</h3><p>We keep it running and keep improving it as you learn what you need.</p><p class="sp-get">You get monitoring, fixes and planned improvements.</p></div>
      <div class="artifact care">
        <div class="care-row"><span>Site and booking checks</span><b class="ok">Passing</b></div>
        <div class="care-row"><span>Backups</span><b class="ok">Daily</b></div>
        <div class="care-row"><span>Improvements this month</span><b>3 shipped</b></div>
        <div class="bars" aria-hidden="true"><i style="--h:30%"></i><i style="--h:46%"></i><i style="--h:40%"></i><i style="--h:62%"></i><i style="--h:58%"></i><i style="--h:80%"></i></div>
        <p class="artifact-cap">Example monthly care summary</p>
      </div>
    </div>
  </div>
</section>

<!-- 7. Close -->
<section id="contact" class="close">
  <div class="wrap">
    <div>
      <h2 class="display">Tell us what’s slowing the business down.</h2>
      <p class="muted" style="max-width:40ch;margin:0">A short description is enough. We’ll reply with questions or a time to talk.</p>
      <div class="contact-alt">
        <a href="mailto:contact@newlegacyai.ca">contact@newlegacyai.ca</a>
        <a href="tel:9059754877">905-975-4877</a>
      </div>
    </div>
    <form class="form wizard" novalidate>
      <div class="wz-head">
        <button type="button" class="wz-back" disabled aria-label="Previous step">Back</button>
        <span class="wz-count">Step <b>1</b> of 4</span>
      </div>
      <div class="wz-progress" aria-hidden="true"><i></i></div>

      <fieldset class="wz-step" data-step="1">
        <legend class="display">What can we help with?</legend>
        <div class="choice-grid">
          <label class="choice"><input type="radio" name="need" value="website"><span><strong>A website or store</strong><small>New site, redesign or a better checkout</small></span></label>
          <label class="choice"><input type="radio" name="need" value="software"><span><strong>Custom software</strong><small>Booking, scheduling, internal tools</small></span></label>
          <label class="choice"><input type="radio" name="need" value="ai"><span><strong>AI or automation</strong><small>Take repeated work off your team</small></span></label>
          <label class="choice"><input type="radio" name="need" value="unsure"><span><strong>Not sure yet</strong><small>Tell us the problem and we'll suggest a fix</small></span></label>
        </div>
      </fieldset>

      <fieldset class="wz-step" data-step="2" hidden>
        <legend class="display">What's getting in the way?</legend>
        <p class="wz-hint">Pick any that apply.</p>
        <div class="chips">
          <label><input type="checkbox" value="leads"><span>Missed enquiries</span></label>
          <label><input type="checkbox" value="booking"><span>Booking by text and phone</span></label>
          <label><input type="checkbox" value="payments"><span>Chasing payments</span></label>
          <label><input type="checkbox" value="mobile"><span>Site is hard to use on phones</span></label>
          <label><input type="checkbox" value="tools"><span>Too many tools</span></label>
          <label><input type="checkbox" value="admin"><span>Repetitive admin</span></label>
        </div>
        <label class="wz-more"><span>Anything else? Optional</span><textarea rows="3" placeholder="We take bookings by text and lose track of deposits"></textarea></label>
        <button class="btn wz-next" type="button">Continue</button>
      </fieldset>

      <fieldset class="wz-step" data-step="3" hidden>
        <legend class="display">When would you like to start?</legend>
        <div class="choice-grid one">
          <label class="choice"><input type="radio" name="when" value="now"><span><strong>As soon as possible</strong></span></label>
          <label class="choice"><input type="radio" name="when" value="months"><span><strong>In the next few months</strong></span></label>
          <label class="choice"><input type="radio" name="when" value="exploring"><span><strong>Just exploring for now</strong></span></label>
        </div>
      </fieldset>

      <fieldset class="wz-step" data-step="4" hidden>
        <legend class="display">Where should we reply?</legend>
        <div class="two">
          <label><span>Name</span><input type="text" name="name" autocomplete="name" required></label>
          <label><span>Email</span><input type="email" name="email" autocomplete="email" required></label>
        </div>
        <div class="two">
          <label><span>Business</span><input type="text" name="business" autocomplete="organization"></label>
          <label><span>Phone, optional</span><input type="text" name="phone" autocomplete="tel"></label>
        </div>
        <button class="btn" type="submit">Send enquiry</button>
        <p class="form-note" aria-live="polite"></p>
      </fieldset>

      <div class="wz-done" hidden>
        <p class="display">Thanks, <span data-name>there</span>.</p>
        <p class="muted">We'll reply with questions or a time to talk. If it's easier, pick a time now.</p>
        <a class="btn" href="/book">Book a 30-minute call</a>
        
      </div>
    </form>
  </div>
</section>
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-pitch">
        <p class="display">Have something that should work better?</p>
        <a class="btn" href="/#contact">Start a project</a>
      </div>
      <nav class="foot-cols" aria-label="Footer">
        <div><h3>Products we built</h3>
          <a href="/work/detailops">DetailOps</a><a href="/#ownlane">Ownlane</a><a href="/#ecomops">EcomOps</a><a href="/#forge">Forge</a></div>
        <div><h3>Client sites</h3>
          <a href="https://www.showroomautocare.ca/">ShowRoom AutoCare</a><a href="https://www.jaythatdrainguy.ca/">Jay That Drain Guy</a><a href="https://dearlatte.shop/">Dear Latte</a><a href="/#sites">All sites</a></div>
        <div><h3>What we build</h3>
          <a href="/#services">Websites and commerce</a><a href="/#services">Custom software</a><a href="/#services">AI and automation</a><a href="/#process">How a project runs</a></div>
        <div><h3>Talk to us</h3>
          <a href="mailto:contact@newlegacyai.ca">contact@newlegacyai.ca</a><a href="tel:9059754877">905-975-4877</a><a href="/book">Book a 30-minute call</a></div>
      </nav>
    </div>
  </div>
  <div class="foot-mark" aria-hidden="true">
    <svg class="foot-ridge" viewBox="0 0 1440 120" preserveAspectRatio="none"><defs><linearGradient id="fr" x1="0" x2="1"><stop offset="0" stop-color="#9B87F5"/><stop offset="1" stop-color="#94A9FF"/></linearGradient></defs>
      <path d="M0 110 L90 96 L170 70 L220 84 L300 92 L380 64 L450 40 L500 56 L590 70 L660 46 L740 20 L790 38 L880 50 L960 28 L1040 6 L1100 26 L1190 36 L1270 18 L1340 30 L1440 22" fill="none" stroke="url(#fr)" stroke-width="1.4"/></svg>
    <span class="display">New Legacy</span>
  </div>
  <div class="wrap foot-base"><span>&copy; 2026 New Legacy. Websites, software and AI, built in Ontario, Canada.</span></div>
</footer>

<a class="mobile-cta btn" href="#contact" aria-hidden="true" tabindex="-1">Start a project</a>`;
export default html;
