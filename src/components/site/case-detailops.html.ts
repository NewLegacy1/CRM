// Generated from docs/design/mocks; static, trusted markup for the marketing pages.
const html = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="arr" viewBox="0 0 16 16"><path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>

<header class="site-header solid">
  <div class="wrap">
    <a class="wordmark display" href="/">New Legacy</a>
    <nav class="site-nav" aria-label="Main">
      <a href="/#work">Work</a>
      <a href="/#services">Services</a>
      <a href="/#process">Process</a>
      <a class="nav-login" href="/login"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="5.5" r="2.75" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.75 13.5c.8-2.3 2.85-3.5 5.25-3.5s4.45 1.2 5.25 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Log in</a>
      <a class="btn" href="/#contact">Start a project</a>
    </nav>
  </div>
</header>

<main>
  <section class="case-hero">
    <div class="wrap">
      <a class="crumb" href="/#work">All work</a>
      <div class="case-title">
        <h1 class="display">DetailOps</h1>
        <p>Booking and operations software that took detailers from DMs and phone tag to a full, paid-up calendar.</p>
      </div>
      <dl class="case-facts">
        <div><dt>Client</dt><dd>DetailOps, with founder Will</dd></div>
        <div><dt>What we did</dt><dd>Product design, web app, phone views, payments, messaging</dd></div>
        <div><dt>Used by</dt><dd>500+ detailers</dd></div>
        <div><dt>Live</dt><dd><a class="text-link" href="https://www.detailops.ca/" target="_blank" rel="noreferrer">detailops.ca <svg><use href="#arr"/></svg></a></dd></div>
      </dl>

      <div class="stage has-phone case-stage" data-viewer>
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i><span class="url">app.detailops.ca</span></div>
          <div class="screen">
            <div class="shot fit"><img loading="lazy" decoding="async" src="/site/do-today.webp" alt="DetailOps Today page"></div>
            <div class="shot fit"><img loading="lazy" decoding="async" src="/site/do-customer.webp" alt="DetailOps customer record"></div>
            <div class="shot fit"><img loading="lazy" decoding="async" src="/site/do-schedule-new.webp" alt="DetailOps week schedule"></div>
            <span class="scroll-hint">Scroll inside</span>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="DetailOps screens">
          <button role="tab" data-url="app.detailops.ca/today" data-caption="The owner opens to today: money booked, jobs done and the crew’s route. Northline demo shop, sample data.">Today</button>
          <button role="tab" data-url="app.detailops.ca/customers" data-caption="Every customer’s vehicles, visits and notes in one record. Northline demo shop, sample data.">Customer</button>
          <button role="tab" data-url="app.detailops.ca/schedule" data-caption="One shared schedule for the whole shop. Northline demo shop, sample data.">Schedule</button>
        </div>
        <p class="tab-caption"></p>
        <div class="phone" data-live>
          <div class="glass">
            <img loading="lazy" decoding="async" src="/site/detailops-mobile.webp" alt="">
            <iframe title="DetailOps live demo booking page" data-src="https://www.detailops.ca/book/demo"></iframe>
            <button class="shield" type="button"><span>Try the live booking page</span></button>
          </div>
          <div class="phone-label"><span class="live-dot">Live demo booking</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap prose">
      <h2 class="display">The problem</h2>
      <div class="cols">
        <p>Detailers were running their businesses through Instagram DMs, texts and phone calls. Bookings slipped through, and customers who didn’t show up cost a whole morning because there was no deposit to hold the slot.</p>
        <p>Once a job was done there was no system for follow-up. Past customers weren’t reminded to come back, and reviews were left to chance.</p>
        <p>Existing tools were built for salons or general field service. They didn’t understand vehicles, packages, travel between jobs, or how a detailing day actually runs.</p>
        <p>We set out to build the whole loop in one place: the booking page a customer sees, the schedule the shop works from, and the follow-up afterwards.</p>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="feature">
        <div class="feature-media center">
          <div class="phone" data-live style="--w:280px">
            <div class="glass">
              <img loading="lazy" decoding="async" src="/site/detailops-mobile.webp" alt="">
              <iframe title="DetailOps live demo booking page" data-src="https://www.detailops.ca/book/demo"></iframe>
              <button class="shield" type="button"><span>Book a demo appointment</span></button>
            </div>
          </div>
        </div>
        <div class="feature-copy">
          <h3 class="display">Booking with a deposit</h3>
          <p>Each shop gets its own booking page. Customers pick a package, add their vehicle, choose a time and pay a deposit in one flow on their phone.</p>
          <p>The deposit is what changed the business. A held slot is a paid slot, and no-shows stop costing a morning.</p>
          <p class="detail">This is the live demo shop, running on the real product.</p>
        </div>
      </div>

      <div class="feature flip">
        <div class="feature-copy">
          <h3 class="display">One schedule for the shop</h3>
          <p>Bookings land on a shared week view with the service, vehicle and duration already filled in. The owner can move jobs, block time and see the gaps worth filling.</p>
          <p class="detail">Each job shows its deposit status, so nobody has to ask whether it’s been paid.</p>
        </div>
        <div class="feature-media"><div class="crop"><img loading="lazy" decoding="async" src="/site/do-schedule-new.webp" alt="DetailOps week schedule with jobs" style="width:100%"></div></div>
      </div>

      <div class="feature">
        <div class="feature-media center">
          <div class="phone" style="--w:230px"><div class="glass"><img loading="lazy" decoding="async" src="/site/do-today-phone.webp" alt="DetailOps today's route on a phone"></div></div>
          <div class="phone" style="--w:230px"><div class="glass"><img loading="lazy" decoding="async" src="/site/do-job-phone.webp" alt="DetailOps job detail on a phone"></div></div>
        </div>
        <div class="feature-copy">
          <h3 class="display">The day on a phone</h3>
          <p>Mobile crews see their next stop, the customer’s details and the job notes without opening a laptop. When the job’s done, the invoice and follow-up go out from the same place.</p>
          <p class="detail">Reminders and review requests are sent automatically after each job.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="big-quote">
    <div class="wrap">
      <blockquote class="display">“They built with us, not around us, and the product has scaled way past what I pictured when we started.”</blockquote>
      <div class="voice-by"><img loading="lazy" decoding="async" src="/site/detailops-brandmark.webp" alt="" style="object-fit:contain;background:#141726;padding:6px"><div><strong>Will</strong>DetailOps</div></div>
    </div>
  </section>

  <section style="padding-bottom:40px">
    <div class="wrap">
      <div class="numbers">
        <div><b>500+</b><span>detailers on the platform</span></div>
        <div><b>10 min</b><span>typical time for a shop to go live</span></div>
        <div><b>1</b><span>place for booking, schedule, payment and follow-up</span></div>
      </div>
      <p class="muted" style="margin:40px 0 0;font-size:15px">Built with Next.js, Stripe payments, SMS and email messaging, and a multi-shop account system.</p>
    </div>
  </section>

  <section class="section" style="padding-bottom:0">
    <div class="wrap">
      <a class="next" href="/#ownlane">
        <small>Next project</small>
        <span class="display">Ownlane</span>
        <div class="next-img"><img loading="lazy" decoding="async" src="/site/ownlane-offer.webp" alt=""></div>
      </a>
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
          <a href="mailto:contact@newlegacyai.ca">contact@newlegacyai.ca</a><a href="tel:9059754877">905-975-4877</a><a href="/book">Book a 30-minute call</a><a href="/login">Client and team login</a></div>
      </nav>
    </div>
  </div>
  <div class="foot-mark" aria-hidden="true">
    <svg class="foot-ridge" viewBox="0 0 1440 120" preserveAspectRatio="none"><defs><linearGradient id="fr" x1="0" x2="1"><stop offset="0" stop-color="#9B87F5"/><stop offset="1" stop-color="#94A9FF"/></linearGradient></defs>
      <path d="M0 110 L90 96 L170 70 L220 84 L300 92 L380 64 L450 40 L500 56 L590 70 L660 46 L740 20 L790 38 L880 50 L960 28 L1040 6 L1100 26 L1190 36 L1270 18 L1340 30 L1440 22" fill="none" stroke="url(#fr)" stroke-width="1.4"/></svg>
    <span class="display">New Legacy</span>
  </div>
  <div class="wrap foot-base"><span>&copy; 2026 New Legacy. Websites, software and AI, built in Ontario, Canada.</span></div>
</footer>`;
export default html;
