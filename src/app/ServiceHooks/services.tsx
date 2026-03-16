"use client";

import { useEffect, useState } from "react";

const MOCK_BUILDINGS = [
  { id: 1, buildingName: "Main Building" },
  { id: 2, buildingName: "Annex A" },
  { id: 3, buildingName: "Warehouse" },
  { id: 4, buildingName: "North Campus" },
];

const MOCK_MAILLOCATIONS = [
  {
    id: 1,
    active: true,
    locationName: "Main Building",
    location: {
      buildingId: 1,
      address: null,
      locationType: { id: 1 },
      name: "Main Building",
    },
  },
  {
    id: 2,
    active: true,
    locationName: "123 Main St, Springfield IL 62701",
    location: {
      buildingId: null,
      address: "123 Main St, Springfield IL 62701",
      locationType: { id: 3 },
      name: "123 Main St, Springfield IL 62701",
    },
  },
  {
    id: 3,
    active: false,
    locationName: "Annex A",
    location: {
      buildingId: 2,
      address: null,
      locationType: { id: 1 },
      name: "Annex A",
    },
  },
];

export function useFetchMaillocations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_MAILLOCATIONS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}

export function useFetchBuildings() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuildings(MOCK_BUILDINGS);
      setBuildingsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return { buildings, buildingsLoading };
}
