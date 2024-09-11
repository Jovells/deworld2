"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { THE_GRAPH_URL } from "../constants";
import StoreCard from "./_components/StoreCard";
import type { NextPage } from "next";

const Stores: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stores, setStores] = useState<any[]>([]);

  async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
    setIsLoading(true);
    const response = await fetch(THE_GRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables,
        operationName,
      }),
    });
    setIsLoading(false);
    return await response.json();
  }

  const operation = `
    query MyQuery {
      planets(first: 10, orderBy: id) {
        planetDescription
        id
        planetName
      }
    }
  `;

  async function fetchMyQuery() {
    const { data, errors } = await fetchGraphQL(operation, "MyQuery", {});

    if (errors) {
      console.error(errors);
      return;
    }

    setStores(data?.planets);
  }

  useEffect(() => {
    fetchMyQuery().catch(error => {
      console.error("Error fetching query:", error);
    });
  }, []);

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow flex-col bg-gray-50 w-full px-8 py-12 items-center justify-center gap-10 relative">
          {/* Title Section */}
          <h1 className="flex justify-start items-center gap-2 mb-8">
            <img
              src="/planet.png"
              alt="planet"
              className="w-[50px] animate-bounce opacity-70"
            />
            <span className="text-[30px] font-bold text-gray-800">Planets</span>
          </h1>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full">
            {isLoading ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : stores?.length ? (
              stores?.map((store: any, index: number) => (
                <StoreCard key={index} planet={store} />
              ))
            ) : (
              <h2 className="text-center text-xl text-gray-500">No Planets available</h2>
            )}
          </div>

          {/* Background Decoration */}
          <img
            src="/solar.gif"
            alt="solar system"
            className="w-[300px] absolute right-10 bottom-0 opacity-70"
          />
        </div>
      </div>
    </>
  );
};

export default Stores;
