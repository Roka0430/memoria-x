<?php
require_once "DataRepository.php";

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Content-Type: application/json; charset=utf-8");

$data = DataRepository::load();

$length = 0;
foreach ($data as $subject) {
  foreach ($subject["questions"] as $question) {
    $length += mb_strlen($question) + 2;
  }
}

echo json_decode($length);
