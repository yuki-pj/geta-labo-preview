/* ============================================
   GETA LABO — メインスクリプト
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- 「動きを減らす」設定（OSのアクセシビリティ設定）の確認 ---------- */
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 動きを減らす設定の人にはトップ動画を自動再生しない（静止画のまま） */
  var heroVideos = document.querySelectorAll(".hero-video");
  if (prefersReducedMotion && heroVideos.length) {
    Array.prototype.forEach.call(heroVideos, function (video) {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

  /* ---------- ヘッダーのスクロール変化 ----------
     スクロールのたびに位置を計算せず、コンセプト文が画面から出入りする
     瞬間だけを監視する（負荷の軽い方式） */
  var header = document.getElementById("header");
  var concept = document.getElementById("concept");

  if (concept && window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      var pastConcept = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
      header.classList.toggle("is-scrolled", pastConcept);
    }).observe(concept);
  } else {
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 60);
    });
  }

  /* ---------- ハンバーガーメニュー ---------- */
  var hamburger = document.getElementById("hamburger");
  var navOverlay = document.getElementById("navOverlay");
  var hamburgerLabel = document.getElementById("hamburgerLabel");
  var navLinks = document.querySelectorAll(".nav-link");

  // 開閉の状態は html の is-menu-open で表す。
  // CSS側で裏のページの固定と、右下バナーの非表示に使っている
  function setMenu(isOpen) {
    hamburger.classList.toggle("is-active", isOpen);
    navOverlay.classList.toggle("is-open", isOpen);
    hamburgerLabel.textContent = isOpen ? "CLOSE" : "MENU";
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    document.documentElement.classList.toggle("is-menu-open", isOpen);
  }

  function toggleMenu() {
    setMenu(!navOverlay.classList.contains("is-open"));
  }

  function closeMenu() {
    setMenu(false);
  }

  hamburger.addEventListener("click", toggleMenu);

  // メニューリンクをクリックしたらメニューを閉じる
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // 開いている間：Escで閉じる／Tabの移動先を「閉じるボタン＋メニューの中」だけにする
  document.addEventListener("keydown", function (e) {
    if (!navOverlay.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeMenu();
      hamburger.focus();
      return;
    }

    if (e.key !== "Tab") return;
    var items = [hamburger].concat(Array.prototype.slice.call(navOverlay.querySelectorAll("a[href]")))
      .filter(function (el) { return el.getClientRects().length > 0; });
    var first = items[0];
    var last = items[items.length - 1];
    var current = items.indexOf(document.activeElement);

    if (current === -1) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------- スクロール連動フェードインアニメーション ---------- */
  var fadeElements = document.querySelectorAll(".fade-in");

  var observerOptions = {
    root: null,
    rootMargin: "0px 0px -80px 0px",
    threshold: 0.1
  };

  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(function (el) {
    fadeObserver.observe(el);
  });

  /* ---------- 商品カード 上品な浮上フェード ---------- */
  var productReveals = document.querySelectorAll('.product-reveal');
  productReveals.forEach(function (el) {
    fadeObserver.observe(el);
  });

  /* ---------- ニュース：CMSのお知らせ一覧から自動読み込み＋フィルタータブ ----------
     同じサーバーの /news/index.html（お知らせ一覧）から最新記事を取り込む。
     "/news" と書くと本番サーバーが /news/ → /news/index.html と2回転送するので、最初から転送先を指定する。
     読み込みに失敗した場合は、HTMLに書いてある固定リストをそのまま表示する（保険）。 */
  var NEWS_SOURCE = "/news/index.html";
  var NEWS_FETCH_MAX = 12;   // 取り込む記事数（タブ切り替え用の在庫）
  var NEWS_VISIBLE_MAX = 4;  // 一度に表示する記事数
  var newsListEl = document.querySelector("#news .news-list");
  var newsTabs = document.querySelectorAll(".news-tab");

  function applyNewsFilter(filter) {
    if (!newsListEl) return;
    var shown = 0;
    newsListEl.querySelectorAll(".news-item").forEach(function (item) {
      var match = filter === "all" || item.getAttribute("data-category") === filter;
      if (match && shown < NEWS_VISIBLE_MAX) {
        item.classList.remove("is-hidden");
        shown++;
      } else {
        item.classList.add("is-hidden");
      }
    });

    var empty = newsListEl.querySelector(".news-empty");
    if (shown === 0) {
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "news-empty";
        empty.style.cssText = "padding: 24px 0; color: #6f6f6f; font-size: 0.9rem;";
        empty.textContent = "該当するお知らせはまだありません。";
        newsListEl.appendChild(empty);
      }
      empty.style.display = "";
    } else if (empty) {
      empty.style.display = "none";
    }
  }

  newsTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      newsTabs.forEach(function (t) { t.classList.remove("is-active"); });
      this.classList.add("is-active");
      applyNewsFilter(this.getAttribute("data-filter"));
    });
  });

  function buildNewsItem(li) {
    var link = li.querySelector("a[href]");
    var title = li.querySelector(".news-ttl");
    if (!link || !title) return null; // タブ等、記事以外のliは除外

    var a = document.createElement("a");
    a.href = link.getAttribute("href");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "news-item fade-in is-visible";

    var img = li.querySelector(".img-box img");
    if (img) {
      var thumb = document.createElement("img");
      thumb.className = "news-thumb";
      thumb.src = img.getAttribute("src");
      thumb.alt = img.getAttribute("alt") || "";
      thumb.loading = "lazy";
      a.appendChild(thumb);
    }

    var body = document.createElement("div");
    body.className = "news-body";
    var meta = document.createElement("div");
    meta.className = "news-meta";

    var dateSrc = li.querySelector(".news-date");
    var time = document.createElement("time");
    time.className = "news-date";
    time.textContent = dateSrc ? dateSrc.textContent.trim() : "";
    meta.appendChild(time);

    var tagSrc = li.querySelector(".news-tag");
    var tagText = tagSrc ? tagSrc.textContent.trim() : "";
    if (tagText) {
      var tag = document.createElement("span");
      tag.className = "news-tag";
      tag.textContent = tagText;
      meta.appendChild(tag);
    }
    a.setAttribute("data-category", tagText);

    var titleEl = document.createElement("p");
    titleEl.className = "news-title";
    titleEl.textContent = title.textContent.trim();

    body.appendChild(meta);
    body.appendChild(titleEl);
    a.appendChild(body);
    return a;
  }

  function loadLatestNews() {
    if (!newsListEl || !window.fetch || !window.DOMParser) return;
    // ローカルでファイルを直接開いている時は取得しない（公開サーバー上でのみ動く機能）
    if (window.location.protocol === "file:") return;

    fetch(NEWS_SOURCE).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (html) {
      // 一覧HTMLに含まれる装飾指定(style属性と<style>ブロック)はここでは使わないので
      // 先に取り除く。残したまま読み取ると、セキュリティ設定(CSP)の警告がブラウザに出るため。
      html = html.replace(/ style="[^"]*"/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
      var doc = new DOMParser().parseFromString(html, "text/html");
      var built = [];
      doc.querySelectorAll("ul.news-list li.item").forEach(function (li) {
        if (built.length >= NEWS_FETCH_MAX) return;
        var item = buildNewsItem(li);
        if (item) built.push(item);
      });
      if (built.length === 0) throw new Error("no news items found");

      newsListEl.innerHTML = "";
      built.forEach(function (item) { newsListEl.appendChild(item); });

      var activeTab = document.querySelector(".news-tab.is-active");
      applyNewsFilter(activeTab ? activeTab.getAttribute("data-filter") : "all");
    }).catch(function () {
      // 読み込み失敗時は何もしない＝HTMLの固定リストがそのまま表示される
    });
  }

  loadLatestNews();

  /* ---------- 固定バナーの×ボタン ---------- */
  var fixedBanner = document.getElementById("fixedBanner");
  var fixedBannerClose = document.getElementById("fixedBannerClose");

  if (fixedBanner && fixedBannerClose) {
    // 一度閉じたら、このタブを開いている間は表示しない
    try {
      if (sessionStorage.getItem("getalabo-banner-closed")) {
        fixedBanner.classList.add("is-hidden");
      }
    } catch (e) {}

    fixedBannerClose.addEventListener("click", function () {
      fixedBanner.classList.add("is-hidden");
      try { sessionStorage.setItem("getalabo-banner-closed", "1"); } catch (e) {}
    });
  }

  /* ---------- スムーススクロール ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;

      var target = document.querySelector(targetId);
      if (target) {
        var headerHeight = header.offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
      }
    });
  });

});
