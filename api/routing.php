<?php
function loader()
{
  if (isset($_GET["edit"])) {
    return [
      "content" => file_get_contents("pages/editor.html"),
      "scripts" => ["assets/js/base.js", "assets/js/editor.js"]
    ];
  }
  if (isset($_GET["answer"])) {
    return [
      "content" => file_get_contents("pages/answer.html"),
      "scripts" => ["assets/js/base.js", "assets/js/answer.js"]
    ];
  }
  if (isset($_GET["result"])) {
    return [
      "content" => file_get_contents("pages/result.html"),
      "scripts" => ["assets/js/base.js", "assets/js/result.js"]
    ];
  }

  return [
    "content" => file_get_contents("pages/home.html"),
    "scripts" => ["assets/js/base.js", "assets/js/home.js"]
  ];
}
