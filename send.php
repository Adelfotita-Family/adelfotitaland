<?php
// ============================================================
// НАСТРОЙКИ — заполните свои данные
// ============================================================

// Email
define('MAIL_TO',      'hello@adelfotita.ru');   // куда приходит письмо
define('MAIL_FROM',    'noreply@adelfotita.ru');  // от кого (должен совпадать с доменом сервера)
define('MAIL_SUBJECT', 'Новая заявка с сайта Adelfotita');

// Telegram
define('TG_BOT_TOKEN', 'ВАШ_ТОКЕН_БОТА');        // токен от @BotFather
define('TG_CHAT_ID',   'ВАШ_CHAT_ID');            // ID чата/канала куда слать

// ============================================================
// CORS + JSON-ответы
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
// ПОЛУЧЕНИЕ И САНИТИЗАЦИЯ ДАННЫХ
// ============================================================
$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$service = trim(strip_tags($_POST['service'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

// Валидация
$errors = [];
if (empty($name))                      $errors[] = 'Укажите имя';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Некорректный email';
if (empty($message))                   $errors[] = 'Укажите детали проекта';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => implode(', ', $errors)]);
    exit;
}

// ============================================================
// ОТПРАВКА EMAIL
// ============================================================
$mailBody = "Новая заявка с сайта Adelfotita Family\n";
$mailBody .= "==========================================\n\n";
$mailBody .= "Имя:     {$name}\n";
$mailBody .= "Email:   {$email}\n";
$mailBody .= "Услуга:  " . ($service ?: 'не выбрана') . "\n\n";
$mailBody .= "Сообщение:\n{$message}\n";

$mailHeaders  = "From: " . MAIL_FROM . "\r\n";
$mailHeaders .= "Reply-To: {$email}\r\n";
$mailHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
$mailHeaders .= "X-Mailer: PHP/" . phpversion();

$mailSent = mail(MAIL_TO, '=?UTF-8?B?' . base64_encode(MAIL_SUBJECT) . '?=', $mailBody, $mailHeaders);

// ============================================================
// ОТПРАВКА В TELEGRAM
// ============================================================
$tgText  = "📩 *Новая заявка с сайта*\n\n";
$tgText .= "👤 *Имя:* " . escTg($name) . "\n";
$tgText .= "📧 *Email:* " . escTg($email) . "\n";
$tgText .= "🛠 *Услуга:* " . escTg($service ?: 'не выбрана') . "\n\n";
$tgText .= "💬 *Сообщение:*\n" . escTg($message);

$tgUrl  = 'https://api.telegram.org/bot' . TG_BOT_TOKEN . '/sendMessage';
$tgData = http_build_query([
    'chat_id'    => TG_CHAT_ID,
    'text'       => $tgText,
    'parse_mode' => 'Markdown',
]);

$ctx = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => $tgData,
        'timeout' => 10,
    ]
]);
$tgResponse = @file_get_contents($tgUrl, false, $ctx);
$tgResult   = $tgResponse ? json_decode($tgResponse, true) : null;
$tgSent     = $tgResult['ok'] ?? false;

// ============================================================
// ОТВЕТ
// ============================================================
if ($mailSent || $tgSent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Не удалось отправить сообщение. Попробуйте позже.']);
}

// ============================================================
// ХЕЛПЕР — экранирование для Markdown в Telegram
// ============================================================
function escTg(string $text): string {
    return str_replace(['_', '*', '[', '`'], ['\\_', '\\*', '\\[', '\\`'], $text);
}
