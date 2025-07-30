import Pocketbase from "pocketbase";
import { ADMIN_CREDENTIALS } from "./constants";

export async function createAuthenticatedClient(url: string) {
  const pb = new Pocketbase(url);
  await pb
    .collection("_superusers")
    .authWithPassword(ADMIN_CREDENTIALS.EMAIL, ADMIN_CREDENTIALS.PASSWORD);
  return pb;
}
