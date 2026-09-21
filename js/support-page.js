(function () {
  var SUPPORT = "fanelesibonge50@gmail.com";
  if (typeof mountPlayerReviews === "function") mountPlayerReviews("published-reviews");
  var form = document.getElementById("review-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (document.getElementById("review-name").value || "").trim() || "Player";
    var rating = document.getElementById("review-rating").value;
    var text = (document.getElementById("review-text").value || "").trim();
    if (text.length < 8) {
      window.alert("Please write at least a few words for your review.");
      return;
    }
    var body = "Name: " + name + "\nRating: " + rating + " / 5\n\n" + text + "\n\n---\nSent from Complete the Verse support page";
    var url = "mailto:" + SUPPORT + "?subject=" + encodeURIComponent("Complete the Verse review") +
      "&body=" + encodeURIComponent(body);
    window.location.href = url;
  });
})();
