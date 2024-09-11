"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { DEWORLD_ZKSYNC_ADDRESS, THE_GRAPH_URL } from "~~/app/constants";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import usePaymasterAsync from "./usePaymasterAsync";

/* eslint-disable @next/next/no-img-element */
const ProductDetails: NextPage = () => {
  const { writeContractAsync, isPending: pending } = useScaffoldWriteContract("Deworld");
  const { writeContractAsync: writeMockUSDTAsync, isPending: approvalPending } = useScaffoldWriteContract("MockUSDT");
  const { writeContractWithPaymaster: buywithPaymasterAsync, 
    isPending: isPaymasterPending } = usePaymasterAsync(DEWORLD_ZKSYNC_ADDRESS, deployedContracts[300].Deworld.abi as any,
        "0xd851E8cDca408A80691255F823F76C057b08ccCc");
  const [productId, setProductId] = useState<any>(null);
  const [product, setProduct] = useState({});
  const [itemQty, setItemQty] = useState<any>(1);
  const [isPending, setIsPending] = useState<any>(pending);
  const [isApprovalPending, setIsApprovalPending] = useState<any>(approvalPending);
  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const { address } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
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

    return await response.json();
  }

  const operation = `
     query MyQuery {
      products(where: { id: "${searchParams.get("id")}" }, orderDirection: asc) {
        id
        name
        price
        quantity
        seller 
        productImage
      }
    }
  `;

  function fetchMyQuery() {
    return fetchGraphQL(operation, "MyQuery", {});
  }

  const buyProduct = async () => {
    setIsPending(true);
    console.log(productId, itemQty);
    try {
      await writeMockUSDTAsync(
        {
          functionName: "approve",
          args: [DEWORLD_ZKSYNC_ADDRESS, product?.price],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );

      await writeContractAsync(
        {
          functionName: "purchaseProduct",
          args: [productId, itemQty],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
      router?.push(`/buyer-dashboard/?id=${address}`);
      setIsPending(false);
    } catch (e) {
      setIsPending(false);
      console.error("Error buying product", e);
    }
  };
  const buyProductWithPayMaster = async () => {
    console.log("argsProduct", productId, itemQty);
    try {
      await buywithPaymasterAsync(
        {
          functionName: "purchaseProduct",
          args: [productId, itemQty],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction hash", txnReceipt.hash);
          },
        },
      );

 
      router?.push(`/buyer-dashboard/?id=${address}`);
    } catch (e) {
      setIsPending(false);
      console.error("Error buying product", e);
    }
  };


  useEffect(() => {
    // check and set the product id
    const currentId = searchParams.get('id');
    if (currentId) {
      setProductId(currentId || 1);
    }

    // Graphql query to fetch products details by id
    fetchMyQuery()
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        } else {
          setProduct(data?.products[0]);
          console.log(data?.products[0]);
          setEthAmount((data.products[0].price / 10 ** 6) * itemQty);
        }
      })
      .catch(error => {
        console.error("Error fetching query:", error);
      });
  }, []);

  useEffect(() => {
    setEthAmount((product.price / 10 ** 6) * itemQty);
  }, [itemQty]);

  return (
    <>
      <div className="p-5">
        <h1 className="w-100 font-bold text-xl">Product Details</h1>

        <div className="flex flex-wrap justify-center items-center gap-5">
          <img src={`https://ipfs.io/ipfs/${product?.productImage}`} alt="" className="w-1/4" />
          <div className="w-full sm:w-1/2 flex flex-col justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{product?.name}</h1>
            <div className="flex justify-start items-center gap-2 p-1 font-bold">
              <span>$</span>
              <span>{ethAmount}</span>
            </div>
            <h2>
              <b>{product?.quantity}</b> Qty available
            </h2>
            <Address address={product?.seller} />
            <span>⭐⭐</span>
            <span className="w-fit">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio quae deserunt maxime asperiores
              voluptatem exercitationem molestias impedit vitae dignissimos repellat vel, in provident hic aperiam.
              Deserunt nam sit ullam incidunt!
            </span>
            <div className="flex justify-start items-center gap-5">
              <input
                type="number"
                name="qty"
                id="qty"
                min={1}
                value={itemQty}
                onChange={e => setItemQty(e.target.value)}
                className="w-full sm:w-1/2 p-2 outline outline-2"
              />
              <button
                className="bg-blue-300 p-2 rounded-lg w-full sm:w-1/2"
                onClick={buyProduct}
                disabled={itemQty < 1 || isPending}
              >
                {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Buy"}
              </button>
              <button
                className="bg-blue-300 p-2 rounded-lg w-full sm:w-1/2"
                onClick={buyProductWithPayMaster}
                disabled={itemQty < 1 || isPending}
              >
                {isPaymasterPending ? <span className="loading loading-spinner loading-sm"></span> : "BuyWithPayMaster"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
