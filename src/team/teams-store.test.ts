import { assert, test, vi, type Mock } from "vitest";
import { get, type Updater, type Writable } from "svelte/store";
import { Factory } from "fishery";
import { teams, areTeamsFilled, type Team, type Teams, updateStoreTeamGamePoints } from "./teams-store";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0
	};
});

test("areTeamsFilled store returns false when teams store is empty", () => {
	teams.set(new Map());

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

test('areTeamsFilled store returns false when teams store has one item with an empty "teamName"', () => {
	teams.set(new Map([[1, teamFactory.build()]]));

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

test('areTeamsFilled store returns false when teams store has two items with an empty "teamName"', () => {
	teams.set(
		new Map([
			[1, teamFactory.build()],
			[2, teamFactory.build()]
		])
	);

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

test('areTeamsFilled store returns true when teams store has one item with a non empty "teamName"', () => {
	teams.set(new Map([[1, teamFactory.build({ teamName: "test" })]]));

	const filled = get(areTeamsFilled);

	assert.isTrue(filled);
});

test('areTeamsFilled store returns true when teams store has two items with a non empty "teamName"', () => {
	teams.set(
		new Map([
			[1, teamFactory.build({ teamName: "test" })],
			[1, teamFactory.build({ teamName: "test2" })]
		])
	);

	const filled = get(areTeamsFilled);

	assert.isTrue(filled);
});

test('areTeamsFilled store returns false when teams store has two items where one item has a non empty "teamName"', () => {
	teams.set(
		new Map([
			[1, teamFactory.build({ teamName: "test" })],
			[1, teamFactory.build()]
		])
	);

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

interface CreateTeamsStoreOverrides {
	readonly update?: Mock;
	readonly subscribe?: Mock;
}

function createTeamsStore(overrides: CreateTeamsStoreOverrides = {}): Writable<Teams> {
	return {
		update: overrides.update ?? vi.fn(),
		subscribe: overrides.subscribe ?? vi.fn().mockReturnValue(vi.fn())
	} as unknown as Writable<Teams>;
}

test("updateStoreTeamGamePoints() does not update the given store when the team is empty", () => {
	let assertionCalled = false;

	const update = vi.fn<Updater<Teams>[], void>((updater) => {
		const teams: Teams = new Map();

		const updatedTeams = updater(teams);

		assert.strictEqual(teams, updatedTeams);
		assertionCalled = true;
	});

	const teamsStore = createTeamsStore({ update });
	updateStoreTeamGamePoints(0, 0, teamsStore);

	assert.isTrue(assertionCalled);
});

test("updateStoreTeamGamePoints() does not update the given store when the team number could not be found", () => {
	let assertionCalled = false;

	const update = vi.fn<Updater<Teams>[], void>((updater) => {
		const teams: Teams = new Map([[1, teamFactory.build()]]);

		const updatedTeams = updater(teams);

		assert.strictEqual(teams, updatedTeams);
		assertionCalled = true;
	});

	const teamsStore = createTeamsStore({ update });
	updateStoreTeamGamePoints(42, 0, teamsStore);

	assert.isTrue(assertionCalled);
});

test("updateStoreTeamGamePoints() updates the given store when the team number could be found", () => {
	let assertionCalled = false;

	const update = vi.fn<Updater<Teams>[], void>((updater) => {
		const teams: Teams = new Map([[1, teamFactory.build()]]);

		const updatedTeams = updater(teams);

		assert.deepStrictEqual(updatedTeams, new Map([[1, teamFactory.build({ gamePoints: 4 })]]));
		assertionCalled = true;
	});

	const teamsStore = createTeamsStore({ update });
	updateStoreTeamGamePoints(1, 4, teamsStore);

	assert.isTrue(assertionCalled);
});

test("updateStoreTeamGamePoints() returns the updated store value", () => {
	const teams: Teams = new Map([[1, teamFactory.build()]]);

	const subscribe = vi.fn<((teams: Teams) => void)[]>((getFromStore) => {
		getFromStore(teams);

		return vi.fn();
	});

	const teamsStore = createTeamsStore({ subscribe });
	const updatedTeams = updateStoreTeamGamePoints(1, 4, teamsStore);

	assert.deepStrictEqual(updatedTeams, teams);
});
