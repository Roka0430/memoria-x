<?php
require_once "DataRepository.php";

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Content-Type: application/json; charset=utf-8");

if (isset($_GET["id"])) {
  $id = (int)$_GET["id"];
  $data = DataRepository::load();

  foreach ($data as $subject) {
    if ($subject["id"] === $id) {
      echo json_encode($subject);
      exit;
    }
  }

  http_response_code(404);
}
