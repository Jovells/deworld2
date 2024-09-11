"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { useAccount, useBalance, useChainId } from "wagmi";
import { DEWORLD_ZKSYNC_ADDRESS, MUSDC_ZKSYNC_ADDRESS, THE_GRAPH_URL, ZKSYNC_MUSDT_PAYMASTER_ADDRESS } from "~~/app/constants";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract, useWatchBalance } from "~~/hooks/scaffold-eth";
import usePaymasterAsync from "./usePaymasterAsync";
import { formatEther, formatUnits } from "viem";
import toast from "react-hot-toast";

/* eslint-disable @next/next/no-img-element */
const ProductDetails: NextPage = () => {
  const { writeContractAsync, isPending: pending } = useScaffoldWriteContract("Deworld");
  const { writeContractAsync: writeMockUSDTAsync, isPending: approvalPending } = useScaffoldWriteContract("MockUSDT");
  const { writeContractWithPaymaster: buywithPaymasterAsync, 
    isPending: isPaymasterPending } = usePaymasterAsync(DEWORLD_ZKSYNC_ADDRESS, deployedContracts[300].Deworld.abi as any,
      ZKSYNC_MUSDT_PAYMASTER_ADDRESS);
  const { writeContractWithPaymaster: approveWithPaymasterAsync, 
    isPending: isPaymasterAprovalPending } = usePaymasterAsync(MUSDC_ZKSYNC_ADDRESS, deployedContracts[300].MockUSDT.abi as any,
      ZKSYNC_MUSDT_PAYMASTER_ADDRESS);
      const [productId, setProductId] = useState<any>(null);
      const [product, setProduct] = useState({});
      const [itemQty, setItemQty] = useState<any>(1);
      const [isPending, setIsPending] = useState<any>(pending);
      const [isApprovalPending, setIsApprovalPending] = useState<any>(approvalPending);
      const [ethAmount, setEthAmount] = useState<number | null>(null);
      const { address } = useAccount();
      const { data: mockUSDTBalance} = useScaffoldReadContract({
        contractName: "MockUSDT",
        functionName: "balanceOf",
        args: [address],
      });
      const chain = useChainId();
      const {data: ethBalance} = useWatchBalance({address: address, chainId: chain});
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
      await approveWithPaymasterAsync(
        {
          functionName: "approve",
          args: [DEWORLD_ZKSYNC_ADDRESS, product?.price],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Approval Transaction blockHash", txnReceipt.hash);
          },
        },
      );

      await buywithPaymasterAsync(
        {
          functionName: "purchaseProduct",
          args: [productId, itemQty],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction hash", txnReceipt.hash);
            toast.success("Purchase  successful");
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

  //implement the togglePayWithEth function
  const [payWithEth, setPayWithEth] = useState<boolean>(true);
  const togglePayWithEth = () => {
    setPayWithEth(!payWithEth);
  };

  return (
    <>
    <div className="p-5">
      <h1 className="w-full font-bold text-xl mb-4">Product Details</h1>
  
      <div className="flex flex-wrap justify-center items-start gap-8">
        {/* Product Image */}
        <img 
        src={product?.productImage?.startsWith('https://')? product?.productImage : `https://ipfs.io/ipfs/${product?.productImage}`}
         alt="Product"
          className="w-full sm:w-1/3 object-cover" 
          onError={(e) => e.currentTarget.src = "https://via.placeholder.com/300x300.png?text=" + product?.name}
          />
  
        {/* Product Information */}
        <div className="w-full sm:w-1/2 flex flex-col justify-start gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{product?.name}</h1>
  
          <div className="flex items-center gap-2 p-1 text-xl font-bold">
            <span>$</span>
            <span>{ethAmount}</span>
          </div>
  
          <h2 className="text-lg">
            <b>{product?.quantity}</b> Qty available
          </h2>
  
          <Address address={product?.seller} />
  
          <div className="text-yellow-500">⭐⭐</div>
  
          {/* Product Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio quae deserunt maxime asperiores voluptatem exercitationem molestias
            impedit vitae dignissimos repellat vel, in provident hic aperiam. Deserunt nam sit ullam incidunt!
          </p>
  
          {/* Quantity and Buy Button */}
          <div className="flex justify-start items-center gap-5">
            <input
              type="number"
              name="qty"
              id="qty"
              min={1}
              value={itemQty}
              onChange={e => setItemQty(e.target.value)}
              className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg"
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-lg w-full sm:w-1/2 flex justify-center items-center"
              onClick={payWithEth ? buyProduct : buyProductWithPayMaster}
              disabled={itemQty < 1 || isPending}
            >
              {isPending || isPaymasterPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Buy"
              )}
            </button>
          </div>
  
          {/* Payment Method Toggle */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Pay gas fees with:</h3>
              <div className="flex items-center">
                <span className="mr-4">USDT</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={payWithEth}
                    onChange={togglePayWithEth}
                    disabled={isPending || isPaymasterPending}
                  />
                  <div className="w-10 h-5 bg-blue-600 rounded-full peer peer-checked:bg-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
                <span className="ml-4">ETH</span>
              </div>
            </div>
  
            {/* USDT and ETH Balance */}
            <div className="flex justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1">USDT Balance:</h3>
                <span>{mockUSDTBalance && formatUnits(mockUSDTBalance, 6)}</span>
                         {/* Mint USDT Link */}
          <a
            href="https://sepolia.explorer.zksync.io/address/0xff68f7561562C1F24A317d939B46741F76c4Ef55#contract:~:text=1.%20approve-,2.%20mint,-Connect%20Wallet%20to"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-100 text-center p-2 rounded-lg w-full sm:w-1/2 mt-4"
          >
            Mint some USDT
          </a>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">ETH Balance:</h3>
                <span>{ethBalance && formatEther(ethBalance?.value)}</span>
              </div>
            </div>
          </div>
  
 
        </div>
      </div>
    </div>
  </>
  
  );
};

export default ProductDetails;
