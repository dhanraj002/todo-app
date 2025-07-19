# Todo Web Application

A full-stack Todo application where you can manage daily tasks and track your weekly/monthly accomplishments.

## Features

- **Daily Task Management**: Add, edit, delete, and mark tasks as complete for specific days
- **Weekly Summary**: View all tasks for a week with completion statistics
- **Monthly Summary**: View all tasks for a month with completion statistics
- **Persistent Storage**: All data is stored in SQLite database
- **Responsive Design**: Clean, modern UI that works on desktop and mobile

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: SQLite (persistent storage)
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system

### Running the Application

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd todo-app
   ```

3. Build and run the application using Docker Compose:
   
   **For interactive mode (with logs):**
   ```bash
   docker-compose up --build
   ```
   
   **For detached mode (runs in background):**
   ```bash
   docker-compose up -d --build
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

The application will be running with persistent data storage in the `./data` directory.

### Stopping the Application

To stop the application:
```bash
docker-compose down
```

## Usage

### Daily View
- Select a specific date using the date picker
- Add new tasks by typing in the input field and clicking "Add"
- Mark tasks as complete by checking the checkbox
- Delete tasks using the "Delete" button

### Weekly View
- Select any date within the week you want to view
- See all tasks for that week
- View completion statistics (accomplished vs pending)

### Monthly View
- Select any date within the month you want to view
- See all tasks for that month
- View completion statistics (accomplished vs pending)

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/tasks` - Get all tasks (optionally filter by date)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/summary/week` - Get weekly summary
- `GET /api/summary/month` - Get monthly summary

## Data Persistence

All task data is stored in a SQLite database located at `./data/todo.db`. This directory is mounted as a Docker volume, so your data persists between container restarts.

**Note**: The `data/` folder is excluded from version control for security and privacy reasons. When you first run the application, it will automatically create the database and required tables.

## Development

### Project Structure
```
todo-app/
├── client/          # React frontend
├── server/          # Node.js backend
├── data/            # SQLite database storage (created automatically)
├── Dockerfile       # Multi-stage Docker build
├── docker-compose.yml
└── README.md
```

### Manual Development Setup (without Docker)

If you want to run the application without Docker for development:

1. Install Node.js (v16 or higher)
2. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. Build the frontend:
   ```bash
   cd client && npm run build
   ```
4. Start the backend:
   ```bash
   cd server && npm start
   ```

## Security

This application implements several security measures:

- **Input Validation**: All API endpoints validate and sanitize input data
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Rate Limiting**: Protection against abuse with request limits
- **Security Headers**: Enhanced security headers for XSS and clickjacking protection
- **SQL Injection Protection**: Parameterized queries throughout
- **Error Handling**: Secure error responses without information disclosure

For detailed security information, see [SECURITY.md](SECURITY.md).

## Environment Configuration

For production deployment, copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `NODE_ENV=production`
- `ALLOWED_ORIGINS`: Your production domain(s)
- `PORT`: Server port (default: 5000)

## License

This project is open source and available under the MIT License. 