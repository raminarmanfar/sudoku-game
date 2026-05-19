# Sudoku Game — Full-Stack Project

A production-ready Sudoku game with an **Ionic/Angular Android app**, **Java Spring Boot API**, **PostgreSQL** database, and a complete **DevOps pipeline** on **AWS EKS**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS EKS Cluster                        │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Ionic PWA  │───▶│ Spring Boot  │───▶│   PostgreSQL RDS  │  │
│  │  (nginx)    │    │   REST API   │    │  (StatefulSet /   │  │
│  └─────────────┘    └──────────────┘    │   AWS RDS)        │  │
│         │                               └───────────────────┘  │
│   AWS ALB Ingress                                               │
└─────────────────────────────────────────────────────────────────┘

CI/CD Flow:
  GitHub PR → GitHub Actions (lint/test)
  Push to develop/main → Jenkins Pipeline
    → Maven test → npm build → Docker Build
    → Push to AWS ECR
    → Update Kustomize image tags
    → ArgoCD syncs to EKS (dev auto / prod manual)

Android APK:
  Ionic → Capacitor → Android Studio → Play Store
```

---

## Project Structure

```
sudoku/
├── mobile/                    # Ionic Angular app (PWA + Android via Capacitor)
│   ├── src/app/
│   │   ├── pages/
│   │   │   ├── home/          # Difficulty selector + navigation
│   │   │   ├── game/          # Sudoku board, timer, number pad
│   │   │   └── leaderboard/   # Top scores per difficulty
│   │   └── services/
│   │       └── sudoku.service.ts  # API client + local board generator
│   ├── Dockerfile             # Multi-stage nginx build
│   └── capacitor.config.json  # Capacitor / Android config
│
├── backend/                   # Spring Boot 3 / Java 21
│   ├── src/main/java/com/sudoku/
│   │   ├── controller/        # REST endpoints
│   │   ├── service/           # Business logic
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Spring Data repos
│   │   ├── dto/               # Request/response DTOs
│   │   ├── exception/         # Global error handler
│   │   └── config/            # CORS config
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/      # Flyway SQL migrations
│   └── Dockerfile             # Multi-stage Maven build
│
├── k8s/
│   ├── base/                  # Namespace, Postgres, Backend, Frontend, Ingress
│   └── overlays/
│       ├── dev/               # 1 replica, dev image tags
│       └── prod/              # 3 replicas, stable image tags
│
├── argocd/
│   ├── project.yaml           # ArgoCD AppProject
│   ├── application-dev.yaml   # Auto-sync from develop branch
│   └── application-prod.yaml  # Manual sync from main branch
│
├── jenkins/
│   ├── Jenkinsfile            # Multibranch pipeline
│   └── jenkins-k8s.yaml      # Jenkins deployment on EKS
│
├── .github/workflows/
│   └── pr-checks.yml          # PR lint & test checks
│
└── docker-compose.yml         # Local development stack
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/puzzles?difficulty=medium` | Get a random puzzle |
| `POST` | `/api/puzzles/{id}/validate` | Validate a submitted solution |
| `POST` | `/api/scores` | Save a completed game score |
| `GET` | `/api/scores/leaderboard?difficulty=hard` | Get top 50 scores |
| `GET` | `/actuator/health` | Health check |

---

## Quick Start (Local)

### Prerequisites
- Docker & Docker Compose
- Java 21 + Maven (for backend development)
- Node 20 + npm (for frontend development)

### Run everything locally
```bash
docker compose up --build
```
- Frontend: http://localhost:4200
- Backend:  http://localhost:8080
- Postgres: localhost:5432

### Backend only (dev mode)
```bash
cd backend
mvn spring-boot:run
```

### Frontend only (dev mode)
```bash
cd mobile
npm install --legacy-peer-deps
npx ionic serve
```

---

## Android Build

```bash
cd mobile
npm install --legacy-peer-deps
npx ionic build --prod
npx cap add android
npx cap sync android
npx cap open android   # Opens Android Studio
```

---

## AWS Infrastructure Setup

### 1. Create ECR repositories
```bash
aws ecr create-repository --repository-name sudoku-backend --region us-east-1
aws ecr create-repository --repository-name sudoku-frontend --region us-east-1
```

### 2. Create EKS cluster
```bash
eksctl create cluster \
  --name sudoku-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed
```

### 3. Install AWS Load Balancer Controller
```bash
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=sudoku-cluster
```

### 4. Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
# Apply project & applications
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-prod.yaml
```

### 5. Deploy Jenkins on EKS
```bash
kubectl create namespace jenkins
kubectl apply -f jenkins/jenkins-k8s.yaml
```

---

## Jenkins Credentials Required

| ID | Type | Description |
|----|------|-------------|
| `aws-account-id` | Secret text | AWS Account ID |
| `aws-ecr-credentials` | AWS credentials | ECR push access |
| `argocd-token` | Secret text | ArgoCD API token |
| `github-ssh` | SSH private key | Git push for GitOps |

---

## Branching Strategy

| Branch | Trigger | Environment |
|--------|---------|-------------|
| `develop` | Auto-deploy | dev (ArgoCD auto-sync) |
| `main` | Manual approval | prod (ArgoCD manual sync) |
| `feature/*` | PR checks only | — |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Ionic 7 + Angular 17 + Capacitor 5 |
| Backend | Spring Boot 3.2 + Java 21 |
| Database | PostgreSQL 16 + Flyway migrations |
| Container | Docker multi-stage builds |
| Registry | AWS ECR |
| Orchestration | Kubernetes on AWS EKS |
| GitOps | ArgoCD + Kustomize |
| CI/CD | Jenkins (Kubernetes agent) |
| PR Checks | GitHub Actions |
| Ingress | AWS ALB Ingress Controller |
