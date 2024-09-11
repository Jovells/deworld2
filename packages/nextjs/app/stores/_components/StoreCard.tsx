"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { NextPage } from "next";

const StoreCard: NextPage = ({ planet }) => {
  return (
    <>
      <Link
        href={`/products/?id=${planet?.id || "1"}`}
        className="bg-white w-full sm:w-[250px] flex flex-col items-center shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl overflow-hidden"
      >
        {/* Image Section */}
        <div className="w-full p-4 bg-gray-100 flex items-center justify-center">
          <img
            src={
              planet?.img || planet?.planetName?.includes("Pearson")
                ? "https://assets-global.website-files.com/637d4c3b222767826da03ef4/637ff65ccfb898870679226e_Pearson-logo-p-500.png"
                : "https://www.databankgroup.com/wp-content/uploads/2018/01/databanklogo-1.png"
            }
            alt="Landscape picture"
            className="rounded-full w-[150px] h-[150px] object-cover"
          />
        </div>

        {/* Text Section */}
        <div className="w-full p-4 text-center">
          <h1 className="text-lg uppercase font-bold mb-2">{planet?.planetName}</h1>
          <p className="text-sm text-gray-600">{planet?.planetDescription}</p>
          <div className="mt-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="text-yellow-500">⭐</span>
            ))}
          </div>
        </div>
      </Link>
    </>
  );
};

export default StoreCard;
