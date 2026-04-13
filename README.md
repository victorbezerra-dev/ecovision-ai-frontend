# Eco Vision AI Frontend

Angular frontend for the Eco Vision AI platform. This application provides a dashboard for visualizing urban environmental degradation data, uploading ZIP datasets, and creating collaborative reports with image-based description analysis.

> 📸 **Where to place application images:**
>
> - Right below this introduction: add a **cover image or general screenshot of the system**
> - In the **Main Features** section: add **one image per main feature**
> - In the **Run locally** section: add **an image showing the app running in the browser**

![Suggested cover image - main application screen](docs/images/app-overview.png)

## Overview

This project was built with Angular and includes:

- Environmental statistics dashboard
- Urban degradation map visualization
- Collaborative citizen reports
- ZIP file upload flow
- Google authentication
- Real image description analysis through the backend API

## Main Features

### 1. Dashboard and statistics
- Displays cluster and environmental stats
- Presents visual information for monitoring degradation indicators

![Suggested image - dashboard and statistics](docs/images/dashboard.png)

### 2. Urban degradation map
- Shows mapped report points
- Helps identify affected areas geographically

![Suggested image - urban degradation map](docs/images/urban-degradation-map.png)

### 3. Collaborative reporting
- Authenticated users can create new reports
- Reports include:
  - geographic coordinates
  - textual description
  - optional image
  - report status

![Suggested image - collaborative reporting flow](docs/images/collaborative-reporting.png)

### 4. Real image analysis
The frontend sends image files to the backend endpoint below:

`POST /api/v1/describe-image`

The request sends the image using `FormData` with the field:

`file`

Expected response format:

```json
{
  "filename": "images.jpeg",
  "content_type": "image/jpeg",
  "description": "..."
}
```

The returned `description` is automatically used to populate the report description field.

![Suggested image - image analysis and automatic description](docs/images/image-analysis.png)

## Tech Stack

- Angular 14
- TypeScript
- RxJS
- Angular Material
- Firebase
- Leaflet
- Bootstrap

## Project Structure

```text
src/
  app/
    components/
    layouts/
    models/
    pages/
    services/
  assets/
  environments/
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Angular CLI

### Installation

```bash
npm install
```

### Run locally

```bash
npm start
```

After starting the project, you can also add a screenshot here showing the application running locally:

![Suggested image - application running locally](docs/images/running-locally.png)

The development server will be available at:

```text
http://localhost:4200
```

## Available Scripts

### Start development server

```bash
npm start
```

### Build the project

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Run lint

```bash
npm run lint
```

### Run end-to-end tests

```bash
npm run e2e
```

## API Integration

The frontend is configured to communicate with the backend API under:

```text
https://ecovision-api.wonderfulmushroom-0044c3af.brazilsouth.azurecontainerapps.io/api/v1/
```

Currently used flows include:

- `POST /upload`
- `POST /describe-image`

## Authentication

The application uses Firebase Authentication for user sign-in and collaborative report creation.

## Notes

- The image description flow no longer uses mock generation.
- Image analysis is now performed by the real backend endpoint.
- Some build warnings may still exist in the project, but the application compiles successfully.

## License

Please check the `LICENSE.md` file for license details.