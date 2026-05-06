# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2bf3ce8a-1217-4c68-bd5c-0348af0bf22d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2bf3ce8a-1217-4c68-bd5c-0348af0bf22d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 환경 변수

### `VITE_BANNER_LOG_LEVEL` — Job Fit Evaluation 배너 로그 레벨

채용 적합도 평가(`/job-fit-evaluation`) 페이지의 "URL 파라미터 누락" 안내 배너 및 타이머 동작에 대한 콘솔 로그 출력을 제어합니다.

**설정 방법**

프로젝트 루트의 `.env` 파일(또는 `.env.local`)에 다음과 같이 추가합니다.

```sh
# 예시: 개발 중 모든 로그 보기
VITE_BANNER_LOG_LEVEL=debug

# 예시: 프로덕션에서 경고 이상만 보기
VITE_BANNER_LOG_LEVEL=warn

# 예시: 모든 배너 로그 끄기
VITE_BANNER_LOG_LEVEL=silent
```

값을 변경한 뒤에는 Vite 개발 서버를 재시작해야 적용됩니다.

**허용 값**

| 값        | 출력되는 로그                                  | 권장 사용 환경            |
| --------- | --------------------------------------------- | ------------------------ |
| `debug`   | `debug` / `info` / `warn` / `error` 전부      | 로컬 개발, 배너 동작 디버깅 |
| `info`    | `info` / `warn` / `error`                     | QA, 스테이징              |
| `warn`    | `warn` / `error`                              | 프로덕션 기본값            |
| `error`   | `error` 만                                    | 에러만 추적하고 싶을 때     |
| `silent`  | (출력 없음)                                   | 완전히 끄고 싶을 때        |

**기본값**

- `import.meta.env.DEV === true` (개발 모드): `debug`
- 그 외 (프로덕션 빌드): `warn`
- 허용되지 않은 값을 지정하면 위 기본값으로 폴백됩니다.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2bf3ce8a-1217-4c68-bd5c-0348af0bf22d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
