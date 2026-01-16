# 📦 Estoque Pro

**Estoque Pro** é uma aplicação web de **Gestão de Estoque** com foco em mobilidade e controle de validade (FIFO). Desenvolvido para funcionar perfeitamente em dispositivos móveis (Mobile First) com interface Dark Mode moderna.

O sistema permite o cadastro de produtos, controle de lotes por validade, leitura de código de barras via câmera do celular e alertas visuais para produtos vencidos ou com estoque baixo.

---

## 📸 Screenshots

| TELA INICIAL (Mobile) | TELA DE LOGIN. | RELATORIO | ADICIONAR PEODUTOS 


TELA INICIAL ![WhatsApp Image 2026-01-16 at 02 40 43](https://github.com/user-attachments/assets/24d680e2-7a5a-40c3-aba8-39c347293551)

LOGIN <img width="1902" height="953" alt="Captura de tela 2026-01-16 022527" src="https://github.com/user-attachments/assets/b5c572c4-245f-460c-a5a6-3d66bee9bddb" />

RELATORIO <img width="1907" height="951" alt="Captura de tela 2026-01-16 024050" src="https://github.com/user-attachments/assets/88dde31d-ef40-480b-829a-526e73128ead" />

ADD PRODUTOS <img width="1918" height="957" alt="Captura de tela 2026-01-16 024127" src="https://github.com/user-attachments/assets/cfbdb3d2-3a34-4320-9501-97610ba8e31c" />


---

## 🚀 Funcionalidades Principais

- **📱 Interface Mobile First:** Design responsivo e tema Dark Mode (inspirado no Material Design).
- **📷 Scanner Integrado:** Leitura de códigos de barras usando a câmera do dispositivo (via `html5-qrcode`).
- **📅 Controle FIFO (PEPS):** Lógica inteligente que prioriza a exibição de produtos com validade mais próxima.
- **🚨 Alertas Visuais:**
  - 🟢 **Verde:** Validade OK.
  - 🟡 **Amarelo:** Atenção/Estoque Baixo.
  - 🔴 **Vermelho:** Produto Vencido.
- **📊 Dashboard Financeiro:** Relatório rápido de valor total em estoque e quantidade de itens.
- **🖼️ Upload de Imagens:** Cadastro de produtos com foto.
- **🔐 Sistema de Login:** Autenticação simples para proteção dos dados.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python 3, Flask.
- **Banco de Dados:** SQLite (Nativo, sem necessidade de instalação extra).
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Bibliotecas:** - `html5-qrcode` (Scanner).
  - `Werkzeug` (Segurança de arquivos).

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- Python 3.x instalado.
- Git instalado.

### Passo a Passo

# No Windows

python -m venv venv
.\venv\Scripts\activate

# No Linux/Mac

python3 -m venv venv
source venv/bin/activate

Instale as dependências:

   pip install -r requirements.txt
   
Execute a aplicação:

    python app.py
   
Acesse no navegador:
   
Abra http://localhost:5000

Login Padrão:

Usuário: admin

Senha: admin

📱 Como Testar no Celular (Rede Local)
Para usar a câmera do celular, o navegador exige uma conexão segura (HTTPS) ou localhost.

Instale o Ngrok (para criar um túnel seguro).

Com o app rodando, execute em outro terminal:
ngrok http 5000

📂 Estrutura do Projeto
EstoquePro/
│
├── static/          # Arquivos CSS e JavaScript
├── templates/       # Arquivos HTML (Frontend)
├── uploads/         # Onde as fotos dos produtos são salvas
├── app.py           # Código principal (Backend Flask)
├── estoque.db       # Banco de dados SQLite
└── requirements.txt # Lista de dependências

📝 Licença
Este projeto está sob a licença MIT. Sinta-se à vontade para usá-lo e modificá-lo para seus estudos.

Feito com 💜 por [Stefanny-Brito00]
https://github.com/Stefanny-Brito00

