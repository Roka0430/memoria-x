<?php
require_once "DataRepository.php";

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Content-Type: application/json; charset=utf-8");

$data = DataRepository::load();
$subjects = array_map(fn($subject) => (
  [
    "id" =>  $subject["id"],
    "name" =>  $subject["name"],
  ]
), $data);
echo json_encode($subjects);
