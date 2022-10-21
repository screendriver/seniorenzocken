import { createTeamsStore } from "./teams-store-factory";

export const teamsStore = createTeamsStore(window.sessionStorage);
