/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./_components/ProductCard";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { THE_GRAPH_URL } from "~~/app/constants";
import AddProduct from "./_components/AddProduct";

const Products: NextPage = () => {
  const { writeContractAsync } = useScaffoldWriteContract("Deworld");
  const { address: connectedAddress } = useAccount();
  
  const [products, setProducts] = useState<any[]>([]);
  const [productImage, setProductImage] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(0);
  const [planetId, setPlanetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();

  async function fetchGraphQL(operationsDoc: string, operationName: string, variables: any) {
    setIsLoading(true);
    const response = await fetch(THE_GRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      products(where: { planet: "${searchParams.get('id')}" }) {
        id
        name
        price
        quantity
        seller
        productImage
      }
    }
  `;

  async function fetchMyQuery() {
    const { data, errors } = await fetchGraphQL(operation, 'MyQuery', {});
    if (errors) {
      console.error(errors);
      return [];
    }
    return data.products;
  }

  async function submitProduct() {
    const payload = {
      productImage,
      productName,
      planetId: searchParams.get('id') ?? '1',
      seller: connectedAddress,
      quantity: productQuantity,
      price: productPrice,
    };

    if (productName && searchParams.get('id') && productImage && connectedAddress && productQuantity && productPrice) {
      try {
        await writeContractAsync(
          {
            functionName: "addProduct",
            args: [productName, searchParams.get('id') as any, productImage, connectedAddress, productQuantity, productPrice]
          },
          {
            onBlockConfirmation: txnReceipt => {
              console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            },
          },
        );
        location.reload();
      } catch (e) {
        console.error("Error posting product", e);
      }
    }
  }

  useEffect(() => {
    const currentId = searchParams.get('id');
    if (currentId) {
      setPlanetId(currentId);
    }
    fetchMyQuery()
      .then(products => setProducts(products))
      .catch(error => console.error('Error fetching query:', error));
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center flex-grow bg-gray-100 min-h-screen py-6 px-4">
      <div className="w-full max-w-7xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <label 
            htmlFor="my_modal_7" 
            className="text-xl font-semibold bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          >
            ➕ Post Product
          </label>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {isLoading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : products.length ? (
            products.map((product: any, index: number) => (
              <ProductCard key={index} product={product} />
            ))
          ) : (
            <h2 className="text-xl font-semibold text-gray-600">No Products available</h2>
          )}
        </div>
      </div>
      <AddProduct 
        setProductImage={setProductImage}
        setProductName={setProductName}
        setProductPrice={setProductPrice}
        setProductQuantity={setProductQuantity}
        submitProduct={submitProduct}
      />
    </div>
  );
};

export default Products;
