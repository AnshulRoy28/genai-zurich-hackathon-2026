/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPTILER_KEY: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_ACCESS_KEY_ID: string;
  readonly VITE_AWS_SECRET_ACCESS_KEY: string;
  readonly VITE_AWS_POLLY_VOICE_ID: string;
  readonly VITE_AWS_POLLY_ENGINE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
