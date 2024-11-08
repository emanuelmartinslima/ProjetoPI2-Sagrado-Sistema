        // Recupera o estado do tema do armazenamento local
        document.addEventListener('DOMContentLoaded', () => {
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('toggleTheme').innerHTML = '<i class="bi bi-brightness-high"></i>';
            }
        });

        // Alterna o tema e salva a preferência
        document.getElementById('toggleTheme').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            document.getElementById('toggleTheme').innerHTML = isDarkMode
                ? '<i class="bi bi-brightness-high"></i>'
                : '<i class="bi bi-moon-fill"></i>';
        });
