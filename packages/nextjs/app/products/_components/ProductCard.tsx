"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";

const ProductCard: NextPage = ({ product }) => {
  const [ethAmount] = useState(product?.price / 10 ** 6);

  return (
    <>
      <div className="bg-white w-full sm:w-[250px] flex flex-col items-center shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl overflow-hidden">
        <Link href={`/product-details/?id=${product?.id || "1"}`} className="w-full">
          {/* Image Section */}
          <div className="w-full p-4 bg-gray-100 flex items-center justify-center">
            <img
              src={product?.productImage.startsWith('https://')? product?.productImage : `https://ipfs.io/ipfs/${product?.productImage}`}
              alt="Product picture"
              onError={(e) => e.currentTarget.src = "https://via.placeholder.com/300x300.png?text=" + product?.name}
              className="rounded-lg w-[180px] h-[180px] object-cover"
            />
          </div>
          
          {/* Product Details */}
          <div className="w-full p-4 text-center bg-white">
            <h1 className="text-lg font-semibold mb-2">{product?.name}</h1>
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-xl font-bold">$</span>
              <span className="text-xl font-bold">{ethAmount}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2" >
            <Address address={product?.seller} />
            </div>
            <div className="flex justify-center gap-1 text-yellow-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>⭐</span>
              ))}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;
