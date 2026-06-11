<?php
require_once "DataRepository.php";

$deletion = json_decode(file_get_contents("php://input"), true);
$data = DataRepository::load();

$id = (int)$deletion["id"];

$data = array_values(
  array_filter(
    $data,
    fn($subject) => $subject["id"] !== $id
  )
);

DataRepository::save($data);
