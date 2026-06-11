<?php
$file = "../data/data.json";

if (!file_exists($file)) {
  http_response_code(404);
  exit("data.json not found");
}

$filename = "MemoraX_" . date("Y-m-d_H-i-s") . ".json";

header("Content-Type: application/json; charset=utf-8");
header('Content-Disposition: attachment; filename="' . $filename . '"');
header("Content-Length: " . filesize($file));

readfile($file);
exit;
