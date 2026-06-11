<?php
require_once "DataRepository.php";

$data = DataRepository::load();

$output = "";
foreach ($data as $subject) {
  $output .= "＃" . $subject["name"] . "\n\n";
  foreach ($subject["questions"] as $question) {
    $output .= $question . "\n\n";
  }
  $output .= "\n\n\n\n";
}

$filename = "MemoraX_" . date("Y-m-d_H-i-s") . ".txt";

header("Content-Type: application/json; charset=utf-8");
header('Content-Disposition: attachment; filename="' . $filename . '"');
header("Content-Length: " . strlen($output));

echo $output;
exit;
