````markdown
# nccKitsUnit-frontend

The **NCC Cadet Management System - Frontend** is a web application developed using **React.js**. It provides a user-friendly interface for cadets to manage stocks, register for camps, and receive notifications. The ANO can view cadet stock statuses, accept/reject camp registrations, and send announcements to cadets, enhancing communication and organization within the NCC unit.

## Features

- **Cadet Dashboard**: Cadets can view and manage their assigned stocks, including returnable and pending items.
- **Camp Registration**: Cadets can register for upcoming camps, while the ANO can accept or reject their registrations.
- **Stock Management**: Cadets can view their stock statuses, and the ANO can track which cadets have issued stocks.
- **Email Notifications**: Cadets receive **Regimental IDs** and announcements from the ANO through email.
- **Responsive Design**: The application is designed to be fully responsive, ensuring an optimal experience across all devices.

## Tech Stack

- **React.js**: Frontend framework.
- **React Router DOM**: For navigation between pages.
- **Tailwind CSS**: For styling and responsive design.
- **Axios**: For making API calls to the backend.
- **JWT (JSON Web Tokens)**: For handling user authentication and session management.

## Setup

### Prerequisites

- Node.js (>=12.0.0)
- npm (>=6.0.0)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nccKitsUnit-frontend.git
   cd nccKitsUnit-frontend
````

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. Start the development server:

   ```bash
   npm start
   ```

   The app should now be running at `http://localhost:3000`.

### Available Scripts

* **`npm start`**: Runs the app in development mode.
* **`npm run build`**: Builds the app for production to the `build` folder.
* **`npm test`**: Launches the test runner in interactive watch mode.

## Backend Integration

This frontend interacts with the backend of the **NCC Cadet Management System** using REST APIs. The API URL must be specified in the `.env` file as `REACT_APP_API_URL`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

The **NCC Cadet Management System** was developed by **4th-year students** of **KITs College**, under the guidance of **Tarun Swaroop**.

```

This `README.md` file provides all the necessary details for setting up and using the frontend of your NCC Cadet Management System.
```
