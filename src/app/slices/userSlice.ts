import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/app/ServiceHooks/services";
import type { RootState } from "@/store/store";

type UserPreferences = {
    wmaUser?: unknown;
    showApticr?: unknown;
    showAptic?: unknown;
    printReceivingLabel?: unknown;
};

export type UserDerivedContext = {
    isWMAUser: boolean;
    isLOCUser: boolean;
    isCurrentStationSet: boolean;
    isFranUser: boolean;
    isCurrentBuildingSet: boolean;
    isAtLocBuilding: boolean;
    isAtLocBuildingX: boolean;
    currentBuilding: User["currentBuilding"] | null;
    currentStation: User["currentStation"] | null;
    showAptic: boolean;
    printReceivingLabel: boolean;
};

type UserState = {
    data: User | null;
    derived: UserDerivedContext;
};

const EMPTY_DERIVED: UserDerivedContext = {
    isWMAUser: false,
    isLOCUser: false,
    isCurrentStationSet: false,
    isFranUser: false,
    isCurrentBuildingSet: false,
    isAtLocBuilding: false,
    isAtLocBuildingX: false,
    currentBuilding: null,
    currentStation: null,
    showAptic: false,
    printReceivingLabel: false,
};

const parsePreferences = (preferencesAsJson: string | undefined): UserPreferences => {
    if (!preferencesAsJson) {
        return {};
    }

    try {
        return JSON.parse(preferencesAsJson) as UserPreferences;
    } catch {
        return {};
    }
};

const toBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        return value.trim().toLowerCase() === "true";
    }
    if (typeof value === "number") {
        return value === 1;
    }
    return false;
};

const hasId = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === "string") {
        return value.trim().length > 0;
    }
    return true;
};

const getCurrentStation = (user: User): User["currentStation"] | null => {
    const stationFromUser = user.currentStation;
    if (stationFromUser) {
        return stationFromUser;
    }

    const fallbackStation = (user as any).currentStations ?? (user as any).current;
    return fallbackStation ?? null;
};

const getCurrentStationId = (user: User): unknown => {
    const station = getCurrentStation(user);
    return (station as any)?.id;
};

const getCurrentBuilding = (user: User): User["currentBuilding"] | null => {
    const buildingFromUser = user.currentBuilding;
    if (buildingFromUser) {
        return buildingFromUser;
    }

    const fallbackBuilding = (user as any).currentBuildings;
    return fallbackBuilding ?? null;
};

const getBuildingLabel = (building: unknown): string => {
    if (!building || typeof building !== "object") {
        return "";
    }

    const record = building as Record<string, unknown>;
    const preferredLabel =
        (record.shortDescription as string | undefined) ??
        (record.longDescription as string | undefined) ??
        (record.buildingName as string | undefined) ??
        (record.name as string | undefined) ??
        "";

    return preferredLabel;
};

const deriveUserContext = (user: User | null): UserDerivedContext => {
    if (!user) {
        return EMPTY_DERIVED;
    }

    const preferences = parsePreferences(user.preferencesAsJson);
    const isWMAUser = toBoolean(preferences.wmaUser);
    const currentStation = getCurrentStation(user);
    const currentStationId = getCurrentStationId(user);
    const isCurrentStationSet = hasId(currentStationId);
    const isLOCUser = currentStationId === 9 && !isWMAUser;
    const isFranUser = isCurrentStationSet && currentStationId === 19;

    const currentBuilding = getCurrentBuilding(user);
    const currentBuildingId = (currentBuilding as any)?.id;
    const isCurrentBuildingSet = hasId(currentBuildingId);
    const buildingLabel = getBuildingLabel(currentBuilding);

    const isAtLocBuilding =
        isCurrentBuildingSet && isWMAUser && buildingLabel.startsWith("XOC - BUILDING");
    const isAtLocBuildingX =
        isCurrentBuildingSet && isWMAUser && buildingLabel.startsWith("XOC - BUILDING X");

    const showAptic = toBoolean(preferences.showApticr ?? preferences.showAptic);
    const printReceivingLabel = toBoolean(preferences.printReceivingLabel);

    return {
        isWMAUser,
        isLOCUser,
        isCurrentStationSet,
        isFranUser,
        isCurrentBuildingSet,
        isAtLocBuilding,
        isAtLocBuildingX,
        currentBuilding,
        currentStation,
        showAptic,
        printReceivingLabel,
    };
};

const initialUserState: UserState = {
    data: null,
    derived: EMPTY_DERIVED,
};

export const userSlice = createSlice({
    name: "user",
    initialState: initialUserState,
    reducers: {
        setUserData: (state, action: PayloadAction<User | null>) => {
            state.data = action.payload;
            state.derived = deriveUserContext(action.payload);
        },
    },
});

export const { setUserData } = userSlice.actions;

export const selectUserData = (state: RootState) => state.user.data;
export const selectUserDerived = (state: RootState) => state.user.derived;

export default userSlice.reducer;
