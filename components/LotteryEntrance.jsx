import { useWeb3Contract, useMoralis } from 'react-moralis';
import { abi, contractAddresses } from '../constants';
import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import { useNotification } from '@web3uikit/core';

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  console.log(parseInt(chainId));
  const [entranceFee, setEntranceFee] = useState('0');
  const [player, setPlayer] = useState('');
  const [length, setLength] = useState('');
  const [input, setInput] = useState(0);
  const [recentPlayer, setRecentPlayer] = useState('');
  const dispatch = useNotification();
  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'enterRaffle',
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getEntranceFee',
    params: {},
  });

  // async function getPlayers(e) {
  //   e.preventDefault();
  //   const input = e.target.elements[0].value.toString();
  // const { runContractFunction: getPlayer } = useWeb3Contract({
  //   abi: abi,
  //   contractAddress: raffleAddress,
  //   functionName: 'getPlayer',
  //   params: {
  //     index: [input],
  //   },
  // });
  //   const gamer = (await getPlayers()).toString();
  //   setPlayer(gamer);
  //   console.log(gamer);
  // }

  const { runContractFunction: getPlayer } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getPlayer',
    params: {
      index: input,
    },
  });

  const { runContractFunction: getPlayerLength } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getNumberOfPlayers',
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getRecentWinner',
    params: {},
  });

  async function updateUI() {
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    const lengthPlayers = await getPlayerLength();
    const playerAtId = JSON.stringify(await getPlayer());
    const recentWinner = await getRecentWinner();
    setEntranceFee(entranceFeeFromCall);
    setPlayer(playerAtId);
    setInput(input);
    setLength(lengthPlayers);
    setRecentPlayer(recentWinner);
  }

  // const handleChange = (event) => {
  //   setPlayer(event.target.value);
  // };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, player, input]);

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    console.log(tx);
    handleNewNotification(tx);
    updateUI();
  };

  const handleNewNotification = () => {
    dispatch({
      type: 'info',
      message: 'Transaction Complete',
      title: 'tx Notification',
      position: 'topR',
      icon: 'Bell',
    });
  };
  return (
    <div classNmae="px-8">
      Decentralized lottery
      {raffleAddress ? (
        <>
          <div>Your chainId is: {chainId}</div>
          <div>
            The Entrance Fee Is: {ethers.utils.formatUnits(entranceFee)}
          </div>
          <div>The Length Is: {length.toString()}</div>
          <div>The Recent Winner Is : {recentPlayer}</div>
          <div>
            <label>Get player</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="number" /* onChange={handleChange}*/
              className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
              bg-emerald-50
            "
            />
            <div>{player}</div>
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async () =>
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spin-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
        </>
      ) : (
        <div className="text-center	text-current	decoration-2	">
          The raffleAddress is not detected
        </div>
      )}
      <div>You never know who is going to win</div>
    </div>
  );
}
