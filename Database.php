<?php

// Show errors (disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

// Get form data
$name = trim($_POST['name'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$honeypot = $_POST['website'] ?? '';

// Validation
if (
    $honeypot !== '' ||
    empty($name) || strlen($name) < 2 ||
    empty($subject) ||
    empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    empty($message) || strlen($message) < 5
) {
    header("Location: https://techstersol.com?error=1");
    exit;
}

// Database credentials
$host = "localhost";
$username = "u563786655_tech";
$password = "Techstersol789@";
$dbname = "u563786655_tech";

// Connect DB
$con = new mysqli($host, $username, $password, $dbname);

if ($con->connect_error) {
    die("Database connection failed");
}

// Insert into database
$stmt = $con->prepare("INSERT INTO contactform (name, subject, email, message) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $subject, $email, $message);

if ($stmt->execute()) {

    $adminMail = new PHPMailer(true);
    $customerMail = new PHPMailer(true);

    try {

         // ==========================
        // ADMIN CONFIRMATION EMAIL
        // ==========================
        
        $adminMail->isSMTP();
        $adminMail->Host = 'smtp.hostinger.com';
        $adminMail->SMTPAuth = true;
        $adminMail->Username = 'info@techstersol.com';
        $adminMail->Password = 'Z1a@y3e4m789@';
        $adminMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $adminMail->Port = 587;

        $adminMail->setFrom('info@techstersol.com', 'Techstersol');
        $adminMail->addAddress('mzayemazam@gmail.com');

        $adminMail->isHTML(false);
        $adminMail->Subject = "Softifex Demo Booking Form Submission";

        $adminMail->Body =
            "Name: $name\n\n" .
            "Subject: $subject\n\n" .
            "Email: $email\n\n" .
            "Message:\n$message";

        // Send Email
        $adminMail->send();


        // ==========================
        // CUSTOMER CONFIRMATION EMAIL
        // ==========================

        $customerMail->isSMTP();
        $customerMail->Host = 'smtp.hostinger.com';
        $customerMail->SMTPAuth = true;
        $customerMail->Username = 'info@techstersol.com';
        $customerMail->Password = 'YOUR_NEW_PASSWORD';
        $customerMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $customerMail->Port = 587;

        $customerMail->setFrom('info@techstersol.com', 'Softifex Systems');
        $customerMail->addAddress($email, $name);

        $customerMail->isHTML(true);
        $customerMail->Subject = 'Submission Confirmation - Softifex Systems';

        $customerMail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Submission Confirmation</title>
        </head>
        <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f9; margin:0; padding:20px;">

        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
        <td align="center">

        <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e5e5;">

        <tr>
        <td style="background:#0a3d8f; padding:25px; text-align:center;">
        <h1 style="color:#ffffff; margin:0;">Softifex Systems</h1>
        </td>
        </tr>

        <tr>
        <td style="padding:35px; color:#333333;">

        <h2 style="margin-top:0; color:#0a3d8f;">
        Submission Received Successfully
        </h2>

        <p>Dear '.htmlspecialchars($name).',</p>

        <p>
        Thank you for your submission. We have successfully received your request and our team will review it shortly.
        </p>

        <p>
        One of our representatives will contact you using the details you provided.
        </p>

        <p>
        We appreciate your trust in <strong>Softifex Systems</strong> and look forward to serving you.
        </p>

        <br>

        <p>
        Best Regards,<br>
        <strong>Softifex Systems Team</strong>
        </p>

        </td>
        </tr>

        <tr>
        <td style="padding:20px 35px; background:#f8f9fb; border-top:1px solid #e5e5e5;">
        <strong>Softifex Systems</strong><br>
        A comprehensive Pharmaceutical ERP built for distributors, and 
        wholesalers.
        Developed by Techstersol.
        </td>
        </tr>

        <tr>
        <td style="padding:30px; text-align:center; font-size:13px; color:#666666; border-top:1px solid #e5e5e5;">

        <div style="margin-bottom:15px;">
        <strong>Website:</strong>
        <a href="https://www.softifex.techstersol.com" style="color:#0a3d8f;">
        www.softifex.techstersol.com
        </a>
        </div>

        <div style="margin-bottom:8px;">
        📞 +92 306 6940981
        </div>

        <div style="margin-bottom:8px;">
        ✉ zayem@techstersol.com
        </div>

        <div style="margin-bottom:15px;">
        <a href="https://wa.me/923066940981?text=Hi%20Zayem%2C%20I%27m%20interested%20in%20Softifex%20ERP!" style="color:#0a3d8f;">
        WhatsApp Chat Available
        </a>
        </div>

        <div>
        © 2026 Softifex Systems. All Rights Reserved.
        </div>

        <div style="margin-top:10px;">
        Powered by <strong>Techstersol</strong>
        &nbsp;|&nbsp;
        Developed by <strong>Muhammad Zayem</strong>
        </div>

        </td>
        </tr>

        </table>

        </td>
        </tr>
        </table>

        </body>
        </html>';

        $customerMail->send();

        header("Location: https://softifex.techstersol.com/?success=1");
        exit;

    } catch (Exception $e) {

        header("Location: https://softifex.techstersol.com/?error=1");
    }

} else {
        header("Location: https://softifex.techstersol.com/?error=1");
}

$stmt->close();
$con->close();

?>