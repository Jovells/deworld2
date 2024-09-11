import { useState, useEffect, useCallback } from 'react';
import Web3  from 'web3';
import { getPaymasterParams, types, Web3ZKsyncL2, ZKsyncPlugin } from 'web3-plugin-zksync';
import ZkSyncContractPaymasterPlugin from "./ZkSyncContractPaymasterPlugin";

declare let window: any;

const usePaymasterAsync = (contractAddress: string, contractAbi: any[], _paymasterAddress?: string) => {
  const [web3, setWeb3] = useState<Web3>();
  const [account, setAccount] = useState<string>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [paymaster, setPaymaster] = useState(_paymasterAddress);



  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        // const l2= Web3ZKsyncL2.initWithDefaultProvider(types.Network.Sepolia)
        web3.registerPlugin(new ZkSyncContractPaymasterPlugin(window.ethereum));
        // web3.registerPlugin(new ZKsyncPlugin(l2))

        if(!paymaster){
          setPaymaster(await web3.ZKsync.rpc.getTestnetPaymasterAddress() as string)
        }

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        console.log('Accounts:', accounts);
        setWeb3(web3);
      }
    };

    initializeWeb3();
  }, []);

  console.log('Paymaster Address:', paymaster, 'account:', account);


  const writeContractWithPaymaster = useCallback(async (
    { functionName, args }: { functionName: string; args: any[] },
    { onBlockConfirmation }: { onBlockConfirmation?: (txnReceipt: any) => void }
  ) => {
    if (!web3 || !account) return;
    setIsPending(true);

    console.log('Writing to contract:', {functionName, account, args, contractAddress});

    try {
      // @ts-ignore
      const tx = await web3.zkSyncContractPaymasterPlugin.write(
        contractAddress,
        contractAbi,
        {
          methodName: functionName,
          args: args,
          from: account,
          customData: {
            gasPerPubdata: 50000,
            paymasterParams: getPaymasterParams(paymaster as string, {
              type: "General",
              innerInput: new Uint8Array(),
            }),
          }
        }
      );

      console.log('Transaction receipt:', tx);
      setIsPending(false);

      if (onBlockConfirmation) {
        onBlockConfirmation(tx);
      }

      return tx;
    } catch (error) {
      setIsPending(false);
      console.error('Error writing to contract:', error);
      throw error;
    }
  }, [web3, account, contractAddress, contractAbi, _paymasterAddress]);

  return {
    isPending,
    writeContractWithPaymaster,
  };
};

export default usePaymasterAsync;