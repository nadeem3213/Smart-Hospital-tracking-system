# MediRoute: Smart Emergency Routing & Hospital Load Balancer

MediRoute is a full-stack, real-time web application designed to optimize emergency dispatch operations. By connecting a dynamic network of hospitals with real-time analytics, it calculates the fastest route for ambulances based on live distance, hospital capacity, and critical care availability.

## Features

- **Live Analytics Dashboard**: Real-time visualization of hospital network capacity, bed availability, and medical staff distribution using Recharts.
- **Dynamic Routing Engine**: Uses advanced algorithms (Dijkstra) integrated with Map/OSRM data to calculate the most efficient emergency routes based on live GPS tracking.
- **Pre-Selected Dispatching**: Seamlessly transition from a hospital listing directly into an active, pre-calculated emergency route.
- **Role-Based Access**: Secure JWT authentication for dispatchers and medical personnel.
- **Comprehensive Profiles**: Patient medical history and emergency contact management.
- **State-of-the-Art UI**: Built with React, Tailwind CSS, Framer Motion, and shadcn/ui for a premium, highly responsive user experience. 

## Technology Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion, Recharts, Leaflet/React-Leaflet, shadcn/ui.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens), bcryptjs.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI.

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Installation

1. Install Frontend Dependencies:
```bash
npm install
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Start the Backend Server:
```bash
npm start
```

4. Start the Frontend Development Server:
```bash
cd ..
npm run dev
```

The application will be available at `http://localhost:8080/`.

## Contributing
Contributions are welcome. Please ensure that you test all routing and map logic before opening a pull request.
