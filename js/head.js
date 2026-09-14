/* JSが有効なときだけ <html> に js クラスを付ける。
   ふわっと表示（.fade-in）は js クラスがある時のみ「最初は透明」になるため、
   JSが動かない環境でも全コンテンツがそのまま見える。 */
document.documentElement.classList.add("js");
