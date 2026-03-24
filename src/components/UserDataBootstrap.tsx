"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFetchUserData } from "@/app/ServiceHooks/services";
import { setUserData } from "@/app/slices/userSlice";

export default function UserDataBootstrap() {
  const dispatch = useDispatch();
  const { userData, userDataLoading } = useFetchUserData();

  useEffect(() => {
    if (!userDataLoading && userData) {
      dispatch(setUserData(userData));
    }
  }, [dispatch, userData, userDataLoading]);

  return null;
}
