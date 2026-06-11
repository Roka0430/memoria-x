<?php
require_once "DataRepository.php";

header("Content-Type: application/json; charset=utf-8");

$addition = json_decode(file_get_contents("php://input"), true);
$data = DataRepository::load();
$id_list = array_map(fn($subject) => $subject["id"], $data);

$new_id = 0;
while (in_array($new_id, $id_list)) $new_id++;

$new_subject = [
  "id" => $new_id,
  "name" => $addition["name"],
  "questions" => [],
];
array_push($data, $new_subject);

DataRepository::save($data);

echo json_decode($new_id);
