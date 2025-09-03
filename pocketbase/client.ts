import type { TypedPocketBase } from "../src/lib/typed-pocketbase";
import { createTypedPocketBase } from "../src/lib/typed-pocketbase";
import { ADMIN_CREDENTIALS } from "./constants";

export async function createAuthenticatedClient(
  url: string,
): Promise<TypedPocketBase> {
  const pb = createTypedPocketBase(url);
  await pb
    .collection("_superusers")
    .authWithPassword(ADMIN_CREDENTIALS.EMAIL, ADMIN_CREDENTIALS.PASSWORD);
  return pb;
}
