# 🧪 Eli Health Test Strip Scanner Backend

This is the backend service for the Eli Health Test Strip Scanner application. It supports image uploads, QR code extraction, submission history, image validation, and retry mechanisms. The service is containerized using Docker and built with Node.js, Express, PostgreSQL, and native image processing tools.

It exposes RESTful API endpoints to manage test strip submissions and handles validation, duplicate detection, and thumbnail generation.


## 🚀 Features

- 📸 Upload test strip images via REST API
- 🔍 Automatic QR code extraction from uploaded images
- 🧠 Image validation: checks for file size, format, and dimensions
- 🔁 Offline retry mechanism (queue retry handled by frontend)
- 🗂️ Submission history with pagination and individual record fetching
- 🖼️ Image thumbnail generation for previews
- 🐳 Dockerized backend setup for easy deployment
- 🧪 Follows SOLID principles with middleware and service architecture

## 🧰 Technologies Used

### Backend
- **Node.js** & **Express** – Web framework and server
- **PostgreSQL** – Database for storing submission records
- **Docker** – Containerized development and deployment
- **Multer** – Middleware for handling `multipart/form-data` (image uploads)
- **QRCode-reader** – Library for reading QR codes from images
- **Image-Size** – For validating image dimensions
- **uuid** – To generate unique IDs for file names (where needed)

### Frontend (React Native Expo App)
- **React Native** – Cross-platform mobile app framework
- **Expo Camera** – For capturing test strip photos
- **Axios** – For API requests
- **@react-native-community/netinfo** – To detect network status
- **ImageManipulator (Expo)** – For resizing/compressing images before upload
- **AsyncStorage** – For offline upload queue storage

### Code Practices
- 🧱 Modular folder structure with separation of concerns
- 🧪 SOLID Principles applied across controller, service, and middleware layers

## ⚙️ Setup Instructions

Follow these steps to set up the project locally using Docker:

### 1. Clone the repository
```bash
git clone https://github.com/ChinmayaGarg/test-strip-scanner.git
cd test-strip-scanner

docker-compose up --build

cd mobile
npm install
npx expo start -c

Use Expo Go or a simulator/emulator to run the app on your device.


## 📡 API Endpoints

### 🔼 POST `/api/test-strips/upload`
Upload a new test strip image.

- **Request**: `multipart/form-data` with field `image`
- **Response**: QR code data, dimensions, image size, status, and thumbnail path.
- **Errors**:
  - `400`: No file or invalid file format
  - `409`: Duplicate QR code
  - `500`: Processing error

---

### 📜 GET `/api/test-strips/history`
Fetch all previously submitted test strips.

- **Response**: Array of all submissions with image URLs

---

### 📄 GET `/api/test-strips/:id`
Fetch a specific test strip submission by its ID.

- **Params**: `id` (UUID)
- **Response**: Full details of the submission
- **Errors**:
  - `404`: Not found

---

### 🌐 GET `/api/test-strips`
Fetch paginated test strip submissions.

- **Query Params**:
  - `page` (optional, default = 1)
  - `limit` (optional, default = 10)

- **Response**:
  ```json
  {
    "data": [...],
    "page": 1,
    "limit": 10
  }

---

### 🌐 GET `/api/test-strips/uploads/:filename`
Serve the uploaded image file by filename.

- **Query Params**:
  - `page` (optional, default = 1)
  - `limit` (optional, default = 10)

- **Response**:
    - `image file`

- **Errors**:
  - `404`: Not found

## 💡 Learnings & Blockers

### 🔍 Key Learnings

- **Image Quality Validation**: We implemented blur detection and brightness checks using Expo and React Native libraries to ensure only good-quality images are processed. This helped in reducing backend failures.
- **Offline Support**: Handling offline uploads using a persistent queue in the frontend gave us insights into edge-case handling and synchronization using `NetInfo`.
- **End-to-End System Integration**: Connecting React Native (frontend), Express/Node.js (backend), PostgreSQL (DB), and Docker showed us the importance of clean APIs, modular services, and solid error handling.
- **Code Maintainability**: Applying **SOLID principles** helped in refactoring controllers, introducing middleware and services, and decoupling responsibilities for easier testing and extensibility.
- **Dockerizing the Stack**: Docker simplified cross-environment setup and deployment. We learned how to efficiently use Docker Compose to coordinate PostgreSQL and Express servers.

---

### 🐞 Notable Blockers & How We Solved Them

