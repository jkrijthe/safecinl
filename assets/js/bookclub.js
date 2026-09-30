// Book club carousel.
// - Opens centered on the current session: the first one that hasn't ended yet.
// - Moves on to the next session automatically when the current one ends.
// - While the pointer is over a session card, vertical wheel scrolling steps
//   through sessions horizontally. At the first/last session the page scrolls
//   normally again, so visitors never get stuck.
(function () {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track = root.querySelector(".carousel-track");
  const cards = Array.from(track.querySelectorAll(".session"));
  const sessions = cards.map((el) => ({
    el,
    start: Date.parse(el.dataset.start),
    end: Date.parse(el.dataset.end),
  }));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let pos = 0; // index of the card currently centered
  let featured = -1; // index of the current session

  function currentIndex(now) {
    const i = sessions.findIndex((s) => s.end > now);
    return i === -1 ? sessions.length - 1 : i;
  }

  function goTo(i, smooth = true) {
    pos = Math.max(0, Math.min(cards.length - 1, i));
    const card = cards[pos];
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: smooth && !reduceMotion ? "smooth" : "auto",
    });
  }

  function nearestIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  function updateStatus(now, current) {
    sessions.forEach((s, i) => {
      let label = "Planned";
      let state = "planned";
      if (s.end <= now) {
        label = "Past";
        state = "past";
      } else if (s.start <= now) {
        label = "allDay" in s.el.dataset ? "Today" : "Happening now";
        state = "live";
      } else if (i === current) {
        label = "Next up";
        state = "next";
      }
      s.el.dataset.state = state;
      s.el.classList.toggle("is-current", i === current);
      s.el.querySelector("[data-status]").textContent = label;
    });
  }

  // Re-evaluate the current session, and set a timer for the next start/end time.
  let timer;
  function tick(initial) {
    const now = Date.now();
    const current = currentIndex(now);
    updateStatus(now, current);
    if (current !== featured) {
      featured = current;
      goTo(current, !initial);
    }

    clearTimeout(timer);
    const upcoming = sessions.flatMap((s) => [s.start, s.end]).filter((t) => t > now);
    if (upcoming.length) {
      // Cap the delay: browsers overflow on timeouts longer than ~24 days.
      const wait = Math.min(Math.min(...upcoming) - now + 1000, 60 * 60 * 1000);
      timer = setTimeout(() => tick(false), wait);
    }
  }

  // Wheel: one step per gesture. A gesture ends after a short pause, so trackpad
  // momentum doesn't skip through several sessions at once.
  let locked = false;
  let idleTimer;
  track.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => (locked = false), 150);
      // Keep swallowing a gesture's momentum even if the cards slide out from
      // under the pointer; otherwise only react over a card itself.
      if (locked) {
        e.preventDefault();
        return;
      }
      if (!e.target.closest(".session")) return;
      const target = pos + dir;
      if (target < 0 || target >= cards.length) return; // at the edge: scroll the page
      e.preventDefault();
      locked = true;
      goTo(target);
    },
    { passive: false }
  );

  // Keep `pos` in sync when the track is scrolled natively (touch, trackpad swipe).
  let scrollTimer;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (!locked) pos = nearestIndex();
    }, 120);
  });

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      goTo(pos + (e.key === "ArrowRight" ? 1 : -1));
    }
  });
  root.querySelector("[data-prev]").addEventListener("click", () => goTo(pos - 1));
  root.querySelector("[data-next]").addEventListener("click", () => goTo(pos + 1));
  root.querySelector("[data-current]").addEventListener("click", () => goTo(featured));

  window.addEventListener("resize", () => goTo(pos, false));
  // Timers are throttled in background tabs; catch up when the page is shown again.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick(false);
  });

  tick(true);
})();
