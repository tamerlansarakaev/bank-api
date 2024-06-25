export const previewPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backend - Home</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(to bottom, #e0ffff, #cce0ff);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
        }

        h1 {
            font-size: 3em;
            color: #333;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            margin-bottom: 1em;
            animation: fadeInUp 1s ease-out;
        }

        .button {
            display: inline-block;
            padding: 15px 30px;
            font-size: 1.4em;
            text-decoration: none;
            background-color: #008CBA;
            color: #fff;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            animation: pulse 1.5s infinite;
        }

        .button:hover {
            background-color: #00688B;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
            transform: translateY(-2px);
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2em;
            }
            .button {
                font-size: 1.2em;
            }
        }
    </style>
</head>
<body>
    <h1>Welcome to the Bank API!</h1>
    <a href="/docs" class="button">Documentation</a>
</body>
</html>`;
