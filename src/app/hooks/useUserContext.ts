"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { User } from "@/app/ServiceHooks/services";
import {
  selectUserData,
  selectUserDerived,
  type UserDerivedContext,
} from "@/app/slices/userSlice";

export type UserContextValue = UserDerivedContext & {
  user: User | null;
  displayName: string;
};

export function useUserContext(): UserContextValue {
  const user = useSelector(selectUserData);
  const derived = useSelector(selectUserDerived);

  return useMemo(
    () => ({
      user,
      displayName: user?.displayName ?? "",
      ...derived,
    }),
    [derived, user]
  );
}