| Blocker | Resolution |
|--------|------------|
| Blurry or dark image uploads | Added `estimateBlur` and brightness checks to avoid processing poor-quality images |
| Uploads failing in offline mode | Implemented an offline queue system using AsyncStorage and retry mechanism with `NetInfo` |
| Image dimension/size issues on backend | Created a validator module to restrict uploads to a max size and dimensions |
| Redundant controller logic | Introduced service layers and middleware to follow Single Responsibility and Open-Closed principles |
| UUID and input validation | Used regex to validate UUID format directly in the controller before querying the DB |
| Unexpected large file sizes in queue | Compressed and resized images before storing them in the upload queue using `ImageManipulator` |

## 🚀 Future Improvements

While the current version is functional and robust, there are several enhancements that could further improve usability, performance, and maintainability:

### ✅ Functional Enhancements

- **User Authentication**: Introduce user accounts and associate uploads with specific users to enable personalized history tracking and secure access.
- **Admin Dashboard**: Build a web-based dashboard to review submissions, flag anomalies, and manage the backend database.
- **Multi-language Support**: Add internationalization (i18n) for broader accessibility in different regions.
- **Push Notifications**: Notify users when their submissions are successfully uploaded or if they need to retake a test.

### 🔐 Security Enhancements

- **CORS Restrictions**: Only allow requests from the official hosted frontend (e.g., `https://myapp.com`). Block all others, including Postman or external tools.
- **API Key Protection**: Add API keys or JWT-based authentication to prevent unauthorized access.
- **Rate Limiting**: Prevent brute-force attacks and abuse by limiting the number of requests per IP.
- **Input Sanitization**: Ensure all incoming data is validated and sanitized to prevent injection attacks.
- **HTTPS Enforcement**: Redirect all traffic to HTTPS to protect data in transit.

### ⚙️ Technical Improvements

- **Background Uploads**: Implement background tasks to allow image uploads even when the app is minimized or closed.
- **Image Quality Scoring**: Use machine learning (e.g., TensorFlow.js or a lightweight model) to evaluate image quality more accurately.
- **CDN for Image Hosting**: Offload image hosting to a CDN (like Cloudinary or AWS S3 + CloudFront) for faster load times and scalability.
- **Automated Testing**: Add unit tests for services and API endpoints using tools like Jest and Supertest.

### 📦 DevOps Improvements

- **CI/CD Pipeline**: Integrate GitHub Actions or GitLab CI to automate linting, testing, and deployments.
- **Monitoring and Logging**: Add monitoring tools like Prometheus and logging via Winston or Datadog for better diagnostics and alerting.
- **Config Management**: Extract environment-specific configs using `.env` files or Docker secrets for better configuration management.

### 🔧 Solutions for Future Improvements & Security

#### 1. Resumable Uploads
- **Solution**: Implement a chunked upload mechanism using libraries like [`tus-js-client`](https://github.com/tus/tus-js-client) on the client side and `tus-node-server` on the backend. This allows uploads to resume from the last chunk in case of failure.

#### 2. Image Quality Feedback in Real-Time
- **Solution**: Use WebAssembly or lightweight TensorFlow models on the client side to give users real-time feedback (e.g., brightness level, blur detection) before capture or upload.

#### 3. Offline Upload Management UI
- **Solution**: Maintain a local queue using `AsyncStorage` or `MMKV` and display a status banner with retry options. Allow users to manually retry failed uploads from the queue.

#### 4. Rate Limiting and Abuse Prevention
- **Solution**: Use middleware like `express-rate-limit` to limit API usage per IP address or token. Store counts in Redis or in-memory for speed and efficiency.

#### 5. Restrict External API Access (Only Allow from Frontend)
- **Solution**:
  - Set up strict **CORS policy** in Express:
    ```ts
    app.use(
      cors({
        origin: ['https://your-frontend-domain.com'],
        methods: ['GET', 'POST'],
        credentials: true,
      })
    );
    ```
  - Restrict API calls using **Referer header** verification or JWT-based frontend authentication.
  - Configure reverse proxy (e.g., NGINX) to allow only traffic from whitelisted domains.

#### 6. Environment-Specific Configuration
- **Solution**: Use `.env` in development and Docker secrets or runtime environment variables in production. Inject them securely using `docker-compose` or Kubernetes config maps.

#### 7. Unit & Integration Tests
- **Solution**:
  - Write more comprehensive tests.
  - Use `msw` to mock API calls in the frontend.
  - Use `jest` snapshots to validate image processing logic and data flows.


