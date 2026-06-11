<?php
require_once "DataRepository.php";

$body = json_decode(file_get_contents("php://input"), true);
$data = DataRepository::load();

$target = null;
foreach ($data as &$subject) {
  if ($subject["id"] === (int)$body["id"]) {
    $target = &$subject;
    break;
  }
}
unset($subject);

if ($target) {
  $target["questions"] = $body["questions"];
  DataRepository::save($data);
}
