<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? '');
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_VALIDATE_EMAIL);
    $message = trim($_POST["message"] ?? '');

    if ($name && $email && $message) {
        // Encode HTML special characters only on output (not necessary for email)
        $name_safe = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $message_safe = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $to = "leonhe377@gmail.com";

        $subject = mb_encode_mimeheader("Kontaktformular – Gemüsegenossen", "UTF-8");

        $headers = "From: kontakt@deinedomain.de\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "Content-Type: text/plain; charset=utf-8\r\n";

        $body = "Neue Nachricht über das Kontaktformular:\n\n";
        $body .= "Name: $name\n";
        $body .= "E-Mail: $email\n\n";
        $body .= "Nachricht:\n$message\n";

        if (mail($to, $subject, $body, $headers)) {
            echo "<!DOCTYPE html>
<html lang='de'>
<head>
  <meta charset='UTF-8'>
  <title>Nachricht gesendet</title>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'>
</head>
<body class='bg-light text-center py-5'>
  <div class='container'>
    <h1 class='text-success'>Danke für deine Nachricht!</h1>
    <p>Wir melden uns so schnell wie möglich.</p>
    <p>Deine Gemüsegenossen</p>
    <a href='kontakt.html' class='btn btn-success mt-3'>Zurück zur Kontaktseite</a>
  </div>
</body>
</html>";
        } else {
            echo "Fehler beim Versenden der Nachricht. Bitte versuche es später noch einmal.";
        }
    } else {
        echo "Bitte alle Felder korrekt ausfüllen.";
    }
} else {
    header("Location: kontakt.html");
    exit;
}

?>
