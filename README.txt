USUÁRIOS GENÉRICOS:
para criá-los precisa primeiramente:
1. descomentar todos os sync({force: true}) das models
2. executar o node app.js UMA vez (para criar as tabelas do banco)
3. comentá-los (sync({force: true})) novamente
4. descomentar as linhas 77 e 78 do app.js
5. rodar app.js UMA vez (cria os usuários)
6. comentá-las (linhas 77 e 78 do app.js) novamente
7. pronto, a partir disso pode executar normalmente o app.js

LOGIN USUÁRIO OPERADOR:
operador@gmail.com
senha: 123

LOGIN USUÁRIO GERENTE:
gerente@gmail.com
senha: 321