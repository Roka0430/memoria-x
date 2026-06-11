<?php
class DataRepository
{
  private static string $path = __DIR__ . "/../data/data.json";

  public static function load(): array
  {
    $json = file_get_contents(self::$path);
    $data = json_decode($json, true);
    usort($data, fn($a, $b) => strcmp($a['name'], $b['name']));
    return $data ?? [];
  }

  public static function save(array $data): void
  {
    file_put_contents(
      self::$path,
      json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
  }
}

class BackupRepository
{
  private static string $path = __DIR__ . "/../data/backup.json";

  public static function load(): array
  {
    $json = file_get_contents(self::$path);
    $data = json_decode($json, true);
    usort($data, fn($a, $b) => strcmp($a['name'], $b['name']));
    return $data ?? [];
  }

  public static function save(array $data): void
  {
    file_put_contents(
      self::$path,
      json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
  }
}
