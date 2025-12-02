import { SERVER_URL } from "#/data/constants";
import { hcWithType } from "../../../server/src/lib/hc";

export const apiClient = hcWithType(SERVER_URL, {
  init: {
    credentials: "include",
  },
});
