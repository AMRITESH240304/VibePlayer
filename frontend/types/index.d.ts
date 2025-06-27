export interface UserInfo {
    id: string;
    name: string;
    email: string;
}

export type WebSocketMessage =
  | {
      type: "metrics";
      cpu: number;
      memory: number;
    }
  | {
      type: "upload_status" | "training_status";
      message: number;
    };

type Song = {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
};