/* ヒーロー動画の読み込み。
   画面幅900px以下ならスマホ用（縦）、それより広ければPC用（横）を読み込む。
   HTMLの動画タグ直後に読み込むことで、動画の取得を早い段階で始められる。
   ※以前は index.html 内に直書きしていたが、CSP（script-src 'self'）と
     衝突して動画が再生されなくなるため外部ファイル化した。
   ※表紙画像（poster）も data-poster から移し替える。HTMLに直接書くと、
     隠れている方の表紙画像まで取得されていたため（2026-09-13 改善12）。 */
(function () {
  /* OSで「動きを減らす」設定の人には動画を読み込まない（表紙画像だけ出す） */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var mq = window.matchMedia("(max-width: 900px)");

  function load(isMobile) {
    var target = document.querySelector(isMobile ? ".hero-video--sp" : ".hero-video--pc");
    if (!target) { return; }
    if (target.dataset.poster && !target.getAttribute("poster")) {
      target.setAttribute("poster", target.dataset.poster);
    }
    if (!reduceMotion && target.dataset.src && !target.src) {
      target.src = target.dataset.src;
    }
  }

  load(mq.matches);

  /* タブレットの縦横回転などで900pxの境目をまたいだら、もう片方も読み込む。
     （読み込みは初回の1度だけ。以後はブラウザが再生を引き継ぐ） */
  function onChange(e) { load(e.matches); }
  if (mq.addEventListener) { mq.addEventListener("change", onChange); }
  else if (mq.addListener) { mq.addListener(onChange); }
})();
