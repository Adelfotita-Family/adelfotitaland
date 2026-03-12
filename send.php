<?php
// ============================================================
// НАСТРОЙКИ
// ============================================================
define('MAIL_TO',      'hello@adelfotita.ru');
define('MAIL_FROM',    'noreply@adelfotita.ru');
define('MAIL_SUBJECT', 'Новая заявка с сайта Adelfotita');

define('TG_BOT_TOKEN', '8728795186:AAHn7TVt7R1iRafZajvg_BmlSOov_Y-eBuA');
define('TG_CHAT_ID',   '-1003743857167'); // ← уточните ID через @userinfobot

// ============================================================
// CORS + заголовки
// ============================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ============================================================
// ДАННЫЕ + ВАЛИДАЦИЯ
// ============================================================
$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$service = trim(strip_tags($_POST['service'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

$errors = [];
if (empty($name))                                    $errors[] = 'Укажите имя';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))      $errors[] = 'Некорректный email';
if (empty($message))                                 $errors[] = 'Укажите детали проекта';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => implode(', ', $errors)]);
    exit;
}

// ============================================================
// EMAIL
// ============================================================
$mailBody  = "Новая заявка с сайта Adelfotita Family\n";
$mailBody .= "==========================================\n\n";
$mailBody .= "Имя:     {$name}\n";
$mailBody .= "Email:   {$email}\n";
$mailBody .= "Услуга:  " . ($service ?: 'не выбрана') . "\n\n";
$mailBody .= "Сообщение:\n{$message}\n";

$mailHeaders  = "From: " . MAIL_FROM . "\r\n";
$mailHeaders .= "Reply-To: {$email}\r\n";
$mailHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
$mailHeaders .= "X-Mailer: PHP/" . phpversion();

$mailSent = mail(
    MAIL_TO,
    '=?UTF-8?B?' . base64_encode(MAIL_SUBJECT) . '?=',
    $mailBody,
    $mailHeaders
);

// ============================================================
// TELEGRAM (MarkdownV2 — корректное экранирование)
// ============================================================
$tgText  = "📩 *Новая заявка с сайта*\n\n";
$tgText .= "👤 *Имя:* "    . escTg($name)                    . "\n";
$tgText .= "📧 *Email:* "  . escTg($email)                   . "\n";
$tgText .= "🛠 *Услуга:* " . escTg($service ?: 'не выбрана') . "\n\n";
$tgText .= "💬 *Сообщение:*\n" . escTg($message);

$tgPayload = json_encode([
    'chat_id'    => TG_CHAT_ID,
    'text'       => $tgText,
    'parse_mode' => 'MarkdownV2',
], JSON_UNESCAPED_UNICODE);

$ctx = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\nContent-Length: " . strlen($tgPayload),
        'content' => $tgPayload,
        'timeout' => 10,
        'ignore_errors' => true,
    ]
]);

$tgUrl      = 'https://api.telegram.org/bot' . TG_BOT_TOKEN . '/sendMessage';
$tgResponse = @file_get_contents($tgUrl, false, $ctx);
$tgResult   = $tgResponse ? json_decode($tgResponse, true) : null;
$tgSent     = $tgResult['ok'] ?? false;

// Логируем ошибку Telegram для отладки (в error_log сервера)
if (!$tgSent && $tgResponse) {
    error_log('[Adelfotita] Telegram error: ' . $tgResponse);
}

// ============================================================
// ОТВЕТ
// ============================================================
if ($mailSent || $tgSent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => 'Не удалось отправить сообщение. Попробуйте позже или напишите напрямую на hello@adelfotita.ru',
    ]);
}

// ============================================================
// ХЕЛПЕР — экранирование для MarkdownV2
// ============================================================
function escTg(string $text): string {
    // Все спецсимволы MarkdownV2 должны быть экранированы обратным слешем
    return preg_replace('/([_*\[\]()~`>#+\-=|{}.!])/', '\\\\$1', $text);
}
