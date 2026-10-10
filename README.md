Sistema Bancario Distribuido — Nodo 2: Sucursal AdministrativaEste repositorio contiene la implementación del Nodo 2 (Sucursal Administrativa) dentro de un Sistema Bancario Distribuido. Este módulo permite a los ejecutivos de sucursal gestionar la apertura de cuentas de clientes, la consulta de estados de cuenta e historial transaccional, y la consolidación de cortes operativos y reportes de auditoría en tiempo real en comunicación sincrónica con el Nodo 1 (Banco Central).📌 Enlaces de Despliegue en ProducciónComponenteEntorno de HostingEnlace / URL PúblicaEstadoNodo 1 — Banco Central APICoolify / Renderhttps://banco-central-api.onrender.comACTIVONodo 2 — Sucursal AdministrativaRender / Vercelhttps://sucursal-nodo2-nyl2.onrender.comACTIVO📐 Diagrama de Arquitectura de la Red Bancariagraph TD
    subgraph Cliente ["💻 Cliente / Ejecutivo de Cuenta"]
        UI["Interfaz Web (EJS + Tailwind CSS)"]
    end

    subgraph Nodo2 ["🏢 Nodo 2: Sucursal Administrativa (Node.js / Express)"]
        Router["Express Router & Controllers"]
        CentralService["Central API Service (Axios Client)"]
        SessionStore["Session Manager"]
    end

    subgraph Nodo1 ["🏛️ Nodo 1: Banco Central (Servidor Principal)"]
        CentralAPI["API REST Central"]
        CentralDB[(Base de Datos Central - PostgreSQL / Supabase)]
    end

    UI -->|HTTPS / Requests| Router
    Router -->|Invocación interna| CentralService
    CentralService -->|Peticiones REST con API Key| CentralAPI
    CentralAPI -->|Consultas SQL / Transacciones| CentralDB
🛠️ Módulos del Sistema DistribuidoAutenticación y Control de Sesión (/login, /logout):Acceso restringido para ejecutivos de cuenta autorizados en el Nodo 2.Apertura de Cuentas (/new-client, /create-account):Registro distribuido de clientes y asignación automática de número de cuenta de 10 dígitos mediante el Banco Central.Sistema de notificaciones (toasts) en el Dashboard.Consulta de Cuentas y Movimientos (/search-account):Búsqueda en tiempo real de saldos y la bitácora transaccional (depósitos y retiros) sincronizada.Reportes y Corte de Caja (/reports):Métricas de liquidez de la sucursal, consolidación de depósito/retiro acumulado e interfaz adaptada para impresión física/PDF.📂 Estructura de Proyecto (Nodo 2)sucursal-nodo2/
├── src/
│   ├── config/
│   │   └── supabase.js       # Configuración de base de datos local (opcional/respaldo)
│   ├── controllers/
│   │   └── branchController.js # Lógica de negocio de la sucursal
│   ├── routes/
│   │   └── branchRoutes.js    # Definición de rutas Express
│   ├── services/
│   │   └── centralService.js  # Cliente de integración Axios con Nodo 1 (Banco Central)
│   └── app.js                 # Punto de entrada de la aplicación Node.js
├── views/                     # Vistas EJS (Interfaz Matte Titanium)
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── new-client.ejs
│   ├── account-details.ejs
│   └── reports.ejs
├── public/                    # Recurso estáticos (CSS/JS)
├── .env.example               # Plantilla de variables de entorno
├── openapi.yaml               # Especificación OpenAPI 3.0 de la API
├── package.json
└── README.md
⚙️ Variables de Entorno (.env)Para ejecutar el proyecto localmente o desplegarlo en Render/Vercel/Coolify, configura las siguientes variables:PORT=3000
SESSION_SECRET=super_secreto_bancario_nodo2
CENTRAL_API_URL=https://banco-central-api.onrender.com/api
CENTRAL_API_KEY=tu_clave_api_central_aqui
🚀 Instalación y Ejecución LocalClonar el repositorio:git clone https://github.com/tu-usuario/sucursal-nodo2.git
cd sucursal-nodo2
Instalar dependencias:npm install
Iniciar en modo desarrollo:npm run dev
Abrir en el navegador: http://localhost:3000